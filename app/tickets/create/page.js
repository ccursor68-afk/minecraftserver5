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

const CATEGORIES = ['general', 'server_report', 'server_removal', 'account', 'technical', 'other']
const PRIORITIES = ['low', 'normal', 'high']

export default function CreateTicketPage() {
  const router = useRouter()
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
    checkAuth()
    fetchServers()
  }, [])

  const checkAuth = async () => {
    try {
      const supabase = createBrowserSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('Please login to create a ticket')
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
        toast.success('Ticket created successfully!')
        router.push(`/tickets/${data.id}`)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create ticket')
      }
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('Failed to create ticket')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#0a0a0a]/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/tickets" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-5 h-5 text-green-500" />
            <Gamepad2 className="w-8 h-8 text-green-500" />
            <div>
              <h1 className="text-2xl font-bold text-green-500">MINECRAFT SERVER LIST</h1>
              <p className="text-xs text-gray-400">Create Support Ticket</p>
            </div>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Create Support Ticket</h2>
            <p className="text-gray-400">Describe your issue and we'll help you resolve it</p>
          </div>

          <Card className="bg-[#0f0f0f] border-gray-800 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                  <SelectTrigger className="bg-gray-900 border-gray-700 mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Question</SelectItem>
                    <SelectItem value="server_report">Report a Server</SelectItem>
                    <SelectItem value="server_removal">Request Server Removal</SelectItem>
                    <SelectItem value="account">Account Issue</SelectItem>
                    <SelectItem value="technical">Technical Problem</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(formData.category === 'server_report' || formData.category === 'server_removal') && (
                <div>
                  <Label htmlFor="serverId">Select Server (Optional)</Label>
                  <Select value={formData.serverId} onValueChange={(val) => setFormData({ ...formData, serverId: val })}>
                    <SelectTrigger className="bg-gray-900 border-gray-700 mt-2">
                      <SelectValue placeholder="Choose a server" />
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
                <Label htmlFor="priority">Priority *</Label>
                <Select value={formData.priority} onValueChange={(val) => setFormData({ ...formData, priority: val })}>
                  <SelectTrigger className="bg-gray-900 border-gray-700 mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - General inquiry</SelectItem>
                    <SelectItem value="normal">Normal - Standard issue</SelectItem>
                    <SelectItem value="high">High - Urgent problem</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  placeholder="Brief description of your issue"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="bg-gray-900 border-gray-700 mt-2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  placeholder="Please provide detailed information about your issue..."
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
                      Creating...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Create Ticket
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