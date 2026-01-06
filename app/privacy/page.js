'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function PrivacyPolicyPage() {
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
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
        </div>

        <Card className="bg-[#0f0f0f] border-gray-800 p-8">
          <div className="prose prose-invert prose-green max-w-none space-y-6">
            <p className="text-gray-400">Son güncelleme: {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            
            <section>
              <h2 className="text-2xl font-bold text-green-500 mb-4">1. Giriş</h2>
              <p className="text-gray-300">
                Bu Minecraft Sunucu Listesi sitesine hoş geldiniz. Gizliliğiniz bizim için önemlidir. 
                Bu gizlilik politikası, hangi bilgileri topladığımızı, nasıl kullandığımızı ve 
                haklarınızı açıklamaktadır.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-500 mb-4">2. Topladığımız Bilgiler</h2>
              
              <h3 className="text-xl font-semibold text-green-400 mb-2">2.1 Hesap Bilgileri</h3>
              <p className="text-gray-300 mb-4">
                Sitemize kayıt olduğunuzda topladığımız bilgiler:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4">
                <li>E-posta adresi</li>
                <li>Kullanıcı adı</li>
                <li>Minecraft kullanıcı adı (opsiyonel)</li>
                <li>Şifre (hashlenmiş)</li>
              </ul>

              <h3 className="text-xl font-semibold text-green-400 mb-2">2.2 Oy Verme Bilgileri</h3>
              <p className="text-gray-300 mb-4">
                Bir sunucuya oy verdiğinizde topladığımız bilgiler:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4">
                <li>Minecraft kullanıcı adınız</li>
                <li>IP adresiniz (spam önleme için)</li>
                <li>Oy verme tarihi ve saati</li>
                <li>Oy verdiğiniz sunucu bilgisi</li>
              </ul>

              <h3 className="text-xl font-semibold text-green-400 mb-2">2.3 Sunucu Bilgileri</h3>
              <p className="text-gray-300 mb-4">
                Sunucu eklerken sağladığınız bilgiler:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4">
                <li>Sunucu adı ve açıklaması</li>
                <li>Sunucu IP adresi</li>
                <li>Banner görselleri</li>
                <li>İletişim bilgileri (Discord, Website)</li>
              </ul>

              <h3 className="text-xl font-semibold text-green-400 mb-2">2.4 Otomatik Toplanan Bilgiler</h3>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>IP adresi</li>
                <li>Tarayıcı türü ve versiyonu</li>
                <li>Ziyaret edilen sayfalar</li>
                <li>Çerezler (cookies)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-500 mb-4">3. Bilgileri Nasıl Kullanıyoruz</h2>
              <p className="text-gray-300 mb-4">Toplanan bilgileri şunlar için kullanıyoruz:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Hesabınızı yönetmek ve hizmetlerimizi sağlamak</li>
                <li>Oy sistemi için Minecraft sunucularına bildirim göndermek (Votifier)</li>
                <li>Spam ve kötüye kullanımı önlemek (IP bazlı sınırlamalar)</li>
                <li>Site performansını iyileştirmek</li>
                <li>Kullanıcı desteği sağlamak</li>
                <li>Yasal yükümlülüklere uymak</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-500 mb-4">4. Bilgi Paylaşımı</h2>
              <p className="text-gray-300 mb-4">
                Bilgilerinizi üçüncü şahslarla paylaşmayoruz, aşağıdaki durumlar hariç:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li><strong>Minecraft Sunucuları:</strong> Oy verdiğinizde, Minecraft kullanıcı adınız Votifier üzerinden sunucuya gönderilir</li>
                <li><strong>Yasal Zorunluluklar:</strong> Yasal talep olması durumunda</li>
                <li><strong>Güvenlik:</strong> Sitenin güvenliğini sağlamak için gerektiğinde</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-500 mb-4">5. Çerezler (Cookies)</h2>
              <p className="text-gray-300 mb-4">
                Sitemiz, deneyiminizi iyileştirmek için çerezler kullanır:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li><strong>Zorunlu Çerezler:</strong> Oturum yönetimi için</li>
                <li><strong>Analitik Çerezler:</strong> Site kullanımını anlamak için</li>
                <li><strong>Tercih Çerezleri:</strong> Ayarlarınızı hatırlamak için</li>
              </ul>
              <p className="text-gray-300 mt-4">
                Tarayıcı ayarlarınızdan çerezleri reddedebilirsiniz, ancak bu durumda bazı özellikler çalışmayabilir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-500 mb-4">6. Veri Güvenliği</h2>
              <p className="text-gray-300">
                Bilgilerinizi korumak için şu önlemleri alıyoruz:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 mt-4">
                <li>SSL/TLS şifreleme</li>
                <li>Şifrelerin hashlenmiş olarak saklanması</li>
                <li>Düzenli güvenlik denetimleri</li>
                <li>Erişim kontrolü ve yetkilendirme</li>
                <li>Güvenli veritabanı depolama</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-500 mb-4">7. Haklarınız</h2>
              <p className="text-gray-300 mb-4">Verileriniz üzerinde aşağıdaki haklara sahipsiniz:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li><strong>Erişim:</strong> Hangi verilerinizi sakladığımızı öğrenme</li>
                <li><strong>Düzeltme:</strong> Yanlış bilgileri düzeltme</li>
                <li><strong>Silme:</strong> Hesabınızı ve verilerinizi silme</li>
                <li><strong>İtiraz:</strong> Belirli işlemlere itiraz etme</li>
                <li><strong>Taşınabilirlik:</strong> Verilerinizi indirme</li>
              </ul>
              <p className="text-gray-300 mt-4">
                Bu haklardan yararlanmak için bizimle iletişime geçebilirsiniz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-500 mb-4">8. Çocukların Gizliliği</h2>
              <p className="text-gray-300">
                Sitemiz 13 yaşın altındaki çocuklara yönelik değildir. 13 yaşın altındaki çocuklardan 
                bilerek kişisel bilgi toplamayız. Eğer bir ebeveyn veya vasi olarak çocuğunuzun 
                bilgilerini paylaştığını fark ederseniz, lütfen bizimle iletişime geçin.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-500 mb-4">9. Değişiklikler</h2>
              <p className="text-gray-300">
                Bu gizlilik politikasını zaman zaman güncelleyebiliriz. Önemli değişiklikleri 
                e-posta yoluyla size bildireceğiz. Devam eden kullanımınız, değişiklikleri kabul 
                ettiğiniz anlamına gelir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-500 mb-4">10. İletişim</h2>
              <p className="text-gray-300 mb-4">
                Gizlilik politikası hakkında sorularınız varsa, bizimle iletişime geçebilirsiniz:
              </p>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <p className="text-gray-300">E-posta: privacy@minecraftserverlist.com</p>
                <p className="text-gray-300">Discord: discord.gg/yourserver</p>
              </div>
            </section>
          </div>
        </Card>
      </div>
    </div>
  )
}