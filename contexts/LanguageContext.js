'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import tr from '../locales/tr.json'
import en from '../locales/en.json'

const LanguageContext = createContext()

const translations = {
  tr,
  en
}

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState('tr') // Default Turkish
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    // Load saved language from localStorage
    const savedLocale = localStorage.getItem('locale')
    if (savedLocale && (savedLocale === 'tr' || savedLocale === 'en')) {
      setLocale(savedLocale)
    }
    setMounted(true)
  }, [])
  
  const changeLocale = (newLocale) => {
    if (newLocale === 'tr' || newLocale === 'en') {
      setLocale(newLocale)
      localStorage.setItem('locale', newLocale)
    }
  }
  
  const t = (key) => {
    const keys = key.split('.')
    let value = translations[locale]
    
    for (const k of keys) {
      if (value && value[k]) {
        value = value[k]
      } else {
        return key // Return key if translation not found
      }
    }
    
    return value
  }
  
  if (!mounted) {
    return null // Prevent hydration mismatch
  }
  
  return (
    <LanguageContext.Provider value={{ locale, changeLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}