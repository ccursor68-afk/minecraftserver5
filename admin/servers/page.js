'use client'

import { useState, useEffect } from 'react'
import { Trash2, Edit, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function AdminServersPage() {
  const [servers, setServers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchServers()
  }, [])

  const fetchServers = async () => {
    try {
      const response = await fetch('/api/servers')
      if (response.ok) {
        const data = await response.json()
        setServers(data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteServer = async (id) => {
    if (!confirm('Are you sure you want to delete this server?')) return

    try {
      const response = await fetch(`/api/admin/servers/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Server deleted')
        fetchServers()
      } else {
        toast.error('Failed to delete server')
      }
    } catch (error) {
      toast.error('Error deleting server')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Servers Management</h1>
        <div className="text-sm text-gray-400">
          Total: {servers.length} servers
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-yellow-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {servers.map((server) => (
            <Card key={server.id} className="bg-gray-900 border-gray-800 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{server.name}</h3>
                    <Badge className={server.status === 'online' ? 'bg-green-600' : 'bg-red-600'}>
                      {server.status}
                    </Badge>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">{server.shortDescription}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>IP: {server.ip}:{server.port}</span>
                    <span>Votes: {server.voteCount}</span>
                    <span>Players: {server.onlinePlayers}/{server.maxPlayers}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a href={`/server/${server.id}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="border-gray-700">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </a>
                  <Button
                    onClick={() => deleteServer(server.id)}
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
