'use client'

import Link from 'next/link'
import { Gamepad2, Mail, MessageCircle, Heart } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()
  
  return (
    <footer className="bg-[#0a0a0a] border-t border-gray-800 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Gamepad2 className="w-8 h-8 text-green-500" />
              <span className="text-2xl font-bold text-green-500">MINECRAFT SERVER LIST</span>
            </Link>
            <p className="text-gray-400 text-sm mb-4">
              {t('footer.description')}
            </p>
            <p className="text-gray-500 text-xs">
              {t('footer.notAffiliated')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-green-500 transition-colors text-sm">
                  {t('footer.home')}
                </Link>
              </li>
              <li>
                <Link href="/submit" className="text-gray-400 hover:text-green-500 transition-colors text-sm">
                  {t('footer.addServer')}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-green-500 transition-colors text-sm">
                  {t('footer.blog')}
                </Link>
              </li>
              <li>
                <Link href="/tickets/create" className="text-gray-400 hover:text-green-500 transition-colors text-sm">
                  {t('footer.support')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-bold mb-4">{t('footer.legal')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-green-500 transition-colors text-sm">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-green-500 transition-colors text-sm">
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link href="/tickets/create" className="text-gray-400 hover:text-green-500 transition-colors text-sm">
                  {t('footer.contact')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm text-center md:text-left">
              © {new Date().getFullYear()} Minecraft Server List. {t('footer.rights')}
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a 
                href="mailto:support@minecraftserverlist.com" 
                className="text-gray-400 hover:text-green-500 transition-colors"
                aria-label="E-posta"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a 
                href="https://discord.gg/yourserver" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-green-500 transition-colors"
                aria-label="Discord"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
            
            <p className="text-gray-500 text-sm flex items-center gap-1">
              {t('footer.madeWith')} <Heart className="w-4 h-4 text-red-500" /> {t('footer.love')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
