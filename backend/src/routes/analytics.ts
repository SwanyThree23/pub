import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get analytics overview
router.get('/overview', authMiddleware, async (req: any, res, next) => {
  try {
    const userId = req.userId;

    // Get total streams
    const totalStreams = await prisma.stream.count({
      where: { userId }
    });

    // Get total viewers
    const streams = await prisma.stream.findMany({
      where: { userId },
      select: { totalViewers: true, totalMinutes: true }
    });

    const totalViewers = streams.reduce((sum, s) => sum + (s.totalViewers || 0), 0);
    const totalMinutes = streams.reduce((sum, s) => sum + (s.totalMinutes || 0), 0);

    // Get active streams
    const activeStreams = await prisma.stream.count({
      where: {
        userId,
        status: { in: ['LIVE', 'STARTING'] }
      }
    });

    // Get videos
    const totalVideos = await prisma.video.count({
      where: { userId }
    });

    const completedVideos = await prisma.video.count({
      where: {
        userId,
        status: 'COMPLETED'
      }
    });

    // Get voice clones
    const totalVoices = await prisma.voiceClone.count({
      where: { userId }
    });

    // Platform breakdown
    const platformStats = await prisma.streamDestination.groupBy({
      by: ['platform'],
      where: {
        stream: {
          userId
        }
      },
      _count: {
        id: true
      },
      _sum: {
        viewerCount: true
      }
    });

    res.json({
      overview: {
        totalStreams,
        activeStreams,
        totalViewers,
        totalMinutes,
        totalVideos,
        completedVideos,
        totalVoices
      },
      platformStats: platformStats.map(p => ({
        platform: p.platform,
        streamCount: p._count.id,
        totalViewers: p._sum.viewerCount || 0
      }))
    });
  } catch (error) {
    next(error);
  }
});

// Get stream analytics by period
router.get('/streams/period', authMiddleware, async (req: any, res, next) => {
  try {
    const userId = req.userId;
    const { period = '7d' } = req.query;

    const daysAgo = period === '7d' ? 7 : period === '30d' ? 30 : 1;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    const streams = await prisma.stream.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate
        }
      },
      include: {
        destinations: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Group by day
    const streamsByDay = streams.reduce((acc: any, stream) => {
      const day = stream.createdAt.toISOString().split('T')[0];
      if (!acc[day]) {
        acc[day] = {
          date: day,
          streams: 0,
          viewers: 0,
          minutes: 0
        };
      }
      acc[day].streams++;
      acc[day].viewers += stream.totalViewers || 0;
      acc[day].minutes += stream.totalMinutes || 0;
      return acc;
    }, {});

    res.json({
      period,
      data: Object.values(streamsByDay)
    });
  } catch (error) {
    next(error);
  }
});

// Get platform performance
router.get('/platforms/performance', authMiddleware, async (req: any, res, next) => {
  try {
    const userId = req.userId;

    const destinations = await prisma.streamDestination.findMany({
      where: {
        stream: {
          userId
        }
      },
      include: {
        stream: {
          select: {
            totalMinutes: true
          }
        }
      }
    });

    const platformPerformance = destinations.reduce((acc: any, dest) => {
      const platform = dest.platform;
      if (!acc[platform]) {
        acc[platform] = {
          platform,
          totalStreams: 0,
          totalViewers: 0,
          avgViewers: 0,
          successRate: 0,
          totalMinutes: 0
        };
      }

      acc[platform].totalStreams++;
      acc[platform].totalViewers += dest.viewerCount || 0;
      acc[platform].totalMinutes += dest.stream.totalMinutes || 0;

      if (dest.status === 'LIVE' || dest.status === 'DISCONNECTED') {
        acc[platform].successRate++;
      }

      return acc;
    }, {});

    // Calculate averages
    Object.values(platformPerformance).forEach((p: any) => {
      p.avgViewers = Math.round(p.totalViewers / p.totalStreams);
      p.successRate = Math.round((p.successRate / p.totalStreams) * 100);
    });

    res.json(Object.values(platformPerformance));
  } catch (error) {
    next(error);
  }
});

// Get content analytics
router.get('/content', authMiddleware, async (req: any, res, next) => {
  try {
    const userId = req.userId;

    // Video stats
    const videoStats = await prisma.video.groupBy({
      by: ['type', 'status'],
      where: { userId },
      _count: {
        id: true
      }
    });

    // Voice stats
    const voiceStats = await prisma.voiceClone.groupBy({
      by: ['status'],
      where: { userId },
      _count: {
        id: true
      }
    });

    // Recent activity
    const recentVideos = await prisma.video.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        type: true,
        status: true,
        createdAt: true,
        completedAt: true
      }
    });

    res.json({
      videos: videoStats,
      voices: voiceStats,
      recentActivity: recentVideos
    });
  } catch (error) {
    next(error);
  }
});

export default router;
