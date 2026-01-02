#!/bin/bash

set -e

echo "🎬 Setting up Unified Platform - Complete Integration"
echo "===================================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo -e "${BLUE}Checking Node.js installation...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js not found. Please install Node.js 18+ first.${NC}"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js ${NODE_VERSION} found${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${YELLOW}npm not found. Please install npm first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ npm found${NC}"
echo ""

# Backend Setup
echo -e "${BLUE}📦 Setting up Backend...${NC}"
cd backend

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file from template...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please edit backend/.env with your API keys${NC}"
fi

echo "Installing backend dependencies..."
npm install

echo "Generating Prisma Client..."
npx prisma generate

echo -e "${GREEN}✓ Backend setup complete${NC}"
echo ""

# Frontend Setup
echo -e "${BLUE}📦 Setting up Frontend...${NC}"
cd ../frontend

echo "Installing frontend dependencies..."
npm install

echo -e "${GREEN}✓ Frontend setup complete${NC}"
echo ""

# Docker Setup (optional)
cd ..
echo -e "${BLUE}🐳 Docker Setup (optional)${NC}"
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓ Docker found${NC}"
    echo ""
    echo "To run with Docker Compose:"
    echo "  cd deployment/docker"
    echo "  docker-compose up -d"
else
    echo -e "${YELLOW}Docker not found. Install Docker to use containerized deployment.${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. ${YELLOW}Configure API Keys:${NC}"
echo "   Edit backend/.env with your:"
echo "   - Database URL (PostgreSQL)"
echo "   - Redis URL"
echo "   - Supabase credentials"
echo "   - AI service API keys (HeyGen, ElevenLabs, Akool)"
echo "   - Streaming service keys (VDO.Ninja, EvMux)"
echo ""
echo "2. ${YELLOW}Set up Database:${NC}"
echo "   cd backend"
echo "   npx prisma db push"
echo ""
echo "3. ${YELLOW}Start Development:${NC}"
echo "   Terminal 1 (Backend):   cd backend && npm run dev"
echo "   Terminal 2 (Workers):   cd backend && npm run worker"
echo "   Terminal 3 (Frontend):  cd frontend && npm run dev"
echo ""
echo "4. ${YELLOW}Deploy to Production:${NC}"
echo "   Option A (Railway):     cd backend && ./scripts/deploy.sh"
echo "   Option B (Docker):      cd deployment/docker && docker-compose up -d"
echo ""
echo "🌐 Access the app:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:4000"
echo "   API Docs: http://localhost:4000/health"
echo ""
echo -e "${GREEN}Happy streaming! 🚀${NC}"
