import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { livekitService } from '../services/LiveKitService';
import { PrismaClient } from '@prisma/client';

const router  = Router();
const prisma  = new PrismaClient();

// Get host token (publisher)
router.post('/token/host', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId   = req.userId!;
    const { streamId } = req.body;
    if (!streamId) return res.status(400).json({ error: 'streamId required' });

    // Verify stream belongs to user
    const stream = await prisma.stream.findFirst({ where: { id: streamId, userId } });
    if (!stream) return res.status(404).json({ error: 'Stream not found' });

    const token = livekitService.generateHostToken(streamId, userId);
    const { url } = livekitService.getConnectionInfo();

    res.json({ token, url, roomName: `stream_${streamId}` });
  } catch (error) { next(error); }
});

// Get viewer token
router.post('/token/viewer', async (req, res, next) => {
  try {
    const { streamId, viewerId } = req.body;
    if (!streamId) return res.status(400).json({ error: 'streamId required' });

    const vid   = viewerId || `anon_${Date.now()}`;
    const token = livekitService.generateViewerToken(streamId, vid);
    const { url } = livekitService.getConnectionInfo();

    res.json({ token, url, roomName: `stream_${streamId}`, viewerId: vid });
  } catch (error) { next(error); }
});

// Get guest token (invited speaker)
router.post('/token/guest', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { streamId, guestName } = req.body;
    if (!streamId || !guestName) {
      return res.status(400).json({ error: 'streamId and guestName required' });
    }

    const token = livekitService.generateGuestToken(streamId, guestName);
    const { url } = livekitService.getConnectionInfo();

    res.json({ token, url, roomName: `stream_${streamId}` });
  } catch (error) { next(error); }
});

// Create LiveKit room when stream starts
router.post('/room/create', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const { streamId, maxParticipants } = req.body;

    const stream = await prisma.stream.findFirst({ where: { id: streamId, userId } });
    if (!stream) return res.status(404).json({ error: 'Stream not found' });

    const room = await livekitService.createRoom(streamId, { maxParticipants });
    res.json(room);
  } catch (error) { next(error); }
});

// Get room info
router.get('/room/:streamId', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { streamId } = req.params;
    const info = await livekitService.getRoomInfo(streamId);
    if (!info) return res.status(404).json({ error: 'Room not found' });
    res.json(info);
  } catch (error) { next(error); }
});

// List participants
router.get('/room/:streamId/participants', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { streamId } = req.params;
    const participants = await livekitService.listParticipants(`stream_${streamId}`);
    res.json(participants);
  } catch (error) { next(error); }
});

// Remove participant (moderation)
router.delete('/room/:streamId/participants/:identity', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { streamId, identity } = req.params;
    const userId = req.userId!;

    const stream = await prisma.stream.findFirst({ where: { id: streamId, userId } });
    if (!stream) return res.status(403).json({ error: 'Not authorized' });

    await livekitService.removeParticipant(`stream_${streamId}`, identity);
    res.json({ success: true });
  } catch (error) { next(error); }
});

// LiveKit webhook (room events from server)
router.post('/webhook', async (req, res) => {
  const event = req.body;
  console.log('LiveKit webhook:', event.event);

  try {
    if (event.event === 'participant_joined') {
      const streamId = event.room?.name?.replace('stream_', '');
      if (streamId) {
        await prisma.stream.update({
          where: { id: streamId },
          data: { totalViewers: { increment: 1 } }
        });
      }
    } else if (event.event === 'participant_left') {
      const streamId = event.room?.name?.replace('stream_', '');
      if (streamId) {
        // Update peak viewers before decrementing
        const stream = await prisma.stream.findUnique({
          where: { id: streamId },
          select: { totalViewers: true, peakViewers: true }
        });
        if (stream) {
          const newCount = Math.max(0, stream.totalViewers - 1);
          await prisma.stream.update({
            where: { id: streamId },
            data: {
              totalViewers: newCount,
              peakViewers: Math.max(stream.peakViewers, stream.totalViewers)
            }
          });
        }
      }
    } else if (event.event === 'room_finished') {
      const streamId = event.room?.name?.replace('stream_', '');
      if (streamId) {
        await prisma.stream.updateMany({
          where: { id: streamId, status: { in: ['LIVE', 'STARTING'] } },
          data: { status: 'ENDED', endedAt: new Date() }
        });
      }
    }
  } catch (error) {
    console.error('LiveKit webhook processing error:', error);
  }

  res.json({ received: true });
});

export default router;
