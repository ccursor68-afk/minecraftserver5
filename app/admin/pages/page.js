'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { FileCode, Plus, Edit, Trash2, Eye, EyeOff, Save, X } from 'lucide-react'

export default function PagesManagementPage() {
  const [loading, setLoading] = useState(true)
  const [pages, setPages] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingPage, setEditingPage] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    metaDescription: '',
    isPublished: true,
    showInFooter: true,
    footerOrder: 0
  })

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    try {
      const response = await fetch('/api/admin/pages')
      if (response.ok) {
        const data = await response.json()
        setPages(data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      metaDescription: '',
      isPublished: true,
      showInFooter: true,
      footerOrder: 0
    })
    setEditingPage(null)
    setShowForm(false)
  }

  const handleEdit = (page) => {
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content,
      metaDescription: page.metaDescription || '',
      isPublished: page.isPublished,
      showInFooter: page.showInFooter,
      footerOrder: page.footerOrder || 0
    })
    setEditingPage(page)
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const url = editingPage ? '/api/admin/pages' : '/api/admin/pages'
      const method = editingPage ? 'PUT' : 'POST'
      const body = editingPage 
        ? { ...formData, id: editingPage.id }
        : formData

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        toast.success(editingPage ? '✅ Sayfa güncellendi!' : '✅ Sayfa oluşturuldu!')
        fetchPages()
        resetForm()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Bir hata oluştu')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Bir hata oluştu')
    }
  }

  const handleDelete = async (pageId) => {
    if (!confirm('Bu sayfayı silmek istediğinizden emin misiniz?')) return
    
    try {
      const response = await fetch(`/api/admin/pages?id=${pageId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('✅ Sayfa silindi!')
        fetchPages()
      } else {
        toast.error('Sayfa silinemedi')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Bir hata oluştu')
    }
  }

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
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
            <FileCode className="w-8 h-8 text-yellow-500" />
            Sayfa Yönetimi
          </h1>
          <p className="text-gray-400 mt-2">Özel sayfalar oluşturun ve yönetin</p>
        </div>
        {!showForm && (
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Yeni Sayfa
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <Card className="bg-gray-900 border-gray-800 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {editingPage ? 'Sayfayı Düzenle' : 'Yeni Sayfa Oluştur'}
            </h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={resetForm}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Sayfa Başlığı *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value })
                    if (!editingPage) {
                      setFormData({ ...formData, title: e.target.value, slug: generateSlug(e.target.value) })
                    }
                  }}
                  className="bg-gray-800 border-gray-700 mt-2"
                  placeholder="Hakkımızda"
                  required
                />
              </div>

              <div>
                <Label>URL Slug *</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="bg-gray-800 border-gray-700 mt-2"
                  placeholder="about-us"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Erişim: /pages/{formData.slug || 'slug'}
                </p>
              </div>
            </div>

            <div>
              <Label>SEO Açıklaması</Label>
              <Input
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                className="bg-gray-800 border-gray-700 mt-2"
                placeholder="Bu sayfa hakkında kısa açıklama..."
                maxLength={160}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.metaDescription.length}/160 karakter
              </p>
            </div>

            <div>
              <Label>İçerik (Markdown destekli) *</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="bg-gray-800 border-gray-700 mt-2 min-h-[300px] font-mono"
                placeholder="# Başlık&#10;&#10;İçeriğiniz buraya..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Markdown syntax kullanabilirsiniz: # başlık, **kalın**, *italik*
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div>
                  <Label>Yayında</Label>
                  <p className="text-xs text-gray-500">Sitede görünsün mü?</p>
                </div>
                <Switch
                  checked={formData.isPublished}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div>
                  <Label>Footer'da Göster</Label>
                  <p className="text-xs text-gray-500">Footer linklerinde</p>
                </div>
                <Switch
                  checked={formData.showInFooter}
                  onCheckedChange={(checked) => setFormData({ ...formData, showInFooter: checked })}
                />
              </div>

              <div>
                <Label>Footer Sırası</Label>
                <Input
                  type="number"
                  value={formData.footerOrder}
                  onChange={(e) => setFormData({ ...formData, footerOrder: parseInt(e.target.value) || 0 })}
                  className="bg-gray-800 border-gray-700 mt-2"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="bg-yellow-600 hover:bg-yellow-700">
                <Save className="w-4 h-4 mr-2" />
                {editingPage ? 'Güncelle' : 'Oluştur'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                İptal
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Pages List */}
      <div className="space-y-4">
        {pages.length === 0 ? (
          <Card className="bg-gray-900 border-gray-800 p-12 text-center">
            <FileCode className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Henüz sayfa yok</h3>
            <p className="text-gray-400 mb-6">İlk sayfanızı oluşturun</p>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Yeni Sayfa
            </Button>
          </Card>
        ) : (
          pages.map((page) => (
            <Card key={page.id} className="bg-gray-900 border-gray-800 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{page.title}</h3>
                    <div className="flex gap-2">
                      {page.isPublished ? (
                        <span className="px-2 py-1 bg-green-900 text-green-300 text-xs rounded">
                          <Eye className="w-3 h-3 inline mr-1" />
                          Yayında
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                          <EyeOff className="w-3 h-3 inline mr-1" />
                          Taslak
                        </span>
                      )}
                      {page.showInFooter && (
                        <span className="px-2 py-1 bg-blue-900 text-blue-300 text-xs rounded">
                          Footer #{page.footerOrder}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">/pages/{page.slug}</p>
                  {page.metaDescription && (
                    <p className="text-gray-500 text-sm">{page.metaDescription}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(page)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-400 hover:text-red-300"
                    onClick={() => handleDelete(page.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
