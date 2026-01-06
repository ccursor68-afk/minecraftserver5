'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Gamepad2, ArrowLeft, BookOpen, MessageSquare, Clock, User, Eye, Pin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function CategoryDetailPage({ params }) {
  const router = useRouter()
  const [category, setCategory] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [categorySlug, setCategorySlug] = useState(null)

  // Resolve params safely
  useEffect(() => {
    if (params && params.slug) {
      const slug = typeof params.slug === 'string' ? params.slug : params.slug[0]
      setCategorySlug(slug)
    }
  }, [params])

  useEffect(() => {
    if (categorySlug) {
      fetchCategory()
      fetchPosts()
    }
  }, [categorySlug])

  const fetchCategory = async () => {
    if (!categorySlug) return
    
    try {
      const response = await fetch(`/api/blog/categories/${categorySlug}`)
      if (response.ok) {
        const data = await response.json()
        setCategory(data)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Category fetch error:', errorData)
        toast.error('Kategori bulunamadı')
        router.push('/blog')
      }
    } catch (error) {
      console.error('Error fetching category:', error)
      toast.error('Kategori yüklenirken hata oluştu')
      router.push('/blog')
    }
  }

  const fetchPosts = async () => {
    if (!categorySlug) return
    
    try {
      const url = `/api/blog/posts?categorySlug=${encodeURIComponent(categorySlug)}`
      console.log('Fetching posts from:', url)
      
      const response = await fetch(url)
      const data = await response.json()
      
      console.log('Posts response:', { ok: response.ok, status: response.status, data, postCount: Array.isArray(data) ? data.length : 0 })
      
      if (response.ok) {
        const postsArray = Array.isArray(data) ? data : []
        console.log('Setting posts:', postsArray.length)
        setPosts(postsArray)
      } else {
        console.error('Error fetching posts:', data)
        toast.error(data.error || 'Postlar yüklenirken hata oluştu')
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
      toast.error('Postlar yüklenirken hata oluştu: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-green-500"></div>
          <p className="mt-4 text-gray-400">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!category) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#0a0a0a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/blog" className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5 text-green-500" />
              <Gamepad2 className="w-8 h-8 text-green-500" />
              <div>
                <h1 className="text-2xl font-bold text-green-500">MINECRAFT SERVER LIST</h1>
                <p className="text-xs text-gray-400">Blog & Forum</p>
              </div>
            </Link>
            <Link href="/">
              <Button variant="outline" className="border-gray-700">Ana Sayfa</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Category Header */}
          <Card className="bg-[#0f0f0f] border-gray-800 p-8 mb-8" style={{ borderLeftColor: category.color, borderLeftWidth: '4px' }}>
            <div className="flex items-start gap-6">
              <div
                className="w-20 h-20 rounded-lg flex items-center justify-center text-5xl flex-shrink-0"
                style={{ backgroundColor: `${category.color}20` }}
              >
                {category.icon}
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-3">{category.name}</h1>
                {category.description && (
                  <p className="text-gray-400 text-lg mb-4">{category.description}</p>
                )}
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    {posts.length} Konu
                  </span>
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    {posts.reduce((sum, post) => sum + (post.replyCount || 0), 0)} Mesaj
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Posts List */}
          {posts.length === 0 ? (
            <Card className="bg-[#0f0f0f] border-gray-800 p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Henüz konu yok</h3>
              <p className="text-gray-400 mb-6">Bu kategoride henüz hiç konu oluşturulmamış.</p>
              <Link href="/admin/blog/posts/create">
                <Button className="bg-green-600 hover:bg-green-700">
                  İlk Konuyu Oluştur
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/post/${post.slug}`}>
                  <Card className="bg-[#0f0f0f] border-gray-800 hover:border-green-500/50 transition-all hover:shadow-lg hover:shadow-green-500/10 p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Post Icon/Status */}
                        <div className="flex-shrink-0">
                          {post.isPinned ? (
                            <Pin className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                          ) : (
                            <BookOpen className="w-6 h-6 text-gray-500" />
                          )}
                        </div>

                        {/* Post Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold">{post.title}</h3>
                            {post.isPinned && (
                              <Badge className="bg-yellow-600 text-xs">Sabitlenmiş</Badge>
                            )}
                            {post.isLocked && (
                              <Badge variant="outline" className="border-gray-600 text-xs">Kilitli</Badge>
                            )}
                          </div>
                          {post.excerpt && (
                            <p className="text-gray-400 mb-3 line-clamp-2">{post.excerpt}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              Yazar
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {post.createdAt ? new Date(post.createdAt).toLocaleDateString('tr-TR') : 'Yeni'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {post.viewCount || 0} görüntüleme
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-4 h-4" />
                              {post.replyCount || 0} yanıt
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
