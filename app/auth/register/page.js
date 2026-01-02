'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Gamepad2, Mail, Lock, User, Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase' // createBrowserSupabaseClient

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const supabase = createBrowserSupabaseClient()
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            role: 'user'
          }
        }
      })

      if (error) {
        toast.error(error.message)
      } else {
        // Create user in our database
        await fetch('/api/auth/create-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: data.user.id,
            email: data.user.email
          })
        })

        toast.success('Account created! Welcome!')
        router.push('/')
        router.refresh()
      }
    } catch (error) {
      toast.error('Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-green-500 hover:text-green-400 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex justify-center mb-4">
            <Gamepad2 className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-400">Join the Minecraft server community</p>
        </div>

        {/* Register Form */}
        <Card className="bg-[#0f0f0f] border-gray-800 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 bg-gray-900 border-gray-700"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 bg-gray-900 border-gray-700"
                  placeholder="••••••••"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">At least 6 characters</p>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="pl-10 bg-gray-900 border-gray-700"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 h-12"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-green-500 hover:text-green-400 font-medium">
                Login
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}