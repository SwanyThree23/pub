# 🚀 Unified Platform - Ultimate Streaming & AI Integration

The complete platform for multi-platform live streaming with integrated AI content generation. Stream simultaneously to 12+ platforms while leveraging cutting-edge AI for avatars, translations, voice cloning, and more.

## ✨ Features

### 🎥 Multi-Platform Streaming
- **12+ Platforms**: YouTube, Twitch, Facebook, Instagram, TikTok, LinkedIn, Twitter/X, Kick, Rumble, Telegram, Amazon Live, Steam
- **EvMux Integration**: Multi-destination RTMP streaming (Event ID: 3491)
- **VDO.Ninja**: Remote guest management
- **PRISM Live Studio**: Scene control via WebSocket
- **Real-time Analytics**: Live viewer counts, engagement metrics

### 🤖 AI Content Services
- **HeyGen**: Avatar video generation with photorealistic digital humans
- **ElevenLabs**: Voice cloning and text-to-speech in 29+ languages
- **Akool**: Video translation, image-to-video, face swap
- **Anthropic Claude**: AI orchestration and automation

### 🏗️ Infrastructure
- **PostgreSQL**: Robust data persistence with Prisma ORM
- **Redis**: High-performance caching and queue management
- **BullMQ**: Distributed job processing for AI tasks
- **Socket.io**: Real-time WebSocket updates
- **Supabase Vault**: Encrypted API key storage

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 16 with Prisma
- **Cache**: Redis 7
- **Queue**: BullMQ
- **WebSocket**: Socket.io
- **Security**: Helmet, CORS, Rate Limiting

### Frontend
- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Data Fetching**: TanStack Query
- **Forms**: React Hook Form + Zod

### DevOps
- **Containerization**: Docker & Docker Compose
- **Deployment**: Railway
- **CI/CD**: Automated workflows
- **Monitoring**: Health checks, error tracking

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Redis 6+
- Docker (optional)

### 1. Installation

```bash
# Run setup script
chmod +x setup_complete.sh
./setup_complete.sh
```

### 2. Configuration

Edit `backend/.env` with your credentials:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/unified_platform"

# Redis
REDIS_URL="redis://localhost:6379"

# Supabase
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"

# AI Services
HEYGEN_API_KEY="your-heygen-key"
ELEVENLABS_API_KEY="your-elevenlabs-key"
AKOOL_API_KEY="your-akool-key"

# Streaming
VDO_API_KEY="your-vdo-ninja-key"
EVMUX_API_KEY="your-evmux-key"
```

### 3. Database Setup

```bash
cd backend
npx prisma db push
```

### 4. Start Development

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Workers
cd backend
npm run worker

# Terminal 3 - Frontend
cd frontend
npm run dev
```

Access the application:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Health Check**: http://localhost:4000/health

## 🐳 Docker Deployment

```bash
cd deployment/docker
docker-compose up -d
```

## 🚂 Railway Deployment

```bash
cd backend
./scripts/deploy.sh
```

## 📚 API Documentation

### Core Endpoints

#### Streams
- `GET /api/streams` - List all streams
- `POST /api/streams/start` - Start new stream
- `POST /api/streams/:id/stop` - Stop stream

#### Platforms
- `GET /api/platforms` - List connected platforms
- `POST /api/platforms/connect` - Connect platform

#### AI Content
- `POST /api/content/avatar-video` - Generate avatar video
- `POST /api/content/translate-video` - Translate video
- `POST /api/content/clone-voice` - Clone voice

## 📁 Project Structure

```
unified-platform/
├── backend/                 # Express.js API
│   ├── src/
│   │   ├── core/           # UnifiedPlatform core
│   │   ├── services/       # AI & streaming services
│   │   ├── routes/         # API endpoints
│   │   ├── workers/        # BullMQ workers
│   │   └── types/          # TypeScript types
│   ├── prisma/             # Database schema
│   └── scripts/            # Deployment scripts
├── frontend/               # Next.js app
│   ├── src/
│   │   ├── pages/          # Next.js pages
│   │   ├── components/     # React components
│   │   └── hooks/          # Custom hooks
├── deployment/             # Deployment configs
│   ├── docker/             # Docker files
│   └── railway/            # Railway configs
└── setup_complete.sh       # Setup script
```

## 📄 License

MIT License

---

**Built for creators, streamers, and AI enthusiasts** 🎬
