import { PrismaClient } from '@prisma/client';
import { SupabaseClient } from '@supabase/supabase-js';
import axios from 'axios';
import { AvatarVideoParams } from '../types';

export class HeyGenService {
  private baseUrl = 'https://api.heygen.com/v1';

  constructor(
    private prisma: PrismaClient,
    private supabase: SupabaseClient
  ) {}

  async generateVideo(params: AvatarVideoParams) {
    // Get API key from vault
    const apiKey = await this.getApiKey(params.userId);

    // Create video record
    const video = await this.prisma.video.create({
      data: {
        userId: params.userId,
        type: 'AVATAR',
        status: 'PENDING',
        sourceData: {
          avatarId: params.avatarId,
          voiceId: params.voiceId,
          script: params.script,
          resolution: params.resolution || '1080p'
        },
        provider: 'heygen'
      }
    });

    try {
      // Call HeyGen API
      const response = await axios.post(
        `${this.baseUrl}/video.generate`,
        {
          avatar_id: params.avatarId,
          voice_id: params.voiceId,
          script: params.script,
          resolution: params.resolution || '1080p',
          test: false
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': apiKey
          }
        }
      );

      // Update video record
      await this.prisma.video.update({
        where: { id: video.id },
        data: {
          status: 'PROCESSING',
          jobId: response.data.video_id,
          metadata: response.data
        }
      });

      return {
        videoId: video.id,
        jobId: response.data.video_id,
        status: 'processing'
      };
    } catch (error: any) {
      // Update video record with error
      await this.prisma.video.update({
        where: { id: video.id },
        data: {
          status: 'FAILED',
          error: error.message
        }
      });

      throw error;
    }
  }

  async getVideoStatus(videoId: string) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId }
    });

    if (!video || !video.jobId) {
      throw new Error('Video not found');
    }

    const apiKey = await this.getApiKey(video.userId);

    const response = await axios.get(
      `${this.baseUrl}/video_status.get?video_id=${video.jobId}`,
      {
        headers: {
          'X-Api-Key': apiKey
        }
      }
    );

    // Update video if completed
    if (response.data.status === 'completed') {
      await this.prisma.video.update({
        where: { id: videoId },
        data: {
          status: 'COMPLETED',
          videoUrl: response.data.video_url,
          thumbnailUrl: response.data.thumbnail_url,
          duration: response.data.duration,
          completedAt: new Date()
        }
      });
    }

    return response.data;
  }

  private async getApiKey(userId: string): Promise<string> {
    const apiKeyRecord = await this.prisma.apiKey.findFirst({
      where: {
        userId,
        service: 'heygen',
        isActive: true
      }
    });

    if (!apiKeyRecord) {
      throw new Error('HeyGen API key not found');
    }

    // Decrypt from Supabase vault
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
