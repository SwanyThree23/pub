import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime?: number;
  error?: string;
}

export class MonitoringService {
  async checkDatabaseHealth(): Promise<HealthCheck> {
    const start = Date.now();

    try {
      await prisma.$queryRaw`SELECT 1`;

      const responseTime = Date.now() - start;

      return {
        service: 'database',
        status: responseTime < 100 ? 'healthy' : 'degraded',
        responseTime
      };
    } catch (error: any) {
      return {
        service: 'database',
        status: 'down',
        error: error.message
      };
    }
  }

  async checkRedisHealth(): Promise<HealthCheck> {
    const start = Date.now();

    try {
      const Redis = require('ioredis');
      const redis = new Redis(process.env.REDIS_URL);

      await redis.ping();
      await redis.quit();

      const responseTime = Date.now() - start;

      return {
        service: 'redis',
        status: responseTime < 50 ? 'healthy' : 'degraded',
        responseTime
      };
    } catch (error: any) {
      return {
        service: 'redis',
        status: 'down',
        error: error.message
      };
    }
  }

  async checkExternalServices(): Promise<HealthCheck[]> {
    const services = [
      { name: 'heygen', url: 'https://api.heygen.com' },
      { name: 'elevenlabs', url: 'https://api.elevenlabs.io' },
      { name: 'akool', url: 'https://api.akool.com' }
    ];

    const checks = await Promise.all(
      services.map(async (service) => {
        const start = Date.now();

        try {
          const response = await fetch(service.url, {
            method: 'GET',
            signal: AbortSignal.timeout(5000)
          });

          const responseTime = Date.now() - start;

          return {
            service: service.name,
            status: response.ok ? 'healthy' : 'degraded',
            responseTime
          } as HealthCheck;
        } catch (error: any) {
          return {
            service: service.name,
            status: 'down',
            error: error.message
          } as HealthCheck;
        }
      })
    );

    return checks;
  }

  async updateServiceHealth(check: HealthCheck) {
    await prisma.serviceHealth.upsert({
      where: { service: check.service },
      create: {
        service: check.service,
        status: check.status,
        responseTime: check.responseTime,
        error: check.error
      },
      update: {
        status: check.status,
        responseTime: check.responseTime,
        error: check.error,
        lastCheck: new Date()
      }
    });
  }

  async getAllServiceHealth() {
    return await prisma.serviceHealth.findMany({
      orderBy: { lastCheck: 'desc' }
    });
  }

  async runHealthChecks() {
    try {
      // Check core services
      const dbHealth = await this.checkDatabaseHealth();
      const redisHealth = await this.checkRedisHealth();

      // Update database
      await this.updateServiceHealth(dbHealth);
      await this.updateServiceHealth(redisHealth);

      // Check external services (don't block on these)
      this.checkExternalServices().then(checks => {
        checks.forEach(check => {
          this.updateServiceHealth(check);
        });
      });

      return {
        overall: dbHealth.status === 'healthy' && redisHealth.status === 'healthy'
          ? 'healthy'
          : 'degraded',
        services: [dbHealth, redisHealth]
      };
    } catch (error) {
      console.error('Health check error:', error);
      return {
        overall: 'down',
        services: []
      };
    }
  }
}

export const monitoringService = new MonitoringService();

// Run health checks every 30 seconds
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    monitoringService.runHealthChecks();
  }, 30000);
}
