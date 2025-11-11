# Quick Start Guide 🚀

Get up and running with N8N Claude AI Workflows in **15 minutes**.

---

## Prerequisites Checklist

Before you begin, ensure you have:

- [ ] Node.js (v18+) and npm installed
- [ ] Python 3.9+ and pip installed
- [ ] N8N installed (self-hosted or cloud account)
- [ ] Claude API key from [Anthropic](https://console.anthropic.com/)
- [ ] Chat platform credentials (WhatsApp or Telegram)

---

## Step-by-Step Setup

### 1. Run Automated Setup (2 minutes)

```bash
cd n8n-workflows
./scripts/setup.sh
```

This script will:
- ✅ Check prerequisites
- ✅ Create necessary directories
- ✅ Install all dependencies
- ✅ Generate security keys
- ✅ Initialize database

### 2. Configure Environment (3 minutes)

Edit the `.env` file with your credentials:

```bash
nano .env
```

**Minimum required configuration:**

```bash
# Claude AI
ANTHROPIC_API_KEY=sk-ant-your-key-here

# N8N
N8N_API_URL=http://localhost:5678/api/v1
N8N_API_KEY=your-n8n-api-key

# Choose ONE chat platform
WHATSAPP_API_KEY=your-whatsapp-key
# OR
TELEGRAM_BOT_TOKEN=your-telegram-token

# Add the generated keys from setup script
ENCRYPTION_KEY=<paste-generated-key>
WEBHOOK_SECRET=<paste-generated-secret>
```

**Get your keys:**
- **Claude:** https://console.anthropic.com/settings/keys
- **N8N API:** N8N → Settings → API → Generate API Key
- **WhatsApp:** https://business.facebook.com/latest/whatsapp_manager
- **Telegram:** Talk to [@BotFather](https://t.me/botfather)

### 3. Start N8N (1 minute)

If not already running:

```bash
n8n start
```

Access at: http://localhost:5678

### 4. Create Data Table (2 minutes)

In N8N interface:

1. Go to **Data** → **Data Tables**
2. Click **Create Table**
3. Name it: `chat_messages`
4. Add columns:

| Column Name | Type | Required |
|-------------|------|----------|
| message | String | Yes |
| number | String | Yes |
| message_status | String | Yes |
| platform | String | Yes |
| timestamp | DateTime | No |

5. Click **Create**

### 5. Import Workflow (3 minutes)

1. In N8N, go to **Workflows** → **Import from File**
2. Select: `workflows/human-like-ai-agent-batch-processing.json`
3. Click **Import**

#### Configure Credentials:

**Anthropic API:**
- Click the "Claude Chat Model" node
- Click "Create New Credential"
- Name: "Anthropic Claude API"
- Paste your `ANTHROPIC_API_KEY`
- Save

**Chat Platform (WhatsApp or Telegram):**
- Click "Send Message to User" node
- Configure your platform's API endpoint and credentials

### 6. Test Workflow (2 minutes)

1. Click **Execute Workflow** button
2. Send a test message to your chat platform
3. Watch the execution flow in N8N
4. You should receive a response!

### 7. Start MCP Servers (1 minute)

In a new terminal:

```bash
cd n8n-workflows
npm run mcp:all
```

Keep this running in the background.

### 8. Activate Workflow (1 minute)

1. In N8N workflow, toggle **Active** switch
2. Your bot is now live! 🎉

---

## Quick Test

Send these messages rapidly to your bot:

```
Hi there!
What can you help me with?
Tell me about your features
```

The bot should:
1. Wait for all messages (8 seconds)
2. Process them together
3. Respond with multiple natural messages

---

## Next Steps

### Customize Your Bot

1. **Edit System Prompt:**
   - Open workflow in N8N
   - Click "Claude AI Agent" node
   - Modify the prompt to match your use case
   - See `prompts/claude-ai-agent-prompts.md` for examples

2. **Adjust Batch Wait Time:**
   - Click "Wait for Batch Messages" node
   - Change from 8 to your desired seconds
   - Shorter = faster response, but less batching
   - Longer = more batching, but slower response

3. **Add Tools:**
   - Import `workflows/advanced-ai-agent-with-tools.json`
   - Connect Google Calendar, Gmail, Weather APIs
   - Enable multi-tool orchestration

### Advanced Features

**Enable Scheduling:**
```bash
# Edit workflow to trigger daily
# Set time in "Daily Schedule Trigger" node
```

**Add More Platforms:**
```bash
# Add Slack, Discord, MS Teams
# Modify "Send Message" node with new API
```

**Implement Guardrails:**
```bash
# Review configs/security-guardrails.json
# Implement rate limiting, input validation
```

---

## Common Quick Fixes

### "Workflow not triggering"
**Solution:** Check webhook URL matches in both N8N and your chat platform

### "Claude API error"
**Solution:** Verify API key is correct and has credits

### "Messages not batching"
**Solution:** Ensure data table is set up correctly with exact column names

### "MCP servers won't start"
**Solution:** Check all environment variables are set in `.env`

---

## Getting Help

- 📖 **Full Documentation:** [README.md](../README.md)
- 💬 **Issues:** [GitHub Issues](https://github.com/SwanyThree23/pub/issues)
- 📧 **Email:** support@example.com

---

## Workflow Overview

```
User sends messages → Webhook receives
                    ↓
              Store in data table
                    ↓
              Wait 8 seconds (batch)
                    ↓
         Retrieve all messages
                    ↓
         Mark as "processed"
                    ↓
          Merge into context
                    ↓
         Claude AI processes
                    ↓
        Generate multi-message response
                    ↓
      Send messages with delays
```

---

## Success Checklist

After setup, you should have:

- [x] All dependencies installed
- [x] `.env` file configured
- [x] N8N running and accessible
- [x] Data table created
- [x] Workflow imported and active
- [x] Credentials configured
- [x] MCP servers running
- [x] Test messages working

---

## Performance Tips

1. **Self-host N8N** on VPS (5x cheaper than cloud)
2. **Use Redis** for caching (improves response time)
3. **Enable rate limiting** to prevent abuse
4. **Monitor logs** for errors and optimization
5. **Backup regularly** with included scripts

---

## What You Built

Congratulations! You now have:

✅ **Production-ready AI chatbot** with human-like responses
✅ **Batch message processing** for natural conversations
✅ **Multi-platform support** (WhatsApp, Telegram, extensible)
✅ **Secure data handling** with encryption
✅ **Conversation memory** maintaining context
✅ **MCP integration** for advanced tool usage
✅ **Monitoring and logging** for reliability

---

**Ready to scale?** Check out [README.md](../README.md) for advanced features!

**Need customization?** See [claude-ai-agent-prompts.md](../prompts/claude-ai-agent-prompts.md) for prompt templates!

---

*Setup time: ~15 minutes | Deployment: Production-ready | Scalability: Unlimited*

**Happy automating! 🤖✨**
