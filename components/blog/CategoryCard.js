'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BookOpen, MessageSquare, Star, StarOff } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { useLanguage } from '@/contexts/LanguageContext'

export default function CategoryCard({ category }) {
  const { t } = useLanguage()
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('blogFavorites')
    if (saved) {
      const favorites = JSON.parse(saved)
      setIsFavorite(favorites.includes(category.id))
    }
  }, [category.id])

  const toggleFavorite = (e) => {
    e.preventDefault()
    const saved = localStorage.getItem('blogFavorites')
    let favorites = saved ? JSON.parse(saved) : []
    
    if (favorites.includes(category.id)) {
      favorites = favorites.filter(id => id !== category.id)
      setIsFavorite(false)
      toast.success(t('blog.removedFromFavorites'))
    } else {
      favorites.push(category.id)
      setIsFavorite(true)
      toast.success(t('blog.addedToFavorites'))
    }
    
    localStorage.setItem('blogFavorites', JSON.stringify(favorites))
  }

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
                  {category.topicCount || 0} {t('blog.topics')}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  {category.postCount || 0} {t('blog.posts')}
                </span>
              </div>
            </div>
          </div>

          {/* Favorite Button */}
          <button
            onClick={toggleFavorite}
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
