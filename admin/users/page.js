'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const changeRole = async (userId, newRole) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })

      if (response.ok) {
        toast.success('Role updated')
        fetchUsers()
      } else {
        toast.error('Failed to update role')
      }
    } catch (error) {
      toast.error('Error updating role')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Users Management</h1>
        <div className="text-sm text-gray-400">
          Total: {users.length} users
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-yellow-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <Card key={user.id} className="bg-gray-900 border-gray-800 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold">{user.email}</h3>
                    <Badge className={user.role === 'admin' ? 'bg-yellow-600' : 'bg-blue-600'}>
                      {user.role}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400">ID: {user.id}</p>
                  {user.lastSignIn && (
                    <p className="text-xs text-gray-500 mt-1">
                      Last login: {new Date(user.lastSignIn).toLocaleString()}
                    </p>
                  )}
                </div>
                <Select value={user.role} onValueChange={(val) => changeRole(user.id, val)}>
                  <SelectTrigger className="w-32 bg-gray-800 border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
