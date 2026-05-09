import React, { useState, useEffect } from 'react';
import { Languages, Download, Play, Square, Settings as SettingsIcon } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function TranscriptionPanel({ token }) {
  const [streamId, setStreamId] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [currentCaption, setCurrentCaption] = useState(null);
  const [stats, setStats] = useState(null);
  const [config, setConfig] = useState({
    language: 'en',
    targetLanguage: ''
  });

  // Start transcription
  const startTranscription = async () => {
    try {
      const res = await fetch(`${API_URL}/transcription/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          streamId,
          language: config.language,
          targetLanguage: config.targetLanguage || null
        })
      });

      const data = await res.json();
      if (data.success) {
        setIsActive(true);
        pollCaptions();
      }
    } catch (error) {
      console.error('Failed to start transcription:', error);
    }
  };

  // Stop transcription
  const stopTranscription = async () => {
    try {
      await fetch(`${API_URL}/transcription/${streamId}/stop`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setIsActive(false);
    } catch (error) {
      console.error('Failed to stop transcription:', error);
    }
  };

  // Poll for current captions
  const pollCaptions = () => {
    const interval = setInterval(async () => {
      if (!isActive) {
        clearInterval(interval);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/transcription/${streamId}/current`);
        const data = await res.json();
        setCurrentCaption(data);
      } catch (error) {
        console.error('Failed to fetch captions:', error);
      }
    }, 500);

    return () => clearInterval(interval);
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/transcription/${streamId}/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  // Download SRT
  const downloadSRT = async () => {
    try {
      const res = await fetch(`${API_URL}/transcription/${streamId}/export/srt`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transcript_${streamId}.srt`;
      a.click();
    } catch (error) {
      console.error('Failed to download SRT:', error);
    }
  };

  // Get overlay URL
  const getOverlayURL = () => {
    return `${API_URL}/transcription/${streamId}/overlay`;
  };

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(fetchStats, 5000);
      return () => {
        clearInterval(interval);
        pollCaptions();
      };
    }
  }, [isActive]);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 flex items-center gap-3">
          <Languages className="w-10 h-10 text-cyan-400" />
          Live Transcription & Translation
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Panel */}
          <div className="lg:col-span-2 space-y-6">
            {!isActive ? (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Start Live Transcription</h2>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-white/80 mb-2">Stream ID</label>
                    <input
                      type="text"
                      value={streamId}
                      onChange={(e) => setStreamId(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500"
                      placeholder="Enter stream ID"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/80 mb-2">Source Language</label>
                      <select
                        value={config.language}
                        onChange={(e) => setConfig({ ...config, language: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="it">Italian</option>
                        <option value="pt">Portuguese</option>
                        <option value="ja">Japanese</option>
                        <option value="ko">Korean</option>
                        <option value="zh">Chinese</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-white/80 mb-2">Translate To (Optional)</label>
                      <select
                        value={config.targetLanguage}
                        onChange={(e) => setConfig({ ...config, targetLanguage: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option value="">No Translation</option>
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="it">Italian</option>
                        <option value="pt">Portuguese</option>
                        <option value="ja">Japanese</option>
                        <option value="ko">Korean</option>
                        <option value="zh">Chinese</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  onClick={startTranscription}
                  disabled={!streamId}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-4 rounded-lg font-bold text-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Play className="w-6 h-6" />
                  Start Transcription
                </button>
              </div>
            ) : (
              <>
                {/* Active Transcription */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <Languages className="w-6 h-6 text-cyan-400 animate-pulse" />
                      Transcription Active
                    </h2>
                    <button
                      onClick={stopTranscription}
                      className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
                    >
                      <Square className="w-4 h-4" />
                      Stop
                    </button>
                  </div>

                  {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <StatCard label="Segments" value={stats.totalSegments} />
                      <StatCard label="Duration" value={`${Math.round(stats.totalDuration / 1000)}s`} />
                      <StatCard label="Accuracy" value={`${(stats.averageConfidence * 100).toFixed(0)}%`} />
                      <StatCard label="Language" value={stats.language.toUpperCase()} />
                    </div>
                  )}
                </div>

                {/* Live Caption Display */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                  <h3 className="text-xl font-bold text-white mb-4">Live Captions</h3>
                  {currentCaption ? (
                    <div className="space-y-4">
                      <div className="bg-black/50 rounded-lg p-6 min-h-[100px]">
                        <p className="text-white text-xl leading-relaxed">
                          {currentCaption.current || 'Listening...'}
                        </p>
                      </div>

                      {currentCaption.translated && (
                        <div className="bg-cyan-500/20 border border-cyan-500/50 rounded-lg p-6">
                          <div className="text-cyan-400 text-sm mb-2">Translation</div>
                          <p className="text-white text-lg leading-relaxed">
                            {currentCaption.translated}
                          </p>
                        </div>
                      )}

                      {currentCaption.history && currentCaption.history.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-white/60 text-sm">Recent</div>
                          {currentCaption.history.slice(-3).map((item, idx) => (
                            <div key={idx} className="bg-white/5 rounded px-4 py-2 text-white/60 text-sm">
                              {item.text}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-black/50 rounded-lg p-6 min-h-[100px] flex items-center justify-center">
                      <p className="text-white/40">Waiting for speech...</p>
                    </div>
                  )}
                </div>

                {/* Export Options */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Export & Overlay</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      onClick={downloadSRT}
                      className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Download SRT
                    </button>

                    <button
                      onClick={() => {
                        const url = getOverlayURL();
                        navigator.clipboard.writeText(url);
                        alert('Overlay URL copied to clipboard!');
                      }}
                      className="bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-lg font-semibold transition-all"
                    >
                      Copy Overlay URL
                    </button>
                  </div>

                  <div className="mt-4 p-4 bg-cyan-500/20 border border-cyan-500/50 rounded-lg">
                    <p className="text-cyan-300 text-sm">
                      <strong>PRISM Setup:</strong> Add Browser Source → Paste overlay URL → Set size to 1920x1080
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <SettingsIcon className="w-6 h-6" />
                Features
              </h3>

              <ul className="space-y-3 text-sm text-white/80">
                <FeatureItem icon="🎤" text="Real-time speech-to-text" />
                <FeatureItem icon="🌐" text="Multi-language support" />
                <FeatureItem icon="🔄" text="Auto translation (GPT-4)" />
                <FeatureItem icon="📺" text="Browser overlay for PRISM" />
                <FeatureItem icon="💾" text="SRT export for VOD" />
                <FeatureItem icon="⚡" text="500ms update rate" />
              </ul>
            </div>

            <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/50 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-3">💡 Pro Tips</h3>
              <ul className="space-y-2 text-sm text-white/80">
                <li>• Use clear audio for best results</li>
                <li>• Translation adds ~2s latency</li>
                <li>• Overlay updates every 500ms</li>
                <li>• Export SRT after stream ends</li>
              </ul>
            </div>

            {isActive && (
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-2">✅ Active</h3>
                <p className="text-white/80 text-sm">
                  Stream ID: <span className="font-mono">{streamId}</span>
                </p>
                <p className="text-white/80 text-sm mt-1">
                  Language: <span className="font-mono">{config.language}</span>
                  {config.targetLanguage && (
                    <> → <span className="font-mono">{config.targetLanguage}</span></>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ label, value }) => (
  <div className="bg-white/5 rounded-lg p-4">
    <div className="text-white/60 text-sm mb-1">{label}</div>
    <div className="text-white text-2xl font-bold">{value}</div>
  </div>
);

const FeatureItem = ({ icon, text }) => (
  <li className="flex items-center gap-3">
    <span className="text-xl">{icon}</span>
    <span>{text}</span>
  </li>
);
