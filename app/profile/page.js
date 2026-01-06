'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Calendar, Mail, Edit, Server, Activity, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { useLanguage } from '@/contexts/LanguageContext'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function ProfilePage() {
  const router = useRouter()
  const { t, locale } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [profile, setProfile] = useState(null)
  const [servers, setServers] = useState([])
  const [activities, setActivities] = useState([])
  const [minecraftUsername, setMinecraftUsername] = useState('')
  
  useEffect(() => {
    checkAuth()
  }, [])
  
  const checkAuth = async () => {
    try {
      const supabase = createBrowserSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }
      
      await Promise.all([
        fetchProfile(),
        fetchServers(),
        fetchActivity()
      ])
    } catch (error) {
      console.error('Auth error:', error)
      router.push('/auth/login')
    }
  }
  
  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setMinecraftUsername(data.minecraftUsername || '')
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const fetchServers = async () => {
    try {
      const response = await fetch('/api/servers/my')
      if (response.ok) {
        const data = await response.json()
        setServers(data)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }
  
  const fetchActivity = async () => {
    try {
      const response = await fetch('/api/profile/activity?limit=5')
      if (response.ok) {
        const data = await response.json()
        setActivities(data)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }
  
  const handleUpdateMinecraft = async () => {
    if (minecraftUsername === profile?.minecraftUsername) {
      toast.info(t('profile.noChange'))
      return
    }
    
    setSaving(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minecraftUsername })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success(t('profile.updated'))
        await fetchProfile()
        window.dispatchEvent(new Event('profileUpdated'))
        setTimeout(() => window.location.reload(), 500)
      } else {
        toast.error(data.error || t('profile.updateFailed'))
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error(t('common.errorOccurred'))
    } finally {
      setSaving(false)
    }
  }
  
  const deleteServer = async (serverId, serverName) => {
    if (!confirm(`"${serverName}" ${t('profile.deleteConfirm')}`)) {
      return
    }
    
    setDeleting(serverId)
    try {
      const response = await fetch(`/api/servers/my/${serverId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        toast.success(t('profile.deleteSuccess'))
        fetchServers()
        fetchProfile()
        fetchActivity()
      } else {
        const error = await response.json()
        toast.error(error.error || t('profile.deleteError'))
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error(t('common.errorOccurred'))
    } finally {
      setDeleting(null)
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-green-500"></div>
          <p className="mt-4 text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    )
  }
  
  const avatarUrl = profile?.minecraftUsername 
    ? `https://mc-heads.net/avatar/${profile.minecraftUsername}/128`
    : 'https://mc-heads.net/avatar/MHF_Steve/128'
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] py-12">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">{t('profile.title')}</h1>
          <Link href="/">
            <Button variant="outline" className="border-gray-700">{t('common.homePage')}</Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <Card className="bg-[#0f0f0f] border-gray-800 p-6">
              <div className="text-center mb-6">
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-32 h-32 mx-auto rounded-lg border-4 border-green-500 mb-4"
                  onError={(e) => {
                    e.target.src = 'https://mc-heads.net/avatar/MHF_Steve/128'
                  }}
                />
                <h2 className="text-2xl font-bold">{profile?.username}</h2>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mt-2">
                  <Calendar className="w-4 h-4" />
                  <span>{t('profile.memberSince')} {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="minecraft">{t('profile.minecraftUsername')}</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="minecraft"
                      value={minecraftUsername}
                      onChange={(e) => setMinecraftUsername(e.target.value)}
                      placeholder="Steve"
                      className="bg-gray-800 border-gray-700"
                    />
                    <Button 
                      onClick={handleUpdateMinecraft}
                      disabled={saving}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {saving ? t('profile.saving') : t('profile.save')}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{t('profile.avatarHelp')}</p>
                </div>
                
                <div className="pt-4 border-t border-gray-700">
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <Mail className="w-4 h-4" />
                    <span className="text-gray-400">{t('profile.email')}</span>
                  </div>
                  <p className="text-sm">{profile?.email}</p>
                  {profile?.emailVerified ? (
                    <Badge className="bg-green-600 mt-2">{t('profile.verified')}</Badge>
                  ) : (
                    <Badge className="bg-yellow-600 mt-2">{t('profile.pending')}</Badge>
                  )}
                </div>
                
                <div className="pt-4 border-t border-gray-700 space-y-2">
                  <Link href="/profile/change-password">
                    <Button variant="outline" className="w-full border-gray-700">
                      {t('profile.changePassword')}
                    </Button>
                  </Link>
                  <Link href="/tickets">
                    <Button variant="outline" className="w-full border-gray-700">
                      {t('profile.myTickets')}
                      {profile?.stats?.openTickets > 0 && (
                        <Badge className="ml-2 bg-red-600">{profile.stats.openTickets}</Badge>
                      )}
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Servers & Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Servers */}
            <Card className="bg-[#0f0f0f] border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Server className="w-5 h-5 text-green-500" />
                  {t('profile.myServers')}
                </h3>
                <Link href="/submit">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    {t('profile.newServer')}
                  </Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-900 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-500">{profile?.stats?.serverCount || 0}</div>
                  <div className="text-sm text-gray-400">{t('profile.totalServers')}</div>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-500">{profile?.stats?.totalVotes?.toLocaleString() || 0}</div>
                  <div className="text-sm text-gray-400">{t('profile.totalVotes')}</div>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-500">0</div>
                  <div className="text-sm text-gray-400">{t('profile.totalPlayers')}</div>
                </div>
              </div>
              
              <div className="space-y-3">
                {servers.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Server className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                    <p>{t('profile.noServers')}</p>
                    <Link href="/submit">
                      <Button size="sm" className="mt-3 bg-green-600 hover:bg-green-700">
                        {t('profile.addFirstServer')}
                      </Button>
                    </Link>
                  </div>
                ) : (
                  servers.map((server) => (
                    <div key={server.id} className="bg-gray-900 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold">🎮 {server.name}</h4>
                          <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                            <span>{t('profile.serverStatus')} {server.status === 'approved' ? t('profile.approved') : server.status === 'pending' ? t('profile.pendingApproval') : t('profile.rejected')}</span>
                            <span>•</span>
                            <span>{t('profile.totalVotes')}: {server.voteCount || 0}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/admin/servers/${server.id}/edit`}>
                            <Button size="sm" variant="outline" className="border-gray-700">
                              {t('profile.edit')}
                            </Button>
                          </Link>
                          <Link href={`/server/${server.id}`}>
                            <Button size="sm" variant="outline" className="border-gray-700">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteServer(server.id, server.name)}
                            disabled={deleting === server.id}
                            className="text-red-500 hover:text-red-600 hover:bg-red-950"
                          >
                            {deleting === server.id ? '...' : '🗑️'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
            
            {/* Activity History */}
            <Card className="bg-[#0f0f0f] border-gray-800 p-6">
              <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-green-500" />
                {t('profile.activityHistory')}
              </h3>
              
              <div className="space-y-3">
                {activities.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">{t('profile.noActivity')}</p>
                ) : (
                  activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 text-sm">
                      <span className="text-gray-500">•</span>
                      <div className="flex-1">
                        <span className="text-gray-300">{activity.description}</span>
                        <span className="text-gray-500 text-xs ml-2">
                          {new Date(activity.createdAt).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US')}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
