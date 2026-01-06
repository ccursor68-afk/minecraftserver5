'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogIn, UserPlus, User, Plus, Lock, Ticket, LogOut, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createBrowserSupabaseClient } from '@/lib/supabase'

export default function UserMenu() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  
  useEffect(() => {
    checkUser()
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  const checkUser = async () => {
    try {
      const supabase = createBrowserSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        // Fetch profile for stats
        const response = await fetch('/api/profile')
        if (response.ok) {
          const data = await response.json()
          setProfile(data)
        }
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }
  
  const handleLogout = async () => {
    try {
      const supabase = createBrowserSupabaseClient()
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      setIsOpen(false)
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }
  
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/auth/login">
          <Button variant="outline" size="sm" className="border-gray-700 hover:border-green-500">
            <LogIn className="w-4 h-4 mr-1" />
            Login
          </Button>
        </Link>
        <Link href="/auth/register">
          <Button size="sm" className="bg-green-600 hover:bg-green-700">
            <UserPlus className="w-4 h-4 mr-1" />
            Sign Up
          </Button>
        </Link>
      </div>
    )
  }
  
  const avatarUrl = profile?.avatarUrl || `https://crafatar.com/avatars/steve?size=32&overlay`
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <img
          src={avatarUrl}
          alt="Avatar"
          className="w-8 h-8 rounded border-2 border-green-500 hover:shadow-lg hover:shadow-green-500/50 transition-shadow"
          onError={(e) => {
            e.target.src = 'https://crafatar.com/avatars/steve?size=32&overlay'
          }}
        />
        <span className="text-sm font-medium hidden md:block">{profile?.username}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-50">
          <div className="p-4 border-b border-gray-800">
            <div className="font-bold text-lg">{profile?.username}</div>
            <div className="text-xs text-gray-400">{profile?.email}</div>
          </div>
          
          <div className="py-2">
            <Link href="/submit" onClick={() => setIsOpen(false)}>
              <button className="w-full px-4 py-2 text-left hover:bg-gray-800 transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4 text-green-500" />
                <span>Sunucu Ekle</span>
              </button>
            </Link>
            
            <Link href="/profile" onClick={() => setIsOpen(false)}>
              <button className="w-full px-4 py-2 text-left hover:bg-gray-800 transition-colors flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" />
                <span>Profilim</span>
              </button>
            </Link>
            
            <Link href="/profile/change-password" onClick={() => setIsOpen(false)}>
              <button className="w-full px-4 py-2 text-left hover:bg-gray-800 transition-colors flex items-center gap-2">
                <Lock className="w-4 h-4 text-yellow-500" />
                <span>Şifre Değiştir</span>
              </button>
            </Link>
            
            <Link href="/admin/tickets" onClick={() => setIsOpen(false)}>
              <button className="w-full px-4 py-2 text-left hover:bg-gray-800 transition-colors flex items-center gap-2">
                <Ticket className="w-4 h-4 text-purple-500" />
                <span>Destek Taleplerim</span>
                {profile?.stats?.openTickets > 0 && (
                  <Badge className="ml-auto bg-red-600 text-xs">{profile.stats.openTickets}</Badge>
                )}
              </button>
            </Link>
          </div>
          
          <div className="border-t border-gray-800 py-2">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left hover:bg-gray-800 transition-colors flex items-center gap-2 text-red-500"
            >
              <LogOut className="w-4 h-4" />
              <span>Çıkış Yap</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}