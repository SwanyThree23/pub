import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import UnifiedPlatform from '../core/UnifiedPlatform';

const router = Router();
const prisma = new PrismaClient();

// Get all streams for user
router.get('/', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const streams = await prisma.stream.findMany({
      where: { userId },
      include: {
        destinations: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(streams);
  } catch (error) {
    next(error);
  }
});

// Get stream by ID
router.get('/:id', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { id } = req.params;

    const stream = await prisma.stream.findFirst({
      where: {
        id,
        userId
      },
      include: {
        destinations: true,
        events: {
          orderBy: { timestamp: 'desc' },
          take: 100
        }
      }
    });

    if (!stream) {
      return res.status(404).json({ error: 'Stream not found' });
    }

    res.json(stream);
  } catch (error) {
    next(error);
  }
});

// Start a stream
router.post('/start', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const config = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const platform = req.app.get('platform') as UnifiedPlatform;
    const session = await platform.startStream(userId, config);

    res.json(session);
  } catch (error) {
    next(error);
  }
});

// Stop a stream
router.post('/:id/stop', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify ownership
    const stream = await prisma.stream.findFirst({
      where: { id, userId }
    });

    if (!stream) {
      return res.status(404).json({ error: 'Stream not found' });
    }

    const platform = req.app.get('platform') as UnifiedPlatform;
    await platform.stopStream(id);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Get stream session from cache
router.get('/:id/session', async (req, res, next) => {
  try {
    const { id } = req.params;

    const platform = req.app.get('platform') as UnifiedPlatform;
    const session = await platform.getSession(id);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    next(error);
  }
});

// Get stream analytics
router.get('/:id/analytics', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { id } = req.params;

    const stream = await prisma.stream.findFirst({
      where: { id, userId },
      include: {
        destinations: true,
        events: true
      }
    });

    if (!stream) {
      return res.status(404).json({ error: 'Stream not found' });
    }

    // Calculate analytics
    const analytics = {
      totalViewers: stream.totalViewers,
      peakViewers: stream.peakViewers,
      totalMinutes: stream.totalMinutes,
      platformBreakdown: stream.destinations.map(d => ({
        platform: d.platform,
        viewers: d.viewerCount,
        status: d.status
      })),
      events: stream.events.length,
      eventTypes: stream.events.reduce((acc: any, e) => {
        acc[e.type] = (acc[e.type] || 0) + 1;
        return acc;
      }, {})
    };

    res.json(analytics);
  } catch (error) {
    next(error);
  }
});

export default router;
