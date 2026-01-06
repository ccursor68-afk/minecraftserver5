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
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { useLanguage } from '@/contexts/LanguageContext'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function RegisterPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error(t('auth.passwordsNotMatch'))
      return
    }

    if (formData.password.length < 6) {
      toast.error(t('auth.passwordTooShort'))
      return
    }

    setLoading(true)

    try {
      const supabase = createBrowserSupabaseClient()
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            role: 'user'
          }
        }
      })

      if (error) {
        console.error('Signup error:', error)
        toast.error(error.message)
      } else if (data?.user) {
        // Create user in our database
        const response = await fetch('/api/auth/create-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: data.user.id,
            email: data.user.email
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error('Create user error:', errorData)
        }

        toast.success(t('auth.accountCreated'))
        
        // Wait a bit for session to be established
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Redirect and force reload
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Registration error:', error)
      toast.error(`${t('auth.registrationFailed')}: ${error.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] flex items-center justify-center px-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-green-500 hover:text-green-400 mb-4">
            <ArrowLeft className="w-4 h-4" />
            {t('auth.backToHome')}
          </Link>
          <div className="flex justify-center mb-4">
            <Gamepad2 className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('auth.createAccount')}</h1>
          <p className="text-gray-400">{t('auth.joinCommunity')}</p>
        </div>

        {/* Register Form */}
        <Card className="bg-[#0f0f0f] border-gray-800 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email">{t('auth.emailAddress')}</Label>
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
              <Label htmlFor="password">{t('auth.password')}</Label>
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
              <p className="text-xs text-gray-400 mt-1">{t('auth.passwordMinLength')}</p>
            </div>

            <div>
              <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
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
                  {t('auth.creatingAccount')}
                </>
              ) : (
                t('auth.createAccount')
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-400">
              {t('auth.hasAccount')}{' '}
              <Link href="/auth/login" className="text-green-500 hover:text-green-400 font-medium">
                {t('auth.login')}
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
