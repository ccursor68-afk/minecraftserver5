'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Gamepad2, Search, Filter, Trophy, Users, Shield, ExternalLink, Clock, Sparkles, ChevronLeft, ChevronRight, Menu, X as CloseIcon, Facebook, Twitter, Instagram, Youtube, Music } from 'lucide-react'
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
import Footer from '@/components/Footer'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useLanguage } from '@/contexts/LanguageContext'

// Game mode categories
const GAME_MODES = [
  { id: 'all', name: 'all', icon: '🎮' },
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
  { id: 'all', name: 'all', icon: '🎮', color: 'bg-gray-600' },
  { id: 'java', name: 'java', icon: '☕', color: 'bg-orange-600' },
  { id: 'bedrock', name: 'bedrock', icon: '🎮', color: 'bg-green-600' },
  { id: 'crossplay', name: 'crossplay', icon: '🔀', color: 'bg-blue-600' },
]

export default function HomePage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [servers, setServers] = useState([])
  const [featuredServers, setFeaturedServers] = useState([])
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
  const [failedBanners, setFailedBanners] = useState({})
  const [recentServers, setRecentServers] = useState([])
  const [newServerIds, setNewServerIds] = useState(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [socialMedia, setSocialMedia] = useState({})
  const serversPerPage = 10
  const prevServersRef = useRef([])
  
  // Handle banner load error
  const handleBannerError = (serverId) => {
    setFailedBanners(prev => ({ ...prev, [serverId]: true }))
  }
  
  // Format time ago
  const formatTimeAgo = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const seconds = Math.floor((now - date) / 1000)
    
    if (seconds < 60) return `${seconds} ${t('home.secondsAgo')}`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} ${t('home.minutesAgo')}`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} ${t('home.hoursAgo')}`
    const days = Math.floor(hours / 24)
    return `${days} ${t('home.daysAgo')}`
  }
  
  // Update recent servers and detect new ones
  const updateRecentServers = (allServers) => {
    const sorted = [...allServers].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    ).slice(0, 5)
    
    // Check for new servers
    const prevIds = new Set(prevServersRef.current.map(s => s.id))
    const newIds = sorted.filter(s => !prevIds.has(s.id)).map(s => s.id)
    
    if (newIds.length > 0 && prevServersRef.current.length > 0) {
      setNewServerIds(new Set(newIds))
      // Clear animation after 3 seconds
      setTimeout(() => setNewServerIds(new Set()), 3000)
    }
    
    prevServersRef.current = sorted
    setRecentServers(sorted)
  }
  
  useEffect(() => {
    checkUser()
    fetchServers()
    fetchBanners()
    fetchSettings()
    
    // Poll for new servers every 30 seconds
    const interval = setInterval(fetchServers, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings/public')
      if (response.ok) {
        const data = await response.json()
        if (data.socialmedia) {
          setSocialMedia(data.socialmedia)
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }
  
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
        
        // Separate featured/sponsored servers (max 3)
        const featured = data
          .filter(s => s.isfeatured === true)
          .slice(0, 3)
        
        setFeaturedServers(featured)
        setServers(data)
        updateRecentServers(data)
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
  
  const filteredServers = servers.filter(server => {
    const matchesSearch = server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         server.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || server.category === categoryFilter
    // Platform filter logic - for now we show all since platform info might not be stored
    const matchesPlatform = platformFilter === 'all' || true
    return matchesSearch && matchesCategory && matchesPlatform
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredServers.length / serversPerPage)
  const indexOfLastServer = currentPage * serversPerPage
  const indexOfFirstServer = indexOfLastServer - serversPerPage
  const currentServers = filteredServers.slice(indexOfFirstServer, indexOfLastServer)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, categoryFilter, platformFilter])

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getGameModeName = (mode) => {
    if (mode.id === 'all') return t('gameModes.all')
    return t(`gameModes.${mode.id}`) || mode.name
  }

  const getPlatformName = (platform) => {
    return t(`platforms.${platform.id}`) || platform.name
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#0a0a0a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="ServerListRank" className="w-11 h-11 object-contain" />
              <div>
                <h1 className="text-2xl font-bold text-green-500">ServerListRank</h1>
                <p className="text-xs text-gray-400">{t('home.subtitle')}</p>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link href="/" className="text-green-500 hover:text-green-400 transition-colors">
                🎮 {t('nav.servers')}
              </Link>
              <Link href="/hostings" className="text-gray-400 hover:text-green-400 transition-colors">
                🖥️ Hostingler
              </Link>
              <Link href="/pricing" className="text-gray-400 hover:text-green-400 transition-colors">
                💎 {t('pricing.title')}
              </Link>
              <Link href="/blog" className="text-gray-400 hover:text-green-400 transition-colors">
                📰 {t('nav.blog')}
              </Link>
              {user && (
                <Link href="/tickets" className="text-gray-400 hover:text-green-400 transition-colors">
                  🎫 {t('nav.support')}
                </Link>
              )}
              {userRole === 'admin' && (
                <Link href="/admin" className="text-yellow-500 hover:text-yellow-400 transition-colors">
                  <Shield className="w-4 h-4 inline mr-1" />
                  {t('nav.admin')}
                </Link>
              )}
            </nav>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <UserMenu />
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-400 hover:text-green-500"
              >
                {mobileMenuOpen ? <CloseIcon className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-800 mt-4 py-4 space-y-3">
              <Link 
                href="/" 
                className="block px-4 py-2 text-green-500 hover:bg-gray-800 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                🎮 {t('nav.servers')}
              </Link>
              <Link 
                href="/hostings" 
                className="block px-4 py-2 text-gray-400 hover:bg-gray-800 hover:text-green-400 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                🖥️ Hostingler
              </Link>
              <Link 
                href="/pricing" 
                className="block px-4 py-2 text-gray-400 hover:bg-gray-800 hover:text-green-400 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                💎 {t('pricing.title')}
              </Link>
              <Link 
                href="/blog" 
                className="block px-4 py-2 text-gray-400 hover:bg-gray-800 hover:text-green-400 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                📰 {t('nav.blog')}
              </Link>
              {user && (
                <Link 
                  href="/tickets" 
                  className="block px-4 py-2 text-gray-400 hover:bg-gray-800 hover:text-green-400 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  🎫 {t('nav.support')}
                </Link>
              )}
              {userRole === 'admin' && (
                <Link 
                  href="/admin" 
                  className="block px-4 py-2 text-yellow-500 hover:bg-gray-800 hover:text-yellow-400 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Shield className="w-4 h-4 inline mr-1" />
                  {t('nav.admin')}
                </Link>
              )}
            </div>
          )}
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
                    <p className="text-green-400 font-bold">{t('home.advertise')}</p>
                    <p className="text-gray-400 text-sm">{t('home.advertiseDesc')}</p>
                  </div>
                  <Link href="/submit">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 ml-4">
                      {t('home.getFeatured')}
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Hero Section with Minecraft Background */}
      <section className="relative py-16 border-b border-gray-800 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("/minecraft-hero-bg.png")',
          }}
        />
        {/* Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#0a0a0a]" />
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-5xl font-bold drop-shadow-lg">
              <span className="text-white">{t('home.heroTitle')}</span>
              <br />
              <span className="text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]">{t('home.heroTitle2')}</span>
            </h2>
            <p className="text-xl text-gray-200 drop-shadow-md">
              {t('home.heroSubtitle')}
            </p>
            
            {/* Search Bar */}
            <div className="flex gap-2 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder={t('home.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-900/80 backdrop-blur-sm border-gray-700 focus:border-green-500 text-white"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px] bg-gray-900/80 backdrop-blur-sm border-gray-700">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GAME_MODES.map(mode => (
                    <SelectItem key={mode.id} value={mode.id}>
                      {mode.icon} {getGameModeName(mode)}
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
            <p className="text-sm text-gray-400 mb-4">{t('home.filterByPlatform')}</p>
            <div className="flex justify-center gap-3 flex-wrap">
              {PLATFORMS.map(platform => (
                <Button
                  key={platform.id}
                  onClick={() => setPlatformFilter(platform.id)}
                  className={`${platformFilter === platform.id ? platform.color : 'bg-gray-700'} hover:opacity-90`}
                >
                  {platform.icon} {getPlatformName(platform)}
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
              {/* Sponsored Servers Section */}
              {!loading && featuredServers.length > 0 && (
                <div className="mb-12">
                  <h3 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-pink-500 via-purple-500 to-violet-600 bg-clip-text text-transparent">
                    {t('home.sponsoredServers')}
                  </h3>
                  
                  <div className="space-y-4">
                    {featuredServers.map((server, index) => (
                      <div key={server.id}>
                        <Card className="bg-gradient-to-r from-purple-900/20 via-[#0f0f0f] to-[#0f0f0f] border-pink-500/50 hover:border-pink-400 transition-all hover:shadow-lg hover:shadow-pink-500/30 relative overflow-hidden">
                          {/* Sponsor Badge */}
                          <div className="absolute top-0 right-0 bg-gradient-to-r from-pink-500 via-purple-500 to-violet-600 px-4 py-1 text-xs font-bold text-white shadow-lg">
                            {t('home.featured')}
                          </div>
                          
                          <Link href={`/server/${server.id}`}>
                            <div className="p-4 flex items-center gap-4 pt-8">
                              {/* Featured Icon */}
                              <div className="flex-shrink-0 w-16 text-center">
                                <div className="text-3xl">⭐</div>
                              </div>
                              
                              {/* Server Icon from mcstatus.io */}
                              <div className="flex-shrink-0">
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg bg-gradient-to-br from-pink-600 via-purple-600 to-violet-700 flex items-center justify-center text-2xl md:text-3xl font-bold text-white shadow-lg border-2 border-pink-500/50 overflow-hidden">
                                  <img 
                                    src={`https://api.mcstatus.io/v2/icon/${server.ip}${server.port !== 25565 ? ':' + server.port : ''}`}
                                    alt={`${server.name} icon`}
                                    className="w-full h-full object-cover"
                                    crossOrigin="anonymous"
                                    onError={(e) => {
                                      e.target.style.display = 'none'
                                      if (e.target.nextSibling) {
                                        e.target.nextSibling.style.display = 'flex'
                                      }
                                    }}
                                  />
                                  <span className="hidden items-center justify-center w-full h-full">
                                    {server.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Banner */}
                              <div className="flex-shrink-0">
                                {server.bannerUrl && !failedBanners[server.id] ? (
                                  <img
                                    src={server.bannerUrl}
                                    alt={server.name}
                                    className="w-[300px] lg:w-[468px] h-[60px] object-cover rounded border border-pink-500/70"
                                    onError={() => handleBannerError(server.id)}
                                  />
                                ) : (
                                  <div className="relative w-[300px] lg:w-[468px] h-[60px] rounded border border-pink-500/70 overflow-hidden">
                                    <img
                                      src="/placeholder-banner.png"
                                      alt="Placeholder"
                                      className="absolute inset-0 w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 flex items-center px-4">
                                      <div className="flex items-center gap-3">
                                        <span className="text-xl">⛏️</span>
                                        <span className="font-bold text-white text-lg tracking-wide" style={{
                                          textShadow: '2px 2px 4px #000, -1px -1px 2px #000, 1px 1px 2px rgba(236,72,153,0.5)'
                                        }}>
                                          {server.name}
                                        </span>
                                        <span className="text-xl">🎮</span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {/* Server Info */}
                              <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-bold text-white mb-1 truncate">{server.name}</h3>
                                <p className="text-sm text-gray-400 mb-2 line-clamp-1">{server.shortDescription}</p>
                                <div className="flex flex-wrap gap-2">
                                  <Badge variant="outline" className="border-pink-600 text-pink-400 text-xs">
                                    ☕ Java
                                  </Badge>
                                  <Badge variant="outline" className="border-purple-600 text-purple-400 text-xs">
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
                                  <div className={`w-2 h-2 rounded-full ${server.status === 'online' ? 'bg-pink-500' : 'bg-red-500'}`}></div>
                                  <span className="text-sm font-medium">
                                    {server.onlinePlayers?.toLocaleString() || 0} {t('home.players')}
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
                                <Button className="bg-gradient-to-r from-pink-600 via-purple-600 to-violet-600 hover:from-pink-700 hover:via-purple-700 hover:to-violet-700 text-white font-bold px-6 shadow-lg shadow-pink-500/30">
                                  {t('home.joinNow')}
                                </Button>
                                <p className="text-center text-xs text-gray-500 mt-1">{server.ip}</p>
                              </div>
                            </div>
                          </Link>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Regular Top Servers Section */}
              <h3 className="text-2xl font-bold mb-6 text-center">{t('home.topServers')}</h3>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-green-500"></div>
                  <p className="mt-4 text-gray-400">{t('home.loading')}</p>
                </div>
              ) : filteredServers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg">{t('home.noServers')}</p>
                  <p className="text-gray-500 text-sm mt-2">{t('home.adjustFilters')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentServers.map((server, index) => (
                    <div key={server.id}>
                      <Card className="bg-[#0f0f0f] border-gray-800 hover:border-green-500/50 transition-all hover:shadow-lg hover:shadow-green-500/10 relative overflow-hidden">
                        <Link href={`/server/${server.id}`}>
                          <div className="p-4 flex items-center gap-4">
                            {/* Rank */}
                            <div className="flex-shrink-0 w-16 text-center">
                              <div className="text-3xl font-bold text-gray-500">{indexOfFirstServer + index + 1}.</div>
                              {(indexOfFirstServer + index) < 3 && <Trophy className="w-6 h-6 mx-auto text-yellow-500 mt-1" />}
                            </div>
                            
                            {/* Featured Badge - ÖNE ÇIKAN (First 3 servers only) */}
                            {(indexOfFirstServer + index) < 3 && (
                              <div className="absolute top-2 left-20">
                                <Badge className="bg-gradient-to-r from-orange-500 to-amber-600 text-white text-xs font-bold shadow-lg">
                                  ÖNE ÇIKAN
                                </Badge>
                              </div>
                            )}
                            
                            {/* Server Icon from mcstatus.io */}
                            <div className="flex-shrink-0">
                              <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center text-2xl md:text-3xl font-bold text-white shadow-lg border-2 border-green-500/30 overflow-hidden">
                                <img 
                                  src={`https://api.mcstatus.io/v2/icon/${server.ip}${server.port !== 25565 ? ':' + server.port : ''}`}
                                  alt={`${server.name} icon`}
                                  className="w-full h-full object-cover"
                                  crossOrigin="anonymous"
                                  onError={(e) => {
                                    e.target.style.display = 'none'
                                    if (e.target.nextSibling) {
                                      e.target.nextSibling.style.display = 'flex'
                                    }
                                  }}
                                />
                                <span className="hidden items-center justify-center w-full h-full">
                                  {server.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            
                            {/* Banner */}
                            <div className="flex-shrink-0">
                              {server.bannerUrl && !failedBanners[server.id] ? (
                                <img
                                  src={server.bannerUrl}
                                  alt={server.name}
                                  className="w-[300px] lg:w-[468px] h-[60px] object-cover rounded border border-gray-700"
                                  onError={() => handleBannerError(server.id)}
                                />
                              ) : (
                                <div className="relative w-[300px] lg:w-[468px] h-[60px] rounded border border-gray-700 overflow-hidden">
                                  {/* AI Generated Placeholder Banner */}
                                  <img
                                    src="/placeholder-banner.png"
                                    alt="Placeholder"
                                    className="absolute inset-0 w-full h-full object-cover"
                                  />
                                  {/* Server name overlay */}
                                  <div className="absolute inset-0 flex items-center px-4">
                                    <div className="flex items-center gap-3">
                                      <span className="text-xl">⛏️</span>
                                      <span className="font-bold text-white text-lg tracking-wide" style={{
                                        textShadow: '2px 2px 4px #000, -1px -1px 2px #000, 1px 1px 2px rgba(74,222,128,0.5)'
                                      }}>
                                        {server.name}
                                      </span>
                                      <span className="text-xl">🎮</span>
                                    </div>
                                  </div>
                                </div>
                              )}
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
                                  {server.onlinePlayers?.toLocaleString() || 0} {t('home.players')}
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
                                {t('home.joinNow')}
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

              {/* Pagination */}
              {!loading && filteredServers.length > 0 && totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  {/* Previous Button */}
                  <Button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    variant="outline"
                    className="border-gray-700 hover:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    {t('home.previous')}
                  </Button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                      // Show first page, last page, current page, and pages around current
                      const showPage = 
                        pageNum === 1 || 
                        pageNum === totalPages || 
                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                      
                      // Show ellipsis
                      const showEllipsisBefore = pageNum === currentPage - 2 && currentPage > 3
                      const showEllipsisAfter = pageNum === currentPage + 2 && currentPage < totalPages - 2

                      if (showEllipsisBefore || showEllipsisAfter) {
                        return <span key={pageNum} className="text-gray-500 px-2">...</span>
                      }

                      if (!showPage) return null

                      return (
                        <Button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          className={
                            currentPage === pageNum
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : "border-gray-700 hover:border-green-500"
                          }
                          size="sm"
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>

                  {/* Next Button */}
                  <Button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    className="border-gray-700 hover:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('home.next')}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}

              {/* Page Info */}
              {!loading && filteredServers.length > 0 && (
                <div className="mt-4 text-center text-sm text-gray-500">
                  {t('home.showing')} {indexOfFirstServer + 1}-{Math.min(indexOfLastServer, filteredServers.length)} {t('home.of')} {filteredServers.length}
                </div>
              )}
            </div>

            {/* Sidebar with Banners and Recent Servers */}
            <div className="hidden lg:block w-[300px] flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                {/* Sponsored Banners */}
                {sidebarBanners.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold mb-4">{t('home.sponsored')}</h3>
                    {sidebarBanners.map((banner) => (
                      <a 
                        key={banner.id}
                        href={banner.linkUrl || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="block mb-4"
                      >
                        <img
                          src={banner.imageUrl}
                          alt={banner.serverName}
                          className="w-full h-auto rounded-lg border border-gray-700 hover:border-green-500 transition-colors"
                        />
                      </a>
                    ))}
                  </div>
                )}
                
                {/* Recently Added Servers */}
                <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-lg font-bold text-white">{t('home.recentlyAdded')}</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {recentServers.map((server, index) => (
                      <Link 
                        key={server.id} 
                        href={`/server/${server.id}`}
                        className={`block transition-all duration-500 ${
                          newServerIds.has(server.id) 
                            ? 'animate-slideDown bg-green-900/30 border-green-500' 
                            : 'bg-gray-800/50 border-gray-700'
                        } rounded-lg border p-3 hover:border-green-500 hover:bg-gray-800`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Server Icon from mcstatus.io */}
                          <div className="flex-shrink-0">
                            <div className="relative w-12 h-12 rounded-lg bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center text-lg font-bold text-white shadow-md border border-green-500/30 overflow-hidden">
                              <img 
                                src={`https://api.mcstatus.io/v2/icon/${server.ip}${server.port !== 25565 ? ':' + server.port : ''}`}
                                alt={`${server.name} icon`}
                                className="w-full h-full object-cover"
                                crossOrigin="anonymous"
                                onError={(e) => {
                                  e.target.style.display = 'none'
                                  if (e.target.nextSibling) {
                                    e.target.nextSibling.style.display = 'flex'
                                  }
                                }}
                              />
                              <span className="hidden items-center justify-center w-full h-full">
                                {server.name.charAt(0).toUpperCase()}
                              </span>
                              {/* Rank badge */}
                              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center text-xs font-bold text-gray-900 shadow-md">
                                {index + 1}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            {/* Server name */}
                            <h4 className="font-semibold text-white text-sm truncate flex items-center gap-1">
                              {newServerIds.has(server.id) && (
                                <span className="text-yellow-500 text-xs">✨</span>
                              )}
                              {server.name}
                            </h4>
                            
                            {/* Category badge */}
                            <Badge variant="outline" className="text-xs mt-1 border-gray-600 text-gray-400">
                              {server.category}
                            </Badge>
                            
                            {/* Time ago */}
                            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>{formatTimeAgo(server.createdAt)}</span>
                            </div>
                          </div>
                          
                          {/* Online status */}
                          <div className="flex-shrink-0">
                            <div className={`w-2 h-2 rounded-full ${
                              server.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                            }`} />
                          </div>
                        </div>
                      </Link>
                    ))}
                    
                    {recentServers.length === 0 && (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        {t('home.noServersYet')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Social Media Links */}
                {Object.keys(socialMedia).length > 0 && (
                  <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
                    <h3 className="text-lg font-bold text-white mb-4">Bizi Takip Edin</h3>
                    <div className="flex flex-wrap gap-3">
                      {socialMedia.discord && (
                        <a
                          href={socialMedia.discord}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] transition-colors"
                          title="Discord"
                        >
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                          </svg>
                        </a>
                      )}
                      {socialMedia.twitter && (
                        <a
                          href={socialMedia.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#1DA1F2] hover:bg-[#1a8cd8] transition-colors"
                          title="Twitter"
                        >
                          <Twitter className="w-5 h-5 text-white" />
                        </a>
                      )}
                      {socialMedia.facebook && (
                        <a
                          href={socialMedia.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#1877F2] hover:bg-[#166fe5] transition-colors"
                          title="Facebook"
                        >
                          <Facebook className="w-5 h-5 text-white" />
                        </a>
                      )}
                      {socialMedia.instagram && (
                        <a
                          href={socialMedia.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 hover:opacity-90 transition-opacity"
                          title="Instagram"
                        >
                          <Instagram className="w-5 h-5 text-white" />
                        </a>
                      )}
                      {socialMedia.youtube && (
                        <a
                          href={socialMedia.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#FF0000] hover:bg-[#cc0000] transition-colors"
                          title="YouTube"
                        >
                          <Youtube className="w-5 h-5 text-white" />
                        </a>
                      )}
                      {socialMedia.tiktok && (
                        <a
                          href={socialMedia.tiktok}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-10 h-10 rounded-lg bg-black hover:bg-gray-900 transition-colors"
                          title="TikTok"
                        >
                          <Music className="w-5 h-5 text-white" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
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
                    <p className="text-purple-400 font-bold">{t('home.boostVisibility')}</p>
                    <p className="text-gray-400 text-sm">{t('home.boostDesc')}</p>
                  </div>
                  <Link href="/submit">
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700 ml-4">
                      {t('home.learnMore')}
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  )
}
