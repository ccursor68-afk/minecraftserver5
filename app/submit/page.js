'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Gamepad2, ArrowLeft, ArrowRight, Check, Loader2, AlertCircle, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { createBrowserSupabaseClient } from '@/lib/supabase'

const CATEGORIES = ['Survival', 'Skyblock', 'PvP', 'Creative', 'Roleplay', 'Network', 'Minigames', 'Other']
const VERSIONS = ['1.21', '1.20.1', '1.19.4', '1.18.2', '1.17.1', '1.16.5', '1.12.2', '1.8.9']

export default function SubmitServerPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [validatingIp, setValidatingIp] = useState(false)
  const [ipValidation, setIpValidation] = useState(null)
  
  // Form data
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    name: '',
    ip: '',
    port: '25565',
    version: '1.21',
    website: '',
    discord: '',
    
    // Step 2: Media
    bannerUrl: '',
    
    // Step 3: Content
    category: 'Survival',
    shortDescription: '',
    longDescription: '',
    
    // Step 4: Votifier (Optional)
    votifierIp: '',
    votifierPort: '8192',
    votifierPublicKey: ''
  })
  
  useEffect(() => {
    checkAuth()
  }, [])
  
  const checkAuth = async () => {
    try {
      const supabase = createBrowserSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('You must be logged in to submit a server')
        router.push('/auth/login')
        return
      }
      
      setUser(user)
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/auth/login')
    } finally {
      setCheckingAuth(false)
    }
  }
  
  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }
  
  // Validate server IP using mcstatus.io
  const validateServerIp = async () => {
    if (!formData.ip) {
      toast.error('Please enter a server IP')
      return
    }
    
    setValidatingIp(true)
    setIpValidation(null)
    
    try {
      const response = await fetch(`https://api.mcstatus.io/v2/status/java/${formData.ip}:${formData.port}`)
      const data = await response.json()
      
      if (data.online) {
        setIpValidation({
          valid: true,
          message: `Server is online! ${data.players?.online || 0} players online`,
          data: data
        })
        toast.success('Server validated successfully!')
      } else {
        setIpValidation({
          valid: false,
          message: 'Server is offline or unreachable',
          data: null
        })
        toast.warning('Server appears to be offline')
      }
    } catch (error) {
      setIpValidation({
        valid: false,
        message: 'Failed to validate server. Please check the IP and port.',
        data: null
      })
      toast.error('Failed to validate server')
    } finally {
      setValidatingIp(false)
    }
  }
  
  // Validate current step
  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.name.trim()) {
          toast.error('Server name is required')
          return false
        }
        if (!formData.ip.trim()) {
          toast.error('Server IP is required')
          return false
        }
        if (!formData.port || formData.port < 1 || formData.port > 65535) {
          toast.error('Invalid port number')
          return false
        }
        return true
      
      case 2:
        if (!formData.bannerUrl.trim()) {
          toast.error('Banner URL is required')
          return false
        }
        return true
      
      case 3:
        if (!formData.shortDescription.trim()) {
          toast.error('Short description is required')
          return false
        }
        if (!formData.longDescription.trim()) {
          toast.error('Long description is required')
          return false
        }
        return true
      
      case 4:
        // Votifier is optional
        return true
      
      default:
        return true
    }
  }
  
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4))
    }
  }
  
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }
  
  const handleSubmit = async () => {
    if (!validateStep(4)) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          port: parseInt(formData.port),
          votifierPort: formData.votifierPort ? parseInt(formData.votifierPort) : null
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success('Server submitted successfully! 🎉')
        setTimeout(() => {
          router.push(`/server/${data.id}`)
        }, 1500)
      } else {
        toast.error(data.error || 'Failed to submit server')
      }
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('Failed to submit server')
    } finally {
      setLoading(false)
    }
  }
  
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Server Name *</Label>
              <Input
                id="name"
                placeholder="My Awesome Server"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                className="bg-gray-900 border-gray-700"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Label htmlFor="ip">Server IP Address *</Label>
                <Input
                  id="ip"
                  placeholder="play.example.com"
                  value={formData.ip}
                  onChange={(e) => updateFormData('ip', e.target.value)}
                  className="bg-gray-900 border-gray-700"
                />
              </div>
              <div>
                <Label htmlFor="port">Port *</Label>
                <Input
                  id="port"
                  type="number"
                  placeholder="25565"
                  value={formData.port}
                  onChange={(e) => updateFormData('port', e.target.value)}
                  className="bg-gray-900 border-gray-700"
                />
              </div>
            </div>
            
            <div>
              <Button
                type="button"
                onClick={validateServerIp}
                disabled={validatingIp}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {validatingIp ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Validate Server IP
                  </>
                )}
              </Button>
              
              {ipValidation && (
                <div className={`mt-2 p-3 rounded-lg border ${
                  ipValidation.valid 
                    ? 'bg-green-950/30 border-green-800 text-green-400' 
                    : 'bg-red-950/30 border-red-800 text-red-400'
                }`}>
                  <p className="text-sm">{ipValidation.message}</p>
                </div>
              )}
            </div>
            
            <div>
              <Label htmlFor="version">Minecraft Version *</Label>
              <Select value={formData.version} onValueChange={(val) => updateFormData('version', val)}>
                <SelectTrigger className="bg-gray-900 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VERSIONS.map(ver => (
                    <SelectItem key={ver} value={ver}>{ver}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="website">Website (Optional)</Label>
              <Input
                id="website"
                placeholder="https://example.com"
                value={formData.website}
                onChange={(e) => updateFormData('website', e.target.value)}
                className="bg-gray-900 border-gray-700"
              />
            </div>
            
            <div>
              <Label htmlFor="discord">Discord Invite (Optional)</Label>
              <Input
                id="discord"
                placeholder="https://discord.gg/example"
                value={formData.discord}
                onChange={(e) => updateFormData('discord', e.target.value)}
                className="bg-gray-900 border-gray-700"
              />
            </div>
          </div>
        )
      
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="bannerUrl">Banner Image URL *</Label>
              <Input
                id="bannerUrl"
                placeholder="https://example.com/banner.png"
                value={formData.bannerUrl}
                onChange={(e) => updateFormData('bannerUrl', e.target.value)}
                className="bg-gray-900 border-gray-700"
              />
              <p className="text-xs text-gray-400 mt-1">
                Recommended size: 468x60px (PNG or JPG)
              </p>
            </div>
            
            {formData.bannerUrl && (
              <div className="mt-4">
                <Label>Preview:</Label>
                <div className="mt-2 border border-gray-700 rounded-lg overflow-hidden">
                  <img
                    src={formData.bannerUrl}
                    alt="Banner preview"
                    className="w-full h-auto"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      toast.error('Failed to load banner image')
                    }}
                  />
                </div>
              </div>
            )}
            
            <div className="bg-blue-950/30 border border-blue-800 rounded-lg p-4">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-300">
                  <p className="font-medium mb-1">Tips for great banners:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Use high contrast colors</li>
                    <li>Include your server name</li>
                    <li>Avoid too much text</li>
                    <li>Make it eye-catching!</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )
      
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(val) => updateFormData('category', val)}>
                <SelectTrigger className="bg-gray-900 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="shortDescription">Short Description * (Max 100 characters)</Label>
              <Input
                id="shortDescription"
                placeholder="A brief description of your server"
                maxLength={100}
                value={formData.shortDescription}
                onChange={(e) => updateFormData('shortDescription', e.target.value)}
                className="bg-gray-900 border-gray-700"
              />
              <p className="text-xs text-gray-400 mt-1">
                {formData.shortDescription.length}/100 characters
              </p>
            </div>
            
            <div>
              <Label htmlFor="longDescription">Long Description * (Markdown supported)</Label>
              <Textarea
                id="longDescription"
                placeholder="# Welcome to our server!&#10;&#10;## Features&#10;- Feature 1&#10;- Feature 2&#10;&#10;Join us today!"
                rows={12}
                value={formData.longDescription}
                onChange={(e) => updateFormData('longDescription', e.target.value)}
                className="bg-gray-900 border-gray-700 font-mono text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">
                Use Markdown for formatting (headings, lists, bold, etc.)
              </p>
            </div>
          </div>
        )
      
      case 4:
        return (
          <div className="space-y-4">
            <div className="bg-green-950/30 border border-green-800 rounded-lg p-4">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-300">
                  <p className="font-medium mb-1">Votifier Settings (Optional)</p>
                  <p className="text-xs">
                    Configure Votifier to reward players who vote for your server. 
                    This section is optional but highly recommended!
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="votifierIp">Votifier IP</Label>
                <Input
                  id="votifierIp"
                  placeholder="Same as server IP"
                  value={formData.votifierIp}
                  onChange={(e) => updateFormData('votifierIp', e.target.value)}
                  className="bg-gray-900 border-gray-700"
                />
              </div>
              <div>
                <Label htmlFor="votifierPort">Votifier Port</Label>
                <Input
                  id="votifierPort"
                  type="number"
                  placeholder="8192"
                  value={formData.votifierPort}
                  onChange={(e) => updateFormData('votifierPort', e.target.value)}
                  className="bg-gray-900 border-gray-700"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="votifierPublicKey">Votifier Public Key</Label>
              <Textarea
                id="votifierPublicKey"
                placeholder="Paste your Votifier public key here"
                rows={4}
                value={formData.votifierPublicKey}
                onChange={(e) => updateFormData('votifierPublicKey', e.target.value)}
                className="bg-gray-900 border-gray-700 font-mono text-xs"
              />
              <p className="text-xs text-gray-400 mt-1">
                Find this in your server's Votifier config file
              </p>
            </div>
            
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <h4 className="font-medium mb-2 text-sm">How to set up Votifier:</h4>
              <ol className="list-decimal list-inside space-y-1 text-xs text-gray-400">
                <li>Install Votifier plugin on your server</li>
                <li>Restart your server to generate keys</li>
                <li>Open config.yml and copy the public key</li>
                <li>Paste the key above</li>
              </ol>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }
  
  const steps = [
    { number: 1, title: 'Basic Info' },
    { number: 2, title: 'Media' },
    { number: 3, title: 'Content' },
    { number: 4, title: 'Votifier' }
  ]
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#0a0a0a]/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-5 h-5 text-green-500" />
            <Gamepad2 className="w-8 h-8 text-green-500" />
            <div>
              <h1 className="text-2xl font-bold text-green-500">MINECRAFT SERVER LIST</h1>
            </div>
          </Link>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Submit Your Server</h1>
            <p className="text-gray-400">Get your Minecraft server listed and start receiving votes!</p>
          </div>
          
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-colors ${
                      currentStep >= step.number
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-400'
                    }`}>
                      {currentStep > step.number ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        step.number
                      )}
                    </div>
                    <span className={`text-xs mt-2 ${
                      currentStep >= step.number ? 'text-green-500' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className={`h-0.5 flex-1 -mt-6 transition-colors ${
                      currentStep > step.number ? 'bg-green-600' : 'bg-gray-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Form Card */}
          <Card className="bg-[#0f0f0f] border-gray-800 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">
                {steps[currentStep - 1].title}
              </h2>
              <p className="text-gray-400 text-sm">
                {currentStep === 1 && 'Enter your server\'s basic information'}
                {currentStep === 2 && 'Add a banner image to make your server stand out'}
                {currentStep === 3 && 'Describe your server and choose a category'}
                {currentStep === 4 && 'Configure vote rewards (optional but recommended)'}
              </p>
            </div>
            
            {renderStep()}
            
            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-8">
              {currentStep > 1 && (
                <Button
                  onClick={prevStep}
                  variant="outline"
                  className="flex-1 border-gray-700"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              )}
              
              {currentStep < 4 ? (
                <Button
                  onClick={nextStep}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Submit Server
                    </>
                  )}
                </Button>
              )}
            </div>
          </Card>
          
          {/* Info Box */}
          <div className="mt-6 bg-gray-900 border border-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-400 text-center">
              <strong className="text-green-500">Note:</strong> Your server will be reviewed and listed shortly after submission.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
