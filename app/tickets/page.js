'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Ticket, Plus, MessageSquare, Clock, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { useLanguage } from '@/contexts/LanguageContext'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function MyTicketsPage() {
  const router = useRouter()
  const { t, locale } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [tickets, setTickets] = useState([])
  const [filter, setFilter] = useState('all')
  
  useEffect(() => {
    checkAuth()
  }, [])
  
  const checkAuth = async () => {
    try {
      const supabase = createBrowserSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }
      
      fetchTickets()
    } catch (error) {
      console.error('Auth error:', error)
      router.push('/auth/login')
    }
  }
  
  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/tickets/my')
      if (response.ok) {
        const data = await response.json()
        setTickets(data)
      } else {
        toast.error(t('tickets.loadError'))
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error(t('common.errorOccurred'))
    } finally {
      setLoading(false)
    }
  }
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-green-600">🟢 {t('tickets.open')}</Badge>
      case 'in_progress':
        return <Badge className="bg-blue-600">🔵 {t('tickets.inProgress')}</Badge>
      case 'closed':
        return <Badge className="bg-gray-600">⚪ {t('tickets.closed')}</Badge>
      default:
        return <Badge className="bg-gray-600">{status}</Badge>
    }
  }
  
  const filteredTickets = tickets.filter(ticket => {
    if (filter === 'all') return true
    return ticket.status === filter
  })
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-green-500"></div>
          <p className="mt-4 text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] py-12">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/profile">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('common.back')}
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">{t('tickets.title')}</h1>
          </div>
          <Link href="/tickets/create">
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              {t('tickets.newTicket')}
            </Button>
          </Link>
        </div>
        
        {/* Filter */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-green-600' : 'border-gray-700'}
          >
            {t('tickets.all')} ({tickets.length})
          </Button>
          <Button
            variant={filter === 'open' ? 'default' : 'outline'}
            onClick={() => setFilter('open')}
            className={filter === 'open' ? 'bg-green-600' : 'border-gray-700'}
          >
            {t('tickets.open')} ({tickets.filter(t => t.status === 'open').length})
          </Button>
          <Button
            variant={filter === 'in_progress' ? 'default' : 'outline'}
            onClick={() => setFilter('in_progress')}
            className={filter === 'in_progress' ? 'bg-blue-600' : 'border-gray-700'}
          >
            {t('tickets.inProgress')} ({tickets.filter(t => t.status === 'in_progress').length})
          </Button>
          <Button
            variant={filter === 'closed' ? 'default' : 'outline'}
            onClick={() => setFilter('closed')}
            className={filter === 'closed' ? 'bg-gray-600' : 'border-gray-700'}
          >
            {t('tickets.closed')} ({tickets.filter(t => t.status === 'closed').length})
          </Button>
        </div>
        
        {/* Tickets List */}
        {filteredTickets.length === 0 ? (
          <Card className="bg-[#0f0f0f] border-gray-800 p-12 text-center">
            <Ticket className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">
              {filter === 'all' ? t('tickets.noTickets') : `${t('tickets.noTicketsFilter')} ${filter}`}
            </p>
            <Link href="/tickets/create">
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                {t('tickets.createFirst')}
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <Card key={ticket.id} className="bg-[#0f0f0f] border-gray-800 p-6 hover:border-green-500/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Ticket className="w-5 h-5 text-green-500" />
                      <h3 className="text-xl font-bold">#{ticket.id.slice(-6)} - {ticket.subject}</h3>
                      {getStatusBadge(ticket.status)}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {t('tickets.created')} {new Date(ticket.createdAt).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {ticket.updatedAt && (
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {t('tickets.lastUpdate')} {new Date(ticket.updatedAt).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US')}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-300 line-clamp-2">{ticket.message}</p>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Link href={`/tickets/${ticket.id}`}>
                      <Button size="sm" variant="outline" className="border-gray-700">
                        {t('tickets.view')}
                      </Button>
                    </Link>
                    {ticket.status !== 'closed' && (
                      <Link href={`/tickets/${ticket.id}#reply`}>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          {t('tickets.reply')}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
