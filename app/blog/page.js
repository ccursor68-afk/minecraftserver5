'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Gamepad2, Search, BookOpen, MessageSquare, Clock, Star, StarOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { createBrowserSupabaseClient } from '@/lib/supabase'

export default function BlogPage() {
  const [categories, setCategories] = useState([])
  const [favorites, setFavorites] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    checkUser()
    fetchCategories()
    loadFavorites()
  }, [])

  const checkUser = async () => {
    try {
      const supabase = createBrowserSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    } catch (error) {
      console.error('Auth error:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/blog/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadFavorites = () => {
    const saved = localStorage.getItem('blogFavorites')
    if (saved) setFavorites(JSON.parse(saved))
  }

  const toggleFavorite = (categoryId) => {
    let newFavorites = [...favorites]
    if (favorites.includes(categoryId)) {
      newFavorites = favorites.filter(id => id !== categoryId)
      toast.success('Favorilerden kaldırıldı')
    } else {
      newFavorites.push(categoryId)
      toast.success('Favorilere eklendi')
    }
    setFavorites(newFavorites)
    localStorage.setItem('blogFavorites', JSON.stringify(newFavorites))
  }

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const favoriteCategories = filteredCategories.filter(cat => favorites.includes(cat.id))
  const otherCategories = filteredCategories.filter(cat => !favorites.includes(cat.id))

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#0a0a0a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
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
          {/* Hero */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">📰 Blog & Topluluk</h2>
            <p className="text-xl text-gray-400 mb-6">Minecraft haberleri, rehberler ve daha fazlası</p>
            
            {/* Search */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Kategori ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-900 border-gray-700 h-12"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-green-500"></div>
            </div>
          ) : (
            <>
              {/* Favorites */}
              {favoriteCategories.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Star className="w-6 h-6 text-yellow-500" />
                    Favoriler
                  </h3>
                  <div className="space-y-4">
                    {favoriteCategories.map((category) => (
                      <CategoryCard
                        key={category.id}
                        category={category}
                        isFavorite={true}
                        onToggleFavorite={toggleFavorite}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* All Categories */}
              <div>
                <h3 className="text-2xl font-bold mb-4">Tüm Kategoriler</h3>
                <div className="space-y-4">
                  {otherCategories.map((category) => (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      isFavorite={false}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              </div>

              {filteredCategories.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400">Kategori bulunamadı</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function CategoryCard({ category, isFavorite, onToggleFavorite }) {
  return (
    <Link href={`/blog/${category.slug}`}>
      <Card
        className="bg-[#0f0f0f] border-gray-800 hover:border-green-500/50 transition-all hover:shadow-lg hover:shadow-green-500/10 p-6"
        style={{ borderLeftColor: category.color, borderLeftWidth: '4px' }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            {/* Icon */}
            <div
              className="w-16 h-16 rounded-lg flex items-center justify-center text-3xl flex-shrink-0"
              style={{ backgroundColor: `${category.color}20` }}
            >
              {category.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
              <p className="text-gray-400 mb-3">{category.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {category.topicCount || 0} Konu
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  {category.postCount || 0} Mesaj
                </span>
              </div>
            </div>
          </div>

          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.preventDefault()
              onToggleFavorite(category.id)
            }}
            className="ml-4 p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            {isFavorite ? (
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            ) : (
              <StarOff className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>
      </Card>
    </Link>
  )
}