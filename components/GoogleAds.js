'use client'

import { useEffect } from 'react'
import Script from 'next/script'

export default function GoogleAds({ clientId }) {
  if (!clientId || clientId === '') return null

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  )
}
