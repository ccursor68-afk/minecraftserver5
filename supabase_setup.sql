-- ============================================
-- Minecraft Server List - Supabase Database Setup
-- ============================================
-- Run this script in your Supabase SQL Editor
-- Dashboard: https://supabase.com → Your Project → SQL Editor
-- ============================================

-- Drop existing tables if recreating (OPTIONAL - only if you need to reset)
-- DROP TABLE IF EXISTS votes CASCADE;
-- DROP TABLE IF EXISTS servers CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- TABLE 1: Users (Optional for MVP, but good to have)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  "passwordHash" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLE 2: Servers (Main table)
-- ============================================
CREATE TABLE IF NOT EXISTS servers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  ip TEXT NOT NULL,
  port INTEGER DEFAULT 25565,
  website TEXT,
  discord TEXT,
  "bannerUrl" TEXT,
  "shortDescription" TEXT,
  "longDescription" TEXT,
  version TEXT,
  category TEXT,
  status TEXT DEFAULT 'offline',
  "onlinePlayers" INTEGER DEFAULT 0,
  "maxPlayers" INTEGER DEFAULT 0,
  "voteCount" INTEGER DEFAULT 0,
  "ownerId" TEXT,
  "votifierIp" TEXT,
  "votifierPort" INTEGER,
  "votifierPublicKey" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY ("ownerId") REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- TABLE 3: Votes (24-hour cooldown tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS votes (
  id TEXT PRIMARY KEY,
  "serverId" TEXT NOT NULL,
  "userId" TEXT,
  "voterIp" TEXT NOT NULL,
  "votedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY ("serverId") REFERENCES servers(id) ON DELETE CASCADE,
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- INDEXES for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_servers_votes ON servers("voteCount" DESC);
CREATE INDEX IF NOT EXISTS idx_servers_status ON servers(status);
CREATE INDEX IF NOT EXISTS idx_servers_category ON servers(category);
CREATE INDEX IF NOT EXISTS idx_votes_server ON votes("serverId");
CREATE INDEX IF NOT EXISTS idx_votes_ip_time ON votes("voterIp", "votedAt" DESC);
CREATE INDEX IF NOT EXISTS idx_votes_user ON votes("userId");

-- ============================================
-- ROW LEVEL SECURITY (RLS) Policies
-- ============================================
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables
CREATE POLICY "Allow public read users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public read servers" ON servers FOR SELECT USING (true);
CREATE POLICY "Allow public read votes" ON votes FOR SELECT USING (true);

-- Public insert/update for servers and votes (for MVP)
CREATE POLICY "Allow public insert servers" ON servers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update servers" ON servers FOR UPDATE USING (true);
CREATE POLICY "Allow public insert votes" ON votes FOR INSERT WITH CHECK (true);

-- ============================================
-- AUTO-UPDATE Timestamp Trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS update_servers_timestamp ON servers;

-- Create trigger for servers table
CREATE TRIGGER update_servers_timestamp
  BEFORE UPDATE ON servers
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Database setup complete!';
  RAISE NOTICE '📋 Tables created: users, servers, votes';
  RAISE NOTICE '🔒 RLS policies enabled';
  RAISE NOTICE '⚡ Indexes created for performance';
  RAISE NOTICE '🎉 You can now start the application!';
END $$;
