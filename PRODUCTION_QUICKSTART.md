# SwanyThree Ultimate - Production Quick Start Guide

Get your first automated AI production running in 10 minutes!

## Prerequisites

✅ SwanyThree platform running (Docker containers up)
✅ PRISM Live Studio installed and running
✅ OBS WebSocket enabled in PRISM
✅ OpenAI API key configured

---

## Step 1: Enable OBS WebSocket in PRISM

1. Open **PRISM Live Studio**
2. Go to **Tools** → **WebSocket Server Settings**
3. Check **"Enable WebSocket server"**
4. Set port to `4455` (default)
5. Set a password (save this for .env)
6. Click **Apply**

Update your `.env`:
```bash
OBS_WEBSOCKET_HOST=localhost:4455
OBS_WEBSOCKET_PASSWORD=your_password_here
```

Restart backend:
```bash
docker-compose restart backend
```

---

## Step 2: Create Your First Production

1. **Login to SwanyThree**
   - Open http://localhost:5173
   - Login with: `admin@swanythree.com` / `admin123`

2. **Go to Production Control**
   - Click **"Production"** in the navigation bar
   - Click **"Create Production Room"**

3. **Save Your URLs**
   - **Director URL**: Open this in your browser (production control)
   - **Guest URLs**: Send these to your guests

The system automatically creates:
- 4 individual guest scenes
- 1 grid scene (2x2 layout)
- Browser sources for each guest
- Audio routing

---

## Step 3: Invite Guests

**Option A: Send Guest Links**
1. Copy the Guest URL from Production Control
2. Send to guests via email/chat
3. Guests click link and allow camera/mic
4. They appear in your VDO.Ninja director view

**Option B: Generate QR Codes**
1. In Production Control, click guest slot
2. Generate QR code
3. Guest scans with phone (opens VDO.Ninja)
4. Mobile camera connects instantly

---

## Step 4: Verify in PRISM

1. In PRISM, you should now see new scenes:
   - `Guest_1`
   - `Guest_2`
   - `Guest_3`
   - `Guest_4`
   - `Grid_4_Guests`

2. Click each scene to verify video feeds are working

3. Check **Audio Mixer** - each guest should have audio source:
   - `VDO_Guest_1`
   - `VDO_Guest_2`
   - etc.

---

## Step 5: Enable AI Smart Director

1. Go to **"AI Director"** in navigation
2. Enter your VDO.Ninja **Room ID** (from Production Control)
3. Enter guest slots: `1,2,3,4`
4. Click **"Start AI Director"**

**What happens now:**
- AI monitors audio levels from all guests
- When someone speaks for 3+ seconds, camera switches to them
- Switching is smooth (1 second delay between switches)
- You can manually override at any time

**Configuration:**
- **Switch Delay**: How long to wait between switches (default: 1000ms)
- **Hold Time**: How long someone must speak before switching (default: 3000ms)
- **Silence Threshold**: Audio level to consider "speaking" (default: 20)

---

## Step 6: Enable Live Transcription (Optional)

1. Go to **"Transcription"** in navigation
2. Enter a **Stream ID** (e.g., `stream_001`)
3. Select **Source Language** (e.g., English)
4. Optionally select **Translate To** (e.g., Spanish)
5. Click **"Start Transcription"**

**Add Subtitle Overlay to PRISM:**
1. Click **"Copy Overlay URL"**
2. In PRISM, add **Browser Source**
3. Paste overlay URL
4. Set size to **1920x1080**
5. Position at bottom of scene
6. Check **"Refresh browser when scene becomes active"**

Now you have **live subtitles** updating every 500ms!

---

## Step 7: Go Live!

### Preview First (Recommended)

1. In PRISM, enable **Studio Mode** (bottom panel)
2. You now have **EDIT** and **LIVE** windows
3. Click scenes in EDIT to preview
4. When ready, click **Transition** to send to LIVE

### Quick Go-Live

1. In Production Control, click **"Go Live"** quick action
2. This switches to `Grid_4_Guests` scene
3. Start streaming from PRISM

### Production Control Panel

Use the panel to:
- **Mute/unmute guests** (click mic icon)
- **Adjust guest volume** (use sliders)
- **Switch scenes** (click scene buttons)
- **Quick actions** (pre-configured buttons)

---

## Step 8: Monitor Performance

### AI Director Dashboard

Watch real-time stats:
- **Total Switches**: How many scene changes
- **Auto Switches**: AI-driven switches
- **Manual Switches**: Your overrides
- **Current Speaker**: Who's active now
- **Switch History**: Last 10 switches

