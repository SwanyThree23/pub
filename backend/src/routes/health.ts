import { Router } from 'express';
import { monitoringService } from '../utils/monitoring';
import os from 'os';

const router = Router();

// Basic health check
router.get('/', async (req, res) => {
  const health = await monitoringService.runHealthChecks();

  res.status(health.overall === 'healthy' ? 200 : 503).json({
    status: health.overall,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime(),
    services: health.services
  });
});

// Detailed health check
router.get('/detailed', async (req, res) => {
  const [health, allServices] = await Promise.all([
    monitoringService.runHealthChecks(),
    monitoringService.getAllServiceHealth()
  ]);

  res.json({
    status: health.overall,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime(),
    process: {
      pid: process.pid,
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    },
    system: {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      uptime: os.uptime()
    },
    services: allServices
  });
});

// Ready check (for Kubernetes/Railway)
router.get('/ready', async (req, res) => {
  const health = await monitoringService.runHealthChecks();

  if (health.overall === 'healthy') {
    res.status(200).json({ ready: true });
  } else {
    res.status(503).json({ ready: false });
  }
});

// Live check (for Kubernetes/Railway)
router.get('/live', (req, res) => {
  res.status(200).json({ alive: true });
});

export default router;
