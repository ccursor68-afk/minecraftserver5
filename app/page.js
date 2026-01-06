'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Gamepad2, Search, Filter, Trophy, Users, Plus, LogIn, UserPlus, LogOut, Shield, ExternalLink } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import UserMenu from '@/components/UserMenu'

// Game mode categories
const GAME_MODES = [
  { id: 'all', name: 'All', icon: '🎮' },
  { id: 'Survival', name: 'Survival', icon: '🏕️' },
  { id: 'Skyblock', name: 'Skyblock', icon: '🏝️' },
  { id: 'Bedwars', name: 'Bedwars', icon: '🛏️' },
  { id: 'Skywars', name: 'Skywars', icon: '⚔️' },
  { id: 'Factions', name: 'Factions', icon: '⚔️' },
  { id: 'Prison', name: 'Prison', icon: '🔒' },
  { id: 'Creative', name: 'Creative', icon: '🎨' },
  { id: 'Minigames', name: 'Minigames', icon: '🎯' },
  { id: 'Network', name: 'Network', icon: '🌐' },
  { id: 'Towny', name: 'Towny', icon: '🏘️' },
  { id: 'PvP', name: 'PvP', icon: '⚔️' },
]

// Platform filters
const PLATFORMS = [
  { id: 'all', name: 'All Platforms', icon: '🎮', color: 'bg-gray-600' },
  { id: 'java', name: 'Java', icon: '☕', color: 'bg-orange-600' },
  { id: 'bedrock', name: 'Bedrock', icon: '🎮', color: 'bg-green-600' },
  { id: 'crossplay', name: 'Crossplay', icon: '🔀', color: 'bg-blue-600' },
]

