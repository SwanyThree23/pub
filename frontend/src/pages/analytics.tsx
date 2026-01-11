import { useQuery } from '@tanstack/react-query'
import Head from 'next/head'
import { BarChart3, TrendingUp, Users, Video } from 'lucide-react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export default function AnalyticsPage() {
  const { data: overview } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/analytics/overview`, {
        headers: { 'x-user-id': localStorage.getItem('userId') || 'demo-user' }
      })
      return response.data
    }
  })

  const { data: platformPerformance } = useQuery({
    queryKey: ['analytics', 'platforms'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/analytics/platforms/performance`, {
        headers: { 'x-user-id': localStorage.getItem('userId') || 'demo-user' }
      })
      return response.data
    }
  })

  return (
    <>
      <Head>
        <title>Analytics - Unified Platform</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">Track your streaming and content performance</p>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Streams"
              value={overview?.overview?.totalStreams || 0}
              icon={<Video size={24} />}
              color="blue"
            />
            <StatCard
              title="Total Viewers"
              value={(overview?.overview?.totalViewers || 0).toLocaleString()}
              icon={<Users size={24} />}
              color="green"
            />
            <StatCard
              title="Total Videos"
              value={overview?.overview?.totalVideos || 0}
              icon={<BarChart3 size={24} />}
              color="purple"
            />
            <StatCard
              title="Active Streams"
              value={overview?.overview?.activeStreams || 0}
              icon={<TrendingUp size={24} />}
              color="red"
              live={true}
            />
          </div>

          {/* Platform Performance */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Platform Performance</h2>
            <div className="space-y-4">
              {platformPerformance?.map((platform: any) => (
                <div key={platform.platform} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium capitalize">{platform.platform.toLowerCase()}</span>
                    <span className="text-sm text-gray-600">{platform.totalStreams} streams</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Total Viewers</div>
                      <div className="font-semibold">{platform.totalViewers.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Avg Viewers</div>
                      <div className="font-semibold">{platform.avgViewers}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Success Rate</div>
                      <div className="font-semibold">{platform.successRate}%</div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${platform.successRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Content Overview</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completed Videos</span>
                  <span className="text-2xl font-bold text-green-600">
                    {overview?.overview?.completedVideos || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Voice Clones</span>
                  <span className="text-2xl font-bold text-purple-600">
                    {overview?.overview?.totalVoices || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Minutes</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {overview?.overview?.totalMinutes || 0}m
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Platform Distribution</h2>
              <div className="space-y-2">
                {overview?.platformStats?.slice(0, 5).map((stat: any) => (
                  <div key={stat.platform} className="flex items-center justify-between">
                    <span className="capitalize text-sm">{stat.platform.toLowerCase()}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min(100, (stat.totalViewers / (overview?.overview?.totalViewers || 1)) * 100)}%`
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">
                        {stat.totalViewers}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function StatCard({ title, value, icon, color, live }: any) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600'
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          {icon}
        </div>
        {live && (
          <span className="flex items-center text-xs text-red-600">
            <span className="w-2 h-2 bg-red-600 rounded-full mr-1 animate-pulse" />
            LIVE
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  )
}
