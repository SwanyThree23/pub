#!/bin/bash

#######################################
# N8N Claude AI Workflows Setup Script
# Version: 1.0.0
#######################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

check_command() {
    if command -v "$1" &> /dev/null; then
        log_success "$1 is installed"
        return 0
    else
        log_error "$1 is not installed"
        return 1
    fi
}

# Banner
echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   N8N Claude AI Workflows Setup                  ║
║   Production-Ready Automation System              ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Check prerequisites
log_info "Checking prerequisites..."

PREREQS_OK=true

if ! check_command "node"; then
    log_warning "Please install Node.js >= 18.0.0"
    PREREQS_OK=false
fi

if ! check_command "npm"; then
    log_warning "Please install npm >= 9.0.0"
    PREREQS_OK=false
fi

if ! check_command "python3"; then
    log_warning "Please install Python >= 3.9"
    PREREQS_OK=false
fi

if ! check_command "pip"; then
    log_warning "Please install pip"
    PREREQS_OK=false
fi

if [ "$PREREQS_OK" = false ]; then
    log_error "Prerequisites check failed. Please install missing dependencies."
    exit 1
fi

log_success "All prerequisites are installed"

# Create directories
log_info "Creating project directories..."

mkdir -p data
mkdir -p logs
mkdir -p backups
mkdir -p uploads

log_success "Directories created"

# Copy environment file
log_info "Setting up environment configuration..."

if [ ! -f .env ]; then
    cp configs/.env.example .env
    log_success ".env file created"
    log_warning "Please edit .env file with your credentials"
else
    log_warning ".env file already exists, skipping"
fi

# Install Node.js dependencies
log_info "Installing Node.js dependencies..."

npm install
log_success "Node.js dependencies installed"

# Install Python dependencies
log_info "Installing Python dependencies..."

pip install -r requirements.txt
log_success "Python dependencies installed"

# Generate encryption key
log_info "Generating encryption key..."

ENCRYPTION_KEY=$(openssl rand -base64 32)
log_success "Encryption key generated"
log_warning "Add this to your .env file:"
echo -e "${GREEN}ENCRYPTION_KEY=$ENCRYPTION_KEY${NC}"

# Generate webhook secret
WEBHOOK_SECRET=$(openssl rand -hex 32)
log_success "Webhook secret generated"
log_warning "Add this to your .env file:"
echo -e "${GREEN}WEBHOOK_SECRET=$WEBHOOK_SECRET${NC}"

# Initialize database
log_info "Initializing database..."

sqlite3 data/n8n.db "CREATE TABLE IF NOT EXISTS _initialized (created_at DATETIME DEFAULT CURRENT_TIMESTAMP);"
sqlite3 data/n8n.db "INSERT INTO _initialized DEFAULT VALUES;"

log_success "Database initialized"

# Set permissions
log_info "Setting file permissions..."

chmod +x scripts/*.sh
chmod 600 .env 2>/dev/null || true

log_success "Permissions set"

# Final instructions
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                   ║${NC}"
echo -e "${GREEN}║   Setup Complete!                                ║${NC}"
echo -e "${GREEN}║                                                   ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════╝${NC}"
echo ""

log_info "Next steps:"
echo ""
echo "1. Edit .env file with your credentials:"
echo -e "   ${YELLOW}nano .env${NC}"
echo ""
echo "2. Add the generated keys shown above to your .env file"
echo ""
echo "3. Start N8N (if not already running):"
echo -e "   ${YELLOW}n8n start${NC}"
echo ""
echo "4. Import workflows to N8N:"
echo "   - Open N8N interface (http://localhost:5678)"
echo "   - Go to Workflows → Import from File"
echo "   - Import files from workflows/ directory"
echo ""
echo "5. Configure N8N credentials:"
echo "   - Anthropic API (Claude)"
echo "   - Chat platforms (WhatsApp/Telegram)"
echo "   - Google services (if using)"
echo ""
echo "6. Create data table 'chat_messages' in N8N with columns:"
echo "   - message (String)"
echo "   - number (String)"
echo "   - message_status (String)"
echo "   - platform (String)"
echo "   - timestamp (DateTime)"
echo ""
echo "7. Start MCP servers:"
echo -e "   ${YELLOW}npm run mcp:all${NC}"
echo ""
echo "8. Test your first workflow!"
echo ""

log_success "Happy automating! 🚀"
echo ""
