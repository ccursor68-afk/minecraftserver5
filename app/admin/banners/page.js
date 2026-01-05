'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function AdminBannersPage() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    linkUrl: '',
    position: 0
  })

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const response = await fetch('/api/admin/banners')
      if (response.ok) {
        const data = await response.json()
        setBanners(data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const createBanner = async (e) => {
    e.preventDefault()
    setCreating(true)

    try {
      const response = await fetch('/api/admin/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Banner created')
        setFormData({ title: '', imageUrl: '', linkUrl: '', position: 0 })
        fetchBanners()
      } else {
        toast.error('Failed to create banner')
      }
    } catch (error) {
      toast.error('Error creating banner')
    } finally {
      setCreating(false)
    }
  }

  const deleteBanner = async (id) => {
    if (!confirm('Delete this banner?')) return

    try {
      const response = await fetch(`/api/admin/banners/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Banner deleted')
        fetchBanners()
      }
    } catch (error) {
      toast.error('Error deleting banner')
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Banners Management</h1>

      <Card className="bg-gray-900 border-gray-800 p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Create New Banner</h2>
        <form onSubmit={createBanner} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-gray-800 border-gray-700 mt-2"
              required
            />
          </div>
          <div>
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="bg-gray-800 border-gray-700 mt-2"
              required
            />
          </div>
          <div>
            <Label htmlFor="linkUrl">Link URL</Label>
            <Input
              id="linkUrl"
              value={formData.linkUrl}
              onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
              className="bg-gray-800 border-gray-700 mt-2"
            />
          </div>
          <Button type="submit" disabled={creating} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Banner
          </Button>
        </form>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-yellow-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Active Banners ({banners.length})</h2>
          {banners.map((banner) => (
            <Card key={banner.id} className="bg-gray-900 border-gray-800 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2">{banner.title}</h3>
                  <img src={banner.imageUrl} alt={banner.title} className="max-w-md h-auto rounded border border-gray-700 mb-2" />
                  {banner.linkUrl && (
                    <p className="text-sm text-gray-400">Link: {banner.linkUrl}</p>
                  )}
                </div>
                <Button
                  onClick={() => deleteBanner(banner.id)}
                  variant="outline"
                  size="sm"
                  className="border-gray-700 hover:border-red-500 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
