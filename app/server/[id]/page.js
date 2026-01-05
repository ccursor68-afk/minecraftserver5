'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { Gamepad2, Copy, Check, Users, Wifi, Globe, MessageCircle, ArrowLeft, ExternalLink, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export default function ServerDetailPage({ params }) {
  const resolvedParams = use(params)
  const serverId = resolvedParams.id
  const [server, setServer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [voting, setVoting] = useState(false)
  const [canVote, setCanVote] = useState(true)
  const [voteTimeLeft, setVoteTimeLeft] = useState(0)
  const [voteDialogOpen, setVoteDialogOpen] = useState(false)
  
  useEffect(() => {
    if (serverId) {
      fetchServer()
      checkVoteStatus()
    }
  }, [serverId])
  
  const fetchServer = async () => {
    try {
      const response = await fetch(`/api/servers/${serverId}`)
      if (response.ok) {
        const data = await response.json()
        setServer(data)
      } else {
        toast.error('Server not found')
      }
    } catch (error) {
      console.error('Error fetching server:', error)
      toast.error('Failed to load server')
    } finally {
      setLoading(false)
    }
  }
  
  const checkVoteStatus = async () => {
    try {
      const response = await fetch(`/api/servers/${serverId}/can-vote`)
      if (response.ok) {
        const data = await response.json()
        setCanVote(data.canVote)
        setVoteTimeLeft(data.timeUntilNextVote)
      }
    } catch (error) {
      console.error('Error checking vote status:', error)
    }
  }
  
  const copyToClipboard = () => {
    if (server) {
      const ipAddress = server.port === 25565 ? server.ip : `${server.ip}:${server.port}`
      navigator.clipboard.writeText(ipAddress)
      setCopied(true)
      toast.success('IP copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    }
  }
  
  const refreshServerStatus = async () => {
    if (!serverId) return
    
    setRefreshing(true)
    try {
      const response = await fetch(`/api/servers/${serverId}/status`)
      if (response.ok) {
        const status = await response.json()
        setServer(prev => ({
          ...prev,
          status: status.online ? 'online' : 'offline',
          onlinePlayers: status.players?.online || 0,
          maxPlayers: status.players?.max || 0
        }))
        toast.success('Server status updated!')
      }
    } catch (error) {
      console.error('Error refreshing status:', error)
      toast.error('Failed to refresh status')
    } finally {
      setRefreshing(false)
    }
  }
  
  const handleVote = async () => {
    if (!canVote) {
      const hoursLeft = Math.ceil(voteTimeLeft / (1000 * 60 * 60))
      toast.error(`You can vote again in ${hoursLeft} hours`)
      return
    }
    
    setVoting(true)
    try {
      const response = await fetch(`/api/servers/${serverId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'Anonymous',
          recaptchaToken: null // TODO: Add when user provides reCAPTCHA key
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success('Vote recorded! Thank you for voting! 🎉')
        setCanVote(false)
        setVoteTimeLeft(24 * 60 * 60 * 1000)
        setVoteDialogOpen(false)
        // Refresh server data to show updated vote count
        fetchServer()
      } else if (response.status === 429) {
        toast.error(data.error)
        setCanVote(false)
      } else {
        toast.error(data.error || 'Failed to vote')
      }
    } catch (error) {
      console.error('Vote error:', error)
      toast.error('Failed to vote. Please try again.')
    } finally {
      setVoting(false)
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-green-500"></div>
          <p className="mt-4 text-gray-400">Loading server...</p>
        </div>
      </div>
    )
  }
  
  if (!server) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-400">Server not found</p>
          <Link href="/">
            <Button className="mt-4 bg-green-600 hover:bg-green-700">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }
  
  const ipAddress = server.port === 25565 ? server.ip : `${server.ip}:${server.port}`
  const hoursUntilVote = Math.ceil(voteTimeLeft / (1000 * 60 * 60))
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#0a0a0a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-5 h-5 text-green-500" />
              <Gamepad2 className="w-8 h-8 text-green-500" />
              <div>
                <h1 className="text-2xl font-bold text-green-500">MINECRAFT SERVER LIST</h1>
              </div>
            </Link>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Server Banner */}
            <Card className="bg-[#0f0f0f] border-gray-800 overflow-hidden">
              <img
                src={server.bannerUrl}
                alt={server.name}
                className="w-full h-32 object-cover border-b border-gray-800"
              />
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{server.name}</h1>
                    <p className="text-gray-400">{server.shortDescription}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${server.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm font-medium">{server.status}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className="border-green-600 text-green-400">
                    ☕ Java
                  </Badge>
                  <Badge variant="outline" className="border-green-600 text-green-400">
                    🎮 Bedrock
                  </Badge>
                  <Badge variant="outline" className="border-gray-600 text-gray-400">
                    {server.category}
                  </Badge>
                  <Badge variant="outline" className="border-gray-600 text-gray-400">
                    v{server.version}
                  </Badge>
                </div>
                
                {/* Copy IP Button */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Button
                      onClick={copyToClipboard}
                      className="w-full bg-gray-800 hover:bg-gray-700 text-white font-mono text-lg h-14"
                    >
                      {copied ? (
                        <>
                          <Check className="w-5 h-5 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-5 h-5 mr-2" />
                          {ipAddress}
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-center text-gray-500 mt-2">Click to copy server IP</p>
                  </div>
                  
                  {/* Vote Button */}
                  <Dialog open={voteDialogOpen} onOpenChange={setVoteDialogOpen}>
                    <DialogTrigger asChild>
                      <div>
                        <Button
                          disabled={!canVote}
                          className="bg-green-600 hover:bg-green-700 text-white font-bold h-14 px-8"
                        >
                          {canVote ? '🗳️ Vote Now!' : `⏰ ${hoursUntilVote}h left`}
                        </Button>
                        <p className="text-xs text-center text-gray-500 mt-2">
                          {server.voteCount.toLocaleString()} votes
                        </p>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="bg-[#0f0f0f] border-gray-800">
                      <DialogHeader>
                        <DialogTitle className="text-2xl">Vote for {server.name}</DialogTitle>
                        <DialogDescription>
                          Support this server by voting! You can vote once every 24 hours.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 py-4">
                        {/* reCAPTCHA Placeholder */}
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
                          <p className="text-gray-400 text-sm mb-2">reCAPTCHA verification</p>
                          <div className="bg-gray-900 h-20 rounded flex items-center justify-center">
                            <p className="text-gray-500 text-xs">reCAPTCHA will appear here when configured</p>
                          </div>
                        </div>
                        
                        <Button
                          onClick={handleVote}
                          disabled={voting || !canVote}
                          className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg font-bold"
                        >
                          {voting ? 'Voting...' : '🗳️ Confirm Vote'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </Card>
            
            {/* Server Description */}
            <Card className="bg-[#0f0f0f] border-gray-800 p-6">
              <h2 className="text-2xl font-bold mb-4">About This Server</h2>
              <div className="prose prose-invert prose-green max-w-none">
                <ReactMarkdown>{server.longDescription}</ReactMarkdown>
              </div>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Server Stats */}
            <Card className="bg-[#0f0f0f] border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Server Stats</h3>
                <Button
                  onClick={refreshServerStatus}
                  disabled={refreshing}
                  size="sm"
                  variant="ghost"
                  className="hover:bg-gray-800"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Users className="w-5 h-5" />
                    <span>Players Online</span>
                  </div>
                  <span className="font-bold text-green-500">
                    {server.onlinePlayers.toLocaleString()} / {server.maxPlayers.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Wifi className="w-5 h-5" />
                    <span>Status</span>
                  </div>
                  <Badge className={server.status === 'online' ? 'bg-green-600' : 'bg-red-600'}>
                    {server.status}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400">
                    <span>🗳️</span>
                    <span>Total Votes</span>
                  </div>
                  <span className="font-bold text-white">{server.voteCount.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400">
                    <span>📦</span>
                    <span>Version</span>
                  </div>
                  <span className="font-medium text-white">{server.version}</span>
                </div>
              </div>
            </Card>
            
            {/* Social Links */}
            <Card className="bg-[#0f0f0f] border-gray-800 p-6">
              <h3 className="text-xl font-bold mb-4">Connect</h3>
              <div className="space-y-3">
                {server.website && (
                  <a href={server.website} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full justify-start border-gray-700 hover:border-green-500">
                      <Globe className="w-5 h-5 mr-2" />
                      Website
                      <ExternalLink className="w-4 h-4 ml-auto" />
                    </Button>
                  </a>
                )}
                {server.discord && (
                  <a href={server.discord} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full justify-start border-gray-700 hover:border-green-500">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Discord
                      <ExternalLink className="w-4 h-4 ml-auto" />
                    </Button>
                  </a>
                )}
              </div>
            </Card>
            
            {/* Vote Reward Info */}
            <Card className="bg-gradient-to-br from-green-950/30 to-green-900/10 border-green-800 p-6">
              <h3 className="text-xl font-bold mb-2 text-green-400">🎁 Vote Rewards</h3>
              <p className="text-sm text-gray-300">
                Vote for this server to receive in-game rewards! Rewards are delivered automatically via Votifier.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}