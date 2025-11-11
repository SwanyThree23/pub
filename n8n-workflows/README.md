# N8N Claude AI Workflows 🤖

> **Professional-grade N8N workflows with Claude AI integration, MCP servers, and secure data analysis capabilities**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![N8N Compatible](https://img.shields.io/badge/n8n-Compatible-blue.svg)](https://n8n.io/)
[![Claude AI](https://img.shields.io/badge/Claude-Sonnet%204.5-purple.svg)](https://www.anthropic.com/claude)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Workflows](#workflows)
- [MCP Servers](#mcp-servers)
- [Security](#security)
- [Usage Examples](#usage-examples)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

This repository contains **comprehensive, production-ready N8N workflows** that integrate:

- **Claude AI (Sonnet 4.5)** for advanced reasoning and natural language processing
- **Multi-platform chat integration** (WhatsApp, Telegram)
- **Human-like AI agents** with batch message processing
- **Model Context Protocol (MCP)** servers for tool integration
- **Secure data analysis** with encryption and compliance
- **Professional automation** with guardrails and monitoring

### What Makes This Different?

✅ **Production-Ready** - Built with security, scalability, and reliability in mind
✅ **Comprehensive** - Includes workflows, MCP servers, prompts, and documentation
✅ **Secure** - Enterprise-grade security with encryption, authentication, and compliance
✅ **Extensible** - Modular architecture that's easy to customize and extend
✅ **Well-Documented** - Detailed guides, examples, and best practices

---

## ✨ Features

### 🤖 AI Agent Capabilities

- **Human-like conversations** with multi-message responses
- **Batch message processing** for natural conversation flow
- **Context-aware memory** maintaining conversation history
- **Multi-tool orchestration** coordinating complex tasks
- **Proactive recommendations** based on user patterns

### 💬 Chat Platform Integration

- **WhatsApp Business API** integration
- **Telegram Bot API** integration
- **Platform-agnostic** architecture (easily add more)
- **Conversation history** with SQLite storage
- **User preferences** management

### 🔧 MCP Servers

Three specialized MCP servers for Claude integration:

1. **N8N Automation Server** - Trigger workflows, manage data tables
2. **Data Analysis Server** - Secure data processing and statistics
3. **Chat Platform Server** - Multi-platform messaging with history

### 📊 Data Analysis

- **Secure data loading** (CSV, JSON) with encryption
- **Statistical operations** (mean, median, std, aggregations)
- **Data filtering** and transformation
- **Export capabilities** with format conversion

### 🔒 Security & Compliance

- **Encryption** at rest and in transit (AES-256-GCM, TLS 1.3)
- **Input validation** and sanitization
- **Rate limiting** and DDoS protection
- **PII redaction** for sensitive data
- **GDPR/CCPA** compliance features
- **Audit logging** for all operations

### 📈 Monitoring & Observability

- **Real-time alerts** for errors and anomalies
- **Circuit breakers** for resilience
- **Comprehensive logging** with Winston
- **Metrics collection** for performance tracking

---

## 🏗️ Architecture

```
n8n-workflows/
├── workflows/           # N8N workflow JSON files
│   ├── human-like-ai-agent-batch-processing.json
│   └── advanced-ai-agent-with-tools.json
├── mcp-server/         # Model Context Protocol servers
│   ├── mcp-server-config.json
│   ├── n8n-mcp-server.js
│   ├── data-analysis-mcp-server.py
│   └── chat-platform-mcp-server.js
├── prompts/            # System prompts for AI agents
│   └── claude-ai-agent-prompts.md
├── configs/            # Configuration files
│   ├── security-guardrails.json
│   └── .env.example
├── docs/               # Additional documentation
├── scripts/            # Utility scripts
└── data/               # Data storage (gitignored)
```

### Workflow Architecture

```
┌─────────────┐
│  Webhook    │ Incoming message from chat platform
│  Trigger    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│     Set     │ Standardize variables (message, number, platform)
│  Variables  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Store    │ Save to data table with status "in_queue"
│   Message   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Wait     │ Collect batch messages (8 seconds)
│   Node      │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Retrieve   │ Get all "in_queue" messages for user
│  Messages   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Loop     │ Update each message status to "processed"
│  & Update   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Merge    │ Combine messages into single context
│  Messages   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Claude    │ Process with AI + memory + tools
│  AI Agent   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Segregate  │ Split response into multiple messages
│  Responses  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Loop     │ Send each message with delay
│  & Send     │
└─────────────┘
```

---

## 📦 Prerequisites

### Required

- **Node.js** >= 18.0.0
- **Python** >= 3.9
- **N8N** (self-hosted or cloud)
- **Claude API Key** from Anthropic
- **Chat Platform** credentials (WhatsApp/Telegram)

### Optional

- **Redis** (for caching and queues)
- **PostgreSQL** (alternative to SQLite)
- **Docker** (for containerization)

---

## 🚀 Installation

### 1. Clone Repository

```bash
git clone https://github.com/SwanyThree23/pub.git
cd pub/n8n-workflows
```

### 2. Install Node.js Dependencies

```bash
npm install
```

### 3. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 4. Set Up N8N

#### Option A: Self-Hosted (Recommended)

Using Docker:
```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD=your_password \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

Using npm:
```bash
npm install -g n8n
n8n start
```

#### Option B: N8N Cloud

Sign up at [n8n.cloud](https://n8n.cloud) (€20/month)

### 5. Configure Environment

```bash
cp configs/.env.example .env
# Edit .env with your credentials
nano .env
```

---

## ⚙️ Configuration

### Environment Variables

Edit `.env` file with your configuration:

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-your-api-key
N8N_API_URL=http://localhost:5678/api/v1
N8N_API_KEY=your_n8n_api_key

# Chat Platforms (choose one or more)
WHATSAPP_API_URL=https://api.whatsapp.com/v1
WHATSAPP_API_KEY=your_whatsapp_key

TELEGRAM_BOT_TOKEN=your_telegram_token

# Security
ENCRYPTION_KEY=your_256_bit_key_base64
WEBHOOK_SECRET=your_webhook_secret
```

### N8N Data Table Setup

Create a data table in N8N called `chat_messages` with these columns:

| Column | Type | Description |
|--------|------|-------------|
| `id` | Number | Auto-generated ID |
| `message` | String | Message content |
| `number` | String | User identifier |
| `message_status` | String | Status (in_queue, processed) |
| `platform` | String | Platform (whatsapp, telegram) |
| `timestamp` | DateTime | Message timestamp |

### MCP Server Configuration

Configure MCP servers in your Claude Desktop or API:

```json
{
  "mcpServers": {
    "n8n-automation": {
      "command": "node",
      "args": ["./mcp-server/n8n-mcp-server.js"],
      "env": {
        "N8N_API_URL": "http://localhost:5678/api/v1",
        "N8N_API_KEY": "your_api_key"
      }
    }
  }
}
```

---

## 📝 Workflows

### Import Workflows

1. Open N8N interface
2. Click **Workflows** → **Import from File**
3. Select workflow JSON from `workflows/` directory
4. Update credentials and configuration
5. Activate workflow

### Available Workflows

#### 1. Human-Like AI Agent with Batch Processing

**File:** `human-like-ai-agent-batch-processing.json`

**Features:**
- Collects multiple messages before responding
- Responds with human-like multi-message format
- Maintains conversation context
- Platform-agnostic (WhatsApp, Telegram)

**Use Cases:**
- Customer support chatbots
- Personal assistants
- Sales qualification
- Community management

#### 2. Advanced AI Agent with Tools

**File:** `advanced-ai-agent-with-tools.json`

**Features:**
- Integrates with Google Calendar, Gmail, Weather APIs
- Scheduled execution (daily at 5 AM)
- Multi-tool orchestration
- Proactive recommendations

**Use Cases:**
- Personal assistant automation
- Daily briefings and planning
- Event management
- Smart notifications

---

## 🔌 MCP Servers

### Starting MCP Servers

#### All Servers

```bash
npm run mcp:all
```

#### Individual Servers

```bash
# N8N Automation Server
npm run mcp:n8n

# Chat Platform Server
npm run mcp:chat

# Data Analysis Server (Python)
python mcp-server/data-analysis-mcp-server.py
```

### Available Tools

#### N8N Automation Server

- `trigger_workflow` - Execute N8N workflows
- `get_workflow_status` - Check execution status
- `list_workflows` - List available workflows
- `query_data_table` - Query N8N data tables
- `insert_data_table` - Insert data
- `update_data_table` - Update records
- `create_webhook` - Create webhook endpoints

#### Data Analysis Server

- `load_data` - Load CSV/JSON files
- `analyze_data` - Comprehensive analysis
- `filter_data` - Apply filters
- `aggregate_data` - Group and aggregate
- `compute_statistics` - Calculate stats
- `save_data` - Export processed data

#### Chat Platform Server

- `send_whatsapp_message` - Send via WhatsApp
- `send_telegram_message` - Send via Telegram
- `get_conversation_history` - Retrieve history
- `save_conversation` - Store messages
- `get_user_preferences` - Get user settings
- `set_user_preferences` - Update settings
- `send_batch_messages` - Send multiple with delays
- `search_conversations` - Search history

---

## 🔐 Security

### Security Features

✅ **Encryption** - AES-256-GCM at rest, TLS 1.3 in transit
✅ **Authentication** - API keys, OAuth2, webhook signatures
✅ **Authorization** - Role-based access control
✅ **Input Validation** - Regex patterns, length checks, sanitization
✅ **Rate Limiting** - Sliding window, token bucket algorithms
✅ **PII Protection** - Automatic redaction of sensitive data
✅ **Audit Logging** - Complete trail of all operations
✅ **Circuit Breakers** - Fault tolerance and resilience

### Security Configuration

Edit `configs/security-guardrails.json` to customize:

```json
{
  "rate_limiting": {
    "per_user_message_limit": 30,
    "window_seconds": 60
  },
  "input_validation": {
    "message_max_length": 4000
  },
  "data_retention": {
    "conversations": {
      "retention_days": 90
    }
  }
}
```

### Best Practices

1. **API Keys** - Store in environment variables, never commit
2. **Webhooks** - Always verify signatures
3. **User Input** - Sanitize and validate all inputs
4. **Data Storage** - Encrypt sensitive data
5. **Access Control** - Implement least privilege
6. **Monitoring** - Set up alerts for anomalies
7. **Updates** - Keep dependencies current
8. **Backups** - Regular automated backups

---

## 💡 Usage Examples

### Example 1: Customer Support Bot

```javascript
// In N8N, set variables:
{
  "task": "Handle customer inquiry about order status",
  "companyName": "Acme Corp",
  "userId": "user_123"
}
```

**Result:** AI agent processes inquiry, looks up order, provides status, and offers help.

### Example 2: Daily Assistant

```javascript
// Scheduled trigger at 5 AM
{
  "task": "Check calendar, weather, and recommend trail for run",
  "userContext": "User prefers morning runs, concerned about air quality"
}
```

**Result:** Agent checks calendar events, weather forecast, air quality, consults trail database, and sends recommendation email.

### Example 3: Data Analysis

```python
# Load and analyze sales data
tools = ["load_data", "analyze_data", "compute_statistics"]
data = "sales-2024.csv"

# Results: Summary statistics, trends, insights
```

---

## 🐛 Troubleshooting

### Common Issues

#### Workflow Not Triggering

**Problem:** Webhook not receiving messages
**Solution:**
1. Check webhook URL is correct
2. Verify API credentials
3. Test webhook with Postman/curl
4. Check N8N execution logs

#### Claude API Errors

**Problem:** Rate limits or authentication errors
**Solution:**
1. Verify ANTHROPIC_API_KEY is correct
2. Check API usage/limits on Anthropic console
3. Implement exponential backoff
4. Consider upgrading API tier

#### Messages Not Batching

**Problem:** Each message triggers separately
**Solution:**
1. Ensure wait node is configured (8 seconds)
2. Check data table is storing correctly
3. Verify message_status logic
4. Test with multiple rapid messages

#### MCP Server Connection Failed

**Problem:** Can't connect to MCP server
**Solution:**
1. Verify server is running (`npm run mcp:n8n`)
2. Check environment variables are set
3. Ensure ports are not blocked
4. Review server logs for errors

### Debug Mode

Enable debug logging:

```bash
LOG_LEVEL=debug npm start
```

Check N8N execution data by clicking on nodes after execution.

---

## 📚 Documentation

Additional documentation:

- [System Prompts Guide](prompts/claude-ai-agent-prompts.md) - Comprehensive prompt examples
- [Security Configuration](configs/security-guardrails.json) - Security settings reference
- [MCP Server API](mcp-server/README.md) - MCP server API documentation
- [Environment Variables](configs/.env.example) - Complete configuration reference

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Add tests for new features
- Update documentation
- Use meaningful commit messages
- Keep PRs focused and atomic

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Anthropic** for Claude AI
- **N8N** for the automation platform
- **Community contributors** for feedback and improvements

Built with inspiration from:
- [Blazing Zebra's AI automation tutorials](https://youtube.com/@blazingzebra)
- [Pieter Levels' indie hacker approach](https://levels.io)
- [N8N community workflows](https://n8n.io/workflows)

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/SwanyThree23/pub/issues)
- **Discussions:** [GitHub Discussions](https://github.com/SwanyThree23/pub/discussions)
- **Email:** support@example.com

---

## 🗺️ Roadmap

### v1.1 (Q1 2025)
- [ ] Voice message support
- [ ] Image processing with Claude Vision
- [ ] Multi-language support
- [ ] Advanced analytics dashboard

### v1.2 (Q2 2025)
- [ ] Slack integration
- [ ] Microsoft Teams integration
- [ ] Custom LLM support (Llama, Mistral)
- [ ] Enhanced error recovery

### v2.0 (Q3 2025)
- [ ] Multi-agent orchestration
- [ ] Knowledge base integration
- [ ] Advanced RAG capabilities
- [ ] Enterprise SSO support

---

**⭐ If you find this useful, please star the repository!**

**🚀 Happy Automating!**
