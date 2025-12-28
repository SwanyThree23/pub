import React, { useState, useEffect } from 'react';
import { Radio, Copy, CheckCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function StreamControl({ token, user }) {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPRISM, setShowPRISM] = useState(false);
  const [prismConfig, setPrismConfig] = useState(null);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    fetchStreams();
  }, []);

  const fetchStreams = async () => {
    try {
      const res = await fetch(`${API_URL}/streams`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setStreams(data);
    } catch (error) {
      console.error('Failed to fetch streams:', error);
    }
  };

  const createStream = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/streams/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: `Stream ${Date.now()}` })
      });
      const data = await res.json();
      setStreams([data, ...streams]);
    } catch (error) {
      console.error('Failed to create stream:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupPRISM = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/prism/quick-setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setPrismConfig(data);
      setShowPRISM(true);
    } catch (error) {
      console.error('Failed to setup PRISM:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 flex items-center gap-3">
          <Radio className="w-10 h-10 text-purple-400" />
          Stream Control Center
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <button
            onClick={createStream}
            disabled={loading}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-6 rounded-2xl font-bold text-xl hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? 'Creating...' : '+ Create New Stream'}
          </button>

          <button
            onClick={setupPRISM}
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-6 rounded-2xl font-bold text-xl hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? 'Setting up...' : '📱 Quick PRISM Mobile Setup'}
          </button>
        </div>

        {showPRISM && prismConfig && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">PRISM Mobile Configuration</h2>

            <div className="space-y-4">
              <ConfigItem
                label="RTMP Server"
                value={prismConfig.sources.rtmp.config.url}
                onCopy={() => copyToClipboard(prismConfig.sources.rtmp.config.url, 'server')}
                copied={copied === 'server'}
              />

              <ConfigItem
                label="Stream Key"
                value={prismConfig.sources.rtmp.config.streamKey}
                onCopy={() => copyToClipboard(prismConfig.sources.rtmp.config.streamKey, 'key')}
                copied={copied === 'key'}
              />

              <ConfigItem
                label="Mobile Deep Link"
                value={prismConfig.mobileStream.deepLink}
                onCopy={() => copyToClipboard(prismConfig.mobileStream.deepLink, 'link')}
                copied={copied === 'link'}
              />
            </div>

            <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
              <p className="text-blue-300 text-sm">
                📱 Open PRISM Live Studio on your mobile device and scan the QR code or manually enter the RTMP details above.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {streams.map(stream => (
            <StreamCard key={stream.id} stream={stream} token={token} />
          ))}

          {streams.length === 0 && (
            <div className="text-center text-white/40 py-12 bg-white/5 rounded-2xl">
              No streams yet. Create your first stream to get started!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const ConfigItem = ({ label, value, onCopy, copied }) => (
  <div>
    <div className="text-sm text-white/60 mb-2">{label}</div>
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        readOnly
        className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white font-mono text-sm"
      />
      <button
        onClick={onCopy}
        className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2"
      >
        {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  </div>
);

const StreamCard = ({ stream, token }) => {
  const [status, setStatus] = useState(stream.status);

  const startStream = async () => {
    try {
      await fetch(`${API_URL}/streams/${stream.evmux_id}/start`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setStatus('live');
    } catch (error) {
      console.error('Failed to start stream:', error);
    }
  };

  const stopStream = async () => {
    try {
      await fetch(`${API_URL}/streams/${stream.evmux_id}/stop`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setStatus('ended');
    } catch (error) {
      console.error('Failed to stop stream:', error);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">{stream.name}</h3>
          <div className="text-white/60 text-sm mt-1">ID: {stream.evmux_id}</div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            status === 'live' ? 'bg-green-500/20 text-green-300' :
            status === 'created' ? 'bg-blue-500/20 text-blue-300' :
            'bg-gray-500/20 text-gray-300'
          }`}>
            {status === 'live' ? '🔴 Live' : status === 'created' ? '⏸️ Ready' : '⏹️ Ended'}
          </span>

          {status === 'created' && (
            <button
              onClick={startStream}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition-all"
            >
              Start Stream
            </button>
          )}

          {status === 'live' && (
            <button
              onClick={stopStream}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition-all"
            >
              Stop Stream
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
