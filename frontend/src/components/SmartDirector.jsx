import React, { useState, useEffect } from 'react';
import { Brain, Activity, TrendingUp, Settings as SettingsIcon } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function SmartDirector({ token }) {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [stats, setStats] = useState(null);
  const [config, setConfig] = useState({
    switchDelay: 1000,
    holdTime: 3000,
    silenceThreshold: 20,
    confidenceThreshold: 0.7
  });
  const [roomId, setRoomId] = useState('');
  const [guestSlots, setGuestSlots] = useState('1,2,3,4');

  // Start AI auto-switching
  const startAutoSwitching = async () => {
    try {
      const slots = guestSlots.split(',').map(s => parseInt(s.trim()));

      const res = await fetch(`${API_URL}/smart-director/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roomId,
          guestSlots: slots,
          config
        })
      });

      const data = await res.json();
      setActiveSession(data.session);

      // Start polling for stats
      pollStats();
    } catch (error) {
      console.error('Failed to start Smart Director:', error);
    }
  };

  // Stop AI auto-switching
  const stopAutoSwitching = async () => {
    try {
      await fetch(`${API_URL}/smart-director/stop`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ roomId })
      });

      setActiveSession(null);
    } catch (error) {
      console.error('Failed to stop Smart Director:', error);
    }
  };

  // Manual switch (override AI)
  const manualSwitch = async (guestSlot) => {
    try {
      await fetch(`${API_URL}/smart-director/manual-switch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ roomId, guestSlot })
      });
    } catch (error) {
      console.error('Failed to manual switch:', error);
    }
  };

  // Poll for statistics
  const pollStats = () => {
    const interval = setInterval(async () => {
      if (!activeSession) {
        clearInterval(interval);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/smart-director/stats/${roomId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    }, 2000);

    return () => clearInterval(interval);
  };

  // Update configuration
  const updateConfig = async (newConfig) => {
    try {
      await fetch(`${API_URL}/smart-director/config/${roomId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newConfig)
      });
      setConfig({ ...config, ...newConfig });
    } catch (error) {
      console.error('Failed to update config:', error);
    }
  };

  useEffect(() => {
    if (activeSession) {
      return pollStats();
    }
  }, [activeSession]);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 flex items-center gap-3">
          <Brain className="w-10 h-10 text-purple-400" />
          AI Smart Director
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Control Panel */}
          <div className="lg:col-span-2 space-y-6">
            {!activeSession ? (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Start AI Scene Switching</h2>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-white/80 mb-2">VDO.Ninja Room ID</label>
                    <input
                      type="text"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500"
                      placeholder="Enter room ID"
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 mb-2">Guest Slots (comma-separated)</label>
                    <input
                      type="text"
                      value={guestSlots}
                      onChange={(e) => setGuestSlots(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500"
                      placeholder="1,2,3,4"
                    />
                  </div>
                </div>

                <button
                  onClick={startAutoSwitching}
                  disabled={!roomId}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-lg font-bold text-lg hover:opacity-90 transition-all disabled:opacity-50"
                >
                  Start AI Director
                </button>
              </div>
            ) : (
              <>
                {/* Active Session */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <Activity className="w-6 h-6 text-green-400 animate-pulse" />
                      AI Director Active
                    </h2>
                    <button
                      onClick={stopAutoSwitching}
                      className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition-all"
                    >
                      Stop Director
                    </button>
                  </div>

                  {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <StatCard label="Total Switches" value={stats.totalSwitches} />
                      <StatCard label="Auto Switches" value={stats.autoSwitches} color="green" />
                      <StatCard label="Manual Switches" value={stats.manualSwitches} color="blue" />
                      <StatCard label="Current Speaker" value={`Guest ${stats.currentSpeaker || '-'}`} color="purple" />
                    </div>
                  )}
                </div>

                {/* Manual Override */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Manual Override</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {guestSlots.split(',').map(slot => {
                      const slotNum = parseInt(slot.trim());
                      return (
                        <button
                          key={slotNum}
                          onClick={() => manualSwitch(slotNum)}
                          className={`py-4 px-6 rounded-lg font-semibold transition-all ${
                            stats?.currentSpeaker === slotNum
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                              : 'bg-white/10 text-white/80 hover:bg-white/20'
                          }`}
                        >
                          Guest {slotNum}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-white/60 text-sm mt-3">
                    Manual switching temporarily disables AI for 5 seconds
                  </p>
                </div>

                {/* Switch History */}
                {stats?.history && stats.history.length > 0 && (
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Recent Switches</h3>
                    <div className="space-y-2">
                      {stats.history.map((event, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              event.auto ? 'bg-green-500/20 text-green-300' : 'bg-blue-500/20 text-blue-300'
                            }`}>
                              {event.auto ? 'AUTO' : 'MANUAL'}
                            </span>
                            <span className="text-white/80">
                              Guest {event.from} → Guest {event.to}
                            </span>
                          </div>
                          <span className="text-white/40 text-sm">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Configuration Panel */}
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <SettingsIcon className="w-6 h-6" />
                AI Configuration
              </h3>

              <div className="space-y-4">
                <ConfigSlider
                  label="Switch Delay"
                  value={config.switchDelay}
                  onChange={(v) => updateConfig({ switchDelay: v })}
                  min={500}
                  max={3000}
                  step={100}
                  unit="ms"
                  description="Minimum time between scene switches"
                />

                <ConfigSlider
                  label="Hold Time"
                  value={config.holdTime}
                  onChange={(v) => updateConfig({ holdTime: v })}
                  min={1000}
                  max={10000}
                  step={500}
                  unit="ms"
                  description="How long to hold on speaker before switching"
                />

                <ConfigSlider
                  label="Silence Threshold"
                  value={config.silenceThreshold}
                  onChange={(v) => updateConfig({ silenceThreshold: v })}
                  min={0}
                  max={100}
                  step={5}
                  unit=""
                  description="Audio level threshold for 'speaking'"
                />

                <ConfigSlider
                  label="Confidence Threshold"
                  value={config.confidenceThreshold}
                  onChange={(v) => updateConfig({ confidenceThreshold: v })}
                  min={0}
                  max={1}
                  step={0.1}
                  unit=""
                  description="AI confidence required for auto-switch"
                />
              </div>
            </div>

            {/* Performance Tips */}
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-3">💡 Pro Tips</h3>
              <ul className="space-y-2 text-sm text-white/80">
                <li>• Higher hold time = fewer switches</li>
                <li>• Lower silence threshold = more sensitive</li>
                <li>• Use manual override for intros/outros</li>
                <li>• Monitor switch history for optimization</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ label, value, color = 'purple' }) => {
  const colors = {
    purple: 'from-purple-500 to-pink-500',
    green: 'from-green-500 to-emerald-500',
    blue: 'from-blue-500 to-cyan-500'
  };

  return (
    <div className={`bg-gradient-to-r ${colors[color]} bg-opacity-20 rounded-lg p-4`}>
      <div className="text-white/60 text-sm mb-1">{label}</div>
      <div className="text-white text-2xl font-bold">{value}</div>
    </div>
  );
};

const ConfigSlider = ({ label, value, onChange, min, max, step, unit, description }) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <label className="text-white/80 text-sm font-semibold">{label}</label>
      <span className="text-white font-bold">{value}{unit}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full"
    />
    <p className="text-white/40 text-xs mt-1">{description}</p>
  </div>
);
