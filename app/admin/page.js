'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Server, Users, Ticket, FileText } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    servers: 0,
    users: 0,
    tickets: 0,
    posts: 0
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [serversRes, ticketsRes] = await Promise.all([
        fetch('/api/servers'),
        fetch('/api/tickets/all')
      ])

      if (serversRes.ok) {
        const servers = await serversRes.json()
        setStats(prev => ({ ...prev, servers: servers.length }))
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const statCards = [
    { label: 'Total Servers', value: stats.servers, icon: Server, color: 'text-blue-500' },
    { label: 'Total Users', value: stats.users, icon: Users, color: 'text-green-500' },
    { label: 'Open Tickets', value: stats.tickets, icon: Ticket, color: 'text-yellow-500' },
    { label: 'Blog Yaz\u0131lar\u0131', value: stats.posts, icon: FileText, color: 'text-purple-500' },
  ]

  return (
    <div>
      <h1 className=\"text-3xl font-bold mb-8\">Dashboard</h1>

      <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6\">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className=\"bg-[#0f0f0f] border-gray-800 p-6\">
              <div className=\"flex items-center justify-between\">
                <div>
                  <p className=\"text-sm text-gray-400 mb-1\">{stat.label}</p>
                  <p className=\"text-3xl font-bold\">{stat.value}</p>
                </div>
                <Icon className={`w-12 h-12 ${stat.color}`} />
              </div>
            </Card>
          )
        })}
      </div>

      <div className=\"mt-8\">
        <Card className=\"bg-[#0f0f0f] border-gray-800 p-6\">
          <h2 className=\"text-2xl font-bold mb-4\">Ho\u015f Geldiniz</h2>
          <p className=\"text-gray-400\">
            Admin paneline ho\u015f geldiniz. Sol taraftaki men\u00fcden istedi\u011finiz b\u00f6l\u00fcme gidebilirsiniz.
          </p>
        </Card>
      </div>
    </div>
  )
}
