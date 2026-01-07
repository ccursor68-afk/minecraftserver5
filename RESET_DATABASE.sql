-- =========================================
-- ADIM 1: ESKİ TABLOYU SİL (RESET)
-- =========================================

DROP TABLE IF EXISTS site_settings CASCADE;
DROP TABLE IF EXISTS custom_pages CASCADE;

-- =========================================
-- ADIM 2: YENİ SITE_SETTINGS TABLOSU
-- =========================================

CREATE TABLE site_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  
  -- Analytics & Ads
  googleanalyticsid TEXT DEFAULT '',
  googleadsclientid TEXT DEFAULT '',
  analyticsenabled BOOLEAN DEFAULT FALSE,
  adsenabled BOOLEAN DEFAULT FALSE,
  adslots JSONB DEFAULT '{}',
  
  -- Tema Ayarları
  sitename TEXT DEFAULT 'Minecraft Server List',
  sitetagline TEXT DEFAULT 'En İyi Minecraft Sunucuları',
  logourl TEXT DEFAULT '',
  faviconurl TEXT DEFAULT '',
  primarycolor TEXT DEFAULT '#22c55e',
  secondarycolor TEXT DEFAULT '#eab308',
  accentcolor TEXT DEFAULT '#3b82f6',
  footertext TEXT DEFAULT '© 2025 Minecraft Server List',
  socialmedia JSONB DEFAULT '{"discord":"","twitter":"","facebook":"","instagram":"","youtube":"","tiktok":""}',
  
  -- Timestamps
  createdat TIMESTAMP DEFAULT NOW(),
  updatedat TIMESTAMP DEFAULT NOW()
);

-- TEK ROW EKLE (ZORUNLU)
INSERT INTO site_settings (id) VALUES ('main');

-- Index
CREATE INDEX idx_site_settings_id ON site_settings(id);

-- =========================================
-- ADIM 3: CUSTOM_PAGES TABLOSU
-- =========================================

CREATE TABLE custom_pages (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadescription TEXT DEFAULT '',
  ispublished BOOLEAN DEFAULT TRUE,
  showinfooter BOOLEAN DEFAULT TRUE,
  footerorder INTEGER DEFAULT 0,
  createdat TIMESTAMP DEFAULT NOW(),
  updatedat TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_custom_pages_slug ON custom_pages(slug);
CREATE INDEX idx_custom_pages_published ON custom_pages(ispublished);
CREATE INDEX idx_custom_pages_footer ON custom_pages(showinfooter, footerorder);

-- ÖRNEK SAYFALAR
INSERT INTO custom_pages (id, slug, title, content, metadescription, showinfooter, footerorder) VALUES
('page_privacy', 'privacy-policy', 'Gizlilik Politikası', 
 '# Gizlilik Politikası

Kişisel verileriniz KVKK kapsamında korunmaktadır.

## Toplanan Veriler
- IP adresi
- Çerez verileri
- Kullanım istatistikleri

## Veri Kullanımı
Verileriniz sadece hizmet kalitesini artırmak için kullanılır.
', 
 'Gizlilik politikamız hakkında detaylı bilgi', TRUE, 1),

('page_terms', 'terms-of-service', 'Kullanım Koşulları',
 '# Kullanım Koşulları

Sitemizi kullanarak aşağıdaki koşulları kabul etmiş olursunuz.

## Genel Kurallar
1. Spam yasaktır
2. Sahte sunucu bilgileri paylaşılamaz
3. Hakaret ve küfür yasaktır

## Sorumluluklar
Site yönetimi sunucu bilgilerinin doğruluğundan sorumlu değildir.
',
 'Kullanım koşulları ve site kuralları', TRUE, 2),

('page_about', 'about-us', 'Hakkımızda',
 '# Hakkımızda

Minecraft Server List, en iyi Minecraft sunucularını bulmanıza yardımcı olur.

## Misyonumuz
Minecraft oyuncularına kaliteli sunucular sunmak.

## Vizyonumuz
Dünyanın en büyük Minecraft sunucu listesi olmak.

## İletişim
Discord, Twitter ve diğer sosyal medya kanallarımızdan bize ulaşabilirsiniz.
',
 'Hakkımızda, misyon ve vizyon', TRUE, 3)

ON CONFLICT (id) DO NOTHING;

-- =========================================
-- ADIM 4: DOĞRULAMA
-- =========================================

-- Kontrol: Tek bir row olmalı
SELECT COUNT(*) as row_count FROM site_settings;

-- Kontrol: ID main olmalı
SELECT id, sitename, primarycolor FROM site_settings;

-- Kontrol: Sayfalar eklendi mi
SELECT COUNT(*) as page_count FROM custom_pages;

-- =========================================
-- BAŞARILI! 
-- =========================================
-- site_settings: 1 row (id='main')
-- custom_pages: 3 rows (örnek sayfalar)
-- =========================================
