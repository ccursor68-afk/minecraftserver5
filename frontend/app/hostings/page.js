'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Star, Server, Zap, HeadphonesIcon, Coins, ExternalLink, ChevronRight, Award, TrendingUp, Search, Filter, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Footer from '@/components/Footer'

// Star Rating Component
function StarRating({ rating, size = 'sm' }) {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${
            star <= Math.round(rating)
              ? 'fill-yellow-500 text-yellow-500'
              : 'fill-gray-700 text-gray-700'
          }`}
        />
      ))}
    </div>
  )
}

// Rating Bar Component
function RatingBar({ label, icon: Icon, rating, color }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className={`w-4 h-4 ${color}`} />
      <span className="text-xs text-gray-400 w-20">{label}</span>
      <div className="flex-1 bg-gray-800 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${color.replace('text-', 'bg-')}`}
          style={{ width: `${(rating / 5) * 100}%` }}
        />
      </div>
      <span className="text-xs text-white w-8">{rating.toFixed(1)}</span>
    </div>
  )
}

// Hosting Card Component
function HostingCard({ hosting, rank }) {
  const router = useRouter()
  
  return (
    <Card 
      className="bg-gray-900/50 border-gray-800 hover:border-green-500/50 transition-all cursor-pointer group"
      onClick={() => router.push(`/hostings/${hosting.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Rank */}
          <div className="flex flex-col items-center justify-center w-12">
            <span className={`text-2xl font-bold ${rank <= 3 ? 'text-yellow-500' : 'text-gray-500'}`}>
              {rank}
            </span>
            {rank <= 3 && <Award className="w-5 h-5 text-yellow-500" />}
          </div>
          
          {/* Logo */}
          <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
            {hosting.logo_url ? (
              <img 
                src={hosting.logo_url} 
                alt={hosting.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Server className="w-8 h-8 text-gray-600" />
            )}
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-white group-hover:text-green-500 transition-colors truncate">
                {hosting.name}
              </h3>
              {hosting.is_featured && (
                <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50">
                  Öne Çıkan
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-gray-400 mb-2 line-clamp-1">
              {hosting.short_description}
            </p>
            
            {/* Features */}
            <div className="flex flex-wrap gap-1 mb-2">
              {hosting.features?.slice(0, 3).map((feature, idx) => (
                <Badge key={idx} variant="outline" className="text-xs border-gray-700 text-gray-400">
                  {feature}
                </Badge>
              ))}
              {hosting.features?.length > 3 && (
                <Badge variant="outline" className="text-xs border-gray-700 text-gray-400">
                  +{hosting.features.length - 3}
                </Badge>
              )}
            </div>
            
            {/* Ratings */}
            <div className="space-y-1">
              <RatingBar label="Performans" icon={Zap} rating={hosting.avg_performance || 0} color="text-green-500" />
              <RatingBar label="Destek" icon={HeadphonesIcon} rating={hosting.avg_support || 0} color="text-blue-500" />
              <RatingBar label="Fiyat/Perf." icon={Coins} rating={hosting.avg_price_value || 0} color="text-yellow-500" />
            </div>
          </div>
          
          {/* Right Side */}
          <div className="flex flex-col items-end justify-between h-full min-w-[140px]">
            {/* Overall Rating */}
            <div className="text-center mb-2">
              <div className="flex items-center gap-1 mb-1">
                <StarRating rating={hosting.avg_overall || 0} size="md" />
              </div>
              <span className="text-2xl font-bold text-white">
                {(hosting.avg_overall || 0).toFixed(1)}
              </span>
              <span className="text-xs text-gray-500 block">
                ({hosting.review_count || 0} değerlendirme)
              </span>
            </div>
            
            {/* Price */}
            <div className="text-right mb-2">
              <span className="text-xs text-gray-500">Başlangıç</span>
              <div className="text-lg font-bold text-green-500">
                {hosting.min_price?.toFixed(2)} {hosting.currency}
              </div>
            </div>
            
            {/* Button */}
            <Button 
              size="sm" 
              className="bg-green-600 hover:bg-green-700 w-full"
              onClick={(e) => {
                e.stopPropagation()
                if (hosting.website) {
                  window.open(hosting.website, '_blank')
                }
              }}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Siteye Git
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function HostingsPage() {
  const [hostings, setHostings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('avg_overall')
  
  useEffect(() => {
    fetchHostings()
  }, [sortBy])
  
  const fetchHostings = async () => {
    try {
      const response = await fetch(`/api/hostings?sortBy=${sortBy}`)
      if (response.ok) {
        const data = await response.json()
        setHostings(data)
      }
    } catch (error) {
      console.error('Error fetching hostings:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const filteredHostings = hostings.filter(hosting =>
    hosting.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hosting.short_description?.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  const featuredHostings = filteredHostings.filter(h => h.is_featured)
  const regularHostings = filteredHostings.filter(h => !h.is_featured)
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="ServerListRank" className="w-11 h-11 object-contain" />
              <div>
                <h1 className="text-xl font-bold text-green-500">ServerListRank</h1>
                <p className="text-xs text-gray-400">En İyi Minecraft Sunucuları</p>
              </div>
            </Link>
            
            <nav className="flex items-center gap-4">
              <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                Sunucular
              </Link>
              <Link href="/hostings" className="text-green-500 font-semibold">
                Hostingler
              </Link>
              <Link href="/blog" className="text-gray-400 hover:text-white transition-colors">
                Blog
              </Link>
            </nav>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-b from-green-900/20 to-transparent">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Server className="w-10 h-10 text-green-500" />
            <TrendingUp className="w-6 h-6 text-yellow-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            En İyi <span className="text-green-500">Minecraft Hosting</span> Firmaları
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-6">
            Kullanıcı değerlendirmelerine göre en iyi Minecraft sunucu hosting firmalarını keşfedin.
            Performans, destek ve fiyat/performans oranına göre karşılaştırın.
          </p>
          
          {/* Hosting Application CTA */}
          <div className="mb-8">
            <Link href="/tickets/create?category=hosting_application">
              <Button className="bg-yellow-600 hover:bg-yellow-700 text-black font-semibold">
                <PlusCircle className="w-5 h-5 mr-2" />
                Hosting Firmanızı Ekleyin
              </Button>
            </Link>
            <p className="text-gray-500 text-sm mt-2">
              Hosting firmanızı listelemek için başvuru yapın
            </p>
          </div>
          
          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <Input
                placeholder="Hosting ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-900/50 border-gray-700 text-white"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48 bg-gray-900/50 border-gray-700 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sırala" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="avg_overall">Genel Puan</SelectItem>
                <SelectItem value="avg_performance">Performans</SelectItem>
                <SelectItem value="avg_support">Destek Hızı</SelectItem>
                <SelectItem value="avg_price_value">Fiyat/Performans</SelectItem>
                <SelectItem value="review_count">Değerlendirme Sayısı</SelectItem>
                <SelectItem value="min_price">Fiyat (Düşük)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>
      
      {/* Hostings List */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-green-500"></div>
            </div>
          ) : (
            <>
              {/* Featured Hostings */}
              {featuredHostings.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-yellow-500 mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 fill-yellow-500" />
                    Öne Çıkan Hostingler
                  </h2>
                  <div className="space-y-4">
                    {featuredHostings.map((hosting, index) => (
                      <HostingCard key={hosting.id} hosting={hosting} rank={index + 1} />
                    ))}
                  </div>
                </div>
              )}
              
              {/* All Hostings */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-500" />
                  Tüm Hostingler ({filteredHostings.length})
                </h2>
                <div className="space-y-4">
                  {regularHostings.map((hosting, index) => (
                    <HostingCard 
                      key={hosting.id} 
                      hosting={hosting} 
                      rank={featuredHostings.length + index + 1} 
                    />
                  ))}
                </div>
                
                {filteredHostings.length === 0 && (
                  <div className="text-center py-12">
                    <Server className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-500">Henüz hosting bulunamadı.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>
      
      <Footer />
    </div>
  )
}
