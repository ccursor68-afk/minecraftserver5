'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Star, Server, Zap, HeadphonesIcon, Coins, ExternalLink, ArrowLeft, User, Calendar, ThumbsUp, Send, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { toast } from 'sonner'
import Footer from '@/components/Footer'

// Star Rating Display
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

// Interactive Star Rating Input
function StarRatingInput({ value, onChange, label }) {
  const [hover, setHover] = useState(0)
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-400 w-24">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-6 h-6 cursor-pointer transition-colors ${
              star <= (hover || value)
                ? 'fill-yellow-500 text-yellow-500'
                : 'fill-gray-700 text-gray-700 hover:text-yellow-500/50'
            }`}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(star)}
          />
        ))}
      </div>
      <span className="text-sm text-yellow-500 w-8">{value}/5</span>
    </div>
  )
}

// Rating Bar
function RatingBar({ label, icon: Icon, rating, color, count }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className={`w-5 h-5 ${color}`} />
      <span className="text-sm text-gray-400 w-28">{label}</span>
      <div className="flex-1 bg-gray-800 rounded-full h-3">
        <div
          className={`h-3 rounded-full ${color.replace('text-', 'bg-')}`}
          style={{ width: `${(rating / 5) * 100}%` }}
        />
      </div>
      <span className="text-lg font-bold text-white w-12">{rating.toFixed(1)}</span>
    </div>
  )
}

// Review Card
function ReviewCard({ review }) {
  const avgRating = (review.performance_rating + review.support_rating + review.price_value_rating) / 3
  const reviewDate = new Date(review.created_at).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
              <User className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">
                  {review.user_email?.split('@')[0] || 'Anonim Kullanıcı'}
                </span>
                {review.is_verified && (
                  <Badge className="bg-green-500/20 text-green-500 text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Doğrulanmış
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                {reviewDate}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <StarRating rating={avgRating} size="sm" />
            <span className="text-lg font-bold text-white">{avgRating.toFixed(1)}</span>
          </div>
        </div>
        
        {/* Individual Ratings */}
        <div className="flex gap-4 mb-3 text-xs">
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-green-500" />
            <span className="text-gray-400">Performans:</span>
            <span className="text-white font-semibold">{review.performance_rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <HeadphonesIcon className="w-3 h-3 text-blue-500" />
            <span className="text-gray-400">Destek:</span>
            <span className="text-white font-semibold">{review.support_rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <Coins className="w-3 h-3 text-yellow-500" />
            <span className="text-gray-400">Fiyat/Perf:</span>
            <span className="text-white font-semibold">{review.price_value_rating}</span>
          </div>
        </div>
        
        {review.title && (
          <h4 className="font-semibold text-white mb-2">{review.title}</h4>
        )}
        
        <p className="text-gray-300 text-sm leading-relaxed">{review.comment}</p>
        
        {review.helpful_count > 0 && (
          <div className="flex items-center gap-1 mt-3 text-xs text-gray-500">
            <ThumbsUp className="w-3 h-3" />
            {review.helpful_count} kişi faydalı buldu
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function HostingDetailPage({ params }) {
  const router = useRouter()
  const [hosting, setHosting] = useState(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  
  // Review form state
  const [reviewForm, setReviewForm] = useState({
    title: '',
    comment: '',
    performance_rating: 0,
    support_rating: 0,
    price_value_rating: 0
  })
  
  useEffect(() => {
    checkAuth()
    fetchHosting()
  }, [params.id])
  
  const checkAuth = async () => {
    try {
      const supabase = createBrowserSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    } catch (error) {
      console.error('Auth error:', error)
    }
  }
  
  const fetchHosting = async () => {
    try {
      const response = await fetch(`/api/hostings/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setHosting(data)
      } else {
        toast.error('Hosting bulunamadı')
        router.push('/hostings')
      }
    } catch (error) {
      console.error('Error fetching hosting:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleSubmitReview = async (e) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('Değerlendirme yapmak için giriş yapmalısınız')
      router.push('/auth/login')
      return
    }
    
    if (!reviewForm.performance_rating || !reviewForm.support_rating || !reviewForm.price_value_rating) {
      toast.error('Lütfen tüm kategorileri puanlayın')
      return
    }
    
    if (!reviewForm.comment.trim()) {
      toast.error('Lütfen bir yorum yazın')
      return
    }
    
    setSubmitting(true)
    
    try {
      const response = await fetch(`/api/hostings/${params.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          user_email: user.email,
          ...reviewForm
        })
      })
      
      if (response.ok) {
        toast.success('Değerlendirmeniz başarıyla eklendi!')
        setReviewForm({
          title: '',
          comment: '',
          performance_rating: 0,
          support_rating: 0,
          price_value_rating: 0
        })
        fetchHosting() // Refresh data
      } else {
        const error = await response.json()
        toast.error(error.error || 'Değerlendirme eklenemedi')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error('Bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-green-500"></div>
      </div>
    )
  }
  
  if (!hosting) {
    return null
  }
  
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
      
      {/* Back Button */}
      <div className="container mx-auto px-4 py-4">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/hostings')}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Tüm Hostingler
        </Button>
      </div>
      
      {/* Hosting Detail */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header Card */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    <div className="w-24 h-24 bg-gray-800 rounded-xl flex items-center justify-center overflow-hidden">
                      {hosting.logo_url ? (
                        <img src={hosting.logo_url} alt={hosting.name} className="w-full h-full object-cover" />
                      ) : (
                        <Server className="w-12 h-12 text-gray-600" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-white">{hosting.name}</h1>
                        {hosting.is_featured && (
                          <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50">
                            Öne Çıkan
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-400 mb-4">{hosting.short_description}</p>
                      
                      {/* Features */}
                      <div className="flex flex-wrap gap-2">
                        {hosting.features?.map((feature, idx) => (
                          <Badge key={idx} variant="outline" className="border-gray-700 text-gray-300">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Ratings Overview */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Değerlendirme Özeti
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-white mb-1">
                        {(hosting.avg_overall || 0).toFixed(1)}
                      </div>
                      <StarRating rating={hosting.avg_overall || 0} size="md" />
                      <p className="text-sm text-gray-500 mt-1">
                        {hosting.review_count || 0} değerlendirme
                      </p>
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <RatingBar 
                        label="Performans" 
                        icon={Zap} 
                        rating={hosting.avg_performance || 0} 
                        color="text-green-500" 
                      />
                      <RatingBar 
                        label="Destek Hızı" 
                        icon={HeadphonesIcon} 
                        rating={hosting.avg_support || 0} 
                        color="text-blue-500" 
                      />
                      <RatingBar 
                        label="Fiyat/Performans" 
                        icon={Coins} 
                        rating={hosting.avg_price_value || 0} 
                        color="text-yellow-500" 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Description */}
              {hosting.description && (
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Hakkında</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                      {hosting.description}
                    </p>
                  </CardContent>
                </Card>
              )}
              
              {/* Write Review */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Send className="w-5 h-5 text-green-500" />
                    Değerlendirme Yaz
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {user ? (
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      {/* Rating Inputs */}
                      <div className="space-y-3 p-4 bg-gray-800/50 rounded-lg">
                        <StarRatingInput
                          label="Performans"
                          value={reviewForm.performance_rating}
                          onChange={(v) => setReviewForm({...reviewForm, performance_rating: v})}
                        />
                        <StarRatingInput
                          label="Destek Hızı"
                          value={reviewForm.support_rating}
                          onChange={(v) => setReviewForm({...reviewForm, support_rating: v})}
                        />
                        <StarRatingInput
                          label="Fiyat/Perf."
                          value={reviewForm.price_value_rating}
                          onChange={(v) => setReviewForm({...reviewForm, price_value_rating: v})}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="title" className="text-gray-400">Başlık (Opsiyonel)</Label>
                        <Input
                          id="title"
                          value={reviewForm.title}
                          onChange={(e) => setReviewForm({...reviewForm, title: e.target.value})}
                          placeholder="Değerlendirmenize bir başlık ekleyin"
                          className="bg-gray-800/50 border-gray-700 text-white mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="comment" className="text-gray-400">Yorumunuz *</Label>
                        <Textarea
                          id="comment"
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                          placeholder="Bu hosting hakkındaki deneyimlerinizi paylaşın..."
                          rows={4}
                          className="bg-gray-800/50 border-gray-700 text-white mt-1"
                          required
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                            Gönderiliyor...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Değerlendirmeyi Gönder
                          </>
                        )}
                      </Button>
                    </form>
                  ) : (
                    <div className="text-center py-6">
                      <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400 mb-4">Değerlendirme yapmak için giriş yapmalısınız</p>
                      <Button 
                        onClick={() => router.push('/auth/login')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Giriş Yap
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Reviews */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-green-500" />
                  Kullanıcı Değerlendirmeleri ({hosting.reviews?.length || 0})
                </h2>
                
                {hosting.reviews?.length > 0 ? (
                  <div className="space-y-4">
                    {hosting.reviews.map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))}
                  </div>
                ) : (
                  <Card className="bg-gray-900/50 border-gray-800">
                    <CardContent className="py-12 text-center">
                      <Star className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                      <p className="text-gray-500">Henüz değerlendirme yapılmamış</p>
                      <p className="text-gray-600 text-sm">İlk değerlendirmeyi siz yapın!</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Price Card */}
              <Card className="bg-gray-900/50 border-gray-800 sticky top-24">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <span className="text-sm text-gray-500">Başlangıç Fiyatı</span>
                    <div className="text-4xl font-bold text-green-500">
                      {hosting.min_price?.toFixed(2)}
                      <span className="text-lg text-gray-400 ml-1">{hosting.currency}/ay</span>
                    </div>
                    {hosting.max_price && hosting.max_price !== hosting.min_price && (
                      <span className="text-sm text-gray-500">
                        - {hosting.max_price?.toFixed(2)} {hosting.currency}/ay
                      </span>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700 mb-3"
                    onClick={() => hosting.website && window.open(hosting.website, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Siteye Git
                  </Button>
                  
                  {hosting.website && (
                    <p className="text-xs text-gray-500 text-center truncate">
                      {hosting.website}
                    </p>
                  )}
                  
                  <Separator className="my-4 bg-gray-800" />
                  
                  {/* Quick Stats */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Genel Puan</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        <span className="font-bold text-white">{(hosting.avg_overall || 0).toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Değerlendirme</span>
                      <span className="font-bold text-white">{hosting.review_count || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Performans</span>
                      <span className="font-bold text-green-500">{(hosting.avg_performance || 0).toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Destek</span>
                      <span className="font-bold text-blue-500">{(hosting.avg_support || 0).toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Fiyat/Perf.</span>
                      <span className="font-bold text-yellow-500">{(hosting.avg_price_value || 0).toFixed(1)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  )
}
