// Ultimate Integration Module - Combines All Services
import { PrismaClient } from '@prisma/client';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Redis from 'ioredis';
import { Queue } from 'bullmq';
import { Server as SocketServer } from 'socket.io';
import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';

// Import services
import { HeyGenService } from '../services/HeyGenService';
import { ElevenLabsService } from '../services/ElevenLabsService';
import { AkoolService } from '../services/AkoolService';
import { VDONinjaService } from '../services/VDONinjaService';
import { EvMuxService } from '../services/EvMuxService';
import { PlatformService } from '../services/PlatformService';

// Import types
import {
  ServiceConfig,
  StreamConfig,
  StreamSession,
  PlatformConfig,
  SceneConfig,
  AvatarConfig,
  VoiceConfig,
  TranslationConfig,
  ContentType,
  AvatarVideoParams,
  TranslationParams,
  ImageToVideoParams,
  VoiceCloneParams,
  PlatformConnection
} from '../types';

export class UnifiedPlatform {
  private prisma: PrismaClient;
  private redis: Redis;
  private supabase: SupabaseClient;
  private services: Map<string, ServiceConfig>;
  private queues: Map<string, Queue>;
  private io: SocketServer | null = null;

  // Service instances
  private heyGen: HeyGenService;
  private elevenLabs: ElevenLabsService;
  private akool: AkoolService;
  private vdoNinja: VDONinjaService;
  private evMux: EvMuxService;
  private platformService: PlatformService;

  constructor() {
    // Initialize core infrastructure
    this.prisma = new PrismaClient();
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );

    this.services = new Map();
    this.queues = new Map();

    // Initialize service instances
    this.heyGen = new HeyGenService(this.prisma, this.supabase);
    this.elevenLabs = new ElevenLabsService(this.prisma, this.supabase);
    this.akool = new AkoolService(this.prisma, this.supabase);
    this.vdoNinja = new VDONinjaService();
    this.evMux = new EvMuxService();
    this.platformService = new PlatformService(this.prisma, this.supabase);

