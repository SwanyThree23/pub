// PM2 Ecosystem Config – Unified Platform
// VPS: srv1587098.hstgr.cloud
module.exports = {
  apps: [
    // ── Backend API ──────────────────────────────────────────
    {
      name: 'unified-api',
      cwd: './backend',
      script: 'dist/index.js',
      instances: 2,
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production',
        PORT: 4000
      },
      max_memory_restart: '512M',
      error_file: '/var/log/pm2/api-error.log',
      out_file:   '/var/log/pm2/api-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      watch: false,
      autorestart: true,
      restart_delay: 3000,
      max_restarts: 10
    },

    // ── BullMQ Workers ───────────────────────────────────────
    {
      name: 'unified-workers',
      cwd: './backend',
      script: 'src/workers/index.ts',
      interpreter: 'node',
      interpreter_args: '--require tsx/cjs',
      instances: 1,
      env_production: {
        NODE_ENV: 'production'
      },
      max_memory_restart: '256M',
      error_file: '/var/log/pm2/workers-error.log',
      out_file:   '/var/log/pm2/workers-out.log',
      merge_logs: true,
      watch: false,
      autorestart: true,
      restart_delay: 5000
    },

    // ── Next.js Frontend ─────────────────────────────────────
    {
      name: 'unified-frontend',
      cwd: './frontend',
      script: 'node_modules/.bin/next',
      args: 'start',
      instances: 1,
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: 'https://api.srv1587098.hstgr.cloud',
        NEXT_PUBLIC_WS_URL:  'wss://api.srv1587098.hstgr.cloud'
      },
      max_memory_restart: '512M',
      error_file: '/var/log/pm2/frontend-error.log',
      out_file:   '/var/log/pm2/frontend-out.log',
      merge_logs: true,
      watch: false,
      autorestart: true
    }
  ]
};
