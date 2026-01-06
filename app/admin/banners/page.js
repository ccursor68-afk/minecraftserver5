'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

const POSITION_LABELS = {
  top: 'Üst Banner',
  between_servers: 'Sunucular Arası',
  sidebar: 'Yan Banner',
  bottom: 'Alt Banner'
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const response = await fetch('/api/banners')
      if (response.ok) {
        const data = await response.json()
        setBanners(data)
      } else {
        toast.error('Bannerlar yüklenirken hata oluştu')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const deleteBanner = async (bannerId, serverName) => {
    if (!confirm(`"${serverName}" bannerini silmek istediğinizden emin misiniz?`)) {
      return
    }

    setDeleting(bannerId)
    try {
      const response = await fetch(`/api/banners?id=${bannerId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Banner başarıyla silindi')
        fetchBanners()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Banner silinirken hata oluştu')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Banner silinirken hata oluştu')
    } finally {
      setDeleting(null)
    }
  }

  const toggleActive = async (bannerId, currentStatus) => {
    try {
      const response = await fetch(`/api/banners?id=${bannerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (response.ok) {
        toast.success('Banner durumu güncellendi')
        fetchBanners()
      } else {
        toast.error('Durum güncellenirken hata oluştu')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Bir hata oluştu')
    }
  }

  const isActive = (banner) => {
    const today = new Date().toISOString().split('T')[0]
    return banner.isActive && banner.startDate <= today && banner.endDate >= today
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Banner Yönetimi</h1>
        <Link href="/admin/banners/create">
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Yeni Banner
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-yellow-500"></div>
        </div>
      ) : banners.length === 0 ? (
        <Card className="bg-gray-900 border-gray-800 p-12 text-center">
          <p className="text-gray-400 mb-4">Henüz banner eklenmemiş</p>
          <Link href="/admin/banners/create">
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              İlk Banner'ı Ekle
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {banners.map((banner) => (
            <Card key={banner.id} className="bg-gray-900 border-gray-800 p-6">
              <div className="flex items-center gap-6">
                {/* Banner Preview */}
                <div className="flex-shrink-0">
                  <img
                    src={banner.imageUrl}
                    alt={banner.serverName}
                    className="w-48 h-24 object-cover rounded border border-gray-700"
                  />
                </div>

                {/* Banner Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold">{banner.serverName}</h3>
                    {isActive(banner) ? (
                      <Badge className="bg-green-600">Aktif</Badge>
                    ) : (
                      <Badge className="bg-red-600">Pasif</Badge>
                    )}
                    <Badge variant="outline" className="border-gray-600">
                      {POSITION_LABELS[banner.position]}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400 mb-2 truncate">
                    {banner.linkUrl || 'Link yok'}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>📅 {new Date(banner.startDate).toLocaleDateString('tr-TR')}</span>
                    <span>→</span>
                    <span>📅 {new Date(banner.endDate).toLocaleDateString('tr-TR')}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {banner.viewCount || 0}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive(banner.id, banner.isActive)}
                    className="border-gray-700"
                  >
                    {banner.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                  </Button>
                  <Link href={`/admin/banners/${banner.id}/edit`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-500 hover:text-blue-600 hover:bg-blue-950"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteBanner(banner.id, banner.serverName)}
                    disabled={deleting === banner.id}
                    className="text-red-500 hover:text-red-600 hover:bg-red-950"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}