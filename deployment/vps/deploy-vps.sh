#!/bin/bash
# ─────────────────────────────────────────────────────────────
# Unified Platform – Hostinger VPS Deployment Script
# VPS: srv1587098.hstgr.cloud  |  IP: 2.24.198.112
# ─────────────────────────────────────────────────────────────
set -euo pipefail

VPS_IP="2.24.198.112"
VPS_HOST="srv1587098.hstgr.cloud"
VPS_USER="${VPS_USER:-root}"
APP_DIR="/opt/unified-platform"
REPO_URL="${REPO_URL:-git@github.com:SwanyThree23/pub.git}"
BRANCH="claude/unified-platform-integration-tcqDR"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'

log()  { echo -e "${GREEN}[$(date +%H:%M:%S)] $*${NC}"; }
warn() { echo -e "${YELLOW}[WARN] $*${NC}"; }
err()  { echo -e "${RED}[ERROR] $*${NC}"; exit 1; }

# ── Local checks ──────────────────────────────────────────────
log "Checking local dependencies..."
command -v ssh  >/dev/null || err "ssh not found"
command -v rsync >/dev/null || warn "rsync not found – using scp fallback"

# ── Bootstrap VPS (first run only) ───────────────────────────
bootstrap_vps() {
  log "Bootstrapping VPS at ${VPS_IP}..."

  ssh "${VPS_USER}@${VPS_IP}" bash <<'REMOTE'
set -euo pipefail

# Update system
apt-get update -y && apt-get upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install PM2
npm install -g pm2

# Install Nginx
apt-get install -y nginx

# Install Certbot
apt-get install -y certbot python3-certbot-nginx

# Install PostgreSQL 16
apt-get install -y postgresql postgresql-contrib

# Install Redis
apt-get install -y redis-server

# Enable services
systemctl enable nginx redis-server postgresql
systemctl start  nginx redis-server postgresql

echo "✓ Bootstrap complete"
REMOTE
}

# ── Deploy application ────────────────────────────────────────
deploy_app() {
  log "Deploying application..."

  ssh "${VPS_USER}@${VPS_IP}" bash <<REMOTE
set -euo pipefail

# Clone or pull repo
if [ -d "${APP_DIR}/.git" ]; then
  cd ${APP_DIR}
  git fetch origin
  git checkout ${BRANCH}
  git pull origin ${BRANCH}
else
  git clone --branch ${BRANCH} ${REPO_URL} ${APP_DIR}
  cd ${APP_DIR}
fi

# ── Backend ────────────────────────────────────────────────
cd ${APP_DIR}/backend
npm ci --production=false
npx prisma generate
npx prisma migrate deploy
npm run build

# ── Frontend ───────────────────────────────────────────────
cd ${APP_DIR}/frontend
npm ci
npm run build

echo "✓ Application deployed"
REMOTE
}

# ── Start services with PM2 ───────────────────────────────────
start_services() {
  log "Starting services with PM2..."

  ssh "${VPS_USER}@${VPS_IP}" bash <<REMOTE
cd ${APP_DIR}
pm2 startOrRestart ecosystem.config.js --env production
pm2 save
pm2 startup systemd -u root --hp /root
echo "✓ PM2 services started"
REMOTE
}

# ── Main flow ─────────────────────────────────────────────────
case "${1:-deploy}" in
  bootstrap) bootstrap_vps ;;
  deploy)    deploy_app && start_services ;;
  restart)   ssh "${VPS_USER}@${VPS_IP}" "pm2 restart all" ;;
  logs)      ssh "${VPS_USER}@${VPS_IP}" "pm2 logs" ;;
  status)    ssh "${VPS_USER}@${VPS_IP}" "pm2 status" ;;
  full)      bootstrap_vps && deploy_app && start_services ;;
  *)         err "Usage: $0 {bootstrap|deploy|restart|logs|status|full}" ;;
esac

log "Done! Access your app at https://${VPS_HOST}"