export default function HomePage() {
  const router = useRouter()
  const [servers, setServers] = useState([])
  const [topBanners, setTopBanners] = useState([])
  const [bottomBanners, setBottomBanners] = useState([])
  const [betweenServersBanners, setBetweenServersBanners] = useState([])
  const [sidebarBanners, setSidebarBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [platformFilter, setPlatformFilter] = useState('all')
  
  useEffect(() => {
    checkUser()
    fetchServers()
    fetchBanners()
  }, [])
  
  const checkUser = async () => {
    try {
      const supabase = createBrowserSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        // Get user role from database
        const response = await fetch(`/api/auth/user/${user.id}`)
        if (response.ok) {
          const userData = await response.json()
          setUserRole(userData.role)
        }
      }
    } catch (error) {
      console.error('Auth check error:', error)
    }
  }
  
  const fetchServers = async () => {
    try {
      const response = await fetch('/api/servers')
      if (response.ok) {
        const data = await response.json()
        setServers(data)
      }
    } catch (error) {
      console.error('Error fetching servers:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBanners = async () => {
    try {
      const response = await fetch('/api/banners/active')
      if (response.ok) {
        const data = await response.json()
        setTopBanners(data.filter(b => b.position === 'top'))
        setBottomBanners(data.filter(b => b.position === 'bottom'))
        setBetweenServersBanners(data.filter(b => b.position === 'between_servers'))
        setSidebarBanners(data.filter(b => b.position === 'sidebar'))
      }
    } catch (error) {
      console.error('Error fetching banners:', error)
    }
  }
  
  const handleSignOut = async () => {
    const supabase = createBrowserSupabaseClient()
    await supabase.auth.signOut()
    setUser(null)
    setUserRole(null)
    toast.success('Logged out successfully')
    router.refresh()
  }
  
  const filteredServers = servers.filter(server => {
    const matchesSearch = server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         server.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || server.category === categoryFilter
    // Platform filter logic - for now we show all since platform info might not be stored
    const matchesPlatform = platformFilter === 'all' || true
    return matchesSearch && matchesCategory && matchesPlatform
  })
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#0a0a0a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-8 h-8 text-green-500" />
              <div>
                <h1 className="text-2xl font-bold text-green-500">MINECRAFT SERVER LIST</h1>
                <p className="text-xs text-gray-400">Best Minecraft Servers 2025</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link href="/" className="text-green-500 hover:text-green-400 transition-colors">
                🎮 Servers
              </Link>
              <Link href="/blog" className="text-gray-400 hover:text-green-400 transition-colors">
                📰 Blog
              </Link>
              {user && (
                <Link href="/tickets" className="text-gray-400 hover:text-green-400 transition-colors">
                  🎫 Support
                </Link>
              )}
              {userRole === 'admin' && (
                <Link href="/admin" className="text-yellow-500 hover:text-yellow-400 transition-colors">
                  <Shield className="w-4 h-4 inline mr-1" />
                  Admin
                </Link>
              )}
            </nav>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Top Banner Ad Section */}
      <section className="py-4 border-b border-gray-800 bg-gradient-to-r from-gray-900/50 to-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            {topBanners.length > 0 ? (
              <a href={topBanners[0].linkUrl || '#'} target="_blank" rel="noopener noreferrer" className="block">
                <img 
                  src={topBanners[0].imageUrl} 
                  alt={topBanners[0].serverName}
                  className="max-w-full h-auto rounded-lg border border-gray-700 hover:border-green-500 transition-colors"
                  style={{ maxHeight: '90px' }}
                />
              </a>
            ) : (
              <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-800/50 rounded-lg p-4 text-center w-full max-w-3xl">
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl">📢</span>
                  <div>
                    <p className="text-green-400 font-bold">Advertise Your Server Here!</p>
                    <p className="text-gray-400 text-sm">Get more players by featuring your server in our banner section</p>
                  </div>
                  <Link href="/submit">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 ml-4">
                      Get Featured
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Hero Section */}
      <section className="py-12 border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-5xl font-bold">
              <span className="text-white">Find the Best</span>
              <br />
              <span className="text-green-500">Minecraft Servers</span>
            </h2>
            <p className="text-xl text-gray-400">
              Vote for your favorite servers and help them reach the top!
            </p>
            
            {/* Search Bar */}
            <div className="flex gap-2 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search servers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-900 border-gray-700 focus:border-green-500 text-white"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px] bg-gray-900 border-gray-700">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GAME_MODES.map(mode => (
                    <SelectItem key={mode.id} value={mode.id}>
                      {mode.icon} {mode.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>
      
      {/* Platform Filter */}
      <section className="py-6 border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-4">Filter by Platform</p>
            <div className="flex justify-center gap-3 flex-wrap">
              {PLATFORMS.map(platform => (
                <Button
                  key={platform.id}
                  onClick={() => setPlatformFilter(platform.id)}
                  className={`${platformFilter === platform.id ? platform.color : 'bg-gray-700'} hover:opacity-90`}
                >
                  {platform.icon} {platform.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Game Mode Filter */}
      <section className="py-6 border-b border-gray-800 bg-gray-900/30">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-4">Filter by Game Mode</p>
            <div className="flex justify-center gap-2 flex-wrap max-w-4xl mx-auto">
              {GAME_MODES.map(mode => (
                <Button
                  key={mode.id}
                  onClick={() => setCategoryFilter(mode.id)}
                  variant={categoryFilter === mode.id ? 'default' : 'outline'}
                  size="sm"
                  className={categoryFilter === mode.id 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'border-gray-700 hover:border-green-500 hover:text-green-400'
                  }
                >
                  {mode.icon} {mode.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Server List */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex gap-6">
            {/* Main Content */}
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-6 text-center">🏆 Top Minecraft Servers</h3>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-green-500"></div>
                  <p className="mt-4 text-gray-400">Loading servers...</p>
                </div>
              ) : filteredServers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg">No servers found</p>
                  <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredServers.map((server, index) => (
                    <div key={server.id}>
                      <Card className="bg-[#0f0f0f] border-gray-800 hover:border-green-500/50 transition-all hover:shadow-lg hover:shadow-green-500/10 relative overflow-hidden">
                        <Link href={`/server/${server.id}`}>
                          <div className="p-4 flex items-center gap-4">
                            {/* Rank */}
                            <div className="flex-shrink-0 w-16 text-center">
                              <div className="text-3xl font-bold text-gray-500">{index + 1}.</div>
                              {index < 3 && <Trophy className="w-6 h-6 mx-auto text-yellow-500 mt-1" />}
                            </div>
                            
                            {/* Featured Badge */}
                            {index < 6 && (
                              <div className="absolute top-2 left-20">
                                <Badge className="bg-orange-600 text-xs">FEATURED</Badge>
                              </div>
                            )}
                            
                            {/* Banner */}
                            <div className="flex-shrink-0">
                              <img
                                src={server.bannerUrl}
                                alt={server.name}
                                className="w-[300px] lg:w-[468px] h-[60px] object-cover rounded border border-gray-700"
                              />
                            </div>
                            
                            {/* Server Info */}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xl font-bold text-white mb-1 truncate">{server.name}</h3>
                              <p className="text-sm text-gray-400 mb-2 line-clamp-1">{server.shortDescription}</p>
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="outline" className="border-green-600 text-green-400 text-xs">
                                  ☕ Java
                                </Badge>
                                <Badge variant="outline" className="border-green-600 text-green-400 text-xs">
                                  🎮 Bedrock
                                </Badge>
                                <Badge variant="outline" className="border-gray-600 text-gray-400 text-xs">
                                  {server.category}
                                </Badge>
                              </div>
                            </div>
                            
                            {/* Stats */}
                            <div className="flex-shrink-0 text-right space-y-2 hidden md:block">
                              <div className="flex items-center justify-end gap-2">
                                <div className={`w-2 h-2 rounded-full ${server.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className="text-sm font-medium">
                                  {server.onlinePlayers?.toLocaleString() || 0} players
                                </span>
                              </div>
                              <div className="flex items-center justify-end gap-2 text-gray-400">
                                <Users className="w-4 h-4" />
                                <span className="text-xs">
                                  {server.onlinePlayers?.toLocaleString() || 0} / {server.maxPlayers?.toLocaleString() || 0}
                                </span>
                              </div>
                            </div>
                            
                            {/* Vote Button */}
                            <div className="flex-shrink-0">
                              <Button className="bg-green-600 hover:bg-green-700 text-white font-bold px-6">
                                Join Now!
                              </Button>
                              <p className="text-center text-xs text-gray-500 mt-1">{server.ip}</p>
                            </div>
                          </div>
                        </Link>
                      </Card>
                      
                      {/* Between Servers Banner - Show after every 5 servers */}
                      {(index + 1) % 5 === 0 && betweenServersBanners.length > 0 && (
                        <div className="my-4">
                          <a 
                            href={betweenServersBanners[Math.floor(index / 5) % betweenServersBanners.length].linkUrl || '#'} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="block"
                          >
                            <img
                              src={betweenServersBanners[Math.floor(index / 5) % betweenServersBanners.length].imageUrl}
                              alt={betweenServersBanners[Math.floor(index / 5) % betweenServersBanners.length].serverName}
                              className="w-full h-auto rounded-lg border border-gray-700 hover:border-green-500 transition-colors"
                              style={{ maxHeight: '100px' }}
                            />
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar with Banners */}
            {sidebarBanners.length > 0 && (
              <div className="hidden lg:block w-[300px] flex-shrink-0">
                <div className="sticky top-24 space-y-4">
                  <h3 className="text-lg font-bold mb-4">Sponsored</h3>
                  {sidebarBanners.map((banner) => (
                    <a 
                      key={banner.id}
                      href={banner.linkUrl || '#'} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="block"
                    >
                      <img
                        src={banner.imageUrl}
                        alt={banner.serverName}
                        className="w-full h-auto rounded-lg border border-gray-700 hover:border-green-500 transition-colors"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Bottom Banner Ad Section */}
      <section className="py-6 border-t border-gray-800 bg-gradient-to-r from-gray-900/50 to-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            {bottomBanners.length > 0 ? (
              <a href={bottomBanners[0].linkUrl || '#'} target="_blank" rel="noopener noreferrer" className="block">
                <img 
                  src={bottomBanners[0].imageUrl} 
                  alt={bottomBanners[0].serverName}
                  className="max-w-full h-auto rounded-lg border border-gray-700 hover:border-green-500 transition-colors"
                  style={{ maxHeight: '90px' }}
                />
              </a>
            ) : (
              <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-800/50 rounded-lg p-4 text-center w-full max-w-3xl">
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl">🚀</span>
                  <div>
                    <p className="text-purple-400 font-bold">Boost Your Server Visibility!</p>
                    <p className="text-gray-400 text-sm">Premium banner spots available - reach thousands of players daily</p>
                  </div>
                  <Link href="/submit">
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700 ml-4">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          <p>© 2025 Minecraft Server List. All rights reserved.</p>
          <p className="mt-2">Not affiliated with Mojang or Microsoft.</p>
        </div>
      </footer>
    </div>
  )
}
