# API Documentation

Complete API reference for the Unified Platform.

## Base URL

```
Development: http://localhost:4000/api
Production: https://your-domain.com/api
```

## Authentication

All endpoints (except `/auth/login` and `/auth/register`) require authentication.

### Headers

```
Authorization: Bearer <token>
```

Or for development:

```
x-user-id: <user-id>
```

---

## Authentication

### POST /auth/register

Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /auth/login

Login to existing account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "username": "johndoe",
    "role": "USER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### GET /auth/me

Get current user profile.

**Response:**
```json
{
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "subscription": {
    "plan": "FREE",
    "status": "ACTIVE",
    "monthlyMinutes": 60,
    "usedMinutes": 15
  }
}
```

---

## Streams

### GET /streams

List all streams for the authenticated user.

**Response:**
```json
[
  {
    "id": "stream-123",
    "title": "My Live Stream",
    "description": "Testing the platform",
    "status": "LIVE",
    "totalViewers": 42,
    "peakViewers": 58,
    "startedAt": "2024-01-01T12:00:00.000Z",
    "destinations": [
      {
        "platform": "YOUTUBE",
        "status": "LIVE",
        "viewerCount": 25
      }
    ]
  }
]
```

### GET /streams/:id

Get detailed stream information.

**Response:**
```json
{
  "id": "stream-123",
  "title": "My Live Stream",
  "status": "LIVE",
  "vdoGuestUrl": "https://vdo.ninja/?room=stream_123...",
  "destinations": [...],
  "events": [...]
}
```

### POST /streams/start

Start a new live stream.

**Request:**
```json
{
  "title": "My Live Event",
  "description": "Multi-platform stream",
  "platforms": [
    { "id": "youtube", "enabled": true },
    { "id": "twitch", "enabled": true }
  ],
  "enableVDO": true,
  "enableEvMux": true,
  "aiEnabled": false
}
```

**Response:**
```json
{
  "id": "stream-123",
  "status": "starting",
  "vdoRoom": {
    "directorUrl": "https://vdo.ninja/?director=...",
    "guestUrl": "https://vdo.ninja/?push=..."
  },
  "platforms": [...]
}
```

### POST /streams/:id/stop

Stop an active stream.

**Response:**
```json
{
  "success": true
}
```

### GET /streams/:id/analytics

Get stream analytics and statistics.

**Response:**
```json
{
  "totalViewers": 142,
  "peakViewers": 58,
  "totalMinutes": 120,
  "platformBreakdown": [
    {
      "platform": "YOUTUBE",
      "viewers": 85,
      "status": "LIVE"
    }
  ],
  "events": 342,
  "eventTypes": {
    "viewer_join": 142,
    "viewer_leave": 98,
    "comment": 102
  }
}
```

---

## Platforms

### GET /platforms

List all connected platforms.

**Response:**
```json
[
  {
    "platform": "YOUTUBE",
    "platformUsername": "mychannel",
    "isConnected": true,
    "isEnabled": true,
    "lastStreamAt": "2024-01-01T12:00:00.000Z"
  }
]
```

### POST /platforms/connect

Connect a new platform.

**Request:**
```json
{
  "platformId": "youtube",
  "streamKey": "xxxx-xxxx-xxxx-xxxx",
  "platformUsername": "mychannel"
}
```

**Response:**
```json
{
  "success": true
}
```

### POST /platforms/:platformId/disconnect

Disconnect a platform.

**Response:**
```json
{
  "success": true
}
```

### PATCH /platforms/:platformId/toggle

Enable or disable a platform.

**Request:**
```json
{
  "enabled": false
}
```

**Response:**
```json
{
  "success": true
}
```

---

## AI Content

### POST /content/avatar-video

Generate an avatar video with HeyGen.

**Request:**
```json
{
  "avatarId": "avatar_abc123",
  "voiceId": "voice_xyz789",
  "script": "Hello world! This is my AI avatar.",
  "resolution": "1080p"
}
```

**Response:**
```json
{
  "videoId": "video-123",
  "jobId": "heygen_job_456",
  "status": "processing"
}
```

### POST /content/translate-video

Translate a video to another language with Akool.

**Request:**
```json
{
  "videoUrl": "https://example.com/video.mp4",
  "targetLanguage": "es",
  "voiceClone": true
}
```

**Response:**
```json
{
  "videoId": "video-124",
  "jobId": "akool_job_789",
  "status": "processing"
}
```

### POST /content/image-to-video

Convert an image to a video with Akool.

