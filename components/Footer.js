'use client'

import Link from 'next/link'
import { Gamepad2, Mail, MessageCircle, Heart } from 'lucide-react'

export default function Footer() {
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
              En iyi Minecraft sunucularını keşfedin! Sunucunuzu listeleyerek binlerce oyuncuya ulaşın.
            </p>
            <p className="text-gray-500 text-xs">
              Not affiliated with Mojang Studios or Microsoft.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Hızlı Bağlantılar</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-green-500 transition-colors text-sm">
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link href="/submit" className="text-gray-400 hover:text-green-500 transition-colors text-sm">
                  Sunucu Ekle
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-green-500 transition-colors text-sm">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/admin/tickets/create" className="text-gray-400 hover:text-green-500 transition-colors text-sm">
                  Destek
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-bold mb-4">Yasal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-green-500 transition-colors text-sm">
                  Gizlilik Politikası
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-green-500 transition-colors text-sm">
                  Kullanım Koşulları
                </Link>
              </li>
              <li>
                <Link href="/admin/tickets/create" className="text-gray-400 hover:text-green-500 transition-colors text-sm">
                  İletişim
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm text-center md:text-left">
              © {new Date().getFullYear()} Minecraft Server List. Tüm hakları saklıdır.
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
              Made with <Heart className="w-4 h-4 text-red-500" /> for Minecraft Community
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
