'use client'

import { useEffect } from 'react'
import Script from 'next/script'

export default function GoogleAnalytics({ analyticsId }) {
  if (!analyticsId || analyticsId === '') return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${analyticsId}');
        `}
      </Script>
    </>
  )
}
