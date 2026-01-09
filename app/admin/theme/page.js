'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Palette, Image, Type, Hash, MessageSquare, Save } from 'lucide-react'

export default function ThemeSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    siteName: 'Minecraft Server List',
    siteTagline: 'En İyi Minecraft Sunucuları',
    logoUrl: '',
    faviconUrl: '',
    primaryColor: '#22c55e',
    secondaryColor: '#eab308',
    accentColor: '#3b82f6',
    footerText: '© 2025 Minecraft Server List. Tüm hakları saklıdır.',
    socialMedia: {
      discord: '',
      twitter: '',
      facebook: '',
      instagram: '',
      youtube: '',
      tiktok: ''
    }
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings-file')
      if (response.ok) {
        const data = await response.json()
        setSettings(prev => ({
          ...prev,
          ...data,
          socialMedia: data.socialmedia || prev.socialMedia
        }))
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/settings-file', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        toast.success('✅ Tema ayarları kaydedildi! Sayfayı yenileyin.')
      } else {
        toast.error('Ayarlar kaydedilirken hata oluştu')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Ayarlar kaydedilirken hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-yellow-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Palette className="w-8 h-8 text-yellow-500" />
            Tema Ayarları
          </h1>
          <p className="text-gray-400 mt-2">Site görünümünü özelleştirin</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-yellow-600 hover:bg-yellow-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </div>

      {/* Site Bilgileri */}
      <Card className="bg-gray-900 border-gray-800 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Type className="w-6 h-6 text-blue-500" />
          <h2 className="text-2xl font-bold">Site Bilgileri</h2>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Site Adı</Label>
            <Input
              type="text"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              className="bg-gray-800 border-gray-700 mt-2"
              placeholder="Minecraft Server List"
            />
          </div>

          <div>
            <Label>Site Sloganı</Label>
            <Input
              type="text"
              value={settings.siteTagline}
              onChange={(e) => setSettings({ ...settings, siteTagline: e.target.value })}
              className="bg-gray-800 border-gray-700 mt-2"
              placeholder="En İyi Minecraft Sunucuları"
            />
          </div>

          <div>
            <Label>Footer Metni</Label>
            <Textarea
              value={settings.footerText}
              onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
              className="bg-gray-800 border-gray-700 mt-2"
              placeholder="© 2025 Minecraft Server List. Tüm hakları saklıdır."
              rows={3}
            />
          </div>
        </div>
      </Card>

      {/* Logo & Favicon */}
      <Card className="bg-gray-900 border-gray-800 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Image className="w-6 h-6 text-purple-500" />
          <h2 className="text-2xl font-bold">Logo ve İkonlar</h2>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Logo URL (boş bırakılırsa varsayılan)</Label>
            <Input
              type="url"
              value={settings.logoUrl}
              onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
              className="bg-gray-800 border-gray-700 mt-2"
              placeholder="https://example.com/logo.png"
            />
            <p className="text-xs text-gray-500 mt-2">
              💡 Önerilen boyut: 200x60px, PNG veya SVG
            </p>
          </div>

          <div>
            <Label>Favicon URL (boş bırakılırsa varsayılan)</Label>
            <Input
              type="url"
              value={settings.faviconUrl}
              onChange={(e) => setSettings({ ...settings, faviconUrl: e.target.value })}
              className="bg-gray-800 border-gray-700 mt-2"
              placeholder="https://example.com/favicon.ico"
            />
            <p className="text-xs text-gray-500 mt-2">
              💡 Önerilen: 32x32px, ICO veya PNG
            </p>
          </div>
        </div>
      </Card>

      {/* Renk Teması */}
      <Card className="bg-gray-900 border-gray-800 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Hash className="w-6 h-6 text-pink-500" />
          <h2 className="text-2xl font-bold">Renk Teması</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Ana Renk (Primary)</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                className="w-20 h-12 p-1 bg-gray-800 border-gray-700"
              />
              <Input
                type="text"
                value={settings.primaryColor}
                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                className="flex-1 bg-gray-800 border-gray-700"
              />
            </div>
            <div className="mt-2 h-8 rounded" style={{ backgroundColor: settings.primaryColor }}></div>
          </div>

          <div>
            <Label>İkincil Renk (Secondary)</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="color"
                value={settings.secondaryColor}
                onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                className="w-20 h-12 p-1 bg-gray-800 border-gray-700"
              />
              <Input
                type="text"
                value={settings.secondaryColor}
                onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                className="flex-1 bg-gray-800 border-gray-700"
              />
            </div>
            <div className="mt-2 h-8 rounded" style={{ backgroundColor: settings.secondaryColor }}></div>
          </div>

          <div>
            <Label>Vurgu Rengi (Accent)</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="color"
                value={settings.accentColor}
                onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                className="w-20 h-12 p-1 bg-gray-800 border-gray-700"
              />
              <Input
                type="text"
                value={settings.accentColor}
                onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                className="flex-1 bg-gray-800 border-gray-700"
              />
            </div>
            <div className="mt-2 h-8 rounded" style={{ backgroundColor: settings.accentColor }}></div>
          </div>
        </div>

        <p className="text-sm text-gray-400 mt-4">
          💡 Ana renk: Butonlar ve logolar | İkincil: Admin panel | Vurgu: Linkler ve hover
        </p>
      </Card>

      {/* Sosyal Medya */}
      <Card className="bg-gray-900 border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="w-6 h-6 text-green-500" />
          <h2 className="text-2xl font-bold">Sosyal Medya Linkleri</h2>
        </div>

        <p className="text-sm text-gray-400 mb-4">
          Footer'da sosyal medya ikonları olarak görünecek
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Discord Sunucu Linki</Label>
            <Input
              type="url"
              value={settings.socialMedia.discord}
              onChange={(e) => setSettings({ 
                ...settings, 
                socialMedia: { ...settings.socialMedia, discord: e.target.value }
              })}
              className="bg-gray-800 border-gray-700 mt-2"
              placeholder="https://discord.gg/..."
            />
          </div>

          <div>
            <Label>X (Twitter) Profili</Label>
            <Input
              type="url"
              value={settings.socialMedia.twitter}
              onChange={(e) => setSettings({ 
                ...settings, 
                socialMedia: { ...settings.socialMedia, twitter: e.target.value }
              })}
              className="bg-gray-800 border-gray-700 mt-2"
              placeholder="https://x.com/..."
            />
          </div>

          <div>
            <Label>Facebook Sayfası</Label>
            <Input
              type="url"
              value={settings.socialMedia.facebook}
              onChange={(e) => setSettings({ 
                ...settings, 
                socialMedia: { ...settings.socialMedia, facebook: e.target.value }
              })}
              className="bg-gray-800 border-gray-700 mt-2"
              placeholder="https://facebook.com/..."
            />
          </div>

          <div>
            <Label>Instagram Profili</Label>
            <Input
              type="url"
              value={settings.socialMedia.instagram}
              onChange={(e) => setSettings({ 
                ...settings, 
                socialMedia: { ...settings.socialMedia, instagram: e.target.value }
              })}
              className="bg-gray-800 border-gray-700 mt-2"
              placeholder="https://instagram.com/..."
            />
          </div>

          <div>
            <Label>YouTube Kanalı</Label>
            <Input
              type="url"
              value={settings.socialMedia.youtube}
              onChange={(e) => setSettings({ 
                ...settings, 
                socialMedia: { ...settings.socialMedia, youtube: e.target.value }
              })}
              className="bg-gray-800 border-gray-700 mt-2"
              placeholder="https://youtube.com/..."
            />
          </div>

          <div>
            <Label>TikTok Hesabı</Label>
            <Input
              type="url"
              value={settings.socialMedia.tiktok}
              onChange={(e) => setSettings({ 
                ...settings, 
                socialMedia: { ...settings.socialMedia, tiktok: e.target.value }
              })}
              className="bg-gray-800 border-gray-700 mt-2"
              placeholder="https://tiktok.com/@..."
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-end mt-6">
        <Button 
          onClick={handleSave} 
          disabled={saving}
          size="lg"
          className="bg-yellow-600 hover:bg-yellow-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
        </Button>
      </div>
    </div>
  )
}
