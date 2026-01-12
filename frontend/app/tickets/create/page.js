'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Gamepad2, ArrowLeft, Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { useLanguage } from '@/contexts/LanguageContext'
import { useSearchParams } from 'next/navigation'

const CATEGORIES = ['general', 'server_report', 'server_removal', 'hosting_application', 'account', 'technical', 'purchase', 'other']
const PRIORITIES = ['low', 'normal', 'high']

export default function CreateTicketPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [servers, setServers] = useState([])
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    category: 'general',
    priority: 'normal',
    serverId: ''
  })

  useEffect(() => {
    // Check URL params for category and package
    const categoryParam = searchParams.get('category')
    const packageParam = searchParams.get('package')
    
    if (categoryParam === 'purchase' && packageParam) {
      setFormData(prev => ({
        ...prev,
        category: 'purchase',
        subject: `${packageParam.charAt(0).toUpperCase() + packageParam.slice(1)} Paket Satın Alma`,
        message: `Merhaba,\n\n${packageParam.charAt(0).toUpperCase() + packageParam.slice(1)} paketini satın almak istiyorum.\n\nLütfen benimle iletişime geçin.\n\nTeşekkürler.`
      }))
    } else if (categoryParam === 'hosting_application') {
      setFormData(prev => ({
        ...prev,
        category: 'hosting_application',
        subject: 'Hosting Firması Listeleme Başvurusu',
        message: `Merhaba,\n\nHosting firmamızı sitenizde listelemek istiyoruz.\n\n📌 Firma Bilgileri:\n- Firma Adı: \n- Website: \n- Kısa Açıklama: \n\n🎯 Sunulan Hizmetler:\n- \n- \n\n💰 Fiyat Aralığı:\n- Minimum: TL/ay\n- Maximum: TL/ay\n\n📧 İletişim:\n- E-posta: \n- Telefon: \n\n🖼️ Logo URL (varsa): \n\nTeşekkürler.`
      }))
    }
  }, [searchParams])

  useEffect(() => {
    checkAuth()
    fetchServers()
  }, [])

  const checkAuth = async () => {
    try {
      const supabase = createBrowserSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error(t('tickets.loginRequired'))
        router.push('/auth/login')
        return
      }
      
      setUser(user)
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/auth/login')
    }
  }

  const fetchServers = async () => {
    try {
      const response = await fetch('/api/servers')
      if (response.ok) {
        const data = await response.json()
        setServers(data)
      }
    } catch (error) {
      console.error('Error fetching servers:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId: user.id,
          serverId: formData.serverId || null
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(t('tickets.ticketCreated'))
        router.push(`/tickets/${data.id}`)
      } else {
        const error = await response.json()
        toast.error(error.error || t('tickets.ticketCreateError'))
      }
    } catch (error) {
      console.error('Submit error:', error)
      toast.error(t('tickets.ticketCreateError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#0a0a0a]/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/tickets" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-5 h-5 text-green-500" />
            <img src="/logo.png" alt="ServerListRank" className="w-11 h-11 object-contain" />
            <div>
              <h1 className="text-2xl font-bold text-green-500">ServerListRank</h1>
              <p className="text-xs text-gray-400">{t('tickets.createTicket')}</p>
            </div>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">{t('tickets.createTicket')}</h2>
            <p className="text-gray-400">{t('tickets.describeIssue')}</p>
          </div>

          <Card className="bg-[#0f0f0f] border-gray-800 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="category">{t('tickets.categoryRequired')}</Label>
                <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                  <SelectTrigger className="bg-gray-900 border-gray-700 mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">{t('tickets.generalQuestion')}</SelectItem>
                    <SelectItem value="server_report">{t('tickets.reportServer')}</SelectItem>
                    <SelectItem value="server_removal">{t('tickets.serverRemoval')}</SelectItem>
                    <SelectItem value="hosting_application">{t('tickets.hostingApplication')}</SelectItem>
                    <SelectItem value="account">{t('tickets.accountIssue')}</SelectItem>
                    <SelectItem value="technical">{t('tickets.technicalProblem')}</SelectItem>
                    <SelectItem value="purchase">{t('tickets.purchase')}</SelectItem>
                    <SelectItem value="other">{t('tickets.other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Hosting Application Info */}
              {formData.category === 'hosting_application' && (
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <h3 className="text-green-500 font-semibold mb-2">🖥️ Hosting Başvurusu</h3>
                  <p className="text-gray-400 text-sm mb-3">
                    Hosting firmanızı listelemek için lütfen aşağıdaki bilgileri mesaj kısmında belirtin:
                  </p>
                  <ul className="text-gray-400 text-sm space-y-1 list-disc list-inside">
                    <li>Hosting firma adı</li>
                    <li>Website adresi</li>
                    <li>Sunulan hizmetler ve özellikler</li>
                    <li>Fiyat aralığı</li>
                    <li>İletişim bilgileri</li>
                    <li>Logo URL (varsa)</li>
                  </ul>
                </div>
              )}

              {(formData.category === 'server_report' || formData.category === 'server_removal') && (
                <div>
                  <Label htmlFor="serverId">{t('tickets.selectServer')}</Label>
                  <Select value={formData.serverId} onValueChange={(val) => setFormData({ ...formData, serverId: val })}>
                    <SelectTrigger className="bg-gray-900 border-gray-700 mt-2">
                      <SelectValue placeholder={t('tickets.chooseServer')} />
                    </SelectTrigger>
                    <SelectContent>
                      {servers.map((server) => (
                        <SelectItem key={server.id} value={server.id}>
                          {server.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="priority">{t('tickets.priorityRequired')}</Label>
                <Select value={formData.priority} onValueChange={(val) => setFormData({ ...formData, priority: val })}>
                  <SelectTrigger className="bg-gray-900 border-gray-700 mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t('tickets.lowPriority')}</SelectItem>
                    <SelectItem value="normal">{t('tickets.normalPriority')}</SelectItem>
                    <SelectItem value="high">{t('tickets.highPriority')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subject">{t('tickets.subjectRequired')}</Label>
                <Input
                  id="subject"
                  placeholder={t('tickets.subjectPlaceholder')}
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="bg-gray-900 border-gray-700 mt-2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="message">{t('tickets.messageRequired')}</Label>
                <Textarea
                  id="message"
                  placeholder={t('tickets.messagePlaceholder')}
                  rows={8}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="bg-gray-900 border-gray-700 mt-2"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Be as specific as possible to help us resolve your issue faster
                </p>
              </div>

              <div className="flex gap-3">
                <Link href="/tickets" className="flex-1">
                  <Button type="button" variant="outline" className="w-full border-gray-700">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('tickets.submitting')}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      {t('tickets.submit')}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>

          <div className="mt-6 bg-blue-950/30 border border-blue-800 rounded-lg p-4">
            <h3 className="font-medium mb-2 text-blue-400">💡 Tips for better support:</h3>
            <ul className="text-sm text-blue-300 space-y-1">
              <li>• Include relevant server names or links</li>
              <li>• Describe what you expected vs what happened</li>
              <li>• Add screenshots if applicable (you can reply with images)</li>
              <li>• Response time: Usually within 24 hours</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}