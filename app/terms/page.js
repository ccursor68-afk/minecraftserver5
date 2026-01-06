'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Ana Sayfa
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Kullanım Koşulları</h1>
        </div>

        <Card className="bg-[#0f0f0f] border-gray-800 p-8">
          <div className="prose prose-invert prose-green max-w-none space-y-6">
            <p className="text-gray-400">Son güncelleme: {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            
            <section>
              <h2 className="text-2xl font-bold text-green-500 mb-4">1. Koşulların Kabulü</h2>
              <p className="text-gray-300">
                Bu Minecraft Sunucu Listesi sitesini kullanarak, bu kullanım koşullarını kabul etmiş 
                olursunuz. Eğer bu koşulları kabul etmiyorsanız, lütfen siteyi kullanmayın.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-500 mb-4">2. Hizmet Tanımı</h2>
              <p className="text-gray-300 mb-4">
                Sitemiz, Minecraft sunucularını listelemek ve oyuncuların sunucuları keşfetmesine 
                yardımcı olmak için bir platformdur. Aşağıdaki hizmetleri sunuyoruz:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Minecraft sunucu listesi</li>
                <li>Sunuculara oy verme sistemi</li>
                <li>Sunucu sahipleri için tanıtım platformu</li>
                <li>Blog ve forum özellikleri</li>
                <li>Banner reklam sistemi</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-500 mb-4">3. Hesap Kuralları</h2>
              
              <h3 className="text-xl font-semibold text-green-400 mb-2">3.1 Hesap Oluşturma</h3>
              <p className="text-gray-300 mb-4">
                Hesap oluşturmak için:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4">
                <li>En az 13 yaşında olmalısınız</li>
                <li>Doğru ve güncel bilgiler sağlamalısınız</li>
                <li>Yalnızca bir hesap oluşturmalısınız</li>
                <li>Hesabınızın güvenliğinden siz sorumlusunuz</li>
              </ul>

              <h3 className="text-xl font-semibold text-green-400 mb-2">3.2 Yasak Davranışlar</h3>
              <p className="text-gray-300 mb-4">
                Aşağıdaki davranışlar kesinlikle yasaktır:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Sahte hesaplar oluşturmak</li>
                <li>Başkalarının hesaplarını kullanmak</li>
                <li>Botlar veya otomasyon araçları kullanmak</li>
                <li>Oy sistemini manipule etmek</li>
                <li>Spam veya kötüye kullanım</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-500 mb-4">4. Sunucu Listeleme Kuralları</h2>
              
              <h3 className="text-xl font-semibold text-green-400 mb-2">4.1 Kabul Edilebilir İçerik</h3>
              <p className="text-gray-300 mb-4">Sunucunuz:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4">
                <li>Minecraft sunucusu olmalı</li>
                <li>Erişilebilir ve çalışır durumda olmalı</li>
                <li>Doğru bilgiler içermeli (IP, port, versiyon)</li>
                <li>Uygun görseller ve açıklamalar kullanmalı</li>
              </ul>

              <h3 className="text-xl font-semibold text-green-400 mb-2">4.2 Yasak İçerik</h3>
              <p className="text-gray-300 mb-4">Aşağıdakiler yasaktır:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Yanlış veya aldatmacı bilgiler</li>
                <li>Hakaret, nefret söylemi veya ayrımcılık</li>
                <li>Uygunsuz veya pornografik içerik</li>
                <li>Şiddet, suç veya yasadışı faaliyetleri teşvik etmek</li>
                <li>Telif hakkı ihlali (izinsiz görsel/metin kullanımı)</li>
                <li>Diğer sunucuları kötülemek</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-500 mb-4">5. Oy Verme Sistemi</h2>
              
              <h3 className="text-xl font-semibold text-green-400 mb-2">5.1 Oy Verme Kuralları</h3>
              <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4">
                <li>Her kullanıcı her sunucuya 24 saatte bir oy verebilir</li>
                <li>Oy vermek için geçerli bir Minecraft kullanıcı adı gereklidir</li>
                <li>Oy manipulasyonu (VPN, botlar, vb.) yasaktır</li>
                <li>Sahte oylar tespit edildiğinde silinir</li>
              </ul>

              <h3 className="text-xl font-semibold text-green-400 mb-2">5.2 Votifier</h3>
              <p className="text-gray-300">
                Oy verdiğinizde, Minecraft kullanıcı adınız Votifier protokolü üzerinden 
                sunucuya gönderilir. Bu, sunucunun size oyuncu içi ödül vermesini sağlar.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-500 mb-4">6. Fikri Mülkiyet</h2>
              <p className="text-gray-300 mb-4">
                Sitenin tasarımı, logo, kod ve içeriği bizim fikri mülkiyetimizdir. 
                Aşağıdakiler hariç:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4">
                <li>Kullanıcıların yüklediği sunucu banner ve açıklamaları</li>
                <li>Minecraft ve Mojang markaları (Microsoft'a aittir)</li>
                <li>Blog yazıları (yazarlara aittir)</li>
              </ul>
              <p className="text-gray-300">
                Sitenin içeriğini kopyalamak, dağıtmak veya değiştirmek yasaktır.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-500 mb-4">7. Garanti Reddi</h2>
              <p className="text-gray-300 mb-4">
                Hizmetimiz "olduğu gibi" sunulmaktadır. Aşağıdakiler için garanti vermiyoruz:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Kesintisiz veya hatasız hizmet</li>
                <li>Listelenen sunucuların kalitesi veya güvenliği</li>
                <li>Sunucu sahiplerinin davranışları</li>
                <li>Oyuncu içi ödüllerin teslimi (Votifier sorumlusu sunucudur)</li>
                <li>Veri kaybı veya güvenlik ihlali</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-500 mb-4">8. Sorumluluk Sınırlaması</h2>
              <p className="text-gray-300">
                Sitemizi kullanmanızdan doğabilecek herhangi bir zarar için sorumlu değiliz. 
                Bu, aşağıdakileri içerir ancak bunlarla sınırlı değildir:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 mt-4">
                <li>Dolaylı, dolaysız veya arizi zararlar</li>
                <li>Veri veya kar kaybı</li>
                <li>Üçüncü taraf sunucularından kaynaklanan sorunlar</li>
                <li>Hizmet kesintileri</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-500 mb-4">9. Hesap Askıya Alma ve Sonlandırma</h2>
              <p className="text-gray-300 mb-4">
                Aşağıdaki durumlarda hesabınızı askıya alabilir veya sonlandırabiliriz:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4">
                <li>Kullanım koşullarının ihlali</li>
                <li>Sahte veya spam içerik</li>
                <li>Oy manipulasyonu</li>
                <li>Kötüye kullanım veya taciz</li>
                <li>Yasal gereklilikler</li>
              </ul>
              <p className="text-gray-300">
                Hesabınızı istediğiniz zaman silebilirsiniz. Askıya alma veya sonlandırma 
                kararlarına itiraz etmek için bizimle iletişime geçebilirsiniz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-500 mb-4">10. Değişiklikler</h2>
              <p className="text-gray-300">
                Bu kullanım koşullarını istediğimiz zaman değiştirebiliriz. Önemli değişiklikler 
                sitede duyurulacaktır. Devam eden kullanımınız, değişiklikleri kabul ettiğiniz 
                anlamına gelir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-500 mb-4">11. Uygulanabilir Hukuk</h2>
              <p className="text-gray-300">
                Bu koşullar Türkiye Cumhuriyeti yasalarına tabidir. Uyumazlıklar Türkiye 
                mahkemelerinde çözümlenecektir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-500 mb-4">12. İletişim</h2>
              <p className="text-gray-300 mb-4">
                Kullanım koşulları hakkında sorularınız varsa:
              </p>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <p className="text-gray-300">E-posta: support@minecraftserverlist.com</p>
                <p className="text-gray-300">Discord: discord.gg/yourserver</p>
              </div>
            </section>
          </div>
        </Card>
      </div>
    </div>
  )
}