import { PrismaClient } from '@prisma/client';
import { SupabaseClient } from '@supabase/supabase-js';
import axios from 'axios';
import { TranslationParams, ImageToVideoParams } from '../types';

export class AkoolService {
  private baseUrl = 'https://api.akool.com/v1';

  constructor(
    private prisma: PrismaClient,
    private supabase: SupabaseClient
  ) {}

  async translateVideo(params: TranslationParams) {
    const apiKey = await this.getApiKey(params.userId);

    const video = await this.prisma.video.create({
      data: {
        userId: params.userId,
        type: 'TRANSLATED',
        status: 'PENDING',
        sourceData: {
          videoUrl: params.videoUrl,
          targetLanguage: params.targetLanguage,
          voiceClone: params.voiceClone !== false
        },
        provider: 'akool'
      }
    });

    try {
      const response = await axios.post(
        `${this.baseUrl}/video-translate`,
        {
          video_url: params.videoUrl,
          target_language: params.targetLanguage,
          voice_clone: params.voiceClone !== false
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          }
        }
      );

      await this.prisma.video.update({
        where: { id: video.id },
        data: {
          status: 'PROCESSING',
          jobId: response.data.job_id,
          metadata: response.data
        }
      });

      return {
        videoId: video.id,
        jobId: response.data.job_id,
        status: 'processing'
      };
    } catch (error: any) {
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

  async imageToVideo(params: ImageToVideoParams) {
    const apiKey = await this.getApiKey(params.userId);

    const video = await this.prisma.video.create({
      data: {
        userId: params.userId,
        type: 'IMAGE_TO_VIDEO',
        status: 'PENDING',
        sourceData: {
          imageUrl: params.imageUrl,
          prompt: params.prompt,
          resolution: params.resolution || '1080p'
        },
        provider: 'akool'
      }
    });

    try {
      const response = await axios.post(
        `${this.baseUrl}/image-to-video`,
        {
          image_url: params.imageUrl,
          prompt: params.prompt,
          resolution: params.resolution || '1080p'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          }
        }
      );

      await this.prisma.video.update({
        where: { id: video.id },
        data: {
          status: 'PROCESSING',
          jobId: response.data.job_id,
          metadata: response.data
        }
      });

      return {
        videoId: video.id,
        jobId: response.data.job_id,
        status: 'processing'
      };
    } catch (error: any) {
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

  async faceSwap(sourceImageUrl: string, targetImageUrl: string, userId: string) {
    const apiKey = await this.getApiKey(userId);

    const response = await axios.post(
      `${this.baseUrl}/face-swap`,
      {
        source_image: sourceImageUrl,
        target_image: targetImageUrl
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    return response.data;
  }

  private async getApiKey(userId: string): Promise<string> {
    const apiKeyRecord = await this.prisma.apiKey.findFirst({
      where: {
        userId,
        service: 'akool',
        isActive: true
      }
    });

    if (!apiKeyRecord) {
      throw new Error('Akool API key not found');
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
