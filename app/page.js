'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Gamepad2, Search, Filter, Trophy, Users, Wifi, RefreshCw, Plus } from 'lucide-react'
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

export default function HomePage() {
  const [servers, setServers] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  
  useEffect(() => {
    fetchServers()
  }, [])
  
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
  
  const refreshServerStatuses = async () => {
    setRefreshing(true)
    toast.info('Refreshing server statuses...')
    
    try {
      // Refresh status for each server
      const updates = await Promise.all(
        servers.map(async (server) => {
          try {
            const response = await fetch(`/api/servers/${server.id}/status`)
            if (response.ok) {
              const status = await response.json()
              return { id: server.id, ...status }
            }
          } catch (error) {
            console.error(`Error refreshing ${server.id}:`, error)
          }
          return null
        })
      )
      
      // Update servers with new status
      setServers(prevServers => 
        prevServers.map(server => {
          const update = updates.find(u => u && u.id === server.id)
          if (update) {
            return {
              ...server,
              status: update.online ? 'online' : 'offline',
              onlinePlayers: update.players?.online || 0,
              maxPlayers: update.players?.max || 0
            }
          }
          return server
        })
      )
      
      toast.success('Server statuses refreshed!')
    } catch (error) {
      console.error('Error refreshing statuses:', error)
      toast.error('Failed to refresh statuses')
    } finally {
      setRefreshing(false)
    }
  }
  
  const filteredServers = servers.filter(server => {
    const matchesSearch = server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         server.shortDescription.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || server.category === categoryFilter
    return matchesSearch && matchesCategory
  })
  
  const categories = ['all', ...new Set(servers.map(s => s.category))]
  
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
                🎮 Minecraft Server List
              </Link>
              <Link href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                💬 Discord
              </Link>
              <Link href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                📝 Blog
              </Link>
              <Link href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                ⭐ Featured
              </Link>
            </nav>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="border-gray-700 hover:border-green-500">
                🚪 Login
              </Button>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                👤 Create Account
              </Button>
            </div>
          </div>
        </div>
      </header>
      
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
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>
      
      {/* Platform Filter */}
      <section className="py-8 border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-4">Filter by Platform</p>
            <div className="flex justify-center gap-3">
              <Button className="bg-orange-600 hover:bg-orange-700">
                ☕ Java
              </Button>
              <Button className="bg-green-600 hover:bg-green-700">
                🎮 Bedrock
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                🔀 Crossplay
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Server List */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold mb-6 text-center">🏆 Top Minecraft Servers</h3>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-green-500"></div>
              <p className="mt-4 text-gray-400">Loading servers...</p>
            </div>
          ) : filteredServers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No servers found</p>
            </div>
          ) : (
            <div className="space-y-4 max-w-5xl mx-auto">
              {filteredServers.map((server, index) => (
                <Card key={server.id} className="bg-[#0f0f0f] border-gray-800 hover:border-green-500/50 transition-all hover:shadow-lg hover:shadow-green-500/10">
                  <Link href={`/server/${server.id}`}>
                    <div className="p-4 flex items-center gap-4">
                      {/* Rank */}
                      <div className="flex-shrink-0 w-16 text-center">
                        <div className="text-3xl font-bold text-gray-500">{index + 1}.</div>
                        {index < 3 && <Trophy className="w-6 h-6 mx-auto text-yellow-500 mt-1" />}
                      </div>
                      
                      {/* Featured Badge */}
                      {index < 6 && (
                        <div className="absolute top-4 left-20">
                          <Badge className="bg-orange-600 text-xs">FEATURED</Badge>
                        </div>
                      )}
                      
                      {/* Banner */}
                      <div className="flex-shrink-0">
                        <img
                          src={server.bannerUrl}
                          alt={server.name}
                          className="w-[468px] h-[60px] object-cover rounded border border-gray-700"
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
                      <div className="flex-shrink-0 text-right space-y-2">
                        <div className="flex items-center justify-end gap-2">
                          <div className={`w-2 h-2 rounded-full ${server.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-sm font-medium">
                            {server.onlinePlayers.toLocaleString()} players online
                          </span>
                        </div>
                        <div className="flex items-center justify-end gap-2 text-gray-400">
                          <Users className="w-4 h-4" />
                          <span className="text-xs">
                            {server.onlinePlayers.toLocaleString()} / {server.maxPlayers.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      
                      {/* Vote Button */}
                      <div className="flex-shrink-0">
                        <Link href={`/server/${server.id}`}>
                          <Button className="bg-green-600 hover:bg-green-700 text-white font-bold px-6">
                            Join Now!
                          </Button>
                        </Link>
                        <p className="text-center text-xs text-gray-500 mt-1">{server.ip}</p>
                      </div>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          )}
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