import { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import {
  LayoutDashboard, Radio, Users, Video, BarChart2,
  Settings, Key, LogOut, Menu, X, Bell, ChevronDown
} from 'lucide-react'

const PUBLIC_ROUTES = ['/login', '/register']

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const router  = useRouter()
  const [user, setUser]           = useState<any>(null)
  const [sidebarOpen, setSidebar] = useState(false)
  const [notifOpen, setNotif]     = useState(false)

  // Auth guard
  useEffect(() => {
    const stored = localStorage.getItem('user')
    const token  = localStorage.getItem('token')

    if (!token || !stored) {
      if (!PUBLIC_ROUTES.includes(router.pathname)) {
        router.push('/login')
      }
      return
    }

    setUser(JSON.parse(stored))
  }, [router.pathname])

  if (PUBLIC_ROUTES.includes(router.pathname)) {
    return <>{children}</>
  }

  if (!user) return null // waiting for auth check

  const logout = () => {
    localStorage.clear()
    router.push('/login')
  }

  const nav = [
    { href: '/',           label: 'Dashboard',  icon: <LayoutDashboard size={20} /> },
    { href: '/studio',     label: 'Studio',     icon: <Radio size={20} /> },
    { href: '/analytics',  label: 'Analytics',  icon: <BarChart2 size={20} /> },
    { href: '/content',    label: 'Content',    icon: <Video size={20} /> },
    { href: '/platforms',  label: 'Platforms',  icon: <Users size={20} /> },
    { href: '/settings',   label: 'Settings',   icon: <Settings size={20} /> },
  ]

  const isActive = (href: string) =>
    href === '/' ? router.pathname === '/' : router.pathname.startsWith(href)

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 border-r border-gray-800
        transform transition-transform duration-200 ease-in-out
        md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Unified
          </span>
          <button onClick={() => setSidebar(false)} className="md:hidden text-gray-400">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {nav.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebar(false)}
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
                isActive(item.href)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom: user info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user?.username}</div>
              <div className="text-xs text-gray-500 truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-2 text-sm text-gray-400 hover:text-red-400 transition-colors"
          >
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebar(false)}
        />
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800 shrink-0">
          <button onClick={() => setSidebar(true)} className="md:hidden text-gray-400">
            <Menu size={22} />
          </button>

          <div className="flex-1 md:flex-none" />

          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotif(!notifOpen)}
                className="relative p-2 text-gray-400 hover:text-white"
              >
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50">
                  <div className="p-4 border-b border-gray-700 font-medium">Notifications</div>
                  <div className="p-4 text-sm text-gray-400">No new notifications</div>
                </div>
              )}
            </div>

            {/* User avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold cursor-pointer">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-950">
          {children}
        </main>
      </div>
    </div>
  )
}
