import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import Head from 'next/head'
import { Key, User, Bell, Shield } from 'lucide-react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'api-keys' | 'notifications' | 'security'>('profile')

  const tabs = [
    { id: 'profile', name: 'Profile', icon: <User size={20} /> },
    { id: 'api-keys', name: 'API Keys', icon: <Key size={20} /> },
    { id: 'notifications', name: 'Notifications', icon: <Bell size={20} /> },
    { id: 'security', name: 'Security', icon: <Shield size={20} /> }
  ]

  return (
    <>
      <Head>
        <title>Settings - Unified Platform</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar */}
            <div className="w-full md:w-64">
              <div className="bg-white rounded-lg shadow p-4">
                <nav className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {tab.icon}
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              {activeTab === 'profile' && <ProfileSettings />}
              {activeTab === 'api-keys' && <APIKeysSettings />}
              {activeTab === 'notifications' && <NotificationSettings />}
              {activeTab === 'security' && <SecuritySettings />}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function ProfileSettings() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: ''
  })

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { 'x-user-id': localStorage.getItem('userId') || 'demo-user' }
      })
      return response.data.user
    },
    onSuccess: (data) => {
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        username: data.username || ''
      })
    }
  })

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6">Profile Information</h2>

      <form className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Username
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Save Changes
        </button>
      </form>
    </div>
  )
}

function APIKeysSettings() {
  const [showAddKey, setShowAddKey] = useState(false)
  const [newKey, setNewKey] = useState({
    service: '',
    keyName: '',
    apiKey: ''
  })

  const { data: apiKeys, refetch } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/api-keys`, {
        headers: { 'x-user-id': localStorage.getItem('userId') || 'demo-user' }
      })
      return response.data
    }
  })

  const addKeyMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.post(`${API_URL}/api/api-keys`, data, {
        headers: { 'x-user-id': localStorage.getItem('userId') || 'demo-user' }
      })
      return response.data
    },
    onSuccess: () => {
      refetch()
      setShowAddKey(false)
      setNewKey({ service: '', keyName: '', apiKey: '' })
    }
  })

  const services = [
    { id: 'heygen', name: 'HeyGen' },
    { id: 'elevenlabs', name: 'ElevenLabs' },
    { id: 'akool', name: 'Akool' },
    { id: 'vdo', name: 'VDO.Ninja' },
    { id: 'evmux', name: 'EvMux' }
  ]

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">API Keys</h2>
        <button
          onClick={() => setShowAddKey(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Add API Key
        </button>
      </div>

      <div className="space-y-3">
        {apiKeys?.map((key: any) => (
          <div key={key.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <div className="font-medium capitalize">{key.service}</div>
              <div className="text-sm text-gray-500">{key.keyName}</div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-2 py-1 text-xs rounded ${
                key.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {key.isActive ? 'Active' : 'Inactive'}
              </span>
              <button className="text-red-600 hover:text-red-700 text-sm">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddKey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Add API Key</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service
                </label>
                <select
                  value={newKey.service}
                  onChange={(e) => setNewKey({ ...newKey, service: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select a service</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Name
                </label>
                <input
                  type="text"
                  value={newKey.keyName}
                  onChange={(e) => setNewKey({ ...newKey, keyName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Production Key"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={newKey.apiKey}
                  onChange={(e) => setNewKey({ ...newKey, apiKey: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter API key"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAddKey(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => addKeyMutation.mutate(newKey)}
                  disabled={!newKey.service || !newKey.keyName || !newKey.apiKey}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  Add Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function NotificationSettings() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6">Notification Preferences</h2>

      <div className="space-y-4">
        <NotificationToggle
          title="Stream Started"
          description="Get notified when your stream goes live"
          enabled={true}
        />
        <NotificationToggle
          title="Stream Ended"
          description="Get notified when your stream ends"
          enabled={true}
        />
        <NotificationToggle
          title="Video Completed"
          description="Get notified when AI video generation completes"
          enabled={true}
        />
        <NotificationToggle
          title="New Viewers"
          description="Get notified about viewer milestones"
          enabled={false}
        />
      </div>
    </div>
  )
}

function NotificationToggle({ title, description, enabled }: any) {
  const [isEnabled, setIsEnabled] = useState(enabled)

  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-sm text-gray-500">{description}</div>
      </div>
      <button
        onClick={() => setIsEnabled(!isEnabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          isEnabled ? 'bg-primary-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isEnabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}

function SecuritySettings() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6">Security Settings</h2>

      <div className="space-y-6">
        <div>
          <h3 className="font-medium mb-4">Change Password</h3>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Current password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <input
              type="password"
              placeholder="New password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              Update Password
            </button>
          </div>
        </div>

        <div className="pt-6 border-t">
          <h3 className="font-medium mb-4 text-red-600">Danger Zone</h3>
          <div className="border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Delete Account</div>
                <div className="text-sm text-gray-500">
                  Permanently delete your account and all data
                </div>
              </div>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
