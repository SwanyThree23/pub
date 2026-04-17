import { useState } from 'react'
import { useQuery, useMutation } from '@tantml:query'
import { Video, Mic, Image, Globe } from 'lucide-react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

type ContentType = 'avatar-video' | 'translate-video' | 'image-to-video' | 'voice-clone'

export function ContentStudio() {
  const [activeType, setActiveType] = useState<ContentType>('avatar-video')

  const { data: videos } = useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/content/videos`, {
        headers: { 'x-user-id': localStorage.getItem('userId') || 'demo-user' }
      })
      return response.data
    }
  })

  const { data: voices } = useQuery({
    queryKey: ['voices'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/content/voices`, {
        headers: { 'x-user-id': localStorage.getItem('userId') || 'demo-user' }
      })
      return response.data
    }
  })

  return (
    <div className="space-y-6">
      {/* Content Type Selector */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">AI Content Creation</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setActiveType('avatar-video')}
            className={`flex flex-col items-center p-4 rounded-lg border-2 transition-colors ${
              activeType === 'avatar-video'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Video size={32} className="mb-2" />
            <span className="font-medium">Avatar Video</span>
            <span className="text-xs text-gray-500">HeyGen</span>
          </button>

          <button
            onClick={() => setActiveType('translate-video')}
            className={`flex flex-col items-center p-4 rounded-lg border-2 transition-colors ${
              activeType === 'translate-video'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Globe size={32} className="mb-2" />
            <span className="font-medium">Translate</span>
            <span className="text-xs text-gray-500">Akool</span>
          </button>

          <button
            onClick={() => setActiveType('image-to-video')}
            className={`flex flex-col items-center p-4 rounded-lg border-2 transition-colors ${
              activeType === 'image-to-video'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Image size={32} className="mb-2" />
            <span className="font-medium">Image to Video</span>
            <span className="text-xs text-gray-500">Akool</span>
          </button>

          <button
            onClick={() => setActiveType('voice-clone')}
            className={`flex flex-col items-center p-4 rounded-lg border-2 transition-colors ${
              activeType === 'voice-clone'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Mic size={32} className="mb-2" />
            <span className="font-medium">Voice Clone</span>
            <span className="text-xs text-gray-500">ElevenLabs</span>
          </button>
        </div>
      </div>

      {/* Creation Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">
          Create {activeType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
        </h3>

        {activeType === 'avatar-video' && <AvatarVideoForm />}
        {activeType === 'translate-video' && <TranslateVideoForm />}
        {activeType === 'image-to-video' && <ImageToVideoForm />}
        {activeType === 'voice-clone' && <VoiceCloneForm />}
      </div>

      {/* Content Library */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Your Content</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos?.slice(0, 6).map((video: any) => (
            <div key={video.id} className="border rounded-lg p-4">
              <div className="aspect-video bg-gray-200 rounded mb-3 flex items-center justify-center">
                {video.thumbnailUrl ? (
                  <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover rounded" />
                ) : (
                  <Video size={48} className="text-gray-400" />
                )}
              </div>
              <div className="font-medium truncate">{video.title || 'Untitled'}</div>
              <div className="text-sm text-gray-500 capitalize">{video.type.toLowerCase().replace('_', ' ')}</div>
              <div className={`text-xs mt-2 px-2 py-1 rounded inline-block ${
                video.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                video.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {video.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AvatarVideoForm() {
  const [script, setScript] = useState('')

  const generateVideo = useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.post(`${API_URL}/api/content/avatar-video`, data, {
        headers: { 'x-user-id': localStorage.getItem('userId') || 'demo-user' }
      })
      return response.data
    }
  })

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Script</label>
        <textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Enter your script..."
        />
      </div>

      <button
        onClick={() => generateVideo.mutate({
          avatarId: 'default',
          voiceId: 'default',
          script
        })}
        disabled={!script || generateVideo.isPending}
        className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
      >
        {generateVideo.isPending ? 'Generating...' : 'Generate Video'}
      </button>

      {generateVideo.isSuccess && (
        <div className="p-4 bg-green-50 text-green-700 rounded-lg">
          Video generation started! Check your content library.
        </div>
      )}
    </div>
  )
}

function TranslateVideoForm() {
  const [videoUrl, setVideoUrl] = useState('')
  const [language, setLanguage] = useState('es')

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Video URL</label>
        <input
          type="url"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Target Language</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="zh">Chinese</option>
          <option value="ja">Japanese</option>
        </select>
      </div>

      <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
        Translate Video
      </button>
    </div>
  )
}

function ImageToVideoForm() {
  const [imageUrl, setImageUrl] = useState('')
  const [prompt, setPrompt] = useState('')

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Motion Prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Describe the motion..."
        />
      </div>

      <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
        Generate Video
      </button>
    </div>
  )
}

function VoiceCloneForm() {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Voice Name</label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="My Voice"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Audio Samples</label>
        <input
          type="file"
          accept="audio/*"
          multiple
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <p className="mt-1 text-sm text-gray-500">Upload 3-5 audio samples (min 30s each)</p>
      </div>

      <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
        Clone Voice
      </button>
    </div>
  )
}
