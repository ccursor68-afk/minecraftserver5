'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Server, Plus, Edit, Trash2, Star, Eye, ExternalLink, Search, Filter, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'

export default function AdminHostingsPage() {
  const router = useRouter()
  const [hostings, setHostings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedHosting, setSelectedHosting] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    website: '',
    short_description: '',
    description: '',
    features: '',
    min_price: '',
    max_price: '',
    currency: 'TRY',
    is_featured: false,
    is_active: true
  })
  
  useEffect(() => {
    fetchHostings()
  }, [])
  
  const fetchHostings = async () => {
    try {
      const response = await fetch('/api/hostings')
      if (response.ok) {
        const data = await response.json()
        setHostings(data)
      }
    } catch (error) {
      console.error('Error fetching hostings:', error)
      toast.error('Hostingler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }
  
  const resetForm = () => {
    setFormData({
      name: '',
      logo_url: '',
      website: '',
      short_description: '',
      description: '',
      features: '',
      min_price: '',
      max_price: '',
      currency: 'TRY',
      is_featured: false,
      is_active: true
    })
  }
  
  const openEditDialog = (hosting) => {
    setSelectedHosting(hosting)
    setFormData({
      name: hosting.name || '',
      logo_url: hosting.logo_url || '',
      website: hosting.website || '',
      short_description: hosting.short_description || '',
      description: hosting.description || '',
      features: hosting.features?.join(', ') || '',
      min_price: hosting.min_price?.toString() || '',
      max_price: hosting.max_price?.toString() || '',
      currency: hosting.currency || 'TRY',
      is_featured: hosting.is_featured || false,
      is_active: hosting.is_active !== false
    })
    setIsEditDialogOpen(true)
  }
  
  const handleAddHosting = async () => {
    if (!formData.name.trim()) {
      toast.error('Hosting adı gerekli')
      return
    }
    
    setSubmitting(true)
    
    try {
      const response = await fetch('/api/hostings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          features: formData.features.split(',').map(f => f.trim()).filter(f => f),
          min_price: parseFloat(formData.min_price) || 0,
          max_price: parseFloat(formData.max_price) || 0
        })
      })
      
      if (response.ok) {
        toast.success('Hosting başarıyla eklendi')
        setIsAddDialogOpen(false)
        resetForm()
        fetchHostings()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Hosting eklenemedi')
      }
    } catch (error) {
      console.error('Error adding hosting:', error)
      toast.error('Bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }
  
  const handleEditHosting = async () => {
    if (!selectedHosting) return
    
    setSubmitting(true)
    
    try {
      const response = await fetch(`/api/hostings/${selectedHosting.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          features: formData.features.split(',').map(f => f.trim()).filter(f => f),
          min_price: parseFloat(formData.min_price) || 0,
          max_price: parseFloat(formData.max_price) || 0
        })
      })
      
      if (response.ok) {
        toast.success('Hosting başarıyla güncellendi')
        setIsEditDialogOpen(false)
        setSelectedHosting(null)
        resetForm()
        fetchHostings()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Hosting güncellenemedi')
      }
    } catch (error) {
      console.error('Error updating hosting:', error)
      toast.error('Bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }
  
  const handleDeleteHosting = async () => {
    if (!selectedHosting) return
    
    setSubmitting(true)
    
    try {
      const response = await fetch(`/api/hostings/${selectedHosting.id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        toast.success('Hosting başarıyla silindi')
        setIsDeleteDialogOpen(false)
        setSelectedHosting(null)
        fetchHostings()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Hosting silinemedi')
      }
    } catch (error) {
      console.error('Error deleting hosting:', error)
      toast.error('Bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }
  
  const filteredHostings = hostings.filter(hosting =>
    hosting.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hosting.website?.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  // Form component
  const HostingForm = ({ onSubmit, submitText }) => (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="name">Hosting Adı *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Örn: TurboHost"
            className="bg-gray-800 border-gray-700 mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="website">Website URL</Label>
          <Input
            id="website"
            value={formData.website}
            onChange={(e) => setFormData({...formData, website: e.target.value})}
            placeholder="https://example.com"
            className="bg-gray-800 border-gray-700 mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="logo_url">Logo URL</Label>
          <Input
            id="logo_url"
            value={formData.logo_url}
            onChange={(e) => setFormData({...formData, logo_url: e.target.value})}
            placeholder="https://example.com/logo.png"
            className="bg-gray-800 border-gray-700 mt-1"
          />
        </div>
        
        <div className="col-span-2">
          <Label htmlFor="short_description">Kısa Açıklama</Label>
          <Input
            id="short_description"
            value={formData.short_description}
            onChange={(e) => setFormData({...formData, short_description: e.target.value})}
            placeholder="Kısa tanıtım metni"
            className="bg-gray-800 border-gray-700 mt-1"
          />
        </div>
        
        <div className="col-span-2">
          <Label htmlFor="description">Detaylı Açıklama</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Hosting hakkında detaylı bilgi..."
            rows={3}
            className="bg-gray-800 border-gray-700 mt-1"
          />
        </div>
        
        <div className="col-span-2">
          <Label htmlFor="features">Özellikler (virgülle ayırın)</Label>
          <Input
            id="features"
            value={formData.features}
            onChange={(e) => setFormData({...formData, features: e.target.value})}
            placeholder="DDoS Koruması, SSD Disk, 7/24 Destek"
            className="bg-gray-800 border-gray-700 mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="min_price">Min. Fiyat</Label>
          <Input
            id="min_price"
            type="number"
            step="0.01"
            value={formData.min_price}
            onChange={(e) => setFormData({...formData, min_price: e.target.value})}
            placeholder="29.99"
            className="bg-gray-800 border-gray-700 mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="max_price">Max. Fiyat</Label>
          <Input
            id="max_price"
            type="number"
            step="0.01"
            value={formData.max_price}
            onChange={(e) => setFormData({...formData, max_price: e.target.value})}
            placeholder="299.99"
            className="bg-gray-800 border-gray-700 mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="currency">Para Birimi</Label>
          <Input
            id="currency"
            value={formData.currency}
            onChange={(e) => setFormData({...formData, currency: e.target.value})}
            placeholder="TRY"
            className="bg-gray-800 border-gray-700 mt-1"
          />
        </div>
        
        <div className="flex items-center gap-4 pt-6">
          <div className="flex items-center gap-2">
            <Switch
              id="is_featured"
              checked={formData.is_featured}
              onCheckedChange={(checked) => setFormData({...formData, is_featured: checked})}
            />
            <Label htmlFor="is_featured">Öne Çıkan</Label>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
            />
            <Label htmlFor="is_active">Aktif</Label>
          </div>
        </div>
      </div>
    </div>
  )
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Server className="w-8 h-8 text-green-500" />
            Hosting Yönetimi
          </h1>
          <p className="text-gray-400 mt-1">Minecraft hosting firmalarını yönetin</p>
        </div>
        
        <Button 
          onClick={() => {
            resetForm()
            setIsAddDialogOpen(true)
          }}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Yeni Hosting Ekle
        </Button>
      </div>
      
      {/* Search */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <Input
              placeholder="Hosting ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700"
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-white">{hostings.length}</div>
            <div className="text-sm text-gray-400">Toplam Hosting</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-yellow-500">
              {hostings.filter(h => h.is_featured).length}
            </div>
            <div className="text-sm text-gray-400">Öne Çıkan</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-green-500">
              {hostings.filter(h => h.is_active).length}
            </div>
            <div className="text-sm text-gray-400">Aktif</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-blue-500">
              {hostings.reduce((sum, h) => sum + (h.review_count || 0), 0)}
            </div>
            <div className="text-sm text-gray-400">Toplam Değerlendirme</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Hostings Table */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Hosting Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-700 border-t-green-500"></div>
            </div>
          ) : filteredHostings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Server className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Henüz hosting eklenmemiş</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800">
                  <TableHead className="text-gray-400">Hosting</TableHead>
                  <TableHead className="text-gray-400">Fiyat</TableHead>
                  <TableHead className="text-gray-400">Puan</TableHead>
                  <TableHead className="text-gray-400">Değerlendirme</TableHead>
                  <TableHead className="text-gray-400">Durum</TableHead>
                  <TableHead className="text-gray-400 text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHostings.map((hosting) => (
                  <TableRow key={hosting.id} className="border-gray-800">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
                          {hosting.logo_url ? (
                            <img src={hosting.logo_url} alt={hosting.name} className="w-full h-full object-cover" />
                          ) : (
                            <Server className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-white flex items-center gap-2">
                            {hosting.name}
                            {hosting.is_featured && (
                              <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                            )}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-[200px]">
                            {hosting.website}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-green-500 font-semibold">
                        {hosting.min_price?.toFixed(2)} {hosting.currency}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        <span className="text-white font-semibold">
                          {(hosting.avg_overall || 0).toFixed(1)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-400">{hosting.review_count || 0}</span>
                    </TableCell>
                    <TableCell>
                      {hosting.is_active ? (
                        <Badge className="bg-green-500/20 text-green-500">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Aktif
                        </Badge>
                      ) : (
                        <Badge className="bg-red-500/20 text-red-500">
                          <XCircle className="w-3 h-3 mr-1" />
                          Pasif
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`/hostings/${hosting.id}`, '_blank')}
                          className="text-gray-400 hover:text-white"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(hosting)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedHosting(hosting)
                            setIsDeleteDialogOpen(true)
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-500" />
              Yeni Hosting Ekle
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Yeni bir Minecraft hosting firması ekleyin
            </DialogDescription>
          </DialogHeader>
          
          <HostingForm />
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              className="border-gray-700"
            >
              İptal
            </Button>
            <Button
              onClick={handleAddHosting}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitting ? 'Ekleniyor...' : 'Hosting Ekle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Edit className="w-5 h-5 text-blue-500" />
              Hosting Düzenle
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedHosting?.name} hostingini düzenleyin
            </DialogDescription>
          </DialogHeader>
          
          <HostingForm />
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="border-gray-700"
            >
              İptal
            </Button>
            <Button
              onClick={handleEditHosting}
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {submitting ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-900 border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Hosting Sil</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              <strong>{selectedHosting?.name}</strong> hostingini silmek istediğinize emin misiniz?
              Bu işlem geri alınamaz ve tüm değerlendirmeler de silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
              İptal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteHosting}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting ? 'Siliniyor...' : 'Evet, Sil'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
