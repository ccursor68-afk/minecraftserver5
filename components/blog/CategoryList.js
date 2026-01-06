'use client'

import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import CategoryCard from './CategoryCard'
import { useLanguage } from '@/contexts/LanguageContext'

export default function CategoryList({ categories }) {
  const { t } = useLanguage()
  const [favorites, setFavorites] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('blogFavorites')
    if (saved) setFavorites(JSON.parse(saved))
  }, [])

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const favoriteCategories = filteredCategories.filter(cat => favorites.includes(cat.id))
  const otherCategories = filteredCategories.filter(cat => !favorites.includes(cat.id))

  return (
    <div>
      {favoriteCategories.length > 0 && (
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-500" />
            {t('blog.favorites')}
          </h3>
          <div className="space-y-4">
            {favoriteCategories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-2xl font-bold mb-4">{t('blog.allCategories')}</h3>
        <div className="space-y-4">
          {otherCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">{t('blog.noCategories')}</p>
        </div>
      )}
    </div>
  )
}
