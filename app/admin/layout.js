'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Gamepad2, LayoutDashboard, Server, Users, Ticket, FileText, Image, Settings, Palette, FileCode, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { toast } from 'sonner'

export default function AdminLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const supabase = createBrowserSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('Please login')
        router.push('/auth/login')
        return
      }
      
      const response = await fetch(`/api/auth/user/${user.id}`)
      if (response.ok) {
        const userData = await response.json()
        if (userData.role !== 'admin') {
          toast.error('Unauthorized access')
          router.push('/')
          return
        }
        setUserRole(userData.role)
      }
      
      setUser(user)
    } catch (error) {
      console.error('Auth error:', error)
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    const supabase = createBrowserSupabaseClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-yellow-500"></div>
      </div>
    )
  }

  if (!user || userRole !== 'admin') {
    return null
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/servers', label: 'Servers', icon: Server },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/tickets', label: 'Support', icon: Ticket },
    { href: '/admin/blog', label: 'Blog', icon: FileText },
    { href: '/admin/banners', label: 'Banners', icon: Image },
    { href: '/admin/pages', label: 'Pages', icon: FileCode },
    { href: '/admin/theme', label: 'Theme', icon: Palette },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      <aside className="fixed left-0 top-0 h-full w-64 bg-black border-r border-gray-800 z-50">
        <div className="p-4">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <Gamepad2 className="w-8 h-8 text-yellow-500" />
            <div>
              <h1 className="text-xl font-bold text-yellow-500">ADMIN PANEL</h1>
              <p className="text-xs text-gray-400">Management Panel</p>
            </div>
          </Link>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className={`w-full justify-start ${
                      isActive
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full border-gray-700 hover:border-red-500 hover:text-red-500"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      <main className="ml-64 min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
