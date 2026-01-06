'use client'

import { useEffect } from 'react'

export default function AdSlot({ adSlot, format = 'auto', style = {} }) {
  useEffect(() => {
    try {
      // @ts-ignore
      if (window.adsbygoogle && adSlot) {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({})
      }
    } catch (err) {
      console.error('AdSense error:', err)
    }
  }, [adSlot])

  if (!adSlot || adSlot === '') {
    return (
      <div className="bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
        <p className="text-gray-400">Reklam Alanı</p>
        <p className="text-xs text-gray-500 mt-2">Admin panelden Google Ads ayarlarını yapın</p>
      </div>
    )
  }

  return (
    <div className="my-4">
      <ins
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-format={format}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Will be replaced by actual client ID
        data-ad-slot={adSlot}
        data-full-width-responsive="true"
      />
    </div>
  )
}
