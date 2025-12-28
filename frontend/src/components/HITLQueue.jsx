import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function HITLQueue({ token }) {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchQueue = async () => {
    try {
      const res = await fetch(`${API_URL}/hitl/queue`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setQueue(data);
    } catch (error) {
      console.error('Failed to fetch queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (reviewId, decision) => {
    try {
      await fetch(`${API_URL}/hitl/review/${reviewId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ decision, feedback: '' })
      });
      fetchQueue();
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 flex items-center gap-3">
          <AlertCircle className="w-10 h-10 text-yellow-400" />
          Human Review Queue
        </h1>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard icon={<Clock />} label="Pending" value={queue.length} color="#f59e0b" />
          <StatCard icon={<CheckCircle />} label="Model Accuracy" value="94.2%" color="#10b981" />
          <StatCard icon={<AlertCircle />} label="Avg Confidence" value="0.87" color="#8b5cf6" />
        </div>

        <div className="space-y-4">
          {queue.map(review => (
            <ReviewCard key={review.id} review={review} onSubmit={submitReview} />
          ))}

          {queue.length === 0 && (
            <div className="text-center text-white/40 py-12 bg-white/5 rounded-2xl">
              All caught up! No reviews pending.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const ReviewCard = ({ review, onSubmit }) => (
  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
    <div className="mb-4">
      <div className="text-sm text-white/60 mb-2">Message from {review.data.username}</div>
      <div className="text-white text-lg font-medium">{review.data.message}</div>
    </div>

    <div className="bg-white/5 rounded-lg p-4 mb-4">
      <div className="text-sm text-purple-400 mb-2">AI Analysis</div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-white/60">Toxicity:</span>
          <span className="text-white ml-2 font-bold">
            {(review.data.aiAnalysis.toxicity * 100).toFixed(1)}%
          </span>
        </div>
        <div>
          <span className="text-white/60">Confidence:</span>
          <span className="text-white ml-2 font-bold">
            {(review.data.aiAnalysis.confidence * 100).toFixed(1)}%
          </span>
        </div>
      </div>
      {review.data.aiAnalysis.categories?.length > 0 && (
        <div className="mt-2">
          <span className="text-white/60 text-sm">Flags:</span>
          <div className="flex gap-2 mt-1">
            {review.data.aiAnalysis.categories.map(cat => (
              <span key={cat} className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
                {cat}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>

    <div className="flex gap-3">
      <button
        onClick={() => onSubmit(review.id, 'safe')}
        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition-all"
      >
        ✓ Mark Safe
      </button>
      <button
        onClick={() => onSubmit(review.id, 'toxic')}
        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition-all"
      >
        ✗ Mark Toxic
      </button>
    </div>
  </div>
);

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
    <div className="flex items-center gap-3 mb-2" style={{ color }}>
      {icon}
      <div className="text-sm text-white/60">{label}</div>
    </div>
    <div className="text-3xl font-bold text-white">{value}</div>
  </div>
);
