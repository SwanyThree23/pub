# SwanyThree Ultimate - Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites

- Docker Desktop installed
- OpenAI API key (get from https://platform.openai.com/api-keys)
- (Optional) Stripe account for payment testing

## Step-by-Step Setup

### 1. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your OpenAI key
# Minimum required: OPENAI_KEY=sk-your-key-here
nano .env
```

### 2. Start All Services

```bash
# Start all containers
docker-compose up -d

# This will start:
# - PostgreSQL database (port 5432)
# - Backend API (port 3000)
# - Frontend UI (port 5173)
# - Ollama AI (port 11434)
# - Prometheus (port 9090)
```

### 3. Initialize Database

```bash
# Wait 10 seconds for PostgreSQL to be ready
sleep 10

# Initialize the database schema
docker exec -it swanythree-postgres psql -U admin -d swanythree -f /docker-entrypoint-initdb.d/init.sql
```

### 4. Pull AI Models

```bash
# Download the AI chat model (ministral-3b)
docker exec swanythree-ollama ollama pull ministral-3b

# This may take 2-5 minutes depending on your connection
```

### 5. Access the Platform

Open your browser to:
- **Dashboard**: http://localhost:5173

Login with default admin credentials:
- **Email**: admin@swanythree.com
- **Password**: admin123

## What You Can Do Now

### Test AI Moderation

1. Go to **Dashboard** → **Stream Control**
2. Click **Create New Stream**
3. In your stream, send test messages
4. View moderation results in real-time

### Test HITL (Human-in-the-Loop)

1. Go to **HITL Queue**
2. Review any low-confidence AI predictions
3. Approve or reject to train the system

### Setup Mobile Streaming

1. Go to **Stream Control**
2. Click **Quick PRISM Mobile Setup**
3. Scan QR code with PRISM Live Studio app
4. Start streaming from your phone!

### View Analytics

1. Go to **Analytics**
2. See real-time metrics:
   - Stream statistics
   - AI model performance
   - Moderation insights

## Test Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@swanythree.com | admin123 | Admin |
| streamer1@test.com | admin123 | User |
| moderator1@test.com | admin123 | Moderator |

## Verify Installation

Check all services are running:

```bash
# Check containers
docker-compose ps

# Should show 5 running containers:
# - swanythree-postgres
# - swanythree-backend
# - swanythree-frontend
# - swanythree-ollama
# - swanythree-prometheus
```

Test the API:

```bash
# Health check
curl http://localhost:3000/health

# Should return: {"status":"healthy",...}
```

## Troubleshooting

### PostgreSQL not starting
```bash
docker-compose down
docker volume rm pub_postgres_data
docker-compose up -d
```

### Backend connection error
```bash
# Check logs
docker logs swanythree-backend

# Restart backend
docker-compose restart backend
```

### Frontend not loading
```bash
# Check if backend is running
curl http://localhost:3000/health

# Restart frontend
docker-compose restart frontend
```

### Ollama model missing
```bash
# Check available models
docker exec swanythree-ollama ollama list

# Pull the model
docker exec swanythree-ollama ollama pull ministral-3b
```

## Next Steps

- Configure Stripe for payments (optional)
- Set up VDO.Ninja rooms for multi-guest streams
- Explore the Admin Panel
- Review the full README.md for advanced features

## Stop Services

```bash
# Stop all containers
docker-compose down

# Stop and remove all data
docker-compose down -v
```

## Development Mode

For local development without Docker:

```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev

# Terminal 2: Frontend
cd frontend
npm install
npm run dev

# Terminal 3: Start PostgreSQL
docker-compose up postgres

# Terminal 4: Start Ollama
docker-compose up ollama
```

---

Need help? Check the full README.md or open an issue on GitHub.
