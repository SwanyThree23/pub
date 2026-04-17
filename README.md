# SwanyThree Ultimate - AI Streaming Platform

A comprehensive full-stack AI-powered streaming platform integrating VDO.Ninja multi-guest streaming, PRISM Live Studio automation, AI-driven scene switching, real-time transcription, and Human-in-the-Loop moderation.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Production Setup](#production-setup)
- [Frontend Pages](#frontend-pages)
- [API Reference](#api-reference)
- [Services](#services)
- [n8n Automation](#n8n-automation)
- [HITL Workflow](#hitl-workflow)
- [Model Monitoring](#model-monitoring)
- [Default Credentials](#default-credentials)
- [Success Metrics](#success-metrics)

---

## Features

### AI & Automation
- **AI Smart Director** — Automatic scene switching based on active speaker detection with configurable thresholds, hold times, and manual override
- **Real-Time Transcription** — OpenAI Whisper integration for live speech-to-text with 500ms latency
- **Live Translation** — GPT-4 powered multi-language translation with browser overlay output
- **AI Moderation** — OpenAI Moderation API with confidence scoring and fallback to Ollama
- **HITL Queue** — Human review queue for low-confidence AI decisions with ground truth collection
- **Model Drift Detection** — Real-time monitoring for accuracy degradation
- **n8n Workflows** — Pre-built automation templates for scene switching, guest muting, and alerts

### Production & Streaming
- **VDO.Ninja Remote Control API** — Complete webhook-based control for guest audio, volume, and scenes via `https://api.vdo.ninja/{API_KEY}/{ACTION}/{VALUE}`
- **PRISM/OBS WebSocket** — Full programmatic control of PRISM Live Studio (built on OBS): scene switching, audio mixing, streaming start/stop, Studio Mode
- **Multi-Guest Streaming** — VDO.Ninja integration supporting up to 9 simultaneous guests
- **Automated Scene Creation** — Dynamic per-guest scenes and responsive grid layouts auto-created in OBS on room creation
- **Studio Mode** — Professional preview/program workflow for broadcast production
- **Browser Source Overlays** — HTML subtitle and graphics overlays served directly by the backend
- **Mobile Streaming** — PRISM Live Studio support with QR code guest invites
- **Cloud Delivery** — EVMux integration for multi-platform streaming (YouTube, Twitch, Facebook)

### Platform
- **Real-Time Analytics** — Live dashboard with viewer counts, engagement, and AI performance KPIs
- **Stripe Subscriptions** — Built-in tiered payment processing
- **Admin Dashboard** — User management, role assignment, and system oversight
- **WebSocket Events** — Live push updates for all production and moderation events
- **SRT Export** — Post-stream subtitle file generation for VOD publishing

---

## Architecture

The platform follows the 8-step AI MVP framework:

```
┌─────────────────────────────────────────────────────────────┐
│                   SwanyThree Ultimate                        │
│                                                             │
│  React Frontend (Vite + TailwindCSS)                        │
│  ├── Production Control  (VDO.Ninja room + scene switcher)  │
│  ├── AI Smart Director   (active speaker dashboard)         │
│  ├── Transcription Panel (live captions + translation)      │
│  ├── HITL Queue          (moderation review)                │
│  ├── Analytics           (KPI dashboard)                    │
│  └── Admin Panel         (user management)                  │
│                                                             │
│  Express Backend (Node.js 18+)                              │
│  ├── VDONinjaService     (remote control webhooks)          │
│  ├── OBSWebSocketService (PRISM/OBS automation)             │
│  ├── SmartDirectorService(AI scene switching)               │
│  ├── TranscriptionService(Whisper + GPT-4 translation)      │
│  ├── AIService           (moderation + chat)                │
│  ├── HITLService         (human review queue)               │
│  ├── MonitoringService   (drift detection)                  │
│  ├── PRISMService        (mobile setup)                     │
│  └── EVMuxService        (cloud streaming)                  │
│                                                             │
│  Infrastructure                                             │
│  ├── PostgreSQL 15        (datasets + ground truth)         │
│  ├── Ollama               (local AI models)                 │
│  ├── n8n                  (workflow automation)             │
│  └── Prometheus           (metrics)                         │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow: VDO.Ninja → PRISM

```
Guests (browser) ──push──► VDO.Ninja Room
                                │
                         Director URL (you)
                                │
                    SmartDirectorService (audio levels)
                                │
                    OBSWebSocketService (scene switch)
                                │
                    PRISM Browser Source ──RTMP──► Platforms
```

---

## Tech Stack

### Backend
| Component | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express.js |
| Database | PostgreSQL 15 |
| WebSockets | ws + obs-websocket-js |
| Auth | JWT + bcrypt |
| Payments | Stripe |
| AI — Moderation | OpenAI Moderation API |
| AI — Transcription | OpenAI Whisper |
| AI — Translation | GPT-4 |
| AI — Chat | Ollama (ministral-3b) |
| HTTP Client | node-fetch |

### Frontend
| Component | Technology |
|---|---|
| Framework | React 18 |
| Build | Vite |
| Styling | TailwindCSS |
| Routing | React Router v6 |
| Icons | Lucide React |

### Infrastructure
| Component | Technology |
|---|---|
| Containers | Docker + Docker Compose |
| Monitoring | Prometheus |
| Automation | n8n |
| Streaming | VDO.Ninja + PRISM Live Studio |

---

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+
- OpenAI API key
- PRISM Live Studio (free download) with OBS WebSocket enabled
- Stripe account (optional)

### 1. Clone and configure

```bash
git clone <repository-url>
cd pub
cp .env.example .env
```

Edit `.env`:

```env
# Required
OPENAI_API_KEY=sk-...
JWT_SECRET=your-secret-here
DATABASE_URL=postgresql://admin:password@localhost:5432/swanythree

# PRISM / OBS WebSocket (Tools > WebSocket Server in PRISM)
OBS_WEBSOCKET_HOST=localhost:4455
OBS_WEBSOCKET_PASSWORD=your_obs_password

# Optional
STRIPE_SECRET_KEY=sk_test_...
VDO_NINJA_API_ENABLED=true
```

### 2. Start services

```bash
docker-compose up -d
```

### 3. Initialize database

```bash
docker exec -it swanythree-postgres psql -U admin -d swanythree -f /docker-entrypoint-initdb.d/init.sql
```

### 4. Pull AI model

```bash
docker exec swanythree-ollama ollama pull ministral-3b
```

### 5. Enable OBS WebSocket in PRISM

1. Open PRISM Live Studio
2. Go to **Tools → WebSocket Server Settings**
3. Enable WebSocket server, set port `4455`
4. Set a password and copy it to `.env`

### Access Points

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| Health Check | http://localhost:3000/health |
| Prometheus | http://localhost:9090 |

---

## Production Setup

### Start Your First Production

1. Navigate to **Production** in the nav bar
2. Click **Create Production Room** — this creates a VDO.Ninja room and auto-creates 4 guest scenes + a grid scene in PRISM
3. Share the **Guest URL** with your guests (or generate individual QR links)
4. Open the **Director URL** in your browser to monitor guests

### Enable AI Scene Switching

1. Navigate to **AI Director**
2. Enter the room ID from Production Control
3. Set guest slots (default: `1,2,3,4`)
4. Tune the configuration sliders:
   - **Switch Delay** — minimum ms between scene changes (default 1000)
   - **Hold Time** — how long a speaker must talk before switching (default 3000)
   - **Silence Threshold** — audio level to count as "speaking" (default 20)
5. Click **Start AI Director** — scenes will switch automatically to the active speaker

### Enable Live Transcription

1. Navigate to **Transcription**
2. Enter your stream ID
3. Choose source and target languages
4. Click **Start Transcription**
5. Copy the **Overlay URL** and add it as a Browser Source in PRISM (1920×1080)

---

## Frontend Pages

| Route | Component | Description |
|---|---|---|
| `/` | `Dashboard` | Overview with live stats |
| `/production` | `ProductionControl` | VDO.Ninja room + scene switcher + guest audio |
| `/smart-director` | `SmartDirector` | AI auto-switching dashboard + manual override |
| `/transcription` | `TranscriptionPanel` | Live captions, translation, SRT export |
| `/hitl` | `HITLQueue` | Human moderation review queue |
| `/stream` | `StreamControl` | Stream management |
| `/analytics` | `Analytics` | KPI and performance charts |
| `/admin` | `AdminPanel` | User management (admin only) |

---

## API Reference

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Get JWT token |

### VDO.Ninja Remote Control

| Method | Endpoint | Description |
|---|---|---|
| POST | `/vdo/room/create` | Create room with API enabled |
| POST | `/vdo/room/:id/guest-link` | Generate named guest invite link |
| POST | `/vdo/webhook/:roomId/:action` | Execute arbitrary API webhook |
| POST | `/vdo/room/:id/mute` | Mute entire room |
| POST | `/vdo/room/:id/unmute` | Unmute entire room |
| POST | `/vdo/room/:id/guest/:slot/mute` | Mute individual guest |
| POST | `/vdo/room/:id/guest/:slot/unmute` | Unmute individual guest |
| POST | `/vdo/room/:id/guest/:slot/volume` | Set guest volume (0–100) |
| POST | `/vdo/room/:id/scene/:num` | Switch to scene number |
| POST | `/vdo/room/:id/scene/:num/guest/:slot` | Assign guest to scene |
| POST | `/vdo/room/:id/scenes` | Create multiple scenes |
| POST | `/vdo/room/:id/audio-level` | Report audio level (for AI detection) |
| GET  | `/vdo/room/:id/active-speaker` | Get current active speaker slot |
| GET  | `/vdo/room/:id/browser-url/:slot` | Get browser-capture URL for PRISM |
| GET  | `/vdo/room/:id/n8n-workflow` | Get n8n webhook config for this room |

### OBS / PRISM WebSocket

| Method | Endpoint | Description |
|---|---|---|
| GET  | `/obs/scenes` | List all scenes |
| GET  | `/obs/scene/current` | Get active scene |
| POST | `/obs/scene/current` | Switch program scene |
| POST | `/obs/scene/preview` | Set preview scene (Studio Mode) |
| POST | `/obs/transition` | Trigger scene transition |
| POST | `/obs/scenes/guest` | Create guest scene with browser source |
| POST | `/obs/scenes/grid` | Create responsive grid scene |
| POST | `/obs/audio/mute` | Mute/unmute audio source |
| POST | `/obs/audio/volume` | Set source volume |
| POST | `/obs/streaming/start` | Start streaming |
| POST | `/obs/streaming/stop` | Stop streaming |
| POST | `/obs/studio-mode` | Enable/disable Studio Mode |
| GET  | `/obs/stats` | Get OBS performance stats |

### AI Smart Director

| Method | Endpoint | Description |
|---|---|---|
| POST | `/smart-director/start` | Start auto-switching session |
| POST | `/smart-director/stop` | Stop auto-switching session |
| POST | `/smart-director/manual-switch` | Override — switch to specific guest |
| GET  | `/smart-director/stats/:roomId` | Get switch history + current speaker |
| PATCH | `/smart-director/config/:roomId` | Update AI config live |

### Transcription

| Method | Endpoint | Description |
|---|---|---|
| POST | `/transcription/start` | Start Whisper transcription session |
| POST | `/transcription/:id/chunk` | Submit audio chunk for processing |
| POST | `/transcription/:id/stop` | Stop session |
| GET  | `/transcription/:id/current` | Get current live caption |
| GET  | `/transcription/:id/overlay` | HTML subtitle overlay (for PRISM browser source) |
| GET  | `/transcription/:id/transcript` | Full transcript text |
| GET  | `/transcription/:id/export/srt` | Download SRT subtitle file |
| GET  | `/transcription/:id/stats` | Session statistics |

### AI Moderation

| Method | Endpoint | Description |
|---|---|---|
| POST | `/chat/moderate` | Moderate a chat message |
| GET  | `/hitl/queue` | Fetch human review queue |
| POST | `/hitl/review/:id` | Submit human decision |

### Streaming

| Method | Endpoint | Description |
|---|---|---|
| POST | `/streams/create` | Create stream |
| POST | `/streams/:id/start` | Start stream |
| POST | `/streams/:id/stop` | Stop stream |
| GET  | `/streams` | List streams |

### Analytics

| Method | Endpoint | Description |
|---|---|---|
| GET | `/analytics/overview` | Platform KPI summary |
| GET | `/monitoring/model-performance` | AI model metrics |

### Admin

| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/users` | List all users |
| PATCH | `/admin/users/:id/role` | Update user role |

---

## Services

### VDONinjaService (`backend/src/services/VDONinjaService.js`)

Manages VDO.Ninja rooms and executes Remote Control API webhooks.

```
VDONinjaService
├── createRoom()           — generate room with optional API key
├── generateGuestLink()    — named guest invite URL
├── executeWebhook()       — call https://api.vdo.ninja/{key}/{action}/{value}
├── muteGuest()            — mute individual guest
├── unmuteGuest()          — unmute individual guest
├── setGuestVolume()       — set 0–100 volume
├── trackAudioLevel()      — update audio level map for AI detection
└── getActiveSpeaker()     — return slot with highest recent audio level
```

### OBSWebSocketService (`backend/src/services/OBSWebSocketService.js`)

Full PRISM Live Studio control via OBS WebSocket v5 protocol.

```
OBSWebSocketService
├── connect()              — connect to OBS WebSocket
├── setCurrentScene()      — switch program scene
├── setPreviewScene()      — set Studio Mode preview
├── createGuestScene()     — create scene + browser source for guest
├── createGridScene()      — create responsive NxN grid scene
├── muteSource()           — toggle audio source mute
├── setSourceVolume()      — set dB volume
├── startStreaming()       — start RTMP stream
├── stopStreaming()        — stop stream
├── toggleStudioMode()     — enable/disable preview/program workflow
└── getStats()             — CPU, memory, dropped frames
```

### SmartDirectorService (`backend/src/services/SmartDirectorService.js`)

AI-driven scene switching with configurable sensitivity.

```
SmartDirectorService
├── startSession()         — begin auto-switching for a room
├── stopSession()          — end session and clear interval
├── analyzeAndSwitch()     — check audio levels → switch if threshold met
├── switchToSpeaker()      — execute OBS scene switch + log event
├── manualOverride()       — switch manually, pause AI for 5s
└── getStats()             — total/auto/manual switches + history
```

**Configuration options:**

| Option | Default | Description |
|---|---|---|
| `switchDelay` | 1000ms | Minimum time between switches |
| `holdTime` | 3000ms | Speaker must hold audio for this long |
| `silenceThreshold` | 20 | Audio level below = silence |
| `confidenceThreshold` | 0.7 | Required confidence for auto-switch |

### TranscriptionService (`backend/src/services/TranscriptionService.js`)

Real-time Whisper transcription with GPT-4 translation pipeline.

```
TranscriptionService
├── startSession()         — initialize stream transcription
├── transcribeChunk()      — POST audio to Whisper, optionally translate
├── translateText()        — GPT-4 translation to target language
├── getCurrentCaption()    — latest caption + recent history
├── generateSubtitleHTML() — HTML overlay page for PRISM browser source
├── exportSRT()            — generate SRT file from all segments
└── getStats()             — duration, segments, avg confidence
```

---

## n8n Automation

Pre-built workflow templates in `n8n-workflows/`:

### auto-scene-switch.json
Polls `/smart-director/stats/:roomId` every 2 seconds and switches OBS scenes automatically. Logs all switches to a Google Sheet or Postgres.

### guest-auto-mute.json
Webhook receiver — mutes a guest slot when called from external triggers (audience voting, chat commands, etc.).

### Setup

1. Import JSON files into your n8n instance
2. Set `SWANYTHREE_API_URL` and `JWT_TOKEN` credentials in n8n
3. Activate the workflows

See `n8n-workflows/README.md` for full setup instructions.

---

## HITL Workflow

```
Chat message
    │
    ▼
OpenAI Moderation API
    │
    ├── confidence ≥ 0.8 ──► Auto-action (allow/remove)
    │
    └── confidence < 0.8 ──► HITL Queue
                                  │
                             Human Review
                                  │
                             Ground Truth Stored
                                  │
                             Model Retraining Dataset
```

---

## Model Monitoring

The platform tracks AI performance in real time:

| Metric | Description |
|---|---|
| Total Predictions | Overall model invocations |
| Average Confidence | Rolling mean certainty score |
| Accuracy | Correct decisions vs human ground truth |
| Low Confidence Rate | % of messages requiring human review |
| Drift Alert | Triggered when accuracy drops >10% from baseline |

---

## Default Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@swanythree.com | admin123 |
| Streamer | streamer1@test.com | admin123 |
| Moderator | moderator1@test.com | admin123 |

---

## Success Metrics

### Business KPIs
- User retention target: 25–30% at 90 days
- Moderation time reduction: 70% vs manual
- Multi-platform reach: 3× increase

### AI Performance
- Moderation accuracy: >90%
- HITL review rate: <20% of messages
- Transcription latency: <2 seconds
- Scene switch response: <500ms

### Infrastructure
- API p99 latency: <2 seconds
- WebSocket uptime: >99.9%
- DB query time: <100ms

---

## Development

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend
cd frontend && npm install && npm run dev
```

---

## License

MIT

---

Built with the 8-step AI MVP framework for production-ready streaming systems.
VDO.Ninja + PRISM Live Studio integration based on the SwanyThree Ultimate whitepaper.
