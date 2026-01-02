import React, { useState, useEffect } from 'react';
import { Radio, Users, Mic, MicOff, Volume2, Settings, Tv } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function ProductionControl({ token }) {
  const [room, setRoom] = useState(null);
  const [guests, setGuests] = useState([]);
  const [scenes, setScenes] = useState([]);
  const [currentScene, setCurrentScene] = useState('');
  const [loading, setLoading] = useState(false);

  // Create VDO.Ninja room
  const createRoom = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/vdo/room/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: 'Production Room', enableAPI: true })
      });
      const data = await res.json();
      setRoom(data);

      // Create default scenes
      await createDefaultScenes(data.id);

      // Get OBS scenes
      await fetchOBSScenes();
    } catch (error) {
      console.error('Failed to create room:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create default OBS scenes
  const createDefaultScenes = async (roomId) => {
    for (let i = 1; i <= 4; i++) {
      await fetch(`${API_URL}/obs/scenes/guest`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ guestSlot: i, roomId })
      });
    }

    // Create grid scene
    await fetch(`${API_URL}/obs/scenes/grid`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ guestSlots: [1, 2, 3, 4], roomId })
    });
  };

  // Fetch OBS scenes
  const fetchOBSScenes = async () => {
    try {
      const res = await fetch(`${API_URL}/obs/scenes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setScenes(data.scenes || []);

      // Get current scene
      const currentRes = await fetch(`${API_URL}/obs/scene/current`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const currentData = await currentRes.json();
      setCurrentScene(currentData.scene);
    } catch (error) {
      console.error('Failed to fetch scenes:', error);
    }
  };

  // Switch scene
  const switchScene = async (sceneName) => {
    try {
      await fetch(`${API_URL}/obs/scene/current`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sceneName })
      });
      setCurrentScene(sceneName);
    } catch (error) {
      console.error('Failed to switch scene:', error);
    }
  };

  // Mute guest
  const muteGuest = async (guestSlot, muted) => {
    try {
      const endpoint = muted
        ? `/vdo/room/${room.id}/guest/${guestSlot}/mute`
        : `/vdo/room/${room.id}/guest/${guestSlot}/unmute`;

      await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Update guests state
      setGuests(guests.map(g =>
        g.slot === guestSlot ? { ...g, muted } : g
      ));
    } catch (error) {
      console.error('Failed to mute guest:', error);
    }
  };

  // Set guest volume
  const setGuestVolume = async (guestSlot, volume) => {
    try {
      await fetch(`${API_URL}/vdo/room/${room.id}/guest/${guestSlot}/volume`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ volume })
      });
    } catch (error) {
      console.error('Failed to set volume:', error);
    }
  };

  // Initialize with 4 guest slots
  useEffect(() => {
    setGuests([
      { slot: 1, name: 'Guest 1', muted: false, volume: 100 },
      { slot: 2, name: 'Guest 2', muted: false, volume: 100 },
      { slot: 3, name: 'Guest 3', muted: false, volume: 100 },
      { slot: 4, name: 'Guest 4', muted: false, volume: 100 }
    ]);
  }, []);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 flex items-center gap-3">
          <Tv className="w-10 h-10 text-blue-400" />
          Production Control Center
        </h1>

        {!room ? (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
            <Radio className="w-20 h-20 text-purple-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">Start Your Production</h2>
            <p className="text-white/60 mb-8 max-w-md mx-auto">
              Create a VDO.Ninja room with automatic OBS scene setup. Perfect for interviews, panels, and live shows.
            </p>
            <button
              onClick={createRoom}
              disabled={loading}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? 'Setting Up...' : 'Create Production Room'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Room Info */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Room Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem label="Room ID" value={room.id} />
                <InfoItem label="API Key" value={room.apiKey} secret />
                <URLItem label="Director URL" url={room.directorUrl} />
                <URLItem label="Guest URL" url={room.guestUrl} />
              </div>
            </div>

            {/* Scene Switcher */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Settings className="w-6 h-6" />
                Scene Control
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {scenes.map(scene => (
                  <button
                    key={scene}
                    onClick={() => switchScene(scene)}
                    className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                      currentScene === scene
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    {scene.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Guest Control */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-6 h-6" />
                Guest Audio Control
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {guests.map(guest => (
                  <GuestControl
                    key={guest.slot}
                    guest={guest}
                    onMute={(muted) => muteGuest(guest.slot, muted)}
                    onVolumeChange={(volume) => setGuestVolume(guest.slot, volume)}
                  />
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <QuickAction icon="🎬" label="Go Live" onClick={() => switchScene('Grid_4_Guests')} />
                <QuickAction icon="🔇" label="Mute All" onClick={() => guests.forEach(g => muteGuest(g.slot, true))} />
                <QuickAction icon="🔊" label="Unmute All" onClick={() => guests.forEach(g => muteGuest(g.slot, false))} />
                <QuickAction icon="📊" label="View Analytics" onClick={() => window.location.href = '/analytics'} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const InfoItem = ({ label, value, secret = false }) => (
  <div>
    <div className="text-sm text-white/60 mb-1">{label}</div>
    <div className="text-white font-mono text-sm bg-white/5 px-3 py-2 rounded">
      {secret ? '••••••••••••••••' : value}
    </div>
  </div>
);

const URLItem = ({ label, url }) => {
  const [copied, setCopied] = useState(false);

  const copyURL = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="col-span-full">
      <div className="text-sm text-white/60 mb-1">{label}</div>
      <div className="flex gap-2">
        <div className="flex-1 text-white font-mono text-sm bg-white/5 px-3 py-2 rounded overflow-x-auto">
          {url}
        </div>
        <button
          onClick={copyURL}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded transition-all"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
};

const GuestControl = ({ guest, onMute, onVolumeChange }) => (
  <div className="bg-white/5 rounded-lg p-4">
    <div className="flex items-center justify-between mb-3">
      <span className="text-white font-semibold">{guest.name}</span>
      <button
        onClick={() => onMute(!guest.muted)}
        className={`p-2 rounded-lg transition-all ${
          guest.muted
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-green-500 hover:bg-green-600'
        }`}
      >
        {guest.muted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
      </button>
    </div>
    <div className="flex items-center gap-3">
      <Volume2 className="w-4 h-4 text-white/60" />
      <input
        type="range"
        min="0"
        max="100"
        value={guest.volume}
        onChange={(e) => onVolumeChange(parseInt(e.target.value))}
        className="flex-1"
      />
      <span className="text-white/80 text-sm w-12">{guest.volume}%</span>
    </div>
  </div>
);

const QuickAction = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="bg-white/10 hover:bg-white/20 text-white py-4 rounded-lg transition-all flex flex-col items-center gap-2"
  >
    <span className="text-2xl">{icon}</span>
    <span className="text-sm font-semibold">{label}</span>
  </button>
);
