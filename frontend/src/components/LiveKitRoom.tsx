'use client';

import {
  LiveKitRoom as LKRoom,
  VideoConference,
  RoomAudioRenderer,
  ControlBar,
  GridLayout,
  ParticipantTile,
  useTracks,
  TrackLoop
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';
import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface LiveKitRoomProps {
  streamId: string;
  role: 'host' | 'viewer' | 'guest';
  guestName?: string;
  onDisconnect?: () => void;
}

export function LiveKitRoom({ streamId, role, guestName, onDisconnect }: LiveKitRoomProps) {
  const [token, setToken]     = useState<string | null>(null);
  const [wsUrl, setWsUrl]     = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    async function fetchToken() {
      try {
        let endpoint = '';
        let payload: any = { streamId };

        if (role === 'host') {
          endpoint = '/api/livekit/token/host';
        } else if (role === 'guest') {
          endpoint = '/api/livekit/token/guest';
          payload.guestName = guestName || 'Guest';
        } else {
          endpoint = '/api/livekit/token/viewer';
          payload.viewerId = `viewer_${Date.now()}`;
        }

        const response = await axios.post(`${API_URL}${endpoint}`, payload, {
          headers: { 'x-user-id': localStorage.getItem('userId') || 'demo-user' }
        });

        setToken(response.data.token);
        setWsUrl(response.data.url);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to get token');
      } finally {
        setLoading(false);
      }
    }

    fetchToken();
  }, [streamId, role, guestName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-900 rounded-lg">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-900 rounded-lg">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!token || !wsUrl) return null;

  return (
    <div className="rounded-xl overflow-hidden bg-gray-900" style={{ height: '520px' }}>
      <LKRoom
        serverUrl={wsUrl}
        token={token}
        onDisconnected={onDisconnect}
        options={{
          adaptiveStream: true,
          dynacast: true,
          videoCaptureDefaults: {
            resolution: { width: 1280, height: 720 }
          }
        }}
      >
        <RoomAudioRenderer />

        {role === 'viewer' ? (
          // Viewer: watch-only layout
          <ViewerLayout />
        ) : (
          // Host / Guest: full conference layout
          <VideoConference />
        )}
      </LKRoom>
    </div>
  );
}

// ── Viewer-only layout (no controls) ────────────────────────
function ViewerLayout() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera,      withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false }
    ],
    { onlySubscribed: true }
  );

  return (
    <div className="h-full relative">
      <GridLayout tracks={tracks} style={{ height: '100%' }}>
        <TrackLoop tracks={tracks}>
          <ParticipantTile />
        </TrackLoop>
      </GridLayout>

      {/* View-only badge */}
      <div className="absolute bottom-3 right-3 px-3 py-1 bg-black bg-opacity-60 rounded-full text-white text-xs">
        Watching live
      </div>
    </div>
  );
}
