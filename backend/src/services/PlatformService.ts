import { PrismaClient } from '@prisma/client';
import { SupabaseClient } from '@supabase/supabase-js';
import { PlatformConfig, PlatformConnection } from '../types';

export class PlatformService {
  constructor(
    private prisma: PrismaClient,
    private supabase: SupabaseClient
  ) {}

  async connect(userId: string, platform: PlatformConfig): Promise<PlatformConnection> {
    // Get platform configuration from database
    const userPlatform = await this.prisma.userPlatform.findUnique({
      where: {
        userId_platform: {
          userId,
          platform: platform.id.toUpperCase() as any
        }
      }
    });

    if (!userPlatform || !userPlatform.isConnected) {
      throw new Error(`Platform ${platform.id} not connected`);
    }

    // Get stream key from vault
    const streamKey = await this.getStreamKey(userId, platform.id);

    // Platform-specific RTMP URLs
    const rtmpUrl = this.getRTMPUrl(platform.id, userPlatform);

    return {
      platform: platform.id,
      streamUrl: rtmpUrl,
      streamKey: streamKey,
      status: 'connected'
    };
  }

  private getRTMPUrl(platformId: string, userPlatform: any): string {
    // Use custom RTMP URL if provided
    if (userPlatform.rtmpUrl) {
      return userPlatform.rtmpUrl;
    }

    // Default RTMP URLs for each platform
    const rtmpUrls: Record<string, string> = {
      youtube: 'rtmp://a.rtmp.youtube.com/live2',
      twitch: 'rtmp://live.twitch.tv/app',
      facebook: 'rtmps://live-api-s.facebook.com:443/rtmp',
      instagram: 'rtmps://live-upload.instagram.com:443/rtmp',
      linkedin: 'rtmps://rtmp-api.linkedin.com:443/live',
      twitter: 'rtmps://ingest.pscp.tv:443/x',
      tiktok: 'rtmp://push.tiktokcdn.com/live',
      kick: 'rtmps://fa723fc1b171.global-contribute.live-video.net:443/app',
      rumble: 'rtmp://live.rumble.com/live'
    };

    return rtmpUrls[platformId.toLowerCase()] || '';
  }

  private async getStreamKey(userId: string, platformId: string): Promise<string> {
    const userPlatform = await this.prisma.userPlatform.findUnique({
      where: {
        userId_platform: {
          userId,
          platform: platformId.toUpperCase() as any
        }
      }
    });

    if (!userPlatform?.streamKey) {
      throw new Error(`Stream key not found for ${platformId}`);
    }

    // If encrypted in Supabase vault
    if (userPlatform.streamKey.startsWith('vault:')) {
      const vaultId = userPlatform.streamKey.replace('vault:', '');

      const { data, error } = await this.supabase
        .from('vault')
        .select('decrypted_secret')
        .eq('id', vaultId)
        .single();

      if (error) {
        throw new Error('Failed to retrieve stream key from vault');
      }

      return data.decrypted_secret;
    }

    return userPlatform.streamKey;
  }

  async savePlatformConnection(
    userId: string,
    platformId: string,
    data: {
      platformUserId?: string;
      platformUsername?: string;
      streamKey?: string;
      rtmpUrl?: string;
      accessToken?: string;
      refreshToken?: string;
      tokenExpiresAt?: Date;
    }
  ) {
    // Store sensitive data in Supabase vault if provided
    let streamKeyRef = data.streamKey;
    if (data.streamKey) {
      const { data: vaultData, error } = await this.supabase
        .from('vault')
        .insert({
          secret: data.streamKey,
          name: `${platformId}_stream_key`,
          description: `Stream key for ${platformId}`
        })
        .select()
        .single();

      if (!error && vaultData) {
        streamKeyRef = `vault:${vaultData.id}`;
      }
    }

    await this.prisma.userPlatform.upsert({
      where: {
        userId_platform: {
          userId,
          platform: platformId.toUpperCase() as any
        }
      },
      create: {
        userId,
        platform: platformId.toUpperCase() as any,
        platformUserId: data.platformUserId,
        platformUsername: data.platformUsername,
        streamKey: streamKeyRef,
        rtmpUrl: data.rtmpUrl,
        isConnected: true,
        isEnabled: true
      },
      update: {
        platformUserId: data.platformUserId,
        platformUsername: data.platformUsername,
        streamKey: streamKeyRef,
        rtmpUrl: data.rtmpUrl,
        isConnected: true,
        updatedAt: new Date()
      }
    });
  }

  async disconnectPlatform(userId: string, platformId: string) {
    await this.prisma.userPlatform.update({
      where: {
        userId_platform: {
          userId,
          platform: platformId.toUpperCase() as any
        }
      },
      data: {
        isConnected: false,
        updatedAt: new Date()
      }
    });
  }

  async getPlatformStatus(userId: string, platformId: string) {
    const userPlatform = await this.prisma.userPlatform.findUnique({
      where: {
        userId_platform: {
          userId,
          platform: platformId.toUpperCase() as any
        }
      }
    });

    return {
      connected: userPlatform?.isConnected || false,
      enabled: userPlatform?.isEnabled || false,
      username: userPlatform?.platformUsername,
      lastStream: userPlatform?.lastStreamAt
    };
  }
}
