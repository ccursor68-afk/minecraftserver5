import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { LanguageProvider } from '@/contexts/LanguageContext'
import AnalyticsWrapper from '@/components/AnalyticsWrapper'
import DynamicTheme from '@/components/DynamicTheme'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://minecraftserverlist.com'),
  title: {
    default: 'Minecraft Server List - En İyi Minecraft Sunucuları 2025 | Best MC Servers',
    template: '%s | Minecraft Server List'
  },
  description: 'En iyi Minecraft sunucularını keşfedin! Survival, Skyblock, PvP, Bedwars ve daha fazla oyun modu. Türkçe ve yabancı sunucular için oy verin. Find and vote for the best Minecraft servers.',
  keywords: [
    'minecraft server list',
    'minecraft sunucu',
    'minecraft server',
    'mc sunucu',
    'minecraft türkçe sunucu',
    'minecraft survival server',
    'minecraft skyblock server',
    'minecraft pvp server',
    'minecraft bedwars server',
    'best minecraft servers',
    'top minecraft servers 2025',
    'minecraft server list turkish',
    'minecraft sunucu listesi'
  ],
  authors: [{ name: 'Minecraft Server List' }],
  creator: 'Minecraft Server List',
  publisher: 'Minecraft Server List',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    alternateLocale: ['en_US'],
    url: '/',
    siteName: 'Minecraft Server List',
    title: 'Minecraft Server List - En İyi MC Sunucuları 2025',
    description: 'En iyi Minecraft sunucularını keşfedin! Türkçe ve yabancı sunucular, tüm oyun modları.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Minecraft Server List'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Minecraft Server List - Best MC Servers 2025',
    description: 'Find the best Minecraft servers! Turkish and international servers, all game modes.',
    images: ['/og-image.png'],
    creator: '@minecraftserverlist'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: '/',
    languages: {
      'tr-TR': '/',
      'en-US': '/'
    }
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className="dark">
      <body className={`${inter.className} bg-[#0a0a0a] text-gray-100 antialiased`}>
        <LanguageProvider>
          <DynamicTheme />
          <AnalyticsWrapper />
          {children}
          <Toaster position="top-center" />
        </LanguageProvider>
      </body>
    </html>
  )
}