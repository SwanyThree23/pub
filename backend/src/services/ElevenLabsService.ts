import { PrismaClient } from '@prisma/client';
import { SupabaseClient } from '@supabase/supabase-js';
import axios from 'axios';
import { VoiceCloneParams } from '../types';

export class ElevenLabsService {
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor(
    private prisma: PrismaClient,
    private supabase: SupabaseClient
  ) {}

  async cloneVoice(params: VoiceCloneParams) {
    const apiKey = await this.getApiKey(params.userId);

    // Create voice clone record
    const voiceClone = await this.prisma.voiceClone.create({
      data: {
        userId: params.userId,
        name: params.name,
        description: params.description,
        status: 'PENDING',
        provider: 'elevenlabs',
        sampleUrls: params.audioFiles
      }
    });

    try {
      // Call ElevenLabs API
      const response = await axios.post(
        `${this.baseUrl}/voices/add`,
        {
          name: params.name,
          description: params.description,
          files: params.audioFiles
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': apiKey
          }
        }
      );

      // Update record
      await this.prisma.voiceClone.update({
        where: { id: voiceClone.id },
        data: {
          status: 'COMPLETED',
          voiceId: response.data.voice_id,
          completedAt: new Date()
        }
      });

      return {
        id: voiceClone.id,
        voiceId: response.data.voice_id,
        status: 'completed'
      };
    } catch (error: any) {
      await this.prisma.voiceClone.update({
        where: { id: voiceClone.id },
        data: {
          status: 'FAILED'
        }
      });

      throw error;
    }
  }

  async textToSpeech(text: string, voiceId: string, userId: string) {
    const apiKey = await this.getApiKey(userId);

    const response = await axios.post(
      `${this.baseUrl}/text-to-speech/${voiceId}`,
      {
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        responseType: 'arraybuffer'
      }
    );

    return response.data;
  }

  private async getApiKey(userId: string): Promise<string> {
    const apiKeyRecord = await this.prisma.apiKey.findFirst({
      where: {
        userId,
        service: 'elevenlabs',
        isActive: true
      }
    });

    if (!apiKeyRecord) {
      throw new Error('ElevenLabs API key not found');
    }

    const { data, error } = await this.supabase
      .from('vault')
      .select('decrypted_secret')
      .eq('id', apiKeyRecord.supabaseId)
      .single();

    if (error) {
      throw new Error('Failed to retrieve API key from vault');
    }

    return data.decrypted_secret;
  }
}
