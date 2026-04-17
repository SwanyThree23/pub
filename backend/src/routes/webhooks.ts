import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const router = Router();
const prisma = new PrismaClient();

// Webhook secret validation
const validateWebhookSignature = (
  payload: string,
  signature: string,
  secret: string
): boolean => {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return digest === signature;
};

// HeyGen webhook
router.post('/heygen', async (req, res, next) => {
  try {
    const signature = req.headers['x-heygen-signature'] as string;
    const payload = JSON.stringify(req.body);

    // Validate signature (optional, configure HEYGEN_WEBHOOK_SECRET)
    if (process.env.HEYGEN_WEBHOOK_SECRET && signature) {
      const isValid = validateWebhookSignature(
        payload,
        signature,
        process.env.HEYGEN_WEBHOOK_SECRET
      );

      if (!isValid) {
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    const { event_type, data } = req.body;

    if (event_type === 'video.completed') {
      // Update video record
      await prisma.video.updateMany({
        where: { jobId: data.video_id },
        data: {
          status: 'COMPLETED',
          videoUrl: data.video_url,
          thumbnailUrl: data.thumbnail_url,
          duration: data.duration,
          completedAt: new Date()
        }
      });

      console.log(`HeyGen video completed: ${data.video_id}`);
    } else if (event_type === 'video.failed') {
      await prisma.video.updateMany({
        where: { jobId: data.video_id },
        data: {
          status: 'FAILED',
          error: data.error || 'Video generation failed'
        }
      });

      console.log(`HeyGen video failed: ${data.video_id}`);
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
});

// ElevenLabs webhook
router.post('/elevenlabs', async (req, res, next) => {
  try {
    const { event_type, data } = req.body;

    if (event_type === 'voice.ready') {
      await prisma.voiceClone.updateMany({
        where: { voiceId: data.voice_id },
        data: {
          status: 'COMPLETED',
          previewUrl: data.preview_url,
          completedAt: new Date()
        }
      });

      console.log(`ElevenLabs voice ready: ${data.voice_id}`);
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
});

// Akool webhook
router.post('/akool', async (req, res, next) => {
  try {
    const { event, data } = req.body;

    if (event === 'job.completed') {
      await prisma.video.updateMany({
        where: { jobId: data.job_id },
        data: {
          status: 'COMPLETED',
          videoUrl: data.output_url,
          completedAt: new Date()
        }
      });

      console.log(`Akool job completed: ${data.job_id}`);
    } else if (event === 'job.failed') {
      await prisma.video.updateMany({
        where: { jobId: data.job_id },
        data: {
          status: 'FAILED',
          error: data.error || 'Job failed'
        }
      });

      console.log(`Akool job failed: ${data.job_id}`);
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
});

// EvMux webhook
router.post('/evmux', async (req, res, next) => {
  try {
    const { event, data } = req.body;

    console.log('EvMux webhook:', event, data);

    if (event === 'stream.started') {
      // Update stream destinations
      await prisma.streamDestination.updateMany({
        where: {
          stream: {
            evmuxEventId: data.event_id
          }
        },
        data: {
          status: 'LIVE'
        }
      });
    } else if (event === 'stream.ended') {
      await prisma.streamDestination.updateMany({
        where: {
          stream: {
            evmuxEventId: data.event_id
          }
        },
        data: {
          status: 'DISCONNECTED',
          endedAt: new Date()
        }
      });
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
});

export default router;
