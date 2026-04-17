import { useRouter } from 'next/router'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { subscribeToStream, subscribeToViewers } from '@/utils/supabase'
import { Users, Eye } from 'lucide-react'

const LiveKitRoom = dynamic(
  () => import('@/components/LiveKitRoom').then(m => m.LiveKitRoom),
  { ssr: false }
)

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export default function WatchPage() {
  const router          = useRouter()
  const streamId        = router.query.streamId as string
  const [viewers, setViewers] = useState(0)
  const [isLive, setIsLive]   = useState(false)

  const { data: stream } = useQuery({
    queryKey: ['watch', streamId],
    queryFn: async () => {
      const r = await axios.get(`${API_URL}/api/streams/${streamId}`)
      return r.data
    },
    enabled: !!streamId,
    refetchInterval: 15000,
    onSuccess: (data) => {
      setIsLive(data.status === 'LIVE')
      setViewers(data.totalViewers || 0)
    }
  })

  // Supabase real-time viewer presence
  useEffect(() => {
    if (!streamId) return;

    const channel = subscribeToViewers(streamId, setViewers);
    const streamSub = subscribeToStream(streamId, (payload) => {
      if (payload.new?.status) {
        setIsLive(payload.new.status === 'LIVE');
      }
    });

    return () => {
      channel.unsubscribe();
      streamSub.unsubscribe();
    };
  }, [streamId]);

  if (!streamId) return null;

  return (
    <>
      <Head>
        <title>{stream?.title || 'Watch Live'} – Unified Platform</title>
      </Head>

      <div className="min-h-screen bg-gray-950 text-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Title + live badge */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">{stream?.title || 'Live Stream'}</h1>
              {stream?.description && (
                <p className="text-gray-400 mt-1">{stream.description}</p>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {isLive ? (
                <span className="flex items-center space-x-2 px-3 py-1 bg-red-600 rounded-full text-sm font-medium">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span>LIVE</span>
                </span>
              ) : (
                <span className="px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-400">
                  Offline
                </span>
              )}
              <div className="flex items-center space-x-1 text-gray-400">
                <Eye size={16} />
                <span className="text-sm">{viewers.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Video player */}
          {isLive ? (
            <LiveKitRoom
              streamId={streamId}
              role="viewer"
              onDisconnect={() => router.push('/')}
            />
          ) : (
            <div className="aspect-video bg-gray-900 rounded-xl flex flex-col items-center justify-center">
              <div className="text-gray-500 text-6xl mb-4">📺</div>
              <p className="text-gray-400">This stream is currently offline</p>
            </div>
          )}

          {/* Platform destinations */}
          {stream?.destinations && stream.destinations.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-gray-500">Also live on:</span>
              {stream.destinations.map((d: any) => (
                <span key={d.id} className="px-2 py-1 bg-gray-800 rounded text-xs capitalize text-gray-300">
                  {d.platform.toLowerCase()}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
