import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import UnifiedPlatform from '../core/UnifiedPlatform';

const router = Router();
const prisma = new PrismaClient();

// Generate avatar video
router.post('/avatar-video', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const params = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const platform = req.app.get('platform') as UnifiedPlatform;
    const result = await platform.generateContent('avatar-video', {
      ...params,
      userId
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Translate video
router.post('/translate-video', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const params = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const platform = req.app.get('platform') as UnifiedPlatform;
    const result = await platform.generateContent('translated-video', {
      ...params,
      userId
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Image to video
router.post('/image-to-video', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const params = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const platform = req.app.get('platform') as UnifiedPlatform;
    const result = await platform.generateContent('image-to-video', {
      ...params,
      userId
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Clone voice
router.post('/clone-voice', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const params = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const platform = req.app.get('platform') as UnifiedPlatform;
    const result = await platform.generateContent('voice-clone', {
      ...params,
      userId
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get all videos for user
router.get('/videos', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const videos = await prisma.video.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(videos);
  } catch (error) {
    next(error);
  }
});

// Get video by ID
router.get('/videos/:id', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const video = await prisma.video.findFirst({
      where: { id, userId }
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json(video);
  } catch (error) {
    next(error);
  }
});

// Get all voice clones for user
router.get('/voices', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const voices = await prisma.voiceClone.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(voices);
  } catch (error) {
    next(error);
  }
});

export default router;
