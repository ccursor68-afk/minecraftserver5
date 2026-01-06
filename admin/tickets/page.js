'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { ExternalLink, Trash2 } from 'lucide-react'

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/admin/tickets')
      if (response.ok) {
        const data = await response.json()
        setTickets(data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const closeTicket = async (id) => {
    try {
      const response = await fetch(`/api/admin/tickets/${id}/close`, {
        method: 'PATCH'
      })

      if (response.ok) {
        toast.success('Ticket closed')
        fetchTickets()
      } else {
        toast.error('Failed to close ticket')
      }
    } catch (error) {
      toast.error('Error closing ticket')
    }
  }

  const deleteTicket = async (id) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return

    try {
      const response = await fetch(`/api/admin/tickets/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Ticket deleted')
        fetchTickets()
      } else {
        toast.error('Failed to delete ticket')
      }
    } catch (error) {
      toast.error('Error deleting ticket')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Support Tickets</h1>
        <div className="text-sm text-gray-400">
          Total: {tickets.length} tickets
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-yellow-500"></div>
        </div>
      ) : tickets.length === 0 ? (
        <Card className="bg-gray-900 border-gray-800 p-12 text-center">
          <p className="text-gray-400">No tickets found</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="bg-gray-900 border-gray-800 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold">{ticket.subject}</h3>
                    <Badge className={ticket.status === 'open' ? 'bg-blue-600' : 'bg-gray-600'}>
                      {ticket.status}
                    </Badge>
                    <Badge variant="outline" className="border-gray-600 text-gray-400">
                      {ticket.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400 mb-2 line-clamp-2">{ticket.message}</p>
                  <div className="text-xs text-gray-500">
                    Created: {new Date(ticket.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/tickets/${ticket.id}`}>
                    <Button variant="outline" size="sm" className="border-gray-700">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </Link>
                  {ticket.status === 'open' && (
                    <Button
                      onClick={() => closeTicket(ticket.id)}
                      size="sm"
                      className="bg-gray-700 hover:bg-gray-600"
                    >
                      Close
                    </Button>
                  )}
                  <Button
                    onClick={() => deleteTicket(ticket.id)}
                    variant="outline"
                    size="sm"
                    className="border-gray-700 hover:border-red-500 hover:text-red-500"
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
