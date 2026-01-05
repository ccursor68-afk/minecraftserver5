-- ============================================
-- Blog/Forum System - Supabase Schema
-- ============================================

-- ============================================
-- TABLE: Blog Categories
-- ============================================
CREATE TABLE IF NOT EXISTS blog_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#22c55e',
  "parentId" TEXT,
  position INTEGER DEFAULT 0,
  "topicCount" INTEGER DEFAULT 0,
  "postCount" INTEGER DEFAULT 0,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY ("parentId") REFERENCES blog_categories(id) ON DELETE SET NULL
);

-- ============================================
-- TABLE: Blog Posts/Topics
-- ============================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id TEXT PRIMARY KEY,
  "categoryId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  tags TEXT[],
  status TEXT DEFAULT 'published',
  "isPinned" BOOLEAN DEFAULT false,
  "isLocked" BOOLEAN DEFAULT false,
  "viewCount" INTEGER DEFAULT 0,
  "replyCount" INTEGER DEFAULT 0,
  "lastReplyAt" TIMESTAMP WITH TIME ZONE,
  "lastReplyUserId" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY ("categoryId") REFERENCES blog_categories(id) ON DELETE CASCADE,
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY ("lastReplyUserId") REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- TABLE: Blog Replies/Comments
-- ============================================
CREATE TABLE IF NOT EXISTS blog_replies (
  id TEXT PRIMARY KEY,
  "postId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  content TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY ("postId") REFERENCES blog_posts(id) ON DELETE CASCADE,
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- TABLE: User Favorites
-- ============================================
CREATE TABLE IF NOT EXISTS blog_favorites (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "categoryId" TEXT,
  "postId" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY ("categoryId") REFERENCES blog_categories(id) ON DELETE CASCADE,
  FOREIGN KEY ("postId") REFERENCES blog_posts(id) ON DELETE CASCADE,
  UNIQUE("userId", "categoryId"),
  UNIQUE("userId", "postId")
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON blog_categories(slug);
CREATE INDEX IF NOT EXISTS idx_blog_categories_parent ON blog_categories("parentId");
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts("categoryId");
CREATE INDEX IF NOT EXISTS idx_blog_posts_user ON blog_posts("userId");
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_replies_post ON blog_replies("postId");
CREATE INDEX IF NOT EXISTS idx_blog_replies_user ON blog_replies("userId");

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_favorites ENABLE ROW LEVEL SECURITY;

-- Public read for published content
CREATE POLICY "Public can view active categories" ON blog_categories
  FOR SELECT USING ("isActive" = true);

CREATE POLICY "Public can view published posts" ON blog_posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public can view replies" ON blog_replies
  FOR SELECT USING (true);

-- Users can create posts and replies
CREATE POLICY "Users can create posts" ON blog_posts
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own posts" ON blog_posts
  FOR UPDATE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can create replies" ON blog_replies
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own replies" ON blog_replies
  FOR UPDATE USING (auth.uid()::text = "userId");

-- Favorites
CREATE POLICY "Users can manage own favorites" ON blog_favorites
  FOR ALL USING (auth.uid()::text = "userId");

-- Admin full access
CREATE POLICY "Admin full access blog_categories" ON blog_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admin full access blog_posts" ON blog_posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admin full access blog_replies" ON blog_replies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

-- ============================================
-- TRIGGERS
-- ============================================
DROP TRIGGER IF EXISTS update_blog_categories_timestamp ON blog_categories;
CREATE TRIGGER update_blog_categories_timestamp
  BEFORE UPDATE ON blog_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_blog_posts_timestamp ON blog_posts;
CREATE TRIGGER update_blog_posts_timestamp
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_blog_replies_timestamp ON blog_replies;
CREATE TRIGGER update_blog_replies_timestamp
  BEFORE UPDATE ON blog_replies
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

-- ============================================
-- SAMPLE DATA
-- ============================================
INSERT INTO blog_categories (id, name, slug, description, icon, color, position) VALUES
('cat_updates', 'Güncellemeler', 'guncellemeler', 'Minecraft güncellemeleri ve yenilikler', '🆕', '#3b82f6', 1),
('cat_news', 'Haberler', 'haberler', 'Minecraft dünyasından haberler', '📰', '#22c55e', 2),
('cat_guides', 'Rehberler', 'rehberler', 'Oyun rehberleri ve ipuçları', '📚', '#f59e0b', 3),
('cat_server_support', 'Sunucu Destek', 'sunucu-destek', 'Sunucu sorunları ve çözümleri', '🛠️', '#ef4444', 4),
('cat_community', 'Topluluk', 'topluluk', 'Topluluk etkinlikleri ve duyurular', '👥', '#8b5cf6', 5)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Blog/Forum system setup complete!';
  RAISE NOTICE '📋 Tables: blog_categories, blog_posts, blog_replies, blog_favorites';
  RAISE NOTICE '📁 Sample categories created';
  RAISE NOTICE '🔒 RLS policies enabled';
END $$;
