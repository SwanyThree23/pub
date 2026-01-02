import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { PlatformService } from '../services/PlatformService';

const router = Router();
const prisma = new PrismaClient();
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

const platformService = new PlatformService(prisma, supabase);

// Get all connected platforms for user
router.get('/', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const platforms = await prisma.userPlatform.findMany({
      where: { userId },
      select: {
        platform: true,
        platformUsername: true,
        isConnected: true,
        isEnabled: true,
        lastStreamAt: true,
        createdAt: true
      }
    });

    res.json(platforms);
  } catch (error) {
    next(error);
  }
});

// Connect a platform
router.post('/connect', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { platformId, ...data } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await platformService.savePlatformConnection(userId, platformId, data);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Disconnect a platform
router.post('/:platformId/disconnect', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { platformId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await platformService.disconnectPlatform(userId, platformId);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Enable/disable a platform
router.patch('/:platformId/toggle', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { platformId } = req.params;
    const { enabled } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await prisma.userPlatform.update({
      where: {
        userId_platform: {
          userId,
          platform: platformId.toUpperCase() as any
        }
      },
      data: {
        isEnabled: enabled
      }
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Get platform status
router.get('/:platformId/status', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { platformId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const status = await platformService.getPlatformStatus(userId, platformId);

    res.json(status);
  } catch (error) {
    next(error);
  }
});

export default router;
