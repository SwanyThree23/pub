import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { CheckCircle, XCircle, Settings } from 'lucide-react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

const PLATFORMS = [
  { id: 'youtube', name: 'YouTube', color: 'bg-red-500' },
  { id: 'twitch', name: 'Twitch', color: 'bg-purple-500' },
  { id: 'facebook', name: 'Facebook', color: 'bg-blue-600' },
  { id: 'instagram', name: 'Instagram', color: 'bg-pink-500' },
  { id: 'tiktok', name: 'TikTok', color: 'bg-black' },
  { id: 'twitter', name: 'Twitter/X', color: 'bg-blue-400' },
  { id: 'linkedin', name: 'LinkedIn', color: 'bg-blue-700' },
  { id: 'kick', name: 'Kick', color: 'bg-green-500' },
  { id: 'rumble', name: 'Rumble', color: 'bg-green-600' },
  { id: 'telegram', name: 'Telegram', color: 'bg-blue-500' },
  { id: 'amazon', name: 'Amazon Live', color: 'bg-orange-500' },
  { id: 'steam', name: 'Steam', color: 'bg-gray-700' }
]

export function PlatformManager() {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)
  const [streamKey, setStreamKey] = useState('')

  const { data: platforms, refetch } = useQuery({
    queryKey: ['platforms'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/platforms`, {
        headers: { 'x-user-id': localStorage.getItem('userId') || 'demo-user' }
      })
      return response.data
    }
  })

  const connectPlatform = useMutation({
    mutationFn: async ({ platformId, streamKey }: { platformId: string; streamKey: string }) => {
      const response = await axios.post(
        `${API_URL}/api/platforms/connect`,
        { platformId, streamKey },
        {
          headers: { 'x-user-id': localStorage.getItem('userId') || 'demo-user' }
        }
      )
      return response.data
    },
    onSuccess: () => {
      refetch()
      setSelectedPlatform(null)
      setStreamKey('')
    }
  })

  const togglePlatform = useMutation({
    mutationFn: async ({ platformId, enabled }: { platformId: string; enabled: boolean }) => {
      const response = await axios.patch(
        `${API_URL}/api/platforms/${platformId}/toggle`,
        { enabled },
        {
          headers: { 'x-user-id': localStorage.getItem('userId') || 'demo-user' }
        }
      )
      return response.data
    },
    onSuccess: () => {
      refetch()
    }
  })

  const handleConnect = () => {
    if (selectedPlatform && streamKey) {
      connectPlatform.mutate({ platformId: selectedPlatform, streamKey })
    }
  }

  const getPlatformStatus = (platformId: string) => {
    return platforms?.find((p: any) => p.platform.toLowerCase() === platformId)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Connected Platforms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PLATFORMS.map(platform => {
            const status = getPlatformStatus(platform.id)
            const isConnected = status?.isConnected
            const isEnabled = status?.isEnabled

            return (
              <div key={platform.id} className="border-2 border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${platform.color} rounded-lg flex items-center justify-center text-white font-bold`}>
                      {platform.name[0]}
                    </div>
                    <div>
                      <div className="font-medium">{platform.name}</div>
                      {status?.platformUsername && (
                        <div className="text-sm text-gray-500">@{status.platformUsername}</div>
                      )}
                    </div>
                  </div>
                  {isConnected ? (
                    <CheckCircle className="text-green-500" size={20} />
                  ) : (
                    <XCircle className="text-gray-300" size={20} />
                  )}
                </div>

                {isConnected ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => togglePlatform.mutate({
                        platformId: platform.id,
                        enabled: !isEnabled
                      })}
                      className={`w-full px-4 py-2 rounded-lg font-medium ${
                        isEnabled
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {isEnabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedPlatform(platform.id)}
                    className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Connect
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Connect Platform Modal */}
      {selectedPlatform && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              Connect {PLATFORMS.find(p => p.id === selectedPlatform)?.name}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stream Key
                </label>
                <input
                  type="password"
                  value={streamKey}
                  onChange={(e) => setStreamKey(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your stream key"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Find this in your platform's streaming settings
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setSelectedPlatform(null)
                    setStreamKey('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConnect}
                  disabled={!streamKey || connectPlatform.isPending}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {connectPlatform.isPending ? 'Connecting...' : 'Connect'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
