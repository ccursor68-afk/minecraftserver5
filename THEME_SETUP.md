# Site Tema ve Sayfa Yönetimi Sistemi

## 🎨 Özellikler

### 1. Tema Ayarları (`/admin/theme`)
- ✅ Site adı ve slogan düzenleme
- ✅ Logo ve favicon URL girişi
- ✅ 3 renk teması (Primary, Secondary, Accent)
- ✅ Footer metni özelleştirme
- ✅ Sosyal medya linkleri (Discord, X, Facebook, Instagram, YouTube, TikTok)

### 2. Dinamik Sayfa Sistemi (`/admin/pages`)
- ✅ Yeni sayfa oluşturma
- ✅ Markdown içerik desteği
- ✅ SEO meta description
- ✅ Yayınlama/Taslak durumu
- ✅ Footer'da göster/gizle
- ✅ Sıralama özelliği

### 3. Sosyal Medya Widget
- ✅ Footer'da sosyal medya ikonları
- ✅ Dinamik link sistemi
- ✅ Modern icon tasarımı

## 📋 Kurulum Adımları

### 1. Supabase Tabloları Oluşturma

**ÖNEMLİ:** Önce `supabase_site_settings.sql` dosyasını çalıştırın!

```sql
-- 1. Temel site_settings tablosu
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  googleAnalyticsId TEXT DEFAULT '',
  googleAdsClientId TEXT DEFAULT '',
  analyticsEnabled BOOLEAN DEFAULT FALSE,
  adsEnabled BOOLEAN DEFAULT FALSE,
  adSlots JSONB DEFAULT '{}'::jsonb,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- 2. Sonra theme settings ekle (ALTER TABLE)
```

Ardından `supabase_theme_settings.sql` dosyasını çalıştırın.

### 2. API Endpoint'leri

**Admin:**
- `GET/PUT /api/admin/settings` - Tüm ayarlar
- `GET/POST/PUT/DELETE /api/admin/pages` - Sayfa yönetimi

**Public:**
- `GET /api/settings/public` - Public ayarlar
- `GET /api/pages` - Published sayfalar
- `GET /api/pages/[slug]` - Tek sayfa

### 3. Admin Panel Kullanımı

#### Tema Ayarları:
1. Admin → Theme
2. Site bilgilerini girin
3. Logo URL'leri ekleyin
4. Renkleri seçin (color picker)
5. Sosyal medya linklerini ekleyin
6. Kaydet

#### Sayfa Ekleme:
1. Admin → Pages → "Yeni Sayfa"
2. Başlık ve slug girin
3. Markdown içerik yazın
4. SEO açıklaması ekleyin
5. Footer'da göster/gizle seçin
6. Kaydet

## 🎨 Renk Sistemi

### CSS Variables (Otomatik)
```css
:root {
  --primary: #22c55e;
  --secondary: #eab308;
  --accent: #3b82f6;
}
```

Admin panelden değiştirdiğinizde otomatik güncellenir.

## 📄 Dinamik Sayfa Kullanımı

### Sayfa Oluşturma:
```
Slug: privacy-policy
Title: Gizlilik Politikası
Content: (Markdown)
Show in Footer: ✅
Footer Order: 1
```

### Erişim:
```
https://yoursite.com/pages/privacy-policy
```

### Footer'da Görünüm:
```
Footer Links:
- Hakkımızda
- Gizlilik Politikası  
- Kullanım Koşulları
```

## 🌐 Sosyal Medya

### Admin Panelden Ayarlama:
```
Discord: https://discord.gg/yourserver
X: https://x.com/yourhandle
Facebook: https://facebook.com/yourpage
Instagram: https://instagram.com/yourprofile
YouTube: https://youtube.com/@yourchannel
TikTok: https://tiktok.com/@yourhandle
```

### Footer'da Görünüm:
```
[Discord Icon] [X Icon] [Facebook Icon] [Instagram Icon] [YouTube Icon] [TikTok Icon]
```

Boş bırakılan sosyal medyalar görünmez.

## 🔧 Teknik Detaylar

### Dosya Yapısı:
```
/app/
├── app/
│   ├── admin/
│   │   ├── theme/page.js (Tema ayarları)
│   │   ├── pages/page.js (Sayfa yönetimi)
│   │   └── settings/page.js (Analytics/Ads)
│   ├── api/
│   │   ├── admin/
│   │   │   ├── settings/route.js
│   │   │   └── pages/route.js
│   │   ├── settings/public/route.js
│   │   └── pages/
│   │       ├── route.js
│   │       └── [slug]/route.js
│   └── pages/[slug]/page.js (Public sayfa)
├── components/
│   ├── SocialMediaBar.js
│   ├── DynamicTheme.js
│   └── Footer.js (güncellenecek)
└── supabase_theme_settings.sql
```

## 📊 Özet Tablo

| Özellik | Durum | Admin Yolu |
|---------|-------|------------|
| Site Adı | ✅ | /admin/theme |
| Logo | ✅ | /admin/theme |
| Renkler | ✅ | /admin/theme |
| Sosyal Medya | ✅ | /admin/theme |
| Footer Text | ✅ | /admin/theme |
| Sayfalar | ✅ | /admin/pages |
| Analytics | ✅ | /admin/settings |
| Ads | ✅ | /admin/settings |

## 🎯 Sonraki Adımlar

1. ✅ SQL scriptleri çalıştır
2. ✅ Admin theme sayfasına git
3. ✅ Ayarları yap ve kaydet
4. ✅ Sayfalarını ekle
5. ✅ Sayfayı yenile ve kontrol et

## 🆘 Sorun Giderme

**Ayarlar kaydetmiyor:**
- Supabase SQL scriptlerini çalıştırdığınızdan emin olun
- site_settings tablosunun var olduğunu kontrol edin

**Renkler değişmiyor:**
- Sayfayı yenileyin (Ctrl+F5)
- DynamicTheme component'inin layout'ta olduğunu kontrol edin

**Sosyal medya görünmüyor:**
- URL'lerin doğru formatta olduğunu kontrol edin
- Footer component'inin güncellendiğini kontrol edin

## 📝 Notlar

- Logo dosyaları: CDN veya Supabase Storage kullanın
- Favicon: 32x32 veya 64x64 PNG/ICO
- Renkler: HEX format (#RRGGBB)
- Sosyal medya: Tam URL girin (https://)
- Markdown: Sayfa içeriği için desteklenir
