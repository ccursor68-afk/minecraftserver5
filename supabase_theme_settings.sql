-- Genişletilmiş Site Settings Tablosu
-- Site teması, sosyal medya, sayfa yönetimi

-- Site settings tablosunu güncelle
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS siteName TEXT DEFAULT 'Minecraft Server List',
ADD COLUMN IF NOT EXISTS siteTagline TEXT DEFAULT 'En İyi Minecraft Sunucuları',
ADD COLUMN IF NOT EXISTS logoUrl TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS faviconUrl TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS primaryColor TEXT DEFAULT '#22c55e',
ADD COLUMN IF NOT EXISTS secondaryColor TEXT DEFAULT '#eab308',
ADD COLUMN IF NOT EXISTS accentColor TEXT DEFAULT '#3b82f6',
ADD COLUMN IF NOT EXISTS footerText TEXT DEFAULT '© 2025 Minecraft Server List. Tüm hakları saklıdır.',
ADD COLUMN IF NOT EXISTS socialMedia JSONB DEFAULT '{
  "discord": "",
  "twitter": "",
  "facebook": "",
  "instagram": "",
  "youtube": "",
  "tiktok": ""
}'::jsonb;

-- Dinamik sayfalar için tablo oluştur
CREATE TABLE IF NOT EXISTS custom_pages (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metaDescription TEXT DEFAULT '',
  isPublished BOOLEAN DEFAULT TRUE,
  showInFooter BOOLEAN DEFAULT TRUE,
  footerOrder INTEGER DEFAULT 0,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- Index oluştur
CREATE INDEX IF NOT EXISTS idx_custom_pages_slug ON custom_pages(slug);
CREATE INDEX IF NOT EXISTS idx_custom_pages_published ON custom_pages(isPublished);
CREATE INDEX IF NOT EXISTS idx_custom_pages_footer ON custom_pages(showInFooter, footerOrder);

-- Örnek sayfalar ekle
INSERT INTO custom_pages (id, slug, title, content, metaDescription, showInFooter, footerOrder)
VALUES 
  ('page_privacy', 'privacy-policy', 'Gizlilik Politikası', '# Gizlilik Politikası\n\nKişisel verileriniz KVKK kapsamında korunmaktadır...', 'Gizlilik politikamız hakkında bilgi edinin', TRUE, 1),
  ('page_terms', 'terms-of-service', 'Kullanım Koşulları', '# Kullanım Koşulları\n\nSitemizi kullanarak aşağıdaki koşulları kabul etmiş olursunuz...', 'Kullanım koşullarımız', TRUE, 2),
  ('page_about', 'about-us', 'Hakkımızda', '# Hakkımızda\n\nMinecraft Server List, en iyi Minecraft sunucularını bulmanıza yardımcı olur...', 'Hakkımızda bilgi edinin', TRUE, 3)
ON CONFLICT (id) DO NOTHING;

-- Yorumlar
COMMENT ON TABLE custom_pages IS 'Dinamik olarak yönetilebilen özel sayfalar';
COMMENT ON COLUMN custom_pages.showInFooter IS 'Footer''da göster';
COMMENT ON COLUMN custom_pages.footerOrder IS 'Footer''da görünüm sırası';
