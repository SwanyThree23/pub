#!/bin/bash

set -e

echo "🚀 Deploying Unified Platform to Railway..."

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway
echo "🔐 Logging in to Railway..."
railway login

# Link to project
echo "🔗 Linking to Railway project..."
railway link f904c96c-8bad-4d6d-bf90-221f96222cb9

# Push database migrations
echo "📊 Running database migrations..."
railway run npx prisma migrate deploy

# Deploy backend
echo "🔨 Deploying backend..."
railway up

echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Set environment variables in Railway dashboard"
echo "2. Add PostgreSQL and Redis plugins"
echo "3. Configure domain if needed"
