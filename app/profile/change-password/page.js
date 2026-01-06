'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function ChangePasswordPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }
  
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: 'gray' }
    
    let strength = 0
    if (password.length >= 6) strength++
    if (password.length >= 10) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z0-9]/.test(password)) strength++
    
    if (strength <= 2) return { strength: 2, label: 'Zayıf', color: 'red' }
    if (strength <= 3) return { strength: 3, label: 'Orta', color: 'yellow' }
    return { strength: 5, label: 'Güçlü', color: 'green' }
  }
  
  const passwordStrength = getPasswordStrength(form.newPassword)
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      toast.error('Lütfen tüm alanları doldurun')
      return
    }
    
    if (form.newPassword.length < 6) {
      toast.error('Yeni şifre en az 6 karakter olmalı')
      return
    }
    
    if (form.newPassword !== form.confirmPassword) {
      toast.error('Şifreler eşleşmiyor')
      return
    }
    
    setLoading(true)
    try {
      const response = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword
        })
      })
      
      if (response.ok) {
        toast.success('Şifre başarıyla güncellendi!')
        router.push('/profile')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Şifre güncellenemedi')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/profile">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Şifre Değiştir</h1>
        </div>
        
        <Card className="bg-[#0f0f0f] border-gray-800 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mevcut Şifre *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={form.currentPassword}
                  onChange={handleChange}
                  className="bg-gray-800 border-gray-700 pl-10"
                  placeholder="Mevcut şifrenizi girin"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newPassword">Yeni Şifre *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={form.newPassword}
                  onChange={handleChange}
                  className="bg-gray-800 border-gray-700 pl-10"
                  placeholder="Yeni şifrenizi girin"
                />
              </div>
              {form.newPassword && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-${passwordStrength.color}-500 transition-all`}
                        style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs text-${passwordStrength.color}-500`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    En az 6 karakter, büyük/küçük harf, rakam ve özel karakter kullanın
                  </p>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar) *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="bg-gray-800 border-gray-700 pl-10"
                  placeholder="Yeni şifrenizi tekrar girin"
                />
              </div>
              {form.confirmPassword && form.newPassword !== form.confirmPassword && (
                <p className="text-xs text-red-500">Şifreler eşleşmiyor</p>
              )}
            </div>
            
            <Button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 w-full"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Güncelleniyor...</>
              ) : (
                <><Save className="w-4 h-4 mr-2" /> Şifreyi Güncelle</>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}