'use client'

import { useEffect, useState } from 'react'

export default function DynamicTheme() {
  const [settings, setSettings] = useState(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings/public-file')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
        applyTheme(data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  const applyTheme = (settings) => {
    if (!settings) return

    // Apply CSS variables for colors
    const root = document.documentElement
    
    if (settings.primarycolor) {
      root.style.setProperty('--color-primary', settings.primarycolor)
    }
    
    if (settings.secondarycolor) {
      root.style.setProperty('--color-secondary', settings.secondarycolor)
    }
    
    if (settings.accentcolor) {
      root.style.setProperty('--color-accent', settings.accentcolor)
    }

    // Update favicon if provided
    if (settings.faviconurl) {
      const favicon = document.querySelector('link[rel="icon"]')
      if (favicon) {
        favicon.href = settings.faviconurl
      } else {
        const link = document.createElement('link')
        link.rel = 'icon'
        link.href = settings.faviconurl
        document.head.appendChild(link)
      }
    }

    // Update page title if sitename is provided
    if (settings.sitename) {
      // Only update if it's still the default
      if (document.title.includes('Minecraft Server List')) {
        document.title = settings.sitename
      }
    }
  }

  return null // This component doesn't render anything
}
