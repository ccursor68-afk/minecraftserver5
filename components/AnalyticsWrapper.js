'use client'

import { useEffect, useState } from 'react'
import GoogleAnalytics from './GoogleAnalytics'
import GoogleAds from './GoogleAds'

export default function AnalyticsWrapper() {
  const [settings, setSettings] = useState(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings/public')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  if (!settings) return null

  return (
    <>
      {settings.analyticsEnabled && settings.googleAnalyticsId && (
        <GoogleAnalytics analyticsId={settings.googleAnalyticsId} />
      )}
      {settings.adsEnabled && settings.googleAdsClientId && (
        <GoogleAds clientId={settings.googleAdsClientId} />
      )}
    </>
  )
}
