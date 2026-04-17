import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import Redis from 'ioredis';

import { HeyGenService } from '../services/HeyGenService';
import { ElevenLabsService } from '../services/ElevenLabsService';
import { AkoolService } from '../services/AkoolService';

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379')
};

// Initialize services
const heyGenService = new HeyGenService(prisma, supabase);
const elevenLabsService = new ElevenLabsService(prisma, supabase);
const akoolService = new AkoolService(prisma, supabase);

// HeyGen Worker
const heyGenWorker = new Worker(
  'heygen',
  async (job: Job) => {
    console.log(`Processing HeyGen job ${job.id}:`, job.name);

    try {
      switch (job.name) {
        case 'create-avatar':
          const result = await heyGenService.generateVideo({
            userId: job.data.userId,
            avatarId: job.data.avatarId,
            voiceId: job.data.voiceId,
            script: job.data.script
          });

          // Track in database
          await prisma.queueJob.create({
            data: {
              queueName: 'heygen',
              jobId: job.id!,
              type: job.name,
              status: 'completed',
              data: job.data,
              result: result,
              completedAt: new Date()
            }
          });

          return result;

        default:
          throw new Error(`Unknown job type: ${job.name}`);
      }
    } catch (error: any) {
      // Track error
      await prisma.queueJob.create({
        data: {
          queueName: 'heygen',
          jobId: job.id!,
          type: job.name,
          status: 'failed',
          data: job.data,
          error: error.message,
          attempts: job.attemptsMade
        }
      });

      throw error;
    }
  },
  { connection }
);

// ElevenLabs Worker
const elevenLabsWorker = new Worker(
  'elevenlabs',
  async (job: Job) => {
    console.log(`Processing ElevenLabs job ${job.id}:`, job.name);

    try {
      switch (job.name) {
        case 'clone-voice':
          const result = await elevenLabsService.cloneVoice({
            userId: job.data.userId,
            name: job.data.voiceName,
            audioFiles: [job.data.audioUrl]
          });

          await prisma.queueJob.create({
            data: {
              queueName: 'elevenlabs',
              jobId: job.id!,
              type: job.name,
              status: 'completed',
              data: job.data,
              result: result,
              completedAt: new Date()
            }
          });

          return result;

        case 'text-to-speech':
          const audio = await elevenLabsService.textToSpeech(
            job.data.text,
            job.data.voiceId,
            job.data.userId
          );

          return { audioBuffer: audio };

        default:
          throw new Error(`Unknown job type: ${job.name}`);
      }
    } catch (error: any) {
      await prisma.queueJob.create({
        data: {
          queueName: 'elevenlabs',
          jobId: job.id!,
          type: job.name,
          status: 'failed',
          data: job.data,
          error: error.message,
          attempts: job.attemptsMade
        }
      });

      throw error;
    }
  },
  { connection }
);

// Akool Worker
const akoolWorker = new Worker(
  'akool',
  async (job: Job) => {
    console.log(`Processing Akool job ${job.id}:`, job.name);

    try {
      switch (job.name) {
        case 'setup-translation':
          // Translation setup logic
          return { configured: true, languages: job.data.languages };

        case 'translate-video':
          const result = await akoolService.translateVideo({
            userId: job.data.userId,
            videoUrl: job.data.videoUrl,
            targetLanguage: job.data.targetLanguage
          });

          await prisma.queueJob.create({
            data: {
              queueName: 'akool',
              jobId: job.id!,
              type: job.name,
              status: 'completed',
              data: job.data,
              result: result,
              completedAt: new Date()
            }
          });

          return result;

        case 'image-to-video':
          const videoResult = await akoolService.imageToVideo({
            userId: job.data.userId,
            imageUrl: job.data.imageUrl,
            prompt: job.data.prompt
          });

          await prisma.queueJob.create({
            data: {
              queueName: 'akool',
              jobId: job.id!,
              type: job.name,
              status: 'completed',
              data: job.data,
              result: videoResult,
              completedAt: new Date()
            }
          });

          return videoResult;

        default:
          throw new Error(`Unknown job type: ${job.name}`);
      }
    } catch (error: any) {
      await prisma.queueJob.create({
        data: {
          queueName: 'akool',
          jobId: job.id!,
          type: job.name,
          status: 'failed',
          data: job.data,
          error: error.message,
          attempts: job.attemptsMade
        }
      });

      throw error;
    }
  },
  { connection }
);

// Event listeners
const workers = [heyGenWorker, elevenLabsWorker, akoolWorker];

workers.forEach((worker) => {
  worker.on('completed', (job) => {
    console.log(`✓ Job ${job.id} completed`);
  });

  worker.on('failed', (job, error) => {
    console.error(`✗ Job ${job?.id} failed:`, error.message);
  });

  worker.on('error', (error) => {
    console.error('Worker error:', error);
  });
});

console.log('🔧 Workers started');
console.log('- HeyGen Worker');
console.log('- ElevenLabs Worker');
console.log('- Akool Worker');

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down workers...');
  await Promise.all(workers.map(w => w.close()));
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down workers...');
  await Promise.all(workers.map(w => w.close()));
  await prisma.$disconnect();
  process.exit(0);
});
