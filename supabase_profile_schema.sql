-- ============================================
-- User Profile System - Supabase Schema
-- ============================================

-- Add minecraft_username to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS "minecraftUsername" TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "lastLogin" TIMESTAMP WITH TIME ZONE;

-- Create user_activity table
CREATE TABLE IF NOT EXISTS user_activity (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "activityType" TEXT NOT NULL CHECK ("activityType" IN ('vote', 'server_add', 'profile_update', 'ticket', 'login')),
  description TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_activity_user ON user_activity("userId");
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON user_activity("activityType");
CREATE INDEX IF NOT EXISTS idx_user_activity_created ON user_activity("createdAt" DESC);

-- Enable RLS
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_activity
CREATE POLICY "Users can view own activity" ON user_activity
  FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "System can insert activity" ON user_activity
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can view all activity" ON user_activity
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ User profile system setup complete!';
  RAISE NOTICE '📋 Added columns: minecraftUsername, avatarUrl, lastLogin';
  RAISE NOTICE '📋 Table: user_activity';
  RAISE NOTICE '🔒 RLS policies enabled';
END $$;
