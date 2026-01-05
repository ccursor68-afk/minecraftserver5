'use client'

import { useState, useEffect } from 'react'
import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Gamepad2, ArrowLeft, Send, Loader2, Clock, User, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { createBrowserSupabaseClient } from '@/lib/supabase'

export default function TicketDetailPage({ params }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [replying, setReplying] = useState(false)
  const [replyMessage, setReplyMessage] = useState('')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const supabase = createBrowserSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('Please login to view ticket')
        router.push('/auth/login')
        return
      }
      
      setUser(user)
      fetchTicket()
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/auth/login')
    }
  }

  const fetchTicket = async () => {
    try {
      const response = await fetch(`/api/tickets/${resolvedParams.id}`)
      if (response.ok) {
        const data = await response.json()
        setTicket(data)
      } else {
        toast.error('Ticket not found')
        router.push('/tickets')
      }
    } catch (error) {
      console.error('Error fetching ticket:', error)
      toast.error('Failed to load ticket')
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async (e) => {
    e.preventDefault()
    
    if (!replyMessage.trim()) {
      toast.error('Please enter a message')
      return
    }

    setReplying(true)
    try {
      const response = await fetch(`/api/tickets/${resolvedParams.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          message: replyMessage
        })
      })

      if (response.ok) {
        toast.success('Reply sent!')
        setReplyMessage('')
        fetchTicket()
      } else {
        toast.error('Failed to send reply')
      }
    } catch (error) {
      console.error('Reply error:', error)
      toast.error('Failed to send reply')
    } finally {
      setReplying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-green-500"></div>
          <p className="mt-4 text-gray-400">Loading ticket...</p>
        </div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-400">Ticket not found</p>
          <Link href="/tickets">
            <Button className="mt-4 bg-green-600 hover:bg-green-700">
              Back to Tickets
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
      <header className="border-b border-gray-800 bg-[#0a0a0a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Link href="/tickets" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-5 h-5 text-green-500" />
            <Gamepad2 className="w-8 h-8 text-green-500" />
            <div>
              <h1 className="text-2xl font-bold text-green-500">MINECRAFT SERVER LIST</h1>
              <p className="text-xs text-gray-400">Ticket #{ticket.id.slice(-8)}</p>
            </div>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-[#0f0f0f] border-gray-800 p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Badge className={ticket.status === 'open' ? 'bg-blue-600' : 'bg-gray-600'}>
                    {ticket.status}
                  </Badge>
                  <Badge variant="outline" className="border-gray-600 text-gray-400">
                    {ticket.category}
                  </Badge>
                  <Badge variant="outline" className="border-gray-600 text-gray-400">
                    {ticket.priority} priority
                  </Badge>
                </div>
                <h2 className="text-2xl font-bold mb-2">{ticket.subject}</h2>
                <p className="text-sm text-gray-400">
                  Created {new Date(ticket.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-5 h-5 text-gray-400" />
                <span className="font-medium">You</span>
                <span className="text-xs text-gray-500">
                  {new Date(ticket.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-gray-300 whitespace-pre-wrap">{ticket.message}</p>
            </div>
          </Card>

          {ticket.replies && ticket.replies.length > 0 && (
            <div className="space-y-4 mb-6">
              <h3 className="text-xl font-bold">Replies ({ticket.replies.length})</h3>
              {ticket.replies.map((reply) => (
                <Card key={reply.id} className="bg-[#0f0f0f] border-gray-800 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    {reply.isAdmin ? (
                      <>
                        <Shield className="w-5 h-5 text-green-500" />
                        <span className="font-medium text-green-500">Support Team</span>
                      </>
                    ) : (
                      <>
                        <User className="w-5 h-5 text-gray-400" />
                        <span className="font-medium">You</span>
                      </>
                    )}
                    <span className="text-xs text-gray-500">
                      {new Date(reply.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-300 whitespace-pre-wrap">{reply.message}</p>
                </Card>
              ))}
            </div>
          )}

          {ticket.status === 'open' && (
            <Card className="bg-[#0f0f0f] border-gray-800 p-6">
              <h3 className="text-xl font-bold mb-4">Add Reply</h3>
              <form onSubmit={handleReply}>
                <Textarea
                  placeholder="Type your message here..."
                  rows={4}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="bg-gray-900 border-gray-700 mb-4"
                />
                <Button
                  type="submit"
                  disabled={replying}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {replying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Reply
                    </>
                  )}
                </Button>
              </form>
            </Card>
          )}

          {ticket.status !== 'open' && (
            <Card className="bg-gray-900 border-gray-700 p-6 text-center">
              <Clock className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">This ticket has been {ticket.status}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
