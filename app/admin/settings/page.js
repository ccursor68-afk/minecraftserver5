'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Settings, BarChart, DollarSign, Save, AlertCircle } from 'lucide-react'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    googleAnalyticsId: '',
    analyticsEnabled: false,
    googleAdsClientId: '',
    adsEnabled: false,
    adSlots: {
      blogTopBanner: '',
      blogSidebar: '',
      blogInContent: '',
      homeTopBanner: '',
      homeSidebar: ''
    }
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Ayarlar yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        toast.success('Ayarlar başarıyla kaydedildi! ✅')
      } else {
        toast.error('Ayarlar kaydedilirken hata oluştu')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
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
            <Settings className="w-8 h-8 text-yellow-500" />
            Site Ayarları
          </h1>
          <p className="text-gray-400 mt-2">Google Analytics ve Google Ads entegrasyonları</p>
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

      {/* Google Analytics Section */}
      <Card className="bg-gray-900 border-gray-800 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <BarChart className="w-6 h-6 text-blue-500" />
          <h2 className="text-2xl font-bold">Google Analytics</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Analytics'i Etkinleştir</Label>
              <p className="text-sm text-gray-400">Site genelinde ziyaretçi takibi</p>
            </div>
            <Switch
              checked={settings.analyticsEnabled}
              onCheckedChange={(checked) => 
                setSettings({ ...settings, analyticsEnabled: checked })
              }
            />
          </div>

          <Separator className="bg-gray-800" />

          <div>
            <Label>Google Analytics Measurement ID</Label>
            <Input
              type="text"
              placeholder="G-XXXXXXXXXX"
              value={settings.googleAnalyticsId}
              onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })}
              className="bg-gray-800 border-gray-700 mt-2"
            />
            <p className="text-xs text-gray-500 mt-2">
              💡 Google Analytics 4 property'nizden alın (örn: G-1234567890)
            </p>
          </div>

          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-300">
                <p className="font-semibold mb-1">Nasıl Alırım?</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>analytics.google.com adresine gidin</li>
                  <li>Admin → Data Streams → Web Stream seçin</li>
                  <li>Measurement ID'yi kopyalayın (G- ile başlar)</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Google Ads Section */}
      <Card className="bg-gray-900 border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <DollarSign className="w-6 h-6 text-green-500" />
          <h2 className="text-2xl font-bold">Google Ads (AdSense)</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Reklamları Etkinleştir</Label>
              <p className="text-sm text-gray-400">Site genelinde Google Ads göster</p>
            </div>
            <Switch
              checked={settings.adsEnabled}
              onCheckedChange={(checked) => 
                setSettings({ ...settings, adsEnabled: checked })
              }
            />
          </div>

          <Separator className="bg-gray-800" />

          <div>
            <Label>AdSense Client ID</Label>
            <Input
              type="text"
              placeholder="ca-pub-XXXXXXXXXXXXXXXX"
              value={settings.googleAdsClientId}
              onChange={(e) => setSettings({ ...settings, googleAdsClientId: e.target.value })}
              className="bg-gray-800 border-gray-700 mt-2"
            />
            <p className="text-xs text-gray-500 mt-2">
              💡 Google AdSense hesabınızdan alın (ca-pub- ile başlar)
            </p>
          </div>

          <Separator className="bg-gray-800" />

          <div>
            <h3 className="font-semibold text-lg mb-4">Reklam Slot ID'leri</h3>
            <p className="text-sm text-gray-400 mb-4">
              Her reklam pozisyonu için AdSense'ten aldığınız slot ID'leri girin
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Blog Üst Banner</Label>
                <Input
                  type="text"
                  placeholder="1234567890"
                  value={settings.adSlots?.blogTopBanner || ''}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    adSlots: { ...settings.adSlots, blogTopBanner: e.target.value }
                  })}
                  className="bg-gray-800 border-gray-700 mt-2"
                />
              </div>

              <div>
                <Label>Blog Sidebar</Label>
                <Input
                  type="text"
                  placeholder="1234567890"
                  value={settings.adSlots?.blogSidebar || ''}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    adSlots: { ...settings.adSlots, blogSidebar: e.target.value }
                  })}
                  className="bg-gray-800 border-gray-700 mt-2"
                />
              </div>

              <div>
                <Label>Blog İçerik Arası</Label>
                <Input
                  type="text"
                  placeholder="1234567890"
                  value={settings.adSlots?.blogInContent || ''}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    adSlots: { ...settings.adSlots, blogInContent: e.target.value }
                  })}
                  className="bg-gray-800 border-gray-700 mt-2"
                />
              </div>

              <div>
                <Label>Ana Sayfa Üst Banner</Label>
                <Input
                  type="text"
                  placeholder="1234567890"
                  value={settings.adSlots?.homeTopBanner || ''}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    adSlots: { ...settings.adSlots, homeTopBanner: e.target.value }
                  })}
                  className="bg-gray-800 border-gray-700 mt-2"
                />
              </div>

              <div>
                <Label>Ana Sayfa Sidebar</Label>
                <Input
                  type="text"
                  placeholder="1234567890"
                  value={settings.adSlots?.homeSidebar || ''}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    adSlots: { ...settings.adSlots, homeSidebar: e.target.value }
                  })}
                  className="bg-gray-800 border-gray-700 mt-2"
                />
              </div>
            </div>
          </div>

          <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-green-400 mt-0.5" />
              <div className="text-sm text-green-300">
                <p className="font-semibold mb-1">Nasıl Alırım?</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>adsense.google.com adresine gidin</li>
                  <li>Ads → By site → Ad units seçin</li>
                  <li>Display ads → Responsive oluşturun</li>
                  <li>Ad slot ID'yi kopyalayın (sadece rakamlar)</li>
                </ol>
              </div>
            </div>
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
