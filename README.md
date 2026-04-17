# Unified Platform

Ultimate multi-platform live streaming and AI content generation platform. Stream simultaneously to 12+ platforms, invite remote guests via WebRTC, and automate content pipelines with AI.

---

## Infrastructure at a Glance

| Component | Service | URL / Endpoint |
|---|---|---|
| **VPS** | Hostinger | `srv1587098.hstgr.cloud` — `2.24.198.112` |
| **Frontend** | Next.js 14 | `https://srv1587098.hstgr.cloud` |
| **API** | Express.js | `https://api.srv1587098.hstgr.cloud` |
| **WebRTC** | LiveKit | `wss://seewhylive-1.livekit.cloud` |
| **Automation** | n8n | `https://n8n.srv1587098.hstgr.cloud` |
| **Database** | PostgreSQL + Supabase | `rxlgywvfclyjdfyvfvyc.supabase.co` |
| **Cache / Queues** | Redis + BullMQ | localhost:6379 (VPS) |
| **Deployment alt** | Railway | workspace `f904c96c-8bad-4d6d-bf90-221f96222cb9` |

---

## Features

### Live Streaming
- **12 Platforms simultaneously** — YouTube, Twitch, Facebook, Instagram, TikTok, LinkedIn, Twitter/X, Kick, Rumble, Telegram, Amazon Live, Steam
- **EvMux** multi-destination RTMP (Event ID: 3491)
- **LiveKit WebRTC** — host studio, remote guests, viewer watch page
- **VDO.Ninja** — browser-based remote guest management
- **PRISM Live Studio** — scene control via OBS WebSocket protocol
- Real-time viewer counts synced via LiveKit webhooks + Supabase presence

### AI Content Generation
- **HeyGen** — photorealistic avatar video generation
- **ElevenLabs** — voice cloning and multilingual TTS
- **Akool** — video translation, image-to-video, face swap
- **Anthropic Claude** — orchestration and script writing
- BullMQ job queues — async processing with retries, tracked in PostgreSQL

### Automation (n8n)
- Triggered on: stream start/end, viewer milestones, video completed, voice cloned, platform errors, new user, subscription change
- Webhooks fire-and-forget — never blocks the main request
- Configurable per-event webhook paths via env vars

### Real-Time
- **Socket.io** — stream control events pushed to dashboard
- **Supabase Realtime** — stream status changes and viewer presence
- **LiveKit** — WebRTC audio/video with presence tracking

### Security
- JWT authentication with role-based access (User / Creator / Admin / SuperAdmin)
- Supabase Vault for encrypted API key storage
- Nginx rate limiting (60 req/min API, 10 req/min auth)
- HSTS, X-Frame-Options, X-Content-Type-Options headers
- Input validation with Zod on every route

---

## Project Structure

```
unified-platform/
├── backend/
│   ├── src/
│   │   ├── core/
│   │   │   └── UnifiedPlatform.ts      # Central service orchestrator
│   │   ├── services/
│   │   │   ├── HeyGenService.ts        # Avatar video generation
│   │   │   ├── ElevenLabsService.ts    # Voice cloning & TTS
│   │   │   ├── AkoolService.ts         # Translation, img2vid, face swap
│   │   │   ├── LiveKitService.ts       # WebRTC rooms & token issuance
│   │   │   ├── N8nService.ts           # Automation event triggers
│   │   │   ├── VDONinjaService.ts      # Remote guest URLs
│   │   │   ├── EvMuxService.ts         # Multi-destination RTMP
│   │   │   └── PlatformService.ts      # Stream key management
│   │   ├── routes/
│   │   │   ├── auth.ts                 # Register / login / profile
│   │   │   ├── stream.ts               # Start / stop / analytics
│   │   │   ├── platform.ts             # Connect / toggle platforms
│   │   │   ├── content.ts              # AI content generation
│   │   │   ├── livekit.ts              # WebRTC tokens + webhooks
│   │   │   ├── analytics.ts            # Overview + platform stats
│   │   │   ├── webhooks.ts             # HeyGen / ElevenLabs / Akool / EvMux
│   │   │   ├── apiKey.ts               # Vault-backed API key CRUD
│   │   │   └── health.ts               # /health, /health/ready, /health/live
│   │   ├── middleware/
│   │   │   ├── auth.ts                 # JWT + role guards
│   │   │   ├── errorHandler.ts         # Centralised error mapping
│   │   │   └── logger.ts               # Request + performance logging
│   │   ├── workers/
│   │   │   └── index.ts                # BullMQ: HeyGen, ElevenLabs, Akool
│   │   └── utils/
│   │       ├── supabase.ts             # Vault, Storage, Realtime helpers
│   │       ├── monitoring.ts           # Service health checks
│   │       └── validation.ts           # Zod schemas
│   ├── prisma/
│   │   ├── schema.prisma               # 12 models
│   │   └── migrations/
│   └── .env.example
│
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── index.tsx               # Dashboard (stream / platforms / content tabs)
│       │   ├── login.tsx               # JWT login
│       │   ├── register.tsx            # Registration
│       │   ├── analytics.tsx           # Stats dashboard
│       │   ├── settings.tsx            # Profile / API keys / notifications
│       │   ├── studio/[streamId].tsx   # Host studio (LiveKit + controls)
│       │   └── watch/[streamId].tsx    # Public viewer page
│       ├── components/
│       │   ├── LiveKitRoom.tsx         # WebRTC room (host/guest/viewer modes)
│       │   ├── StreamDashboard.tsx     # Start/stop + stream history
│       │   ├── PlatformManager.tsx     # Connect 12 platforms
│       │   └── ContentStudio.tsx       # AI content creation UI
│       ├── hooks/
│       │   └── useWebSocket.ts         # Socket.io hook
│       └── utils/
│           └── supabase.ts             # Browser Supabase client + presence
│
├── deployment/
│   ├── vps/
│   │   ├── deploy-vps.sh              # SSH deploy (bootstrap/deploy/restart)
│   │   ├── nginx.conf                 # Reverse proxy + WebSocket + SSL
│   │   ├── setup-ssl.sh               # Let's Encrypt for both subdomains
│   │   └── setup-postgres.sh          # DB + user + extensions
│   ├── docker/
│   │   ├── docker-compose.yml         # Full local stack
│   │   ├── Dockerfile.backend
│   │   ├── Dockerfile.workers
│   │   └── Dockerfile.frontend
│   └── railway/
│       ├── railway.json
│       └── railway.toml
│
├── ecosystem.config.js                # PM2: API cluster + workers + frontend
├── setup_complete.sh                  # One-command local setup
└── docs/
    └── API.md                         # Full API reference
```

---

## Quick Start (Local Dev)

### Prerequisites
- Node.js 20+, npm
- PostgreSQL 14+, Redis 6+
- Docker (optional)

### 1. Install

```bash
chmod +x setup_complete.sh
./setup_complete.sh
```

### 2. Configure

```bash
cd backend
cp .env.example .env
# Fill in your keys — see Environment Variables section below
```

### 3. Database

```bash
cd backend
npx prisma db push
```

### 4. Run (three terminals)

```bash
# Terminal 1 — API
cd backend && npm run dev

# Terminal 2 — BullMQ workers
cd backend && npm run worker

# Terminal 3 — Frontend
cd frontend && npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API | http://localhost:4000 |
| Health | http://localhost:4000/health |
| Prisma Studio | `npx prisma studio` |

---

## Deploy to Hostinger VPS (`2.24.198.112`)

### First-time bootstrap

```bash
# Installs Node 20, PM2, Nginx, Postgres, Redis, Certbot
VPS_USER=root ./deployment/vps/deploy-vps.sh bootstrap
```

### Database setup

```bash
ssh root@2.24.198.112 'bash /opt/unified-platform/deployment/vps/setup-postgres.sh'
# Outputs DATABASE_URL — copy into .env
```

### Deploy application

```bash
# Copy env and deploy
scp backend/.env root@2.24.198.112:/opt/unified-platform/backend/.env
./deployment/vps/deploy-vps.sh deploy
```

### SSL certificates

```bash
ssh root@2.24.198.112 'bash /opt/unified-platform/deployment/vps/setup-ssl.sh'
```

### Nginx

```bash
ssh root@2.24.198.112 \
  'cp /opt/unified-platform/deployment/vps/nginx.conf /etc/nginx/sites-available/unified \
   && ln -sf /etc/nginx/sites-available/unified /etc/nginx/sites-enabled/ \
   && nginx -t && systemctl reload nginx'
```

### Ongoing commands

```bash
./deployment/vps/deploy-vps.sh restart   # Restart PM2 processes
./deployment/vps/deploy-vps.sh logs      # Tail PM2 logs
./deployment/vps/deploy-vps.sh status    # PM2 process list
./deployment/vps/deploy-vps.sh deploy    # Redeploy after git push
```

---

## Deploy to Railway

```bash
cd backend
./scripts/deploy.sh
# Target workspace: f904c96c-8bad-4d6d-bf90-221f96222cb9
```

---

## Deploy with Docker

```bash
cd deployment/docker
docker-compose up -d
```

---

## Environment Variables

Create `backend/.env` from `backend/.env.example`:

```env
# ── Core ──────────────────────────────────────────────────────
DATABASE_URL="postgresql://unified:password@localhost:5432/unified_platform"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="change-this-to-a-long-random-string"
PORT=4000
NODE_ENV=production
FRONTEND_URL="https://srv1587098.hstgr.cloud"

