import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Analytics({ token }) {
  const [overview, setOverview] = useState(null);
  const [modelMetrics, setModelMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [overviewRes, metricsRes] = await Promise.all([
        fetch(`${API_URL}/analytics/overview`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/monitoring/model-performance`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const overviewData = await overviewRes.json();
      const metricsData = await metricsRes.json();

      setOverview(overviewData);
      setModelMetrics(metricsData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 flex items-center gap-3">
          <TrendingUp className="w-10 h-10 text-green-400" />
          Analytics Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            icon={<Activity />}
            label="Total Streams"
            value={overview?.total_streams || 0}
            color="#8b5cf6"
          />
          <MetricCard
            icon={<CheckCircle />}
            label="Messages Moderated"
            value={overview?.total_messages || 0}
            color="#10b981"
          />
          <MetricCard
            icon={<AlertTriangle />}
            label="Avg Toxicity"
            value={`${((overview?.avg_toxicity || 0) * 100).toFixed(1)}%`}
            color="#f59e0b"
          />
          <MetricCard
            icon={<CheckCircle />}
            label="Human Reviews"
            value={overview?.human_reviews || 0}
            color="#ec4899"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ModelPerformance metrics={modelMetrics} />
          <ModerationInsights overview={overview} />
        </div>
      </div>
    </div>
  );
}

const MetricCard = ({ icon, label, value, color }) => (
  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
    <div className="flex items-center gap-3 mb-3" style={{ color }}>
      {icon}
      <div className="text-sm text-white/60">{label}</div>
    </div>
    <div className="text-4xl font-bold text-white">{value}</div>
  </div>
);

const ModelPerformance = ({ metrics }) => (
  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
    <h2 className="text-2xl font-bold text-white mb-4">AI Model Performance</h2>

    <div className="space-y-4">
      <PerformanceItem
        label="Total Predictions"
        value={metrics?.totalPredictions || 0}
      />
      <PerformanceItem
        label="Average Confidence"
        value={`${((metrics?.avgConfidence || 0) * 100).toFixed(1)}%`}
      />
      <PerformanceItem
        label="Model Accuracy"
        value={`${((metrics?.accuracy || 0) * 100).toFixed(1)}%`}
      />
      <PerformanceItem
        label="Low Confidence Rate"
        value={`${((metrics?.lowConfidenceRate || 0) * 100).toFixed(1)}%`}
      />
    </div>

    {metrics?.driftDetected && (
      <div className="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
        <div className="flex items-center gap-2 text-red-300 font-semibold mb-2">
          <AlertTriangle className="w-5 h-5" />
          Model Drift Detected
        </div>
        <p className="text-red-300/80 text-sm">
          Model performance has degraded by more than 10%. Consider retraining with recent data.
        </p>
      </div>
    )}
  </div>
);

const PerformanceItem = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="text-white/60">{label}</span>
    <span className="text-white font-bold text-lg">{value}</span>
  </div>
);

const ModerationInsights = ({ overview }) => {
  const safeRate = overview?.total_messages
    ? ((1 - (overview.avg_toxicity || 0)) * 100).toFixed(1)
    : 0;

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <h2 className="text-2xl font-bold text-white mb-4">Moderation Insights</h2>

      <div className="space-y-4">
        <InsightCard
          icon="✅"
          label="Safe Messages"
          value={`${safeRate}%`}
          color="#10b981"
        />
        <InsightCard
          icon="⚠️"
          label="Flagged Content"
          value={`${((overview?.avg_toxicity || 0) * 100).toFixed(1)}%`}
          color="#f59e0b"
        />
        <InsightCard
          icon="👥"
          label="Human Review Rate"
          value={overview?.total_messages
            ? `${((overview.human_reviews / overview.total_messages) * 100).toFixed(1)}%`
            : '0%'}
          color="#8b5cf6"
        />
      </div>

      <div className="mt-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
        <p className="text-green-300 text-sm">
          📊 Your AI moderation system is working effectively. The low human review rate indicates high model confidence.
        </p>
      </div>
    </div>
  );
};

const InsightCard = ({ icon, label, value, color }) => (
  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
    <div className="flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      <span className="text-white/80">{label}</span>
    </div>
    <span className="text-2xl font-bold text-white" style={{ color }}>
      {value}
    </span>
  </div>
);