    this.initializeServices();
  }

  /**
   * Initialize all services and their queues
   */
  private initializeServices() {
    // AI Services
    this.registerService('heygen', {
      name: 'HeyGen Avatar',
      enabled: true,
      baseUrl: 'https://api.heygen.com/v1'
    });

    this.registerService('elevenlabs', {
      name: 'ElevenLabs TTS',
      enabled: true,
      baseUrl: 'https://api.elevenlabs.io/v1'
    });

    this.registerService('akool', {
      name: 'Akool AI',
      enabled: true,
      baseUrl: 'https://api.akool.com/v1'
    });

    // Streaming Services
    this.registerService('vdo', {
      name: 'VDO.Ninja',
      enabled: true,
      baseUrl: 'https://api.vdo.ninja'
    });

    this.registerService('prism', {
      name: 'PRISM Live Studio',
      enabled: true,
      baseUrl: 'ws://localhost:4455'
    });

    this.registerService('evmux', {
      name: 'EvMux',
      enabled: true,
      baseUrl: 'https://api.evmux.com'
    });

    // Platform Destinations
    const platforms = [
      'facebook', 'instagram', 'youtube', 'linkedin', 'twitter',
      'twitch', 'tiktok', 'telegram', 'amazon', 'steam', 'kick', 'rumble'
    ];

    platforms.forEach(platform => {
      this.registerService(platform, {
        name: platform.charAt(0).toUpperCase() + platform.slice(1),
        enabled: false
      });
    });
  }

  /**
   * Register a service and create its queue
   */
  private registerService(id: string, config: ServiceConfig) {
    this.services.set(id, config);

    // Create BullMQ queue for each service
    const queue = new Queue(id, {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379')
      }
    });

    this.queues.set(id, queue);
  }

  /**
   * Unified Stream Management - Main entry point
   */
  async startStream(userId: string, config: StreamConfig): Promise<StreamSession> {
    const streamId = uuidv4();

    const session: StreamSession = {
      id: streamId,
      userId,
      status: 'starting',
      platforms: [],
      startTime: new Date(),
      config
    };

    try {
      // Create stream record in database
      const stream = await this.prisma.stream.create({
        data: {
          id: streamId,
          userId,
          title: config.title || 'Untitled Stream',
          description: config.description,
          status: 'STARTING',
          config: config as any,
          scheduledAt: config.scheduledAt
        }
      });

      // 1. Initialize VDO.Ninja room
      if (config.enableVDO) {
        const vdoRoom = await this.initVDO(streamId);
        session.vdoRoom = vdoRoom;

        await this.prisma.stream.update({
          where: { id: streamId },
          data: {
            vdoRoomId: vdoRoom.id,
            vdoDirectorUrl: vdoRoom.directorUrl,
            vdoGuestUrl: vdoRoom.guestUrl
          }
        });
      }

      // 2. Configure PRISM scenes
      if (config.scenes && config.scenes.length > 0) {
        await this.setupPRISM(config.scenes);
      }

      // 3. Connect to active platforms
      const activePlatforms = config.platforms.filter(p => p.enabled);

      for (const platform of activePlatforms) {
        try {
          const connection = await this.connectPlatform(userId, platform);
          session.platforms.push(connection);

          // Save destination in database
          await this.prisma.streamDestination.create({
            data: {
              streamId,
              platform: platform.id.toUpperCase() as any,
              status: 'CONNECTED',
              streamUrl: connection.streamUrl,
              streamKey: connection.streamKey
            }
          });
        } catch (error: any) {
          console.error(`Failed to connect to ${platform.id}:`, error);
          // Continue with other platforms
        }
      }

      // 4. Start EvMux multi-streaming
      if (config.enableEvMux && session.platforms.length > 0) {
        const evmuxResult = await this.startEvMux(session);

        await this.prisma.stream.update({
          where: { id: streamId },
          data: {
            evmuxEventId: config.eventId || '3491',
            evmuxJobId: evmuxResult.job_id
          }
        });
      }

      // 5. Initialize AI services
      if (config.aiEnabled) {
        await this.initAI(session);
      }

      // Update status
      session.status = 'live';
      await this.prisma.stream.update({
        where: { id: streamId },
        data: {
          status: 'LIVE',
          startedAt: new Date()
        }
      });

      await this.saveSession(session);

      // Emit real-time update
      if (this.io) {
        this.io.to(`user:${userId}`).emit('stream:started', session);
      }

      return session;
    } catch (error: any) {
      session.status = 'error';
      session.error = error.message;

      await this.prisma.stream.update({
        where: { id: streamId },
        data: {
          status: 'ERROR',
          metadata: { error: error.message }
        }
      });

      throw error;
    }
  }

  /**
   * Stop a stream
   */
  async stopStream(streamId: string): Promise<void> {
    const session = await this.getSession(streamId);
    if (!session) {
      throw new Error('Stream not found');
    }

    // Update all destinations
    await this.prisma.streamDestination.updateMany({
      where: { streamId },
      data: {
        status: 'DISCONNECTED',
        endedAt: new Date()
      }
    });

    // Update stream
    await this.prisma.stream.update({
      where: { id: streamId },
      data: {
        status: 'ENDED',
        endedAt: new Date()
      }
    });

    // Clear session from Redis
    await this.redis.del(`session:${streamId}`);

    // Emit real-time update
    if (this.io) {
      this.io.to(`stream:${streamId}`).emit('stream:ended', { streamId });
    }
  }

  /**
   * VDO.Ninja Integration
   */
  private async initVDO(streamId: string) {
    return this.vdoNinja.createRoom(streamId);
  }

  /**
   * PRISM Live Studio Integration
   */
  private async setupPRISM(scenes: SceneConfig[]) {
    const wsUrl = this.services.get('prism')?.baseUrl;
    if (!wsUrl) {
      throw new Error('PRISM service not configured');
    }

    const ws = new WebSocket(wsUrl);

    await new Promise((resolve, reject) => {
      ws.on('open', resolve);
      ws.on('error', reject);
    });

    for (const scene of scenes) {
      // Create scene
      await this.sendOBSCommand(ws, 'CreateScene', {
        sceneName: scene.name
      });

      // Add sources
      for (const source of scene.sources) {
        await this.sendOBSCommand(ws, 'CreateInput', {
          sceneName: scene.name,
          inputName: source.name,
          inputKind: source.type,
          inputSettings: source.settings
        });
      }
    }

    ws.close();
  }

  private async sendOBSCommand(ws: WebSocket, command: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const messageId = uuidv4();

      ws.send(JSON.stringify({
        'request-type': command,
        'message-id': messageId,
        ...data
      }));

      const timeout = setTimeout(() => {
        reject(new Error('OBS command timeout'));
      }, 5000);

      ws.once('message', (response) => {
        clearTimeout(timeout);
        const result = JSON.parse(response.toString());
        if (result.status === 'ok') {
          resolve(result);
        } else {
          reject(new Error(result.error));
        }
      });
    });
  }

  /**
   * Platform Connection
   */
  private async connectPlatform(userId: string, platform: PlatformConfig): Promise<PlatformConnection> {
    return this.platformService.connect(userId, platform);
  }

  /**
   * EvMux Multi-Streaming
   */
  private async startEvMux(session: StreamSession) {
    return this.evMux.startMultiStream({
      eventId: session.config.eventId || '3491',
      destinations: session.platforms.map(p => ({
        name: p.platform,
        rtmp_url: p.streamUrl,
        rtmp_key: p.streamKey
      }))
    });
  }

  /**
   * AI Services Integration
   */
  private async initAI(session: StreamSession) {
    // HeyGen Avatar
    if (session.config.avatar) {
      await this.createAvatarHost(session);
    }

    // ElevenLabs Voice
    if (session.config.voice) {
      await this.initVoiceClone(session);
    }

    // Akool AI Features
    if (session.config.translation) {
      await this.enableTranslation(session);
    }
  }

  private async createAvatarHost(session: StreamSession) {
    const queue = this.queues.get('heygen')!;

    await queue.add('create-avatar', {
      sessionId: session.id,
      userId: session.userId,
      avatarId: session.config.avatar!.id,
      script: session.config.avatar!.script,
      voiceId: session.config.avatar!.voiceId
    });
  }

  private async initVoiceClone(session: StreamSession) {
    const queue = this.queues.get('elevenlabs')!;

    await queue.add('clone-voice', {
      sessionId: session.id,
      userId: session.userId,
      audioUrl: session.config.voice!.sampleUrl,
      voiceName: session.config.voice!.name
    });
  }

  private async enableTranslation(session: StreamSession) {
    const queue = this.queues.get('akool')!;

    await queue.add('setup-translation', {
      sessionId: session.id,
      userId: session.userId,
      languages: session.config.translation!.languages
    });
  }

  /**
   * Content Generation Pipeline
   */
  async generateContent(type: ContentType, params: any) {
    switch (type) {
      case 'avatar-video':
        return await this.generateAvatarVideo(params);
      case 'translated-video':
        return await this.translateVideo(params);
      case 'image-to-video':
        return await this.imageToVideo(params);
      case 'voice-clone':
        return await this.cloneVoice(params);
      default:
        throw new Error(`Unknown content type: ${type}`);
    }
  }

  private async generateAvatarVideo(params: AvatarVideoParams) {
    return this.heyGen.generateVideo(params);
  }

  private async translateVideo(params: TranslationParams) {
    return this.akool.translateVideo(params);
  }

  private async imageToVideo(params: ImageToVideoParams) {
    return this.akool.imageToVideo(params);
  }

  private async cloneVoice(params: VoiceCloneParams) {
    return this.elevenLabs.cloneVoice(params);
  }

  /**
   * Session Management
   */
  private async saveSession(session: StreamSession) {
    await this.redis.setex(
      `session:${session.id}`,
      86400, // 24 hours
      JSON.stringify(session)
    );
  }

  async getSession(id: string): Promise<StreamSession | null> {
    const data = await this.redis.get(`session:${id}`);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Real-time Updates via Socket.io
   */
  setupWebSocket(io: SocketServer) {
    this.io = io;

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Join user room
      socket.on('auth', (userId: string) => {
        socket.join(`user:${userId}`);
      });

      // Join stream room
      socket.on('join-stream', async (streamId: string) => {
        socket.join(`stream:${streamId}`);
        const session = await this.getSession(streamId);
        socket.emit('stream-status', session);
      });

      // Leave stream room
      socket.on('leave-stream', (streamId: string) => {
        socket.leave(`stream:${streamId}`);
      });

      // Update scene
      socket.on('update-scene', async (data: { streamId: string; sceneId: string }) => {
        await this.updateScene(data.streamId, data.sceneId);
        io.to(`stream:${data.streamId}`).emit('scene-changed', data.sceneId);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  private async updateScene(streamId: string, sceneId: string) {
    // Update PRISM scene via WebSocket
    const wsUrl = this.services.get('prism')?.baseUrl;
    if (!wsUrl) return;

    const ws = new WebSocket(wsUrl);

    await new Promise((resolve, reject) => {
      ws.on('open', resolve);
      ws.on('error', reject);
    });

    await this.sendOBSCommand(ws, 'SetCurrentProgramScene', {
      sceneName: sceneId
    });

    ws.close();
  }

  /**
   * Get service status
   */
  async getServiceStatus(serviceId: string) {
    const service = this.services.get(serviceId);
    if (!service) {
      throw new Error(`Service not found: ${serviceId}`);
    }

    // Check health from database
    const health = await this.prisma.serviceHealth.findUnique({
      where: { service: serviceId }
    });

    return {
      ...service,
      health: health?.status || 'unknown',
      lastCheck: health?.lastCheck,
      responseTime: health?.responseTime
    };
  }

  /**
   * Clean up resources
   */
  async cleanup() {
    await this.prisma.$disconnect();
    await this.redis.quit();

    // Close all queues
    for (const [, queue] of this.queues) {
      await queue.close();
    }
  }
}

export default UnifiedPlatform;
