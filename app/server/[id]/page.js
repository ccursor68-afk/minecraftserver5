'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { Gamepad2, Copy, Check, Users, Wifi, Globe, MessageCircle, ArrowLeft, ExternalLink, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useLanguage } from '@/contexts/LanguageContext'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export default function ServerDetailPage() {
  const params = useParams()
  const { t } = useLanguage()
  const serverId = params?.id
  const [server, setServer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [voting, setVoting] = useState(false)
  const [canVote, setCanVote] = useState(true)
  const [voteTimeLeft, setVoteTimeLeft] = useState(0)
  const [voteDialogOpen, setVoteDialogOpen] = useState(false)
  const [minecraftUsername, setMinecraftUsername] = useState('')
  const [agreePrivacy, setAgreePrivacy] = useState(false)
  const [topVoters, setTopVoters] = useState([])
  
  useEffect(() => {
    if (serverId) {
      fetchServer()
      checkVoteStatus()
      fetchTopVoters()
    }
  }, [serverId])
  
  const fetchServer = async () => {
    try {
      const response = await fetch(`/api/servers/${serverId}`)
      if (response.ok) {
        const data = await response.json()
        setServer(data)
      } else {
        toast.error(t('server.serverNotFound'))
      }
    } catch (error) {
      console.error('Error fetching server:', error)
      toast.error(t('common.errorOccurred'))
    } finally {
      setLoading(false)
    }
  }
  
  const checkVoteStatus = async () => {
    try {
      const response = await fetch(`/api/servers/${serverId}/can-vote`)
      const data = await response.json()
      
      if (response.ok) {
        setCanVote(data.canVote)
        setVoteTimeLeft(data.timeLeft || 0)
      }
    } catch (error) {
      console.error('Check vote error:', error)
    }
  }
  
  const fetchTopVoters = async () => {
    try {
      const response = await fetch(`/api/servers/${serverId}/top-voters`)
      if (response.ok) {
        const data = await response.json()
        setTopVoters(data)
      }
    } catch (error) {
      console.error('Fetch top voters error:', error)
    }
  }
  
  const copyToClipboard = () => {
    if (server) {
      const ipAddress = server.port === 25565 ? server.ip : `${server.ip}:${server.port}`
      navigator.clipboard.writeText(ipAddress)
      setCopied(true)
      toast.success(t('server.copied'))
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
        toast.success(t('server.statusUpdated'))
      }
    } catch (error) {
      console.error('Error refreshing status:', error)
      toast.error(t('common.errorOccurred'))
    } finally {
      setRefreshing(false)
    }
  }
  
  const handleVote = async () => {
    if (!minecraftUsername.trim()) {
      toast.error(t('vote.enterUsernameError'))
      return
    }
    
    if (!agreePrivacy) {
      toast.error(t('vote.agreePrivacyError'))
      return
    }
    
    setVoting(true)
    try {
      const response = await fetch(`/api/servers/${serverId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          minecraftUsername: minecraftUsername.trim()
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success(t('vote.voteSuccess'))
        setCanVote(false)
        setVoteTimeLeft(24 * 60 * 60 * 1000)
        setVoteDialogOpen(false)
        setMinecraftUsername('')
        setAgreePrivacy(false)
        fetchServer()
        fetchTopVoters()
      } else if (response.status === 429) {
        toast.error(data.error)
        setCanVote(false)
      } else {
        toast.error(data.error || t('common.errorOccurred'))
      }
    } catch (error) {
      console.error('Vote error:', error)
      toast.error(t('common.errorOccurred'))
    } finally {
      setVoting(false)
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-green-500"></div>
          <p className="mt-4 text-gray-400">{t('server.loadingServer')}</p>
        </div>
      </div>
    )
  }
  
  if (!server) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-400">{t('server.serverNotFound')}</p>
          <Link href="/">
            <Button className="mt-4 bg-green-600 hover:bg-green-700">
              {t('server.backToHome')}
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
            <LanguageSwitcher />
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
                    <span className="text-sm font-medium">{server.status === 'online' ? t('server.online') : t('server.offline')}</span>
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
                          {t('server.copied')}
                        </>
                      ) : (
                        <>
                          <Copy className="w-5 h-5 mr-2" />
                          {ipAddress}
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-center text-gray-500 mt-2">{t('server.clickToCopy')}</p>
                  </div>
                  
                  {/* Vote Button */}
                  <Dialog open={voteDialogOpen} onOpenChange={setVoteDialogOpen}>
                    <DialogTrigger asChild>
                      <div>
                        <Button
                          disabled={!canVote}
                          className="bg-green-600 hover:bg-green-700 text-white font-bold h-14 px-8"
                        >
                          {canVote ? t('server.voteNow') : `⏰ ${hoursUntilVote}${t('server.hoursLeft')}`}
                        </Button>
                        <p className="text-xs text-center text-gray-500 mt-2">
                          {server.voteCount.toLocaleString()} {t('server.votes')}
                        </p>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="bg-[#0f0f0f] border-gray-800 max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-2xl">{t('vote.title')} {server.name}</DialogTitle>
                        <DialogDescription>
                          {t('vote.description')}
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 py-4">
                        {/* Minecraft Username Input */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">{t('vote.minecraftUsername')}</label>
                          <Input
                            type="text"
                            placeholder={t('vote.enterUsername')}
                            value={minecraftUsername}
                            onChange={(e) => setMinecraftUsername(e.target.value)}
                            className="bg-gray-800 border-gray-700"
                            disabled={voting}
                          />
                          <p className="text-xs text-gray-400">{t('vote.usernameHelp')}</p>
                        </div>
                        
                        {/* Cloudflare Turnstile Placeholder */}
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-center h-16 bg-gray-900 rounded">
                            <p className="text-gray-500 text-sm">{t('vote.captcha')}</p>
                          </div>
                        </div>
                        
                        {/* Privacy Policy Checkbox */}
                        <div className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            id="privacy"
                            checked={agreePrivacy}
                            onChange={(e) => setAgreePrivacy(e.target.checked)}
                            className="mt-1 cursor-pointer"
                            disabled={voting}
                          />
                          <label htmlFor="privacy" className="text-sm text-gray-300 cursor-pointer">
                            {t('vote.agreePrivacy')}
                          </label>
                        </div>
                        
                        {/* Buttons */}
                        <div className="flex gap-2">
                          <Button
                            onClick={handleVote}
                            disabled={voting || !canVote || !minecraftUsername.trim() || !agreePrivacy}
                            className="flex-1 bg-green-600 hover:bg-green-700 h-11 text-base font-semibold"
                          >
                            {voting ? t('vote.voting') : t('vote.voteButton')}
                          </Button>
                          <Button
                            onClick={() => setVoteDialogOpen(false)}
                            variant="outline"
                            disabled={voting}
                            className="flex-1 border-gray-700 hover:bg-gray-800 h-11"
                          >
                            {t('vote.backButton')}
                          </Button>
                        </div>
                        
                        {!canVote && voteTimeLeft > 0 && (
                          <p className="text-center text-sm text-yellow-500">
                            {t('vote.canVoteIn')} {Math.ceil(voteTimeLeft / (1000 * 60 * 60))} {t('vote.hours')}
                          </p>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </Card>
            
            {/* Server Description */}
            <Card className="bg-[#0f0f0f] border-gray-800 p-6">
              <h2 className="text-2xl font-bold mb-4">{t('server.aboutServer')}</h2>
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
                <h3 className="text-xl font-bold">{t('server.serverStats')}</h3>
                <Button
                  onClick={refreshServerStatus}
                  disabled={refreshing}
                  size="sm"
                  variant="ghost"
                  className="hover:bg-gray-800"
                  title={t('server.refreshStatus')}
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Users className="w-5 h-5" />
                    <span>{t('server.playersOnline')}</span>
                  </div>
                  <span className="font-bold text-green-500">
                    {server.onlinePlayers.toLocaleString()} / {server.maxPlayers.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Wifi className="w-5 h-5" />
                    <span>{t('server.status')}</span>
                  </div>
                  <Badge className={server.status === 'online' ? 'bg-green-600' : 'bg-red-600'}>
                    {server.status === 'online' ? t('server.online') : t('server.offline')}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400">
                    <span>🗳️</span>
                    <span>{t('server.totalVotes')}</span>
                  </div>
                  <span className="font-bold text-white">{server.voteCount.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400">
                    <span>📦</span>
                    <span>{t('server.version')}</span>
                  </div>
                  <span className="font-medium text-white">{server.version}</span>
                </div>
              </div>
            </Card>
            
            {/* Social Links */}
            <Card className="bg-[#0f0f0f] border-gray-800 p-6">
              <h3 className="text-xl font-bold mb-4">{t('server.connect')}</h3>
              <div className="space-y-3">
                {server.website && (
                  <a href={server.website} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full justify-start border-gray-700 hover:border-green-500">
                      <Globe className="w-5 h-5 mr-2" />
                      {t('server.website')}
                      <ExternalLink className="w-4 h-4 ml-auto" />
                    </Button>
                  </a>
                )}
                {server.discord && (
                  <a href={server.discord} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full justify-start border-gray-700 hover:border-green-500">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      {t('server.discord')}
                      <ExternalLink className="w-4 h-4 ml-auto" />
                    </Button>
                  </a>
                )}
              </div>
            </Card>
            
            {/* Vote Reward Info */}
            <Card className="bg-gradient-to-br from-green-950/30 to-green-900/10 border-green-800 p-6">
              <h3 className="text-xl font-bold mb-2 text-green-400">{t('server.voteRewards')}</h3>
              <p className="text-sm text-gray-300">
                {t('server.voteRewardsDesc')}
              </p>
            </Card>
            
            {/* Top Voters */}
            <Card className="bg-[#0f0f0f] border-gray-800 p-6">
              <h3 className="text-xl font-bold mb-4">{t('server.topVoters')}</h3>
              {topVoters.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">{t('server.noVotes')}</p>
                  <p className="text-xs mt-1">{t('server.beFirst')}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 pb-2 border-b border-gray-800 text-sm font-semibold text-gray-400">
                    <span>{t('server.nickname')}</span>
                    <span className="text-right">{t('server.voteCount')}</span>
                  </div>
                  {topVoters.map((voter, index) => (
                    <div key={index} className="grid grid-cols-2 gap-2 py-2 border-b border-gray-900/50 hover:bg-gray-900/30">
                      <div className="flex items-center gap-2">
                        {index === 0 && <span className="text-yellow-500">🥇</span>}
                        {index === 1 && <span className="text-gray-400">🥈</span>}
                        {index === 2 && <span className="text-orange-600">🥉</span>}
                        {index > 2 && <span className="text-gray-600 text-sm">#{index + 1}</span>}
                        <span className="font-medium truncate">{voter.minecraftUsername}</span>
                      </div>
                      <span className="text-right text-green-500 font-bold">{voter.voteCount}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
