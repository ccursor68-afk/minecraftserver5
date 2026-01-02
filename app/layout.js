import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Minecraft Server List - Best Minecraft Servers 2025',
  description: 'Find and vote for the best Minecraft servers. Browse survival, skyblock, PvP and more!',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0a0a0a] text-gray-100 antialiased`}>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  )
}