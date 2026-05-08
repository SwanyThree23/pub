# SwanyThree Ultimate — AI Streaming Platform

Full-stack AI streaming platform: VDO.Ninja multi-guest, PRISM Live Studio automation, AI scene switching, live transcription, HITL moderation, and the **SeeWhy LIVE** broadcast UI built from 17 production screenshots.

---

## Table of Contents

- [Features](#features)
- [SeeWhy LIVE UI](#seewhy-live-ui)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Environment Variables](#environment-variables)
- [Quick Start](#quick-start)
- [Docker Services](#docker-services)
- [Database Schema](#database-schema)
- [Frontend Pages](#frontend-pages)
- [API Reference](#api-reference)
- [Services](#services)
- [n8n Automation](#n8n-automation)
- [HITL Workflow](#hitl-workflow)
- [Troubleshooting](#troubleshooting)
- [Default Credentials](#default-credentials)
- [Supplementary Docs](#supplementary-docs)

---

## Features

### SeeWhy LIVE Broadcast UI
- Octagonal panel grid — 8-guest stage with `clip-path` octagons, cyan speaker glow, gold host ring
- Double-click spotlight — expands any panel to 2×2 featured view
- Social feed + story rings — LIVE-badged avatars, room cards with viewer counts
- PK Battle — animated split-score progress bar
- Watch Party — ±0ms sync badge, host-controlled scrubber, floating emoji reactions
- 120s Golden Paywall — Bronze / Silver / Gold tier selector before free preview expires
- Go Live modal — Single Cam / Panel / Audio Room type cards with permission grants
- Guardian AI HUD — LLMLingua compression stats in chat header
- Multilingual chat — auto-translated messages shown in italics below original
- Revenue sidebar — live 90/10 earnings ticker with stacked bar visualization
- Guests panel — per-guest CAM ON / NO FEED status, MUTE button, speaking indicator

### AI & Automation
- **AI Smart Director** — automatic scene switching on active speaker detection
- **Real-Time Transcription** — Whisper API, 500ms latency, SRT export
- **Live Translation** — GPT-4 multi-language with browser overlay output
- **AI Moderation** — OpenAI Moderation API + Ollama fallback
- **HITL Queue** — human review for low-confidence decisions
- **Model Drift Detection** — accuracy degradation alerts
- **n8n Workflows** — pre-built automation templates

### Production & Streaming
- **VDO.Ninja Remote Control API** — complete webhook control via `https://api.vdo.ninja/{key}/{action}/{value}`
- **PRISM / OBS WebSocket** — scene switching, audio mixing, streaming start/stop, Studio Mode
- **Multi-Guest** — up to 9 simultaneous VDO.Ninja guests
- **Automated Scene Creation** — per-guest scenes + responsive grid layouts on room creation
- **Browser Source Overlays** — subtitle HTML served directly by backend
- **EVMux Cloud Delivery** — multi-platform RTMP (YouTube, Twitch, Facebook)

### Platform
- Real-time analytics dashboard
- Stripe tiered subscriptions
- Admin dashboard — user management, role assignment
- WebSocket push events for all production and moderation activity

---

## SeeWhy LIVE UI

Route: `/seewhy`  
Component: `frontend/src/components/SeeWhyLIVE.jsx`

Built from analysis of 17 production screenshots (VibePreview, Fanbase, Bigo LIVE PK, Base44, Hostinger, Chatter, Kick embed panels).

| Tab | What it shows |
|---|---|
| Explore | Story rings, live room cards (2-col grid), PK Battle score bar |
| Studio | 4×4 octagonal panel grid, audience row, cam/mute/end controls |
| Watch Party | Video embed, ±0ms sync, emoji reactions, host scrubber, 120s paywall |
| Analytics | Live earnings ticker, stat cards, 90/10 revenue bar |

Sidebar tabs: **Chat** (Guardian AI HUD, multilingual messages, tip cards) · **Revenue** (earnings + tier table) · **Guests** (per-guest status + mute)

Design tokens: Burgundy `#800020` · Gold `#C9A84C` · Acid Green `#39FF14` · Cyan `#00B2FF` · Near Black `#0A0608`  
Fonts: Bebas Neue · Orbitron · Barlow Condensed · DM Mono

---

## Architecture

```
Frontend (React 18 + Vite)
├── /             Dashboard
├── /seewhy       SeeWhy LIVE broadcast UI   ← NEW
├── /production   VDO.Ninja room + scene switcher
├── /smart-director  AI auto-switching
├── /transcription   Live captions
├── /hitl         Human review queue
├── /stream       Stream control
├── /analytics    KPI dashboard
└── /admin        User management

Backend (Express + Node 18)
├── VDONinjaService     webhook remote control
├── OBSWebSocketService PRISM automation
├── SmartDirectorService AI scene switching
├── TranscriptionService Whisper + GPT-4
├── AIService           moderation + chat
├── HITLService         review queue
├── MonitoringService   drift detection
├── PRISMService        mobile setup
└── EVMuxService        cloud streaming

Infrastructure
├── PostgreSQL 15   dataset + ground truth
├── Ollama          local AI (ministral-3b)
├── n8n             workflow automation
└── Prometheus      metrics
```

### VDO.Ninja → PRISM data flow

```
Guests (browser) ──push──► VDO.Ninja Room
                                │
                     SmartDirectorService
                     (audio level polling)
                                │
                     OBSWebSocketService
                     (SetCurrentScene)
                                │
                  PRISM Browser Source ──RTMP──► Platforms
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TailwindCSS, React Router v6, Lucide React |
| Backend | Node.js 18, Express.js |
| Database | PostgreSQL 15 |
| WebSockets | ws + obs-websocket-js |
| Auth | JWT + bcrypt |
| Payments | Stripe |
| AI — Moderation | OpenAI Moderation API |
| AI — Transcription | OpenAI Whisper |
| AI — Translation | GPT-4 |
| AI — Chat | Ollama (ministral-3b) |
| HTTP Client | node-fetch |
| Containers | Docker + Docker Compose |
| Monitoring | Prometheus |
| Automation | n8n |

---

## Environment Variables

Copy `.env.example` to `.env` and fill in all values.

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret for signing JWT tokens |
| `OPENAI_KEY` | Yes | OpenAI API key (Whisper + GPT-4 + Moderation) |
| `OLLAMA_URL` | No | Ollama base URL (default `http://localhost:11434`) |
| `STRIPE_SECRET_KEY` | No | Stripe secret key for payments |
| `STRIPE_WEBHOOK_SECRET` | No | Stripe webhook signing secret |
| `PORT` | No | Backend port (default `3000`) |
| `NODE_ENV` | No | `development` or `production` |
| `FRONTEND_URL` | No | Frontend URL for CORS (default `http://localhost:5173`) |
| `VITE_API_URL` | No | Backend URL used by frontend (default `http://localhost:3000`) |
| `OBS_WEBSOCKET_HOST` | No | PRISM/OBS WebSocket host:port (default `localhost:4455`) |
| `OBS_WEBSOCKET_PASSWORD` | No | PRISM/OBS WebSocket password |
| `VDO_NINJA_API_ENABLED` | No | Enable VDO.Ninja Remote Control API (`true`/`false`) |

---

## Quick Start

```bash
git clone <repository-url> && cd pub
cp .env.example .env          # add OPENAI_KEY at minimum
docker-compose up -d
# wait ~10s for postgres
docker exec -it swanythree-postgres psql -U admin -d swanythree -f /docker-entrypoint-initdb.d/init.sql
docker exec swanythree-ollama ollama pull ministral-3b
```

Open http://localhost:5173 — log in as `admin@swanythree.com` / `admin123`.

### Enable PRISM WebSocket

1. Open PRISM Live Studio → **Tools → WebSocket Server Settings**
2. Enable, set port `4455`, set a password
3. Add to `.env`: `OBS_WEBSOCKET_HOST=localhost:4455` and `OBS_WEBSOCKET_PASSWORD=yourpass`
4. Restart backend: `docker-compose restart backend`

### Start your first production

1. Go to **Production** → Create Production Room (auto-creates 4 guest scenes in PRISM)
2. Share the Guest URL with guests
3. Go to **AI Director** → enter room ID → Start AI Director
4. Go to **Transcription** → Start → copy overlay URL → add as Browser Source in PRISM

---

## Docker Services

| Container | Image | Port | Purpose |
|---|---|---|---|
| `swanythree-postgres` | postgres:15 | 5432 | Primary database |
| `swanythree-backend` | local build | 3000 | Express API |
| `swanythree-frontend` | local build | 5173 | React app |
| `swanythree-ollama` | ollama/ollama | 11434 | Local AI models |
| `swanythree-prometheus` | prom/prometheus | 9090 | Metrics |

Volumes: `postgres_data` · `ollama_data` · `prometheus_data`

Health check: `curl http://localhost:3000/health`

---

## Database Schema

Tables are defined in `backend/src/db/schema.sql`.

### users
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| username | VARCHAR(255) UNIQUE | |
| email | VARCHAR(255) UNIQUE | |
| password_hash | TEXT | bcrypt |
| role | VARCHAR(50) | `user` · `moderator` · `admin` |
| subscription_status | VARCHAR(50) | `inactive` · `active` |
| created_at / updated_at | TIMESTAMP | |

### streams
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| user_id | FK → users | cascade delete |
| evmux_id | VARCHAR(255) UNIQUE | cloud stream ID |
| name | VARCHAR(255) | |
| status | VARCHAR(50) | `offline` · `live` |
| created_at / started_at / ended_at | TIMESTAMP | |

### chat_messages
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| stream_id | FK → streams | |
| username | VARCHAR(255) | |
| message | TEXT | |
| toxicity_score | FLOAT | 0–1 |
| ai_confidence | FLOAT | 0–1 |
| human_reviewed | BOOLEAN | |
| final_decision | VARCHAR(50) | ground truth |

### hitl_reviews
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| review_type | VARCHAR(50) | |
| data | JSONB | raw payload |
| status | VARCHAR(50) | `pending` · `completed` |
| assigned_to | FK → users | reviewer |
| decision | VARCHAR(50) | human label |
| feedback | TEXT | |
| created_at / completed_at | TIMESTAMP | |

### model_metrics
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| model_name | VARCHAR(100) | |
| prediction_input | TEXT | |
| prediction_output | JSONB | |
| confidence | FLOAT | |
| ground_truth | VARCHAR(50) | from HITL |

### vdo_rooms
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| user_id | FK → users | |
| room_id | VARCHAR(100) UNIQUE | VDO.Ninja room ID |
| name | VARCHAR(255) | |
| password | VARCHAR(255) | optional |
| status | VARCHAR(50) | `active` |

**Indexes:** `streams(user_id)`, `streams(status)`, `chat_messages(stream_id)`, `chat_messages(human_reviewed)`, `hitl_reviews(status)`, `hitl_reviews(assigned_to)`, `model_metrics(model_name)`, `model_metrics(created_at)`

---

## Frontend Pages

| Route | Component | Description |
|---|---|---|
| `/` | Dashboard | Overview + live stats |
| `/seewhy` | SeeWhyLIVE | Full broadcast UI from screenshots |
| `/production` | ProductionControl | VDO.Ninja room + scene switcher + guest audio |
| `/smart-director` | SmartDirector | AI auto-switching + manual override |
| `/transcription` | TranscriptionPanel | Live captions, translation, SRT export |
| `/hitl` | HITLQueue | Human moderation review queue |
| `/stream` | StreamControl | Stream management |
| `/analytics` | Analytics | KPI + performance charts |
| `/admin` | AdminPanel | User management (admin only) |

---

## API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Get JWT |

### VDO.Ninja Remote Control
| Method | Endpoint | Description |
|---|---|---|
| POST | `/vdo/room/create` | Create room |
| POST | `/vdo/room/:id/guest-link` | Generate guest invite |
| POST | `/vdo/webhook/:roomId/:action` | Execute API webhook |
| POST | `/vdo/room/:id/mute` | Mute entire room |
| POST | `/vdo/room/:id/unmute` | Unmute entire room |
| POST | `/vdo/room/:id/guest/:slot/mute` | Mute guest |
| POST | `/vdo/room/:id/guest/:slot/unmute` | Unmute guest |
| POST | `/vdo/room/:id/guest/:slot/volume` | Set volume 0–100 |
| POST | `/vdo/room/:id/scene/:num` | Switch scene |
| POST | `/vdo/room/:id/audio-level` | Report audio level |
| GET  | `/vdo/room/:id/active-speaker` | Get active speaker slot |
| GET  | `/vdo/room/:id/browser-url/:slot` | Browser-capture URL for PRISM |
| GET  | `/vdo/room/:id/n8n-workflow` | n8n webhook config |

### OBS / PRISM
| Method | Endpoint | Description |
|---|---|---|
| GET  | `/obs/scenes` | List all scenes |
| GET  | `/obs/scene/current` | Get active scene |
| POST | `/obs/scene/current` | Switch program scene |
| POST | `/obs/scene/preview` | Set Studio Mode preview |
| POST | `/obs/transition` | Trigger transition |
| POST | `/obs/scenes/guest` | Create guest scene + browser source |
| POST | `/obs/scenes/grid` | Create responsive grid scene |
| POST | `/obs/audio/mute` | Mute/unmute source |
| POST | `/obs/audio/volume` | Set source volume |
| POST | `/obs/streaming/start` | Start stream |
| POST | `/obs/streaming/stop` | Stop stream |
| POST | `/obs/studio-mode` | Toggle Studio Mode |
| GET  | `/obs/stats` | OBS performance stats |

### AI Smart Director
| Method | Endpoint | Description |
|---|---|---|
| POST | `/smart-director/start` | Start session |
| POST | `/smart-director/stop` | Stop session |
| POST | `/smart-director/manual-switch` | Override to specific guest |
| GET  | `/smart-director/stats/:roomId` | Switch history + current speaker |
| PATCH | `/smart-director/config/:roomId` | Update AI config live |

**Config options:** `switchDelay` (ms, default 1000) · `holdTime` (ms, default 3000) · `silenceThreshold` (0–100, default 20) · `confidenceThreshold` (0–1, default 0.7)

### Transcription
| Method | Endpoint | Description |
|---|---|---|
| POST | `/transcription/start` | Start Whisper session |
| POST | `/transcription/:id/chunk` | Submit audio chunk |
| POST | `/transcription/:id/stop` | Stop session |
| GET  | `/transcription/:id/current` | Live caption |
| GET  | `/transcription/:id/overlay` | HTML subtitle overlay |
| GET  | `/transcription/:id/export/srt` | Download SRT |
| GET  | `/transcription/:id/stats` | Session statistics |

### Moderation & Admin
| Method | Endpoint | Description |
|---|---|---|
| POST | `/chat/moderate` | Moderate message |
| GET  | `/hitl/queue` | Human review queue |
| POST | `/hitl/review/:id` | Submit human decision |
| GET  | `/analytics/overview` | Platform KPI summary |
| GET  | `/monitoring/model-performance` | AI model metrics |
| GET  | `/admin/users` | List users |
| PATCH | `/admin/users/:id/role` | Update role |

---

## Services

| Service | File | Responsibility |
|---|---|---|
| VDONinjaService | `services/VDONinjaService.js` | Room creation, webhook execution, audio level tracking |
| OBSWebSocketService | `services/OBSWebSocketService.js` | PRISM scene/audio/streaming control via obs-websocket-js |
| SmartDirectorService | `services/SmartDirectorService.js` | AI speaker detection loop, scene switching, manual override |
| TranscriptionService | `services/TranscriptionService.js` | Whisper transcription, GPT-4 translation, SRT export, HTML overlay |
| AIService | `services/AIService.js` | OpenAI Moderation API + Ollama chat |
| HITLService | `services/HITLService.js` | Review queue management, ground truth storage |
| MonitoringService | `services/MonitoringService.js` | Model drift detection, accuracy tracking |
| PRISMService | `services/PRISMService.js` | Mobile QR setup |
| EVMuxService | `services/EVMuxService.js` | Cloud multi-platform streaming |

---

## n8n Automation

Workflow templates in `n8n-workflows/`. See `n8n-workflows/README.md` for full setup.

**Install n8n:**
```bash
docker run -it --rm --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n
```
Open http://localhost:5678, import JSON files via **Workflows → Import from File**.

| Workflow | File | Trigger | Action |
|---|---|---|---|
| Auto Scene Switch | `auto-scene-switch.json` | Every 2s | Polls active speaker, switches OBS scene, logs to DB |
| Guest Auto-Mute | `guest-auto-mute.json` | Webhook | Mutes guest slot via VDO.Ninja API |

Set credentials in n8n: `SWANYTHREE_API_URL` and `JWT_TOKEN`.

---

## HITL Workflow

```
Chat message
    │
    ▼
OpenAI Moderation API
    │
    ├── confidence ≥ 0.8 ──► Auto action (allow / remove)
    │
    └── confidence < 0.8 ──► HITL Queue
                                  │
                             Human Review (/hitl)
                                  │
                             Ground Truth → model_metrics
```

Model monitoring tracks: total predictions · avg confidence · accuracy vs ground truth · low-confidence rate · drift alert at >10% accuracy drop.

---

## Troubleshooting

**PostgreSQL not starting**
```bash
docker-compose down && docker volume rm pub_postgres_data && docker-compose up -d
```

**Backend connection error**
```bash
docker logs swanythree-backend
docker-compose restart backend
```

**OBS WebSocket not connecting**
- Confirm PRISM is running with WebSocket enabled (Tools → WebSocket Server Settings)
- Check `OBS_WEBSOCKET_HOST` and `OBS_WEBSOCKET_PASSWORD` in `.env`
- Backend logs show `⚠️ OBS WebSocket not available` if unreachable — all other features still work

**Ollama model missing**
```bash
docker exec swanythree-ollama ollama list
docker exec swanythree-ollama ollama pull ministral-3b
```

**Frontend not loading**
```bash
curl http://localhost:3000/health   # verify backend first
docker-compose restart frontend
```

**Stop all services**
```bash
docker-compose down          # stop containers
docker-compose down -v       # stop + delete volumes
```

---

## Default Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@swanythree.com | admin123 |
| Streamer | streamer1@test.com | admin123 |
| Moderator | moderator1@test.com | admin123 |

---

## Supplementary Docs

| File | Purpose |
|---|---|
| `INTEGRATION_GUIDE.md` | Deep-dive: VDO.Ninja API, OBS WebSocket, Smart Director, Transcription, n8n |
| `PRODUCTION_QUICKSTART.md` | 10-minute guide: PRISM setup → room → AI Director → transcription overlay |
| `QUICK_START.md` | 5-minute Docker start for first-time setup |
| `n8n-workflows/README.md` | n8n setup, workflow details, API credential config |

---

## Development (without Docker)

```bash
# Terminal 1
cd backend && npm install && npm run dev

# Terminal 2
cd frontend && npm install && npm run dev

# Terminal 3 (database only)
docker-compose up postgres ollama
```

---

## License

MIT — Built on the 8-step AI MVP framework.  
VDO.Ninja + PRISM integration based on the SwanyThree Ultimate whitepaper.  
SeeWhy LIVE UI derived from 17 production broadcast screenshots.
