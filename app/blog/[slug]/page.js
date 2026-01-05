'use client'

import { useState, useEffect } from 'react'
import { use } from 'react'
import Link from 'next/link'
import { Gamepad2, ArrowLeft, Plus, Pin, Lock, Eye, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function CategoryPage({ params }) {
  const resolvedParams = use(params)
  const [category, setCategory] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategory()
    fetchPosts()
  }, [resolvedParams.slug])

  const fetchCategory = async () => {
    try {
      const response = await fetch(`/api/blog/categories/${resolvedParams.slug}`)
      if (response.ok) {
        const data = await response.json()
        setCategory(data)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const fetchPosts = async () => {
    try {
      const response = await fetch(`/api/blog/posts?categorySlug=${resolvedParams.slug}`)
      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-green-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
      <header className="border-b border-gray-800 bg-[#0a0a0a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/blog" className="flex items-center gap-2 hover:opacity-80">
              <ArrowLeft className="w-5 h-5 text-green-500" />
              <Gamepad2 className="w-8 h-8 text-green-500" />
              <div>
                <h1 className="text-2xl font-bold text-green-500">MINECRAFT SERVER LIST</h1>
                <p className="text-xs text-gray-400">{category?.name}</p>
              </div>
            </Link>
            <Link href="/admin/blog/posts/create">
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Yeni Yazı
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {category && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">{category.icon}</span>
                <div>
                  <h2 className="text-3xl font-bold">{category.name}</h2>
                  <p className="text-gray-400">{category.description}</p>
                </div>
              </div>
            </div>
          )}

          {posts.length === 0 ? (
            <Card className="bg-[#0f0f0f] border-gray-800 p-12 text-center">
              <p className="text-gray-400 text-lg">Henüz yazı yok</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/post/${post.slug}`}>
                  <Card className="bg-[#0f0f0f] border-gray-800 hover:border-green-500/50 transition-all p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {post.isPinned && <Pin className="w-4 h-4 text-green-500" />}
                          {post.isLocked && <Lock className="w-4 h-4 text-gray-500" />}
                          <h3 className="text-xl font-bold">{post.title}</h3>
                        </div>
                        {post.excerpt && (
                          <p className="text-gray-400 text-sm mb-2 line-clamp-2">{post.excerpt}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{new Date(post.createdAt).toLocaleDateString('tr-TR')}</span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {post.viewCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {post.replyCount}
                          </span>
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