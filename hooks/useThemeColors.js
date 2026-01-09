'use client'

import { useState, useEffect } from 'react'

export function useThemeColors() {
  const [colors, setColors] = useState({
    primary: '#22c55e',
    secondary: '#eab308',
    accent: '#3b82f6'
  })

  useEffect(() => {
    fetchColors()
  }, [])

  const fetchColors = async () => {
    try {
      const response = await fetch('/api/settings/public-file')
      if (response.ok) {
        const data = await response.json()
        setColors({
          primary: data.primarycolor || '#22c55e',
          secondary: data.secondarycolor || '#eab308',
          accent: data.accentcolor || '#3b82f6'
        })
      }
    } catch (error) {
      console.error('Error fetching theme colors:', error)
    }
  }

  return colors
}