**Request:**
```json
{
  "imageUrl": "https://example.com/image.jpg",
  "prompt": "Make the person wave and smile",
  "resolution": "1080p"
}
```

**Response:**
```json
{
  "videoId": "video-125",
  "jobId": "akool_job_101",
  "status": "processing"
}
```

### POST /content/clone-voice

Clone a voice with ElevenLabs.

**Request:**
```json
{
  "name": "My Voice Clone",
  "audioFiles": [
    "https://example.com/sample1.mp3",
    "https://example.com/sample2.mp3"
  ],
  "description": "Professional voice for videos"
}
```

**Response:**
```json
{
  "id": "voice-456",
  "voiceId": "elevenlabs_voice_abc",
  "status": "completed"
}
```

### GET /content/videos

List all generated videos.

**Response:**
```json
[
  {
    "id": "video-123",
    "type": "AVATAR",
    "status": "COMPLETED",
    "videoUrl": "https://cdn.example.com/video-123.mp4",
    "thumbnailUrl": "https://cdn.example.com/thumb-123.jpg",
    "duration": 120,
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
]
```

### GET /content/voices

List all voice clones.

**Response:**
```json
[
  {
    "id": "voice-456",
    "name": "My Voice Clone",
    "voiceId": "elevenlabs_voice_abc",
    "status": "COMPLETED",
    "previewUrl": "https://cdn.example.com/preview.mp3"
  }
]
```

---

## Analytics

### GET /analytics/overview

Get analytics overview.

**Response:**
```json
{
  "overview": {
    "totalStreams": 25,
    "activeStreams": 1,
    "totalViewers": 1247,
    "totalMinutes": 3600,
    "totalVideos": 42,
    "completedVideos": 38,
    "totalVoices": 5
  },
  "platformStats": [...]
}
```

### GET /analytics/streams/period

Get stream analytics for a time period.

**Query Parameters:**
- `period`: "7d" | "30d" | "1d"

**Response:**
```json
{
  "period": "7d",
  "data": [
    {
      "date": "2024-01-01",
      "streams": 3,
      "viewers": 142,
      "minutes": 360
    }
  ]
}
```

### GET /analytics/platforms/performance

Get platform performance metrics.

**Response:**
```json
[
  {
    "platform": "YOUTUBE",
    "totalStreams": 15,
    "totalViewers": 842,
    "avgViewers": 56,
    "successRate": 95,
    "totalMinutes": 1800
  }
]
```

---

## API Keys

### GET /api-keys

List all API keys.

**Response:**
```json
[
  {
    "id": "key-123",
    "service": "heygen",
    "keyName": "Production Key",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastUsedAt": "2024-01-02T12:00:00.000Z"
  }
]
```

### POST /api-keys

Add a new API key.

**Request:**
```json
{
  "service": "heygen",
  "keyName": "Production Key",
  "apiKey": "your-secret-key"
}
```

**Response:**
```json
{
  "id": "key-123",
  "service": "heygen",
  "keyName": "Production Key",
  "isActive": true
}
```

### DELETE /api-keys/:id

Delete an API key.

**Response:**
```json
{
  "success": true
}
```

---

## Webhooks

Webhook endpoints for AI service callbacks.

### POST /webhooks/heygen

HeyGen video generation webhook.

### POST /webhooks/elevenlabs

ElevenLabs voice cloning webhook.

### POST /webhooks/akool

Akool AI service webhook.

### POST /webhooks/evmux

EvMux streaming webhook.

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "details": [...]
}
```

### Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error
- `503` - Service Unavailable

---

## Rate Limiting

- **General API**: 100 requests per 15 minutes
- **Webhooks**: No rate limit

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import axios from 'axios';

const client = axios.create({
  baseURL: 'https://api.example.com/api',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Start a stream
const stream = await client.post('/streams/start', {
  title: 'My Stream',
  platforms: [
    { id: 'youtube', enabled: true }
  ]
});

// Generate avatar video
const video = await client.post('/content/avatar-video', {
  avatarId: 'avatar_123',
  voiceId: 'voice_456',
  script: 'Hello world!'
});
```

### Python

```python
import requests

headers = {
    'Authorization': f'Bearer {token}'
}

# Start a stream
response = requests.post(
    'https://api.example.com/api/streams/start',
    headers=headers,
    json={
        'title': 'My Stream',
        'platforms': [
            {'id': 'youtube', 'enabled': True}
        ]
    }
)

stream = response.json()
```

---

## Support

- Documentation: https://docs.example.com
- Issues: https://github.com/yourusername/unified-platform/issues
- Email: support@example.com
