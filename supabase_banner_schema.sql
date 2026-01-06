-- ============================================
-- Banner Management System - Supabase Schema
-- ============================================

-- Create banners table
CREATE TABLE IF NOT EXISTS banners (
  id TEXT PRIMARY KEY,
  "serverName" TEXT NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "linkUrl" TEXT,
  position TEXT NOT NULL CHECK (position IN ('top', 'between_servers', 'sidebar', 'bottom')),
  "startDate" DATE NOT NULL,
  "endDate" DATE NOT NULL,
  "isActive" BOOLEAN DEFAULT true,
  "clickCount" INTEGER DEFAULT 0,
  "viewCount" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for active banners query
CREATE INDEX IF NOT EXISTS idx_banners_active ON banners("isActive", "startDate", "endDate");
CREATE INDEX IF NOT EXISTS idx_banners_position ON banners(position);

-- Enable RLS
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Public can view active banners
CREATE POLICY "Public can view active banners" ON banners
  FOR SELECT USING (
    "isActive" = true 
    AND "startDate" <= CURRENT_DATE 
    AND "endDate" >= CURRENT_DATE
  );

-- Admin full access
CREATE POLICY "Admin full access banners" ON banners
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

-- Update timestamp trigger
CREATE TRIGGER update_banners_timestamp
  BEFORE UPDATE ON banners
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

-- Sample data
INSERT INTO banners (id, "serverName", "imageUrl", "linkUrl", position, "startDate", "endDate", "isActive") VALUES
('banner_top_1', 'MegaCraft Server', 'https://via.placeholder.com/728x90/22c55e/ffffff?text=MegaCraft+Server', 'https://megacraft.com', 'top', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', true),
('banner_bottom_1', 'SkyBlock Pro', 'https://via.placeholder.com/728x90/3b82f6/ffffff?text=SkyBlock+Pro', 'https://skyblockpro.com', 'bottom', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', true)
ON CONFLICT (id) DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Banner system setup complete!';
  RAISE NOTICE '📋 Table: banners';
  RAISE NOTICE '🔒 RLS policies enabled';
  RAISE NOTICE '📊 Sample banners added';
END $$;
