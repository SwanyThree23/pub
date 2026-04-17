import { useRouter } from 'next/router'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Users, Mic, MicOff, Video, VideoOff, Settings } from 'lucide-react'

// LiveKit must be client-side only
const LiveKitRoom = dynamic(
  () => import('@/components/LiveKitRoom').then(m => m.LiveKitRoom),
  { ssr: false }
)

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export default function StudioPage() {
  const router   = useRouter()
  const streamId = router.query.streamId as string
  const role     = (router.query.role as string) || 'viewer'
  const [showGuest, setShowGuest] = useState(false)
  const [guestName, setGuestName] = useState('')

  const { data: stream } = useQuery({
    queryKey: ['stream', streamId],
    queryFn: async () => {
      const r = await axios.get(`${API_URL}/api/streams/${streamId}`, {
        headers: { 'x-user-id': localStorage.getItem('userId') || 'demo-user' }
      })
      return r.data
    },
    enabled: !!streamId,
    refetchInterval: 10000
  })

  const { data: participants } = useQuery({
    queryKey: ['participants', streamId],
    queryFn: async () => {
      const r = await axios.get(`${API_URL}/api/livekit/room/${streamId}/participants`, {
        headers: { 'x-user-id': localStorage.getItem('userId') || 'demo-user' }
      })
      return r.data
    },
    enabled: !!streamId && role === 'host',
    refetchInterval: 5000
  })

  if (!streamId) return null

  return (
    <>
      <Head>
        <title>Studio – {stream?.title || 'Live Stream'}</title>
      </Head>

      <div className="min-h-screen bg-gray-950 text-white">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3 bg-gray-900 border-b border-gray-800">
          <div className="flex items-center space-x-4">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="font-semibold">{stream?.title || 'Live Stream'}</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Users size={16} />
              <span>{stream?.totalViewers || 0} viewers</span>
            </div>

            {role === 'host' && (
              <button
                onClick={() => setShowGuest(true)}
                className="px-4 py-1.5 bg-blue-600 rounded-lg text-sm hover:bg-blue-700"
              >
                + Invite Guest
              </button>
            )}
          </div>
        </div>

        {/* Main layout */}
        <div className="flex h-[calc(100vh-57px)]">
          {/* Video area */}
          <div className="flex-1 p-4">
            <LiveKitRoom
              streamId={streamId}
              role={role as any}
              onDisconnect={() => router.push('/')}
            />
          </div>

          {/* Sidebar (host only) */}
          {role === 'host' && (
            <div className="w-72 border-l border-gray-800 bg-gray-900 p-4 overflow-y-auto">
              <h3 className="font-semibold mb-4 text-gray-300">Participants</h3>

              <div className="space-y-2">
                {participants?.map((p: any) => (
                  <div key={p.sid} className="flex items-center justify-between bg-gray-800 rounded-lg p-3">
                    <div>
                      <div className="text-sm font-medium">{p.name || p.identity}</div>
                      <div className="text-xs text-gray-500 capitalize">
                        {p.identity.startsWith('host_') ? 'Host' :
                         p.identity.startsWith('guest_') ? 'Guest' : 'Viewer'}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {p.isMicrophoneEnabled ? (
                        <Mic size={14} className="text-green-400" />
                      ) : (
                        <MicOff size={14} className="text-gray-500" />
                      )}
                      {p.isCameraEnabled ? (
                        <Video size={14} className="text-green-400" />
                      ) : (
                        <VideoOff size={14} className="text-gray-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Platform destinations */}
              <h3 className="font-semibold mt-6 mb-4 text-gray-300">Destinations</h3>
              <div className="space-y-2">
                {stream?.destinations?.map((dest: any) => (
                  <div key={dest.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2">
                    <span className="text-sm capitalize">{dest.platform.toLowerCase()}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      dest.status === 'LIVE'
                        ? 'bg-green-900 text-green-300'
                        : 'bg-yellow-900 text-yellow-300'
                    }`}>{dest.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Invite Guest modal */}
        {showGuest && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Invite Guest</h3>
              <input
                type="text"
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                placeholder="Guest name"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowGuest(false)}
                  className="flex-1 py-2 border border-gray-700 rounded-lg hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/studio/${streamId}?role=guest&name=${encodeURIComponent(guestName)}`;
                    navigator.clipboard.writeText(url);
                    setShowGuest(false);
                  }}
                  className="flex-1 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
