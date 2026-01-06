'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

export default function CreateBannerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    serverName: '',
    imageUrl: '',
    linkUrl: '',
    position: 'top',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isActive: true
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!form.serverName || !form.imageUrl || !form.position || !form.startDate || !form.endDate) {
      toast.error('Lütfen tüm zorunlu alanları doldurun')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      if (response.ok) {
        toast.success('Banner başarıyla oluşturuldu!')
        router.push('/admin/banners')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Banner oluşturulamadı')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/banners">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Yeni Banner Ekle</h1>
      </div>

      <Card className="bg-gray-900 border-gray-800 p-6 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="serverName">Sunucu Adı *</Label>
            <Input
              id="serverName"
              name="serverName"
              value={form.serverName}
              onChange={handleChange}
              placeholder="ÖRN: MegaCraft Server"
              className="bg-gray-800 border-gray-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Banner Resmi URL *</Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              value={form.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/banner.png"
              className="bg-gray-800 border-gray-700"
            />
            <p className="text-xs text-gray-500">Önerilen boyut: 728x90px veya 468x60px</p>
            {form.imageUrl && (
              <div className="mt-2">
                <p className="text-sm text-gray-400 mb-2">Önizleme:</p>
                <img
                  src={form.imageUrl}
                  alt="Banner preview"
                  className="max-w-full h-auto rounded border border-gray-700"
                  style={{ maxHeight: '100px' }}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkUrl">Banner Linki (İsteğe Bağlı)</Label>
            <Input
              id="linkUrl"
              name="linkUrl"
              value={form.linkUrl}
              onChange={handleChange}
              placeholder="https://example.com"
              className="bg-gray-800 border-gray-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Pozisyon *</Label>
            <Select
              value={form.position}
              onValueChange={(val) => setForm(prev => ({ ...prev, position: val }))}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top">🔝 Üst Banner (Header altı)</SelectItem>
                <SelectItem value="between_servers">📋 Sunucular Arası (Her 5 sunucuda)</SelectItem>
                <SelectItem value="sidebar">➡️ Yan Banner (Sidebar)</SelectItem>
                <SelectItem value="bottom">⬇️ Alt Banner (Footer üstü)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Başlangıç Tarihi *</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={handleChange}
                className="bg-gray-800 border-gray-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Bitiş Tarihi *</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={form.endDate}
                onChange={handleChange}
                className="bg-gray-800 border-gray-700"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="isActive"
              checked={form.isActive}
              onCheckedChange={(val) => setForm(prev => ({ ...prev, isActive: val }))}
            />
            <Label htmlFor="isActive">Banner Aktif</Label>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 w-full"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Oluşturuluyor...</>
            ) : (
              <><Save className="w-4 h-4 mr-2" /> Banner Oluştur</>
            )}
          </Button>
        </form>
      </Card>
    </div>
  )
}