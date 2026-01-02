import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const router = Router();
const prisma = new PrismaClient();
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Get all API keys for user
router.get('/', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: { userId },
      select: {
        id: true,
        service: true,
        keyName: true,
        isActive: true,
        createdAt: true,
        lastUsedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(apiKeys);
  } catch (error) {
    next(error);
  }
});

// Add API key
router.post('/', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { service, keyName, apiKey } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Store in Supabase vault
    const { data: vaultData, error: vaultError } = await supabase
      .from('vault')
      .insert({
        secret: apiKey,
        name: `${service}_${keyName}`,
        description: `API key for ${service}`,
        key_id: `${userId}_${service}_${keyName}`
      })
      .select()
      .single();

    if (vaultError) {
      throw new Error('Failed to store API key in vault');
    }

    // Create record in database
    const key = await prisma.apiKey.create({
      data: {
        userId,
        service,
        keyName,
        supabaseId: vaultData.id,
        isActive: true
      },
      select: {
        id: true,
        service: true,
        keyName: true,
        isActive: true,
        createdAt: true
      }
    });

    res.json(key);
  } catch (error) {
    next(error);
  }
});

// Delete API key
router.delete('/:id', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get API key record
    const apiKey = await prisma.apiKey.findFirst({
      where: { id, userId }
    });

    if (!apiKey) {
      return res.status(404).json({ error: 'API key not found' });
    }

    // Delete from Supabase vault
    await supabase
      .from('vault')
      .delete()
      .eq('id', apiKey.supabaseId);

    // Delete from database
    await prisma.apiKey.delete({
      where: { id }
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Toggle API key active status
router.patch('/:id/toggle', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { id } = req.params;
    const { isActive } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const apiKey = await prisma.apiKey.updateMany({
      where: { id, userId },
      data: { isActive }
    });

    if (apiKey.count === 0) {
      return res.status(404).json({ error: 'API key not found' });
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
