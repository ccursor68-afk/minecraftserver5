'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function ThemeTestPage() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings/public-file')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8">Yükleniyor...</div>
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">🎨 Tema Test Sayfası</h1>

        {/* Current Settings */}
        <Card className="bg-gray-900 border-gray-800 p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Mevcut Ayarlar:</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Site Adı:</strong> {settings?.sitename || 'Minecraft Server List'}</p>
            <p><strong>Slogan:</strong> {settings?.sitetagline || 'En İyi Minecraft Sunucuları'}</p>
            <p><strong>Ana Renk:</strong> <span style={{ color: settings?.primarycolor }}>{settings?.primarycolor || '#22c55e'}</span></p>
            <p><strong>İkincil Renk:</strong> <span style={{ color: settings?.secondarycolor }}>{settings?.secondarycolor || '#eab308'}</span></p>
            <p><strong>Vurgu Rengi:</strong> <span style={{ color: settings?.accentcolor }}>{settings?.accentcolor || '#3b82f6'}</span></p>
          </div>
        </Card>

        {/* Color Test */}
        <Card className="bg-gray-900 border-gray-800 p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Renk Testi:</h2>
          
          <div className="space-y-4">
            <div>
              <p className="mb-2">Ana Renk (Primary):</p>
              <div className="flex gap-4">
                <div 
                  className="w-32 h-32 rounded-lg"
                  style={{ backgroundColor: settings?.primarycolor || '#22c55e' }}
                ></div>
                <div>
                  <p className="font-bold" style={{ color: settings?.primarycolor }}>
                    Örnek Başlık
                  </p>
                  <Button 
                    className="mt-2"
                    style={{ 
                      backgroundColor: settings?.primarycolor,
                      color: 'white'
                    }}
                  >
                    Primary Button
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <p className="mb-2">İkincil Renk (Secondary):</p>
              <div className="flex gap-4">
                <div 
                  className="w-32 h-32 rounded-lg"
                  style={{ backgroundColor: settings?.secondarycolor || '#eab308' }}
                ></div>
                <div>
                  <p className="font-bold" style={{ color: settings?.secondarycolor }}>
                    Örnek Başlık
                  </p>
                  <Button 
                    className="mt-2"
                    style={{ 
                      backgroundColor: settings?.secondarycolor,
                      color: 'white'
                    }}
                  >
                    Secondary Button
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <p className="mb-2">Vurgu Rengi (Accent):</p>
              <div className="flex gap-4">
                <div 
                  className="w-32 h-32 rounded-lg"
                  style={{ backgroundColor: settings?.accentcolor || '#3b82f6' }}
                ></div>
                <div>
                  <p className="font-bold" style={{ color: settings?.accentcolor }}>
                    Örnek Başlık
                  </p>
                  <Button 
                    className="mt-2"
                    style={{ 
                      backgroundColor: settings?.accentcolor,
                      color: 'white'
                    }}
                  >
                    Accent Button
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Sosyal Medya Test */}
        {settings?.socialmedia && Object.values(settings.socialmedia).some(v => v) && (
          <Card className="bg-gray-900 border-gray-800 p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Sosyal Medya:</h2>
            <div className="space-y-2">
              {settings.socialmedia.discord && <p>✅ Discord: {settings.socialmedia.discord}</p>}
              {settings.socialmedia.twitter && <p>✅ X: {settings.socialmedia.twitter}</p>}
              {settings.socialmedia.facebook && <p>✅ Facebook: {settings.socialmedia.facebook}</p>}
              {settings.socialmedia.instagram && <p>✅ Instagram: {settings.socialmedia.instagram}</p>}
              {settings.socialmedia.youtube && <p>✅ YouTube: {settings.socialmedia.youtube}</p>}
              {settings.socialmedia.tiktok && <p>✅ TikTok: {settings.socialmedia.tiktok}</p>}
            </div>
          </Card>
        )}

        {/* Instructions */}
        <Card className="bg-gray-900 border-gray-800 p-6">
          <h2 className="text-2xl font-bold mb-4">Test Adımları:</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Admin → Theme sayfasına gidin</li>
            <li>Renkleri değiştirin (örn: Ana Renk → Kırmızı #ff0000)</li>
            <li>"Kaydet" butonuna tıklayın</li>
            <li>Bu sayfayı yenileyin (F5)</li>
            <li>Renklerin değiştiğini görün! 🎨</li>
          </ol>
        </Card>
      </div>
    </div>
  )
}
