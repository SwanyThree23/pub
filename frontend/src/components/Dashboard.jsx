import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Users, MessageSquare, Radio } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Dashboard({ user, token }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/analytics/overview`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
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
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome, {user.username}!</h1>
          <p className="text-white/60">Here's your streaming overview</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Radio className="w-8 h-8" />}
            label="Total Streams"
            value={stats?.total_streams || 0}
            color="#8b5cf6"
          />
          <StatCard
            icon={<Activity className="w-8 h-8" />}
            label="Live Now"
            value={stats?.live_streams || 0}
            color="#10b981"
          />
          <StatCard
            icon={<MessageSquare className="w-8 h-8" />}
            label="Messages Moderated"
            value={stats?.total_messages || 0}
            color="#f59e0b"
          />
          <StatCard
            icon={<Users className="w-8 h-8" />}
            label="Human Reviews"
            value={stats?.human_reviews || 0}
            color="#ec4899"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <QuickActions />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
    <div className="flex items-center gap-3 mb-3" style={{ color }}>
      {icon}
      <div className="text-sm text-white/60">{label}</div>
    </div>
    <div className="text-4xl font-bold text-white">{value}</div>
  </div>
);

const QuickActions = () => (
  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
    <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
    <div className="space-y-3">
      <ActionButton href="/seewhy"     label="🎬 Open SeeWhy LIVE Studio"  color="purple" />
      <ActionButton href="/production" label="📡 Production Control"        color="blue" />
      <ActionButton href="/hitl"       label="👥 Review Moderation Queue"   color="yellow" />
      <ActionButton href="/analytics"  label="📊 View Analytics"            color="blue" />
    </div>
  </div>
);

const ActionButton = ({ href, label, color }) => {
  const colors = {
    purple: 'from-purple-500 to-pink-500',
    yellow: 'from-yellow-500 to-orange-500',
    blue: 'from-blue-500 to-cyan-500'
  };

  return (
    <Link
      to={href}
      className={`block bg-gradient-to-r ${colors[color]} text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition-all text-center`}
    >
      {label}
    </Link>
  );
};

const RecentActivity = () => (
  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
    <h2 className="text-2xl font-bold text-white mb-4">Recent Activity</h2>
    <div className="space-y-3 text-white/60">
      <ActivityItem icon="🔴" text="Stream started 2 hours ago" />
      <ActivityItem icon="✅" text="5 messages moderated" />
      <ActivityItem icon="👥" text="3 guests joined via VDO.Ninja" />
      <ActivityItem icon="📊" text="Analytics updated" />
    </div>
  </div>
);

const ActivityItem = ({ icon, text }) => (
  <div className="flex items-center gap-3 text-sm">
    <span className="text-2xl">{icon}</span>
    <span>{text}</span>
  </div>
);
