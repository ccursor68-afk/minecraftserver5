-- ============================================
-- Minecraft Server List - Authentication & Admin System
-- ============================================
-- Run this script in your Supabase SQL Editor
-- ============================================

-- ============================================
-- UPDATE: Users table with role
-- ============================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE users ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;

-- Create admin user index
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- TABLE: Tickets (Support System)
-- ============================================
CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "serverId" TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  status TEXT DEFAULT 'open',
  priority TEXT DEFAULT 'normal',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY ("serverId") REFERENCES servers(id) ON DELETE SET NULL
);

-- ============================================
-- TABLE: Ticket Replies
-- ============================================
CREATE TABLE IF NOT EXISTS ticket_replies (
  id TEXT PRIMARY KEY,
  "ticketId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  message TEXT NOT NULL,
  "isAdmin" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY ("ticketId") REFERENCES tickets(id) ON DELETE CASCADE,
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- TABLE: Banners (Advertisement System)
-- ============================================
CREATE TABLE IF NOT EXISTS banners (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "linkUrl" TEXT,
  "serverId" TEXT,
  position INTEGER DEFAULT 0,
  "isActive" BOOLEAN DEFAULT true,
  "startDate" TIMESTAMP WITH TIME ZONE,
  "endDate" TIMESTAMP WITH TIME ZONE,
  "clickCount" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY ("serverId") REFERENCES servers(id) ON DELETE SET NULL
);

-- ============================================
-- INDEXES for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_tickets_user ON tickets("userId");
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_created ON tickets("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_ticket_replies_ticket ON ticket_replies("ticketId");
CREATE INDEX IF NOT EXISTS idx_banners_active ON banners("isActive");
CREATE INDEX IF NOT EXISTS idx_banners_position ON banners(position);

-- ============================================
-- ROW LEVEL SECURITY (RLS) Policies
-- ============================================
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Tickets: Users can see their own tickets
CREATE POLICY "Users can view own tickets" ON tickets
  FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can create tickets" ON tickets
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own tickets" ON tickets
  FOR UPDATE USING (auth.uid()::text = "userId");

-- Ticket Replies: Users can see replies to their tickets
CREATE POLICY "Users can view ticket replies" ON ticket_replies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tickets 
      WHERE tickets.id = ticket_replies."ticketId" 
      AND tickets."userId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can reply to own tickets" ON ticket_replies
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tickets 
      WHERE tickets.id = ticket_replies."ticketId" 
      AND tickets."userId" = auth.uid()::text
    )
  );

-- Banners: Public read access
CREATE POLICY "Public can view active banners" ON banners
  FOR SELECT USING ("isActive" = true);

-- Admin access (you'll need to set role manually in database)
CREATE POLICY "Admin full access tickets" ON tickets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admin full access ticket_replies" ON ticket_replies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admin full access banners" ON banners
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

-- ============================================
-- AUTO-UPDATE Timestamp Triggers
-- ============================================
DROP TRIGGER IF EXISTS update_tickets_timestamp ON tickets;
CREATE TRIGGER update_tickets_timestamp
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_banners_timestamp ON banners;
CREATE TRIGGER update_banners_timestamp
  BEFORE UPDATE ON banners
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

-- ============================================
-- CREATE FIRST ADMIN USER (IMPORTANT!)
-- ============================================
-- After running this script, you need to:
-- 1. Register a user through the app
-- 2. Run this command with your user email:
-- UPDATE users SET role = 'admin' WHERE email = 'your-admin-email@example.com';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Authentication & Admin system setup complete!';
  RAISE NOTICE '📋 New tables: tickets, ticket_replies, banners';
  RAISE NOTICE '👤 Users table updated with role column';
  RAISE NOTICE '🔒 RLS policies enabled';
  RAISE NOTICE '⚡ Indexes created for performance';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANT: After first user registration, make them admin:';
  RAISE NOTICE '   UPDATE users SET role = ''admin'' WHERE email = ''your-email@example.com'';';
END $$;
