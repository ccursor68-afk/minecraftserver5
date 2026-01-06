'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useLanguage } from '@/contexts/LanguageContext'

export default function BlogSearch({ onSearch }) {
  const { t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState('')

  const handleChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    onSearch(value)
  }

  return (
    <div className="max-w-2xl mx-auto relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <Input
        type="text"
        placeholder={t('blog.searchCategory')}
        value={searchTerm}
        onChange={handleChange}
        className="pl-10 bg-gray-900 border-gray-700 h-12"
      />
    </div>
  )
}
