# SwanyThree Ultimate - AI Streaming Platform MVP

A comprehensive full-stack AI-powered streaming platform with HITL (Human-in-the-Loop) moderation, real-time analytics, and multi-platform streaming capabilities.

## Features

### AI & Automation
- **AI-Powered Moderation**: OpenAI-based content moderation with confidence scoring
- **HITL System**: Human review queue for low-confidence AI predictions
- **Model Monitoring**: Real-time drift detection and performance tracking
- **Smart Director**: AI-driven automatic scene switching based on active speaker detection
- **Real-Time Transcription**: Whisper API integration with multi-language translation
- **n8n Automation**: Pre-built workflow templates for production automation

### Production & Streaming
- **VDO.Ninja Remote Control API**: Complete webhook-based control system
- **PRISM/OBS WebSocket Integration**: Full scene and audio control
- **Multi-Guest Streaming**: VDO.Ninja integration for up to 9 guests
- **Mobile Streaming**: PRISM Live Studio support with QR code setup
- **Cloud Streaming**: EVMux integration for multi-platform delivery
- **Studio Mode**: Professional preview/program workflow
- **Automated Scene Creation**: Dynamic guest scenes and grid layouts

### Platform Features
- **Real-Time Analytics**: Comprehensive dashboard with performance metrics
- **Stripe Subscriptions**: Built-in payment processing
- **Admin Dashboard**: User management and system oversight
- **WebSocket Real-Time**: Live updates for all production elements
- **Browser Overlays**: HTML overlays for subtitles and graphics

## Architecture

The platform follows the 8-step AI MVP framework:

1. **Problem Definition**: Streamers need unified AI moderation + multi-guest + cloud streaming
2. **Minimum AI Functionality**: OpenAI Moderation API + Ollama for chat
3. **High-Quality Dataset**: PostgreSQL storage for ground truth collection
4. **HITL Integration**: Human review queue for model improvement
5. **Model Monitoring**: Drift detection and accuracy tracking
6. **Production Stack**: Docker, PostgreSQL, Express, React
7. **Feedback Loops**: Continuous learning from human reviews
8. **Metrics & Scale**: Analytics dashboard with KPI tracking

## Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 15
- **WebSockets**: ws library + OBS WebSocket
- **Authentication**: JWT + bcrypt
- **Payment**: Stripe
- **AI Services**:
  - OpenAI Moderation API
  - OpenAI Whisper (transcription)
  - GPT-4 (translation)
  - Ollama (local chat models)

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Routing**: React Router v6
- **Icons**: Lucide React

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Monitoring**: Prometheus
- **AI Models**: Ollama (ministral-3b)

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- OpenAI API key
- Stripe account (optional, for payments)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd pub
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your API keys
```

3. **Start with Docker**
```bash
docker-compose up -d
```

4. **Initialize database**
```bash
docker exec -it swanythree-postgres psql -U admin -d swanythree -f /docker-entrypoint-initdb.d/init.sql
```

5. **Pull AI models**
```bash
docker exec swanythree-ollama ollama pull ministral-3b
```

### Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Prometheus**: http://localhost:9090
- **Health Check**: http://localhost:3000/health
- **Metrics**: http://localhost:3000/metrics

## Default Credentials

- **Admin**: admin@swanythree.com / admin123
- **Streamer**: streamer1@test.com / admin123
- **Moderator**: moderator1@test.com / admin123

## API Endpoints

### Authentication
- `POST /auth/register` - Create new user
- `POST /auth/login` - User login

### Streaming
- `POST /streams/create` - Create new stream
- `POST /streams/:id/start` - Start stream
- `POST /streams/:id/stop` - Stop stream
- `GET /streams` - List user streams

### AI Moderation
- `POST /chat/moderate` - Moderate chat message
- `GET /hitl/queue` - Get HITL review queue
- `POST /hitl/review/:id` - Submit human review

### PRISM Mobile
- `POST /prism/quick-setup` - Generate PRISM config

### VDO.Ninja
- `POST /vdo/room/create` - Create multi-guest room
- `POST /vdo/room/:id/guest-link` - Generate guest link

### Analytics
- `GET /analytics/overview` - Platform statistics
- `GET /monitoring/model-performance` - AI metrics

### Admin
- `GET /admin/users` - List all users
- `PATCH /admin/users/:id/role` - Update user role

## Development

### Local Backend Development
```bash
cd backend
npm install
npm run dev
```

### Local Frontend Development
```bash
cd frontend
npm install
npm run dev
```

## HITL Workflow

1. **AI Analysis**: Chat messages analyzed by OpenAI Moderation API
2. **Confidence Check**: Low confidence (<0.8) → Human review queue
3. **Human Review**: Moderators review flagged content
4. **Ground Truth**: Decisions stored for model retraining
5. **Drift Detection**: System monitors accuracy degradation

## Model Monitoring

The platform tracks:
- **Total Predictions**: Overall model usage
- **Average Confidence**: Model certainty levels
- **Accuracy**: Correct vs ground truth
- **Low Confidence Rate**: % requiring human review
- **Drift Detection**: 10%+ degradation alerts

## Success Metrics

### Business KPIs
- User retention: Target 25-30% at 90 days
- Moderation time reduction: Target 70% vs manual
- Multi-platform reach: Target 3x increase

### AI Metrics
- Moderation accuracy: >90%
- HITL review rate: <20% of messages
- Model drift: Monitor weekly

### Infrastructure
- API latency: <2 seconds
- WebSocket uptime: >99.9%
- Database queries: <100ms

## License

MIT License

---

Built with AI MVP best practices following the 8-step framework for production-ready AI systems
