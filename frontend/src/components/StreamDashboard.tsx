import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Play, Square, Video } from 'lucide-react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export function StreamDashboard() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])

  // Fetch streams
  const { data: streams, refetch } = useQuery({
    queryKey: ['streams'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/streams`, {
        headers: { 'x-user-id': localStorage.getItem('userId') || 'demo-user' }
      })
      return response.data
    }
  })

  // Start stream mutation
  const startStream = useMutation({
    mutationFn: async (config: any) => {
      const response = await axios.post(`${API_URL}/api/streams/start`, config, {
        headers: { 'x-user-id': localStorage.getItem('userId') || 'demo-user' }
      })
      return response.data
    },
    onSuccess: () => {
      refetch()
    }
  })

  // Stop stream mutation
  const stopStream = useMutation({
    mutationFn: async (streamId: string) => {
      const response = await axios.post(`${API_URL}/api/streams/${streamId}/stop`, {}, {
        headers: { 'x-user-id': localStorage.getItem('userId') || 'demo-user' }
      })
      return response.data
    },
    onSuccess: () => {
      refetch()
    }
  })

  const handleStartStream = () => {
    startStream.mutate({
      title: 'My Live Stream',
      description: 'Testing the unified platform',
      platforms: selectedPlatforms.map(id => ({ id, enabled: true })),
      scenes: [],
      aiEnabled: false,
      enableVDO: true,
      enableEvMux: true,
      eventId: '3491'
    })
  }

  const activeStream = streams?.find((s: any) => s.status === 'LIVE' || s.status === 'STARTING')

  return (
    <div className="space-y-6">
      {/* Active Stream */}
      {activeStream ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <h2 className="text-xl font-semibold">Live Now</h2>
            </div>
            <button
              onClick={() => stopStream.mutate(activeStream.id)}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Square size={20} />
              <span>Stop Stream</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Viewers</div>
              <div className="text-2xl font-bold">{activeStream.totalViewers || 0}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Peak</div>
              <div className="text-2xl font-bold">{activeStream.peakViewers || 0}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Duration</div>
              <div className="text-2xl font-bold">{activeStream.totalMinutes || 0}m</div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-gray-700">Active Platforms</h3>
            {activeStream.destinations?.map((dest: any) => (
              <div key={dest.id} className="flex items-center justify-between bg-gray-50 rounded p-3">
                <span className="font-medium capitalize">{dest.platform.toLowerCase()}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{dest.viewerCount || 0} viewers</span>
                  <span className={`px-2 py-1 text-xs rounded ${
                    dest.status === 'LIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {dest.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {activeStream.vdoGuestUrl && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">VDO.Ninja Guest URL</h4>
              <code className="text-sm text-blue-700 break-all">{activeStream.vdoGuestUrl}</code>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Start New Stream</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Platforms
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['youtube', 'twitch', 'facebook', 'kick', 'rumble', 'linkedin', 'twitter', 'tiktok'].map(platform => (
                  <button
                    key={platform}
                    onClick={() => {
                      setSelectedPlatforms(prev =>
                        prev.includes(platform)
                          ? prev.filter(p => p !== platform)
                          : [...prev, platform]
                      )
                    }}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors capitalize ${
                      selectedPlatforms.includes(platform)
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleStartStream}
              disabled={selectedPlatforms.length === 0 || startStream.isPending}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play size={20} />
              <span>{startStream.isPending ? 'Starting...' : 'Start Streaming'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Stream History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Streams</h2>
        <div className="space-y-2">
          {streams?.filter((s: any) => s.status === 'ENDED').slice(0, 5).map((stream: any) => (
            <div key={stream.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex items-center space-x-3">
                <Video size={20} className="text-gray-400" />
                <div>
                  <div className="font-medium">{stream.title}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(stream.startedAt).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                {stream.totalViewers} viewers · {stream.totalMinutes}m
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