# ── Supabase (project: rxlgywvfclyjdfyvfvyc) ──────────────────
SUPABASE_URL="https://rxlgywvfclyjdfyvfvyc.supabase.co"
SUPABASE_ANON_KEY="sb_publishable_CtHMhtj7hLmg8jejBnUrfA_BsWb0Lpb"
SUPABASE_SERVICE_KEY="<your service role key>"

# ── LiveKit ───────────────────────────────────────────────────
LIVEKIT_URL="wss://seewhylive-1.livekit.cloud"
LIVEKIT_API_KEY="<your livekit api key>"
LIVEKIT_API_SECRET="<your livekit api secret>"

# ── n8n Automation ────────────────────────────────────────────
N8N_URL="https://n8n.srv1587098.hstgr.cloud"
N8N_API_TOKEN="<your n8n api token>"

# ── AI Services ───────────────────────────────────────────────
HEYGEN_API_KEY="<your heygen key>"
ELEVENLABS_API_KEY="<your elevenlabs key>"
AKOOL_API_KEY="<your akool key>"

# ── Streaming ─────────────────────────────────────────────────
VDO_API_KEY="<your vdo.ninja key>"
VDO_PASSWORD="<room password>"
EVMUX_API_KEY="<your evmux key>"

# ── Platform OAuth ────────────────────────────────────────────
YOUTUBE_CLIENT_ID=""
YOUTUBE_CLIENT_SECRET=""
TWITCH_CLIENT_ID=""
TWITCH_CLIENT_SECRET=""
FACEBOOK_APP_ID=""
FACEBOOK_APP_SECRET=""
TWITTER_API_KEY=""
TIKTOK_CLIENT_KEY=""
```

Frontend `.env.local`:

```env
NEXT_PUBLIC_API_URL="https://api.srv1587098.hstgr.cloud"
NEXT_PUBLIC_WS_URL="wss://api.srv1587098.hstgr.cloud"
NEXT_PUBLIC_SUPABASE_URL="https://rxlgywvfclyjdfyvfvyc.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_CtHMhtj7hLmg8jejBnUrfA_BsWb0Lpb"
```

---

## API Overview

Full reference: [`docs/API.md`](docs/API.md)

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Get JWT token |
| GET | `/api/auth/me` | Current user + subscription |
| POST | `/api/streams/start` | Start multi-platform stream |
| POST | `/api/streams/:id/stop` | Stop stream |
| GET | `/api/streams/:id/analytics` | Stream stats |
| GET | `/api/platforms` | Connected platforms |
| POST | `/api/platforms/connect` | Add platform stream key |
| POST | `/api/content/avatar-video` | Generate HeyGen avatar video |
| POST | `/api/content/translate-video` | Akool video translation |
| POST | `/api/content/image-to-video` | Akool image→video |
| POST | `/api/content/clone-voice` | ElevenLabs voice clone |
| POST | `/api/livekit/token/host` | LiveKit host token |
| POST | `/api/livekit/token/viewer` | LiveKit viewer token |
| POST | `/api/livekit/token/guest` | LiveKit guest token |
| GET | `/api/analytics/overview` | Dashboard stats |
| GET | `/api/analytics/platforms/performance` | Per-platform metrics |
| POST | `/api/api-keys` | Store API key in vault |
| GET | `/health` | Health + uptime |
| GET | `/health/ready` | Readiness probe |
| GET | `/health/live` | Liveness probe |

---

## Database Models (Prisma)

`User` · `ApiKey` · `UserPlatform` · `Stream` · `StreamDestination` · `StreamEvent` · `Video` · `VoiceClone` · `Subscription` · `ServiceHealth` · `QueueJob`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 |
| API | Express.js + TypeScript |
| Frontend | Next.js 14 + Tailwind CSS |
| Database | PostgreSQL 16 + Prisma ORM |
| Cache | Redis 7 |
| Queues | BullMQ |
| WebRTC | LiveKit |
| Realtime | Socket.io + Supabase Realtime |
| Auth | JWT + bcrypt |
| Secrets | Supabase Vault |
| Process mgr | PM2 (cluster mode) |
| Web server | Nginx |
| SSL | Let's Encrypt / Certbot |
| Automation | n8n |
| CI/CD | GitHub Actions |
| Containers | Docker + Docker Compose |

---

## License

MIT
