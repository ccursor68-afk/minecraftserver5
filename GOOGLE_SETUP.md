# Google Analytics ve Google Ads Kurulum Rehberi

## 📊 Özellikler

Bu sistem ile şunları yapabilirsiniz:
- **Google Analytics 4** entegrasyonu (ziyaretçi takibi)
- **Google AdSense** entegrasyonu (reklam gösterimi)
- Admin panelden kolay yönetim
- Dinamik reklam pozisyonları
- Açma/kapama toggle'ları

## 🚀 Kurulum Adımları

### 1. Supabase Tablo Oluşturma

Supabase Dashboard'ınıza gidin:
1. SQL Editor'ı açın
2. `/app/supabase_site_settings.sql` dosyasının içeriğini kopyalayın
3. SQL Editor'da çalıştırın
4. Tablo başarıyla oluşturulacaktır

### 2. Google Analytics Kurulumu

#### Analytics ID Alma:
1. [analytics.google.com](https://analytics.google.com) adresine gidin
2. Admin → Data Streams → Web Stream seçin
3. **Measurement ID**'yi kopyalayın (örn: `G-1234567890`)

#### Admin Panelde Ayarlama:
1. Admin Panel → Settings sayfasına gidin
2. "Analytics'i Etkinleştir" toggle'ını açın
3. Measurement ID'yi yapıştırın
4. "Kaydet" butonuna tıklayın

### 3. Google AdSense Kurulumu

#### AdSense ID ve Slot ID'leri Alma:

**Client ID:**
1. [adsense.google.com](https://adsense.google.com) adresine gidin
2. Hesap → Hesap bilgileri
3. **Publisher ID**'yi kopyalayın (örn: `ca-pub-1234567890123456`)

**Ad Slot ID'leri:**
1. Ads → By site → Ad units
2. Display ads → Responsive seçin
3. Yeni reklam birimi oluşturun
4. **Ad slot ID**'yi kopyalayın (sadece rakamlar, örn: `1234567890`)

#### Admin Panelde Ayarlama:
1. Admin Panel → Settings sayfasına gidin
2. "Reklamları Etkinleştir" toggle'ını açın
3. Client ID'yi yapıştırın
4. Her pozisyon için Slot ID'leri girin:
   - **Blog Üst Banner**: Blog sayfası başında
   - **Blog Sidebar**: Blog kategorilerinde sağ sidebar
   - **Blog İçerik Arası**: Blog post içinde
   - **Ana Sayfa Üst Banner**: Ana sayfada üstte
   - **Ana Sayfa Sidebar**: Ana sayfada yan tarafta
5. "Kaydet" butonuna tıklayın

## 📍 Reklam Pozisyonları

### Blog Sayfaları
1. **Üst Banner**: Kategori listesi üstünde (728x90 veya responsive)
2. **Sidebar**: Kategori kartları yanında (300x250 veya 300x600)
3. **İçerik Arası**: Blog post içeriğinde (responsive)

### Ana Sayfa
1. **Üst Banner**: Hero section altında (728x90 veya responsive)
2. **Sidebar**: Server listesi yanında (300x250 veya 300x600)

## 🎨 Görünüm

Reklam slot ID'si girilmediğinde:
```
╔════════════════════════════════╗
║                                ║
║      Reklam Alanı              ║
║  Admin panelden Google Ads     ║
║    ayarlarını yapın            ║
║                                ║
╚════════════════════════════════╝
```

Slot ID girildikten sonra Google Ads reklamları otomatik gösterilir.

## ⚙️ Ayarlar

### Admin Panel → Settings

**Google Analytics:**
- Toggle: Açık/Kapalı
- Measurement ID: G-XXXXXXXXXX

**Google Ads:**
- Toggle: Açık/Kapalı
- Client ID: ca-pub-XXXXXXXXXXXXXXXX
- Slot ID'leri: Her pozisyon için ayrı

## 🔧 Teknik Detaylar

### API Endpoints

**Public (Frontend):**
```
GET /api/settings/public
```
Dönen veri:
```json
{
  "analyticsEnabled": true,
  "googleAnalyticsId": "G-1234567890",
  "adsEnabled": true,
  "googleAdsClientId": "ca-pub-1234567890",
  "adSlots": {
    "blogTopBanner": "1234567890",
    "blogSidebar": "0987654321",
    ...
  }
}
```

**Admin:**
```
GET /api/admin/settings
PUT /api/admin/settings
```

### Components

- `<GoogleAnalytics />`: GA4 script yükler
- `<GoogleAds />`: AdSense script yükler
- `<AdSlot />`: Her reklam pozisyonu için
- `<AnalyticsWrapper />`: Layout'ta otomatik yükleme

## 📝 Notlar

1. **AdSense Onayı**: Google AdSense hesabınızın onaylı olması gerekir
2. **Analytics Gecikme**: İlk veriler 24-48 saat sonra görünür
3. **Reklam Politikaları**: Google AdSense politikalarına uyun
4. **Test Modu**: Slot ID olmadan placeholder görünür

## 🆘 Sorun Giderme

**Reklamlar görünmüyor:**
- Slot ID'lerin doğru girildiğini kontrol edin
- AdSense hesabınızın aktif olduğundan emin olun
- Tarayıcı ad-blocker'ı kapatın
- Console'da hata olup olmadığını kontrol edin

**Analytics çalışmıyor:**
- Measurement ID'nin doğru olduğunu kontrol edin
- Analytics toggle'ının açık olduğunu kontrol edin
- 24 saat bekleyin (ilk veri gecikmesi normal)

**Admin panel ayarları kaydetmiyor:**
- Supabase tablosunun oluşturulduğunu kontrol edin
- Console'da API hatalarını kontrol edin
- Admin yetkisinin olduğunu doğrulayın

## 📞 Destek

Sorun yaşarsanız:
1. Browser console'u kontrol edin
2. Network tab'de API çağrılarını inceleyin
3. Supabase logs'u kontrol edin
4. `supabase_site_settings.sql` dosyasının çalıştırıldığından emin olun
