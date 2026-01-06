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

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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
      toast.info('Değişiklik yok')
      return
    }
    
    console.log('Updating Minecraft username:', minecraftUsername)
    
    setSaving(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minecraftUsername })
      })
      
      const data = await response.json()
      console.log('Update response:', data)
      
      if (response.ok) {
        toast.success('Minecraft kullanıcı adı güncellendi!')
        await fetchProfile()
        // Force refresh to update avatar
        window.location.reload()
      } else {
        toast.error(data.error || 'Güncellenemedi')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-green-500"></div>
          <p className="mt-4 text-gray-400">Yükléniyor...</p>
        </div>
      </div>
    )
  }
  
  const avatarUrl = profile?.minecraftUsername 
    ? `https://crafatar.com/avatars/${profile.minecraftUsername}?size=128&overlay`
    : 'https://crafatar.com/avatars/steve?size=128&overlay'
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Profilim</h1>
          <Link href="/">
            <Button variant="outline" className="border-gray-700">Ana Sayfa</Button>
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
                    e.target.src = 'https://crafatar.com/avatars/steve?size=128&overlay'
                  }}
                />
                <h2 className="text-2xl font-bold">{profile?.username}</h2>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mt-2">
                  <Calendar className="w-4 h-4" />
                  <span>Üyelik: {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Yeni'}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="minecraft">Minecraft Kullanıcı Adı</Label>
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
                      {saving ? 'Kayıt...' : 'Kaydet'}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Avatar crafatar.com’dan alınır</p>
                </div>
                
                <div className="pt-4 border-t border-gray-700">
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <Mail className="w-4 h-4" />
                    <span className="text-gray-400">E-posta:</span>
                  </div>
                  <p className="text-sm">{profile?.email}</p>
                  {profile?.emailVerified ? (
                    <Badge className="bg-green-600 mt-2">✓ Doğrulandı</Badge>
                  ) : (
                    <Badge className="bg-yellow-600 mt-2">⚠ Beklemede</Badge>
                  )}
                </div>
                
                <div className="pt-4 border-t border-gray-700 space-y-2">
                  <Link href="/profile/change-password">
                    <Button variant="outline" className="w-full border-gray-700">
                      🔒 Şifre Değiştir
                    </Button>
                  </Link>
                  <Link href="/admin/tickets">
                    <Button variant="outline" className="w-full border-gray-700">
                      🎫 Destek Taleplerim
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
                  Sunucularım
                </h3>
                <Link href="/submit">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    + Yeni Sunucu
                  </Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-900 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-500">{profile?.stats?.serverCount || 0}</div>
                  <div className="text-sm text-gray-400">Toplam Sunucu</div>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-500">{profile?.stats?.totalVotes?.toLocaleString() || 0}</div>
                  <div className="text-sm text-gray-400">Toplam Oy</div>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-500">0</div>
                  <div className="text-sm text-gray-400">Toplam Oyuncu</div>
                </div>
              </div>
              
              <div className="space-y-3">
                {servers.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Server className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                    <p>Henüz sunucu eklenmemiş</p>
                    <Link href="/submit">
                      <Button size="sm" className="mt-3 bg-green-600 hover:bg-green-700">
                        İlk Sunucunu Ekle
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
                            <span>Durum: {server.status === 'approved' ? '✅ Onaylandı' : server.status === 'pending' ? '⏳ Onay Bekliyor' : '❌ Reddedildi'}</span>
                            <span>•</span>
                            <span>Oy: {server.voteCount || 0}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/admin/servers/${server.id}/edit`}>
                            <Button size="sm" variant="outline" className="border-gray-700">
                              Düzenle
                            </Button>
                          </Link>
                          <Link href={`/server/${server.id}`}>
                            <Button size="sm" variant="outline" className="border-gray-700">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
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
                Aktivite Geçmişi
              </h3>
              
              <div className="space-y-3">
                {activities.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">Henüz aktivite yok</p>
                ) : (
                  activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 text-sm">
                      <span className="text-gray-500">•</span>
                      <div className="flex-1">
                        <span className="text-gray-300">{activity.description}</span>
                        <span className="text-gray-500 text-xs ml-2">
                          {new Date(activity.createdAt).toLocaleDateString('tr-TR')}
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