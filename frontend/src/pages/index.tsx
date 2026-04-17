import { useEffect, useState } from 'react'
import Head from 'next/head'
import { StreamDashboard } from '@/components/StreamDashboard'
import { PlatformManager } from '@/components/PlatformManager'
import { ContentStudio } from '@/components/ContentStudio'
import { useWebSocket } from '@/hooks/useWebSocket'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'stream' | 'platforms' | 'content'>('stream')
  const { connected } = useWebSocket()

  return (
    <>
      <Head>
        <title>Unified Platform - Stream & Create</title>
        <meta name="description" content="Ultimate streaming and AI content platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Unified Platform
              </h1>
              <div className="flex items-center space-x-4">
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-600">
                  {connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex space-x-8 -mb-px">
              <button
                onClick={() => setActiveTab('stream')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'stream'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Live Streaming
              </button>
              <button
                onClick={() => setActiveTab('platforms')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'platforms'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Platforms
              </button>
              <button
                onClick={() => setActiveTab('content')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'content'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                AI Content
              </button>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'stream' && <StreamDashboard />}
          {activeTab === 'platforms' && <PlatformManager />}
          {activeTab === 'content' && <ContentStudio />}
        </main>
      </div>
    </>
  )
}