### Production Tips

**Manual Override:**
- Click a guest button to force switch
- AI is disabled for 5 seconds
- Then auto-switching resumes

**Mute All Before Break:**
- Click **"Mute All"** in Production Control
- Start pre-recorded video
- Click **"Unmute All"** when resuming

---

## Common Workflows

### Two-Guest Interview

```
1. Create production room
2. Send 2 guest links
3. Enable AI Director with slots: 1,2
4. Go live on Grid_2 scene
5. AI switches to whoever speaks
```

### Panel Discussion (4 people)

```
1. Create production room
2. Send 4 guest links
3. Enable AI Director with slots: 1,2,3,4
4. Start on Grid_4_Guests scene
5. AI switches to individual scenes when someone speaks for 3+ seconds
6. Shows grid when no clear speaker
```

### Webinar with Q&A

```
1. Create production room
2. Main presenter = Guest 1
3. Attendees asking questions = Guests 2, 3, 4
4. Enable AI Director
5. Enable transcription for accessibility
6. Start on Guest_1 scene (presenter)
7. AI switches to attendees when they ask questions
```

---

## Troubleshooting

### OBS WebSocket Won't Connect

**Check:**
- Is WebSocket enabled in PRISM?
- Is password correct in `.env`?
- Is port 4455 accessible?

**Test:**
```bash
docker logs swanythree-backend | grep "OBS WebSocket"
# Should see: "✅ Connected to OBS WebSocket"
```

### VDO.Ninja Guests Not Appearing

**Check:**
- Did guests allow camera/mic permissions?
- Is the room ID correct?
- Are they using a supported browser (Chrome/Edge)?

**Test:**
- Open Director URL yourself
- You should see VDO.Ninja director interface

### AI Director Not Switching

**Check:**
- Is AI Director active? (green indicator)
- Are audio levels being reported?
- Are scene names correct in PRISM?

**Fix:**
```javascript
// In Production Control, check Room ID matches
// In AI Director, verify guest slots are correct
// Check AI Director stats for activity
```

### Transcription Not Working

**Check:**
- Is OpenAI API key valid?
- Is stream ID entered correctly?
- Is audio being captured?

**Test:**
```bash
# Check backend logs
docker logs swanythree-backend | grep "Transcription"
```

---

## Production Checklist

Before going live:

- [ ] OBS WebSocket connected (check AI Director)
- [ ] All guests connected in VDO.Ninja
- [ ] Guest audio levels visible in PRISM Audio Mixer
- [ ] All scenes working (click through them)
- [ ] AI Director enabled (if using)
- [ ] Transcription enabled (if using)
- [ ] Studio Mode enabled (for safety)
- [ ] Test transitions between scenes
- [ ] Verify internet connection stable
- [ ] Check streaming settings in PRISM
- [ ] Test microphone levels
- [ ] Preview scene looks good

---

## Advanced Tips

### Lower Third Graphics

1. Create HTML overlay in browser source
2. Add to each guest scene
3. Trigger with n8n workflow when speaker changes

### Dynamic Layouts

Use n8n workflow to:
- Monitor active guest count
- Switch from Grid to individual scenes
- Animate transitions

### Auto-Highlight Clips

1. Set up chat keyword monitoring
2. When someone says "!clip"
3. n8n workflow bookmarks timestamp
4. Auto-exports 30-second clip

### Multi-Platform Streaming

1. Configure multiple RTMP outputs in PRISM
2. Stream to YouTube, Twitch, Facebook simultaneously
3. Monitor with EVMux

---

## Next Steps

- Read [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) for advanced features
- Explore [n8n-workflows/](n8n-workflows/) for automation examples
- Join community for tips and tricks

---

**You're Ready to Go!** 🎉

Your first AI-powered production is set up. Start simple with a two-guest interview, then progressively add automation as you get comfortable with the system.

---

## Quick Reference

| Feature | URL/Location |
|---------|--------------|
| Dashboard | http://localhost:5173 |
| Production Control | http://localhost:5173/production |
| AI Director | http://localhost:5173/smart-director |
| Transcription | http://localhost:5173/transcription |
| Analytics | http://localhost:5173/analytics |
| API Docs | [README.md](README.md#api-endpoints) |
| Integration Guide | [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) |
| n8n Workflows | [n8n-workflows/](n8n-workflows/) |

---

**Support:** Check GitHub issues or integration guide troubleshooting section.
