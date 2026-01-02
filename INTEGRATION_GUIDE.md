# SwanyThree Ultimate - VDO.Ninja + PRISM Integration Guide

This guide covers the advanced integration of VDO.Ninja's Remote Control API with PRISM Live Studio for automated, AI-powered broadcast production.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [VDO.Ninja Remote Control API](#vdoninja-remote-control-api)
3. [PRISM/OBS WebSocket Integration](#prismobs-websocket-integration)
4. [AI Smart Director](#ai-smart-director)
5. [Real-Time Transcription](#real-time-transcription)
6. [n8n Automation Workflows](#n8n-automation-workflows)
7. [Production Workflows](#production-workflows)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    SwanyThree Backend                        │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────────┐     │
│  │   VDO.Ninja │  │ Smart        │  │  Transcription  │     │
│  │   Service   │──│ Director     │──│  Service        │     │
│  └─────┬──────┘  └──────┬───────┘  └────────┬────────┘     │
│        │                 │                    │               │
│        │         ┌───────▼────────┐          │               │
│        └────────▶│  OBS WebSocket │◀─────────┘               │
│                  │    Service     │                           │
│                  └───────┬────────┘                           │
└──────────────────────────┼──────────────────────────────────┘
                           │
                   ┌───────▼────────┐
                   │  PRISM Live    │
                   │    Studio      │
                   └───────┬────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                  │
    ┌────▼────┐     ┌─────▼──────┐    ┌─────▼─────┐
    │ YouTube │     │   Twitch   │    │  Facebook │
    └─────────┘     └────────────┘    └───────────┘
```

## VDO.Ninja Remote Control API

### Enabling the API

1. **Create a VDO.Ninja Room with API Enabled**:

```javascript
POST /vdo/room/create
{
  "name": "My Production Room",
  "password": "optional_password"
}

// Response includes API key
{
  "id": "abc123",
  "apiKey": "vdo_xxxxxxxxxxx",
  "directorUrl": "https://vdo.ninja/?director=abc123&api=vdo_xxxxxxxxxxx"
}
```

2. **The API key is automatically embedded in the director URL**. Any remote control commands will only work when the director session is active with the API key.

### Available Webhook Commands

All VDO.Ninja commands follow this pattern:
```
POST /vdo/webhook/:roomId/:action
{
  "value": "optional_value"
}
```

#### Audio Control

```javascript
// Mute local microphone
POST /vdo/room/:id/mute

// Unmute local microphone
POST /vdo/room/:id/unmute

// Mute specific guest
POST /vdo/room/:id/guest/:guestSlot/mute

// Set guest volume (0-100)
POST /vdo/room/:id/guest/:guestSlot/volume
{
  "volume": 75
}
```

#### Scene Management

```javascript
// Add guest to scene (toggle)
POST /vdo/room/:id/scene/:sceneNumber/guest/:guestSlot

// Switch to specific scene
POST /vdo/room/:id/scene/:sceneNumber

// Create a new scene
POST /vdo/room/:id/scenes
{
  "sceneName": "Interview Setup",
  "guestSlots": [1, 2]
}
```

#### Browser Capture URLs

```javascript
// Get browser capture URL for PRISM
GET /vdo/room/:id/browser-url/:guestSlot?type=guest

// Response
{
  "url": "https://vdo.ninja/?view=abc123&slot=1"
}
```

**Usage in PRISM**:
1. Add Browser Source in PRISM
2. Paste the URL
3. Check "Control audio via OBS/PRISM"
4. Adjust size to 1920x1080

## PRISM/OBS WebSocket Integration

### Setup

1. **Enable OBS WebSocket in PRISM**:
   - Tools → WebSocket Server Settings
   - Enable WebSocket server
   - Set port (default: 4455)
   - Set password

2. **Configure Environment**:
```bash
OBS_WEBSOCKET_HOST=localhost:4455
OBS_WEBSOCKET_PASSWORD=your_password
```

### Scene Control

```javascript
// Get all scenes
GET /obs/scenes

// Get current scene
GET /obs/scene/current

// Switch to scene
POST /obs/scene/current
{
  "sceneName": "Guest_1"
}

// Preview scene (Studio Mode)
POST /obs/scene/preview
{
  "sceneName": "Guest_2"
}

// Transition preview to program
POST /obs/transition
```

### Audio Control

```javascript
// Mute audio source
POST /obs/audio/mute
{
  "sourceName": "VDO_Guest_1",
  "muted": true
}

// Set volume (0-100)
POST /obs/audio/volume
{
  "sourceName": "VDO_Guest_1",
  "volume": 85
}
```

### Automated Scene Creation

```javascript
// Create scene for VDO.Ninja guest
POST /obs/scenes/guest
{
  "guestSlot": 1,
  "roomId": "abc123"
}

// Creates:
// - Scene named "Guest_1"
// - Browser source with VDO.Ninja URL
// - Proper audio routing

// Create grid layout
POST /obs/scenes/grid
{
  "guestSlots": [1, 2, 3, 4],
  "roomId": "abc123"
}

// Creates 2x2 grid scene with all guests
```

### Streaming Control

```javascript
// Start streaming
POST /obs/streaming/start

// Stop streaming
POST /obs/streaming/stop

// Get stream status
GET /obs/stream/status
```

### Studio Mode

```javascript
// Enable Studio Mode
POST /obs/studio-mode
{
  "enabled": true
}

// Now you have preview/program workflow
// 1. Set preview scene
POST /obs/scene/preview {"sceneName": "Guest_1"}

// 2. Verify everything looks good

// 3. Transition to program
POST /obs/transition
```

## AI Smart Director

The Smart Director automatically switches scenes based on who is speaking.

### How It Works

1. **Audio Level Tracking**: VDO.Ninja reports audio levels for each guest
2. **Active Speaker Detection**: AI identifies who is currently speaking
3. **Intelligent Switching**: Waits for confirmation before switching (avoids rapid cuts)
4. **Manual Override**: Producers can manually switch and temporarily disable auto-switching

### Starting AI Auto-Switching

```javascript
POST /smart-director/start
{
  "roomId": "abc123",
  "guestSlots": [1, 2, 3],
  "config": {
    "switchDelay": 1000,      // Min time between switches (ms)
    "holdTime": 3000,          // Hold on speaker before switching (ms)
    "silenceThreshold": 20,    // Audio level threshold
    "confidenceThreshold": 0.7 // AI confidence required
  }
}
```

### Audio Level Reporting

Your VDO.Ninja director page needs to send audio levels:

```javascript
// From VDO.Ninja director page (custom script)
setInterval(() => {
  guests.forEach((guest, index) => {
    const audioLevel = getGuestAudioLevel(guest); // 0-100

    fetch(`/vdo/room/${roomId}/audio-level`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        guestSlot: index + 1,
        level: audioLevel
      })
    });
  });
}, 500); // Every 500ms
```

### Getting Stats

```javascript
GET /smart-director/stats/:roomId

// Response
{
  "totalSwitches": 47,
  "autoSwitches": 42,
  "manualSwitches": 5,
  "currentSpeaker": 2,
  "enabled": true,
  "history": [
    {"from": 1, "to": 2, "timestamp": "...", "auto": true},
    {"from": 2, "to": 3, "timestamp": "...", "auto": true}
  ]
}
```

### Manual Override

```javascript
POST /smart-director/manual-switch
{
  "roomId": "abc123",
  "guestSlot": 1
}

// Disables auto-switching for 5 seconds
// Switches to Guest 1
// Re-enables auto-switching
```

## Real-Time Transcription

### Starting Transcription

```javascript
POST /transcription/start
{
  "streamId": "stream_123",
  "language": "en",              // Source language
  "targetLanguage": "es"         // Optional translation
}
```

### Transcription Flow

1. **Audio Capture**: PRISM/OBS captures audio
2. **Chunk Processing**: Audio sent to Whisper API in 2-second chunks
3. **Transcription**: OpenAI Whisper transcribes to text
4. **Translation** (optional): GPT-4 translates to target language
5. **Overlay Update**: HTML overlay updated with new captions

### Browser Overlay for Subtitles

1. **Get Overlay URL**:
```
GET /transcription/:streamId/overlay
```

2. **Add Browser Source in PRISM**:
   - URL: `http://localhost:3000/transcription/stream_123/overlay`
   - Width: 1920
   - Height: 1080
   - Custom CSS: `body { background: transparent; }`

3. **Position at bottom of scene**

### Exporting Transcripts

```javascript
// Get full transcript
GET /transcription/:streamId/transcript

// Export as SRT subtitles
GET /transcription/:streamId/export/srt
// Downloads transcript.srt file
```

## n8n Automation Workflows

### Installation

```bash
# Using Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### Importing Workflows

1. Access n8n at http://localhost:5678
2. Navigate to **Workflows** → **Import from File**
3. Select workflow JSON from `n8n-workflows/` directory
4. Configure credentials (API tokens, database connections)
5. Activate workflow

### Example Workflows

#### 1. Auto Scene Switching

**File**: `n8n-workflows/auto-scene-switch.json`

**What it does**:
- Polls active speaker every 2 seconds
- Switches OBS scene to show active speaker
- Logs all switches to database

**Configuration**:
- Update `roomId` in HTTP Request node
- Add SwanyThree API credentials
- Adjust polling interval if needed

#### 2. Guest Auto-Mute

**File**: `n8n-workflows/guest-auto-mute.json`

**What it does**:
- Listens for webhook triggers
- Mutes guest in both VDO.Ninja and OBS
- Returns success response

**Trigger URL**:
```bash
curl -X POST http://localhost:5678/webhook/vdo-mute \
  -H "Content-Type: application/json" \
  -d '{"roomId": "abc123", "guestSlot": 1}'
```

### Creating Custom Workflows

n8n uses visual programming. Common pattern:

```
Trigger → HTTP Request → Conditional → Action → Log
```

**Example: Lower Third Automation**

1. **Trigger**: Schedule (every 5 seconds)
2. **HTTP Request**: Get active speaker
3. **IF**: Speaker changed?
4. **HTTP Request**: Set preview scene to "Lower_Third_Speaker_X"
5. **HTTP Request**: Transition to program
6. **PostgreSQL**: Log event

## Production Workflows

### Workflow 1: Simple Two-Guest Interview

**Setup**:
1. Create VDO.Ninja room
2. Send guest links
3. Create two guest scenes in PRISM
4. Enable AI auto-switching

**Code**:
```javascript
// 1. Create room
const room = await fetch('/vdo/room/create', {
  method: 'POST',
  body: JSON.stringify({ name: 'Interview' })
});

// 2. Create OBS scenes
await fetch('/obs/scenes/guest', {
  method: 'POST',
  body: JSON.stringify({ guestSlot: 1, roomId: room.id })
});

await fetch('/obs/scenes/guest', {
  method: 'POST',
  body: JSON.stringify({ guestSlot: 2, roomId: room.id })
});

// 3. Start AI director
await fetch('/smart-director/start', {
  method: 'POST',
  body: JSON.stringify({
    roomId: room.id,
    guestSlots: [1, 2]
  })
});

// 4. Start transcription (optional)
await fetch('/transcription/start', {
  method: 'POST',
  body: JSON.stringify({
    streamId: stream.id,
    language: 'en',
    targetLanguage: 'es'
  })
});

// 5. Enable Studio Mode and start
await fetch('/obs/studio-mode', {
  method: 'POST',
  body: JSON.stringify({ enabled: true })
});

await fetch('/obs/streaming/start', { method: 'POST' });
```

### Workflow 2: Multi-Guest Panel (4 people)

**Setup**:
1. Create VDO.Ninja room
2. Create 4 individual scenes + 1 grid scene
3. Use n8n workflow for auto-switching between grid and active speaker

**Scene Layout**:
- **Grid Scene**: Shows all 4 guests in 2x2 layout
- **Guest_1**, **Guest_2**, **Guest_3**, **Guest_4**: Individual close-ups
- **Lower_Third**: Name/title overlay

**Auto-Switching Logic** (n8n):
```
Every 3 seconds:
  Get active speaker
  IF speaker is same for 5+ seconds:
    Switch to individual scene
  ELSE:
    Show grid scene
```

### Workflow 3: Webinar with Q&A

**Setup**:
1. Main presenter scene
2. Grid scene for attendees asking questions
3. Transcription enabled for accessibility
4. Chat moderation with AI HITL

**Code**:
```javascript
// Enable everything
await Promise.all([
  // Transcription
  fetch('/transcription/start', {
    method: 'POST',
    body: JSON.stringify({
      streamId: stream.id,
      language: 'en',
      targetLanguage: null
    })
  }),

  // Chat moderation
  fetch('/chat/moderate', {
    method: 'POST',
    body: JSON.stringify({
      streamId: stream.id,
      username: 'user123',
      message: chatMessage
    })
  })
]);
```

## Best Practices

### 1. Studio Mode Always

Always use Studio Mode for professional productions:
- Preview scene in edit window
- Verify guest video/audio
- Transition when ready
- No on-air mistakes

### 2. Buffering and Delays

- **Switch Delay**: Set to 1000ms minimum to avoid rapid cuts
- **Hold Time**: 3 seconds ensures speaker isn't just coughing
- **Audio Threshold**: 20-30 works for most environments

### 3. Failover Plans

- Keep manual control available
- Monitor AI confidence scores
- Have backup scenes ready
- Test internet connection

### 4. Audio Routing

PRISM Audio Setup:
1. Set VDO.Ninja browser sources to "Control audio via OBS"
2. Use Audio Mixer to balance levels
3. Apply noise suppression filter
4. Monitor output levels (aim for -6dB to -12dB)

### 5. Scene Organization

Name scenes clearly:
- `Guest_1_John_Doe`
- `Grid_4_Panel`
- `Lower_Third_Intro`
- `BRB_Screen`

## Troubleshooting

### VDO.Ninja API Not Working

**Check**:
1. Is API key in director URL?
2. Is director session active?
3. Is backend receiving requests? (check logs)

**Fix**:
```bash
# Check backend logs
docker logs swanythree-backend

# Verify API key
GET /vdo/room/:id
// Should show apiKey field
```

### OBS WebSocket Not Connecting

**Check**:
1. Is OBS WebSocket plugin enabled?
2. Is password correct?
3. Is port 4455 accessible?

**Fix**:
```bash
# Test connection manually
npm install -g wscat
wscat -c ws://localhost:4455

# Should see connection message
```

### AI Scene Switching Not Working

**Check**:
1. Are audio levels being reported?
2. Is Smart Director running?
3. Are scene names correct?

**Fix**:
```javascript
// Check director status
GET /smart-director/stats/:roomId

// Restart if needed
POST /smart-director/stop
POST /smart-director/start
```

### Transcription Delays

**Optimize**:
- Reduce chunk size (but increases API calls)
- Use faster Whisper model
- Cache translations
- Pre-load common phrases

## Advanced Techniques

### 1. Picture-in-Picture Lower Thirds

Combine multiple browser sources:
- Layer 1: VDO.Ninja guest (full screen)
- Layer 2: Lower third graphic (HTML overlay)
- Layer 3: Animated logo (browser source)

### 2. Dynamic Layouts Based on Guest Count

```javascript
// n8n workflow
const guestCount = await getActiveGuests(roomId);

if (guestCount === 1) {
  switchScene('Fullscreen');
} else if (guestCount === 2) {
  switchScene('Split_2');
} else if (guestCount <= 4) {
  switchScene('Grid_2x2');
} else {
  switchScene('Grid_3x3');
}
```

### 3. Audience Polls

Integrate with chat:
1. Parse chat for poll responses
2. Update browser source with results
3. Show in lower third
4. Animate results

### 4. Auto-Highlight Clip Creation

```javascript
// n8n workflow triggered by chat keywords
if (chat.includes('!clip')) {
  // Start recording bookmark
  await fetch('/obs/record/bookmark');

  // 30 seconds later, export clip
  setTimeout(async () => {
    await fetch('/obs/record/export-clip', {
      body: JSON.stringify({ duration: 30 })
    });
  }, 30000);
}
```

## Performance Optimization

### Reduce Latency

1. **VDO.Ninja**: Use `&codec=vp9` or `&codec=av1` for better compression
2. **OBS**: Set keyframe interval to 2 seconds
3. **Network**: Hardwire both streamer and guests
4. **Server**: Use edge locations close to participants

### Reduce CPU Usage

1. **OBS**: Use hardware encoding (NVENC, AMD VCE, QuickSync)
2. **Resolution**: Stream at 720p for panels, 1080p for single speaker
3. **Bitrate**: 3000-4500 kbps for 1080p30, 2000-3000 for 720p30
4. **Filters**: Minimize use of CPU-heavy filters

### Scale for Large Events

1. **Load Balancing**: Run multiple OBS instances
2. **CDN**: Use EVMux for multi-platform distribution
3. **Database**: Use connection pooling
4. **Caching**: Cache VDO.Ninja room data

## Security Considerations

1. **API Keys**: Never expose in frontend code
2. **Webhook URLs**: Use HTTPS in production
3. **OBS Password**: Use strong password, rotate regularly
4. **VDO.Ninja Rooms**: Use passwords for sensitive productions
5. **Database**: Sanitize all inputs to prevent SQL injection

## Support Resources

- **VDO.Ninja Discord**: https://discord.vdo.ninja
- **OBS Forums**: https://obsproject.com/forum/
- **n8n Community**: https://community.n8n.io/
- **SwanyThree Docs**: See README.md

---

**Next Steps**: Start with the simple two-guest interview workflow, then progressively add automation as you get comfortable with the system.
