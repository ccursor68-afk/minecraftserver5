'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { Gamepad2, ArrowLeft, MessageSquare, Clock, User, Eye, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'

export default function PostDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  const postSlug = params?.slug

  useEffect(() => {
    if (postSlug) {
      fetchPost()
    }
  }, [postSlug])

  const fetchPost = async () => {
    if (!postSlug) return
    
    try {
      const response = await fetch(`/api/blog/posts?slug=${encodeURIComponent(postSlug)}`)
      const data = await response.json()
      
      if (response.ok) {
        setPost(data)
      } else {
        console.error('Error fetching post:', data)
        toast.error('Post bulunamadı')
        router.push('/blog')
      }
    } catch (error) {
      console.error('Error fetching post:', error)
      toast.error('Post yüklenirken hata oluştu')
      router.push('/blog')
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

  if (!post) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#0a0a0a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="text-gray-400 hover:text-green-500">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <Link href="/blog" className="flex items-center gap-2">
                <Gamepad2 className="w-8 h-8 text-green-500" />
                <div>
                  <h1 className="text-2xl font-bold text-green-500">MINECRAFT SERVER LIST</h1>
                  <p className="text-xs text-gray-400">Blog & Forum</p>
                </div>
              </Link>
            </div>
            <Link href="/">
              <Button variant="outline" className="border-gray-700">Ana Sayfa</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Post Header */}
          <Card className="bg-[#0f0f0f] border-gray-800 p-8 mb-6">
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            
            {/* Post Meta */}
            <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Yazar
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {post.createdAt ? new Date(post.createdAt).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Yeni'}
              </span>
              <span className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                {post.viewCount || 0} görüntüleme
              </span>
              <span className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                {post.replies?.length || 0} yanıt
              </span>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mb-6">
                <Tag className="w-4 h-4 text-gray-500" />
                {post.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="border-gray-700">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Excerpt */}
            {post.excerpt && (
              <div className="bg-gray-900 border-l-4 border-green-500 p-4 rounded mb-6">
                <p className="text-gray-300 italic">{post.excerpt}</p>
              </div>
            )}
          </Card>

          {/* Post Content */}
          <Card className="bg-[#0f0f0f] border-gray-800 p-8 mb-6">
            <div className="prose prose-invert prose-green max-w-none">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
          </Card>

          {/* Replies Section */}
          <Card className="bg-[#0f0f0f] border-gray-800 p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-green-500" />
              Yorumlar ({post.replies?.length || 0})
            </h2>

            {post.replies && post.replies.length > 0 ? (
              <div className="space-y-4">
                {post.replies.map((reply) => (
                  <div key={reply.id} className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                    <div className="flex items-center gap-2 mb-2 text-sm text-gray-500">
                      <User className="w-4 h-4" />
                      <span>Kullanıcı</span>
                      <span>•</span>
                      <Clock className="w-4 h-4" />
                      <span>
                        {reply.createdAt ? new Date(reply.createdAt).toLocaleDateString('tr-TR') : 'Yeni'}
                      </span>
                    </div>
                    <p className="text-gray-300">{reply.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Henüz yorum yok. İlk yorumu siz yapın!</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
