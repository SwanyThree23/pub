# n8n Workflow Automation for SwanyThree Ultimate

This directory contains n8n workflow templates for automating VDO.Ninja + PRISM Live Studio production workflows.

## What is n8n?

n8n is an open-source workflow automation tool that allows you to connect different services and automate tasks through webhooks and scheduled triggers.

## Setup

1. **Install n8n**:
```bash
# Using Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n

# Or using npm
npm install -g n8n
n8n start
```

2. **Access n8n**:
   - Open http://localhost:5678
   - Create an account

3. **Import Workflows**:
   - Click "Workflows" → "Import from File"
   - Select one of the JSON files in this directory

## Available Workflows

### 1. Auto Scene Switching (`auto-scene-switch.json`)

**Purpose**: Automatically switch OBS/PRISM scenes based on active speaker detection.

**Triggers**: Runs every 2 seconds

**Actions**:
1. Polls VDO.Ninja for active speaker
2. If new speaker detected, switches OBS scene
3. Logs switch events to database

**Configuration**:
- Update `roomId` in HTTP Request node
- Configure OBS WebSocket credentials
- Adjust polling interval if needed

### 2. Guest Auto-Mute (`guest-auto-mute.json`)

**Purpose**: Automatically mute guests when not speaking.

**Triggers**: Webhook trigger (call from external app)

**Actions**:
1. Receives mute command via webhook
2. Executes VDO.Ninja mute API
3. Updates OBS audio mixer

**Usage**:
```bash
curl -X POST http://localhost:5678/webhook/mute-guest \
  -H "Content-Type: application/json" \
  -d '{"roomId": "abc123", "guestSlot": 1}'
```

### 3. Scheduled Stream Start (`scheduled-stream.json`)

**Purpose**: Start stream at a specific time with pre-configured scenes.

**Triggers**: Cron schedule (e.g., "0 18 * * 1-5" = 6 PM weekdays)

**Actions**:
1. Connects to OBS/PRISM WebSocket
2. Sets up scenes with VDO.Ninja sources
3. Enables Studio Mode
4. Starts streaming
5. Sends notification

### 4. Real-Time Subtitle Sync (`subtitle-sync.json`)

**Purpose**: Sync transcriptions from Whisper API to browser overlay.

**Triggers**: Runs every 1 second

**Actions**:
1. Fetches latest transcription
2. Translates if needed
3. Updates subtitle HTML overlay
4. Broadcasts to WebSocket clients

### 5. Multi-Platform Streaming (`multi-platform.json`)

**Purpose**: Simultaneously stream to YouTube, Twitch, Facebook.

**Triggers**: Manual trigger or webhook

**Actions**:
1. Creates RTMP streams for each platform
2. Configures OBS multi-output
3. Starts all streams
4. Monitors stream health

### 6. Guest Onboarding (`guest-onboarding.json`)

**Purpose**: Automate guest setup with QR codes and instructions.

**Triggers**: Form submission webhook

**Actions**:
1. Creates VDO.Ninja guest link
2. Generates QR code
3. Sends email with instructions
4. Creates OBS scene for guest
5. Logs to database

## Workflow Components

### Common Nodes Used

1. **Webhook Trigger** - Receives HTTP requests
2. **HTTP Request** - Calls SwanyThree API endpoints
3. **Schedule Trigger** - Runs on cron schedule
4. **IF** - Conditional logic
5. **Set** - Transform data
6. **Function** - Custom JavaScript
7. **PostgreSQL** - Database operations
8. **Email** - Send notifications

### API Endpoints Reference

All workflows use the SwanyThree backend API:

```javascript
// VDO.Ninja Control
POST /vdo/room/:id/mute
POST /vdo/room/:id/scene/:sceneNumber
POST /vdo/room/:id/guest/:guestSlot/volume
GET  /vdo/room/:id/active-speaker

// OBS Control
POST /obs/scene/current
POST /obs/audio/mute
POST /obs/streaming/start
GET  /obs/scenes

// Smart Director
POST /smart-director/start
GET  /smart-director/stats/:roomId

// Transcription
POST /transcription/start
GET  /transcription/:streamId/current
```

## Creating Custom Workflows

### Example: Auto Lower-Third Graphics

```json
{
  "name": "Auto Lower Third",
  "nodes": [
    {
      "name": "Detect New Speaker",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "GET",
        "url": "http://localhost:3000/vdo/room/{{$json.roomId}}/active-speaker"
      }
    },
    {
      "name": "Show Lower Third",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "http://localhost:3000/obs/scene/preview",
        "body": {
          "sceneName": "Lower Third - {{$json.speakerName}}"
        }
      }
    },
    {
      "name": "Transition",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "http://localhost:3000/obs/transition"
      }
    }
  ]
}
```

## Best Practices

1. **Error Handling**: Add error handling nodes to all workflows
2. **Logging**: Log important events to database for debugging
3. **Rate Limiting**: Don't poll APIs too frequently (<1 sec)
4. **Credentials**: Store API keys in n8n credentials manager
5. **Testing**: Test workflows in n8n UI before production
6. **Monitoring**: Set up notifications for workflow failures

## Integration with SwanyThree Platform

### Generating Workflow Templates

The SwanyThree backend can generate n8n workflows for you:

```bash
curl http://localhost:3000/vdo/room/abc123/n8n-workflow?type=scene-switching
```

Returns a ready-to-import JSON workflow customized for your room.

### Workflow Types

- `scene-switching` - Auto scene switcher
- `guest-mute` - Guest mute automation
- `subtitle-sync` - Real-time subtitles
- `stream-health` - Stream monitoring

## Advanced Automation Examples

### AI-Powered Highlight Detection

Create a workflow that:
1. Monitors stream chat for keywords
2. Uses OpenAI to detect exciting moments
3. Automatically creates highlight clips
4. Posts to social media

### Dynamic Layouts

Workflow that:
1. Counts active guests in VDO.Ninja
2. Switches between 1, 2, 4, 9-grid layouts
3. Animates transitions
4. Adjusts based on screen share

### Audience Interaction

Workflow that:
1. Pulls chat messages
2. Moderates with AI
3. Features messages on screen
4. Triggers poll overlays

## Troubleshooting

### Workflow Not Triggering

- Check webhook URL is correct
- Verify API credentials
- Check firewall/CORS settings
- Review n8n execution logs

### HTTP Request Errors

- Verify backend is running
- Check API endpoint URLs
- Ensure authentication token is valid
- Review request body format

### OBS WebSocket Failures

- Verify OBS WebSocket plugin is enabled
- Check host/port configuration
- Ensure password is correct
- Test connection manually first

## Resources

- [n8n Documentation](https://docs.n8n.io/)
- [VDO.Ninja API Docs](https://docs.vdo.ninja/)
- [OBS WebSocket Protocol](https://github.com/obsproject/obs-websocket)
- [SwanyThree API Reference](../README.md#api-endpoints)

## Support

For help with workflows:
- Check the [SwanyThree Discord](#)
- Review n8n community forums
- Open a GitHub issue

---

**Pro Tip**: Start with pre-built workflows and modify them for your needs rather than building from scratch.
