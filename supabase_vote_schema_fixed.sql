-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id TEXT PRIMARY KEY,
  "serverId" TEXT NOT NULL,
  "minecraftUsername" TEXT NOT NULL,
  "ipAddress" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "votifierSent" BOOLEAN DEFAULT false,
  "votifierResponse" TEXT,
  FOREIGN KEY ("serverId") REFERENCES servers(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_votes_server ON votes("serverId");
CREATE INDEX IF NOT EXISTS idx_votes_username ON votes("minecraftUsername");
CREATE INDEX IF NOT EXISTS idx_votes_created ON votes("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_votes_server_month ON votes("serverId", "createdAt");

-- Create view for monthly top voters
CREATE OR REPLACE VIEW monthly_top_voters AS
SELECT 
  "serverId",
  "minecraftUsername",
  COUNT(*) as "voteCount",
  MAX("createdAt") as "lastVoteAt"
FROM votes
WHERE "createdAt" >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY "serverId", "minecraftUsername"
ORDER BY "voteCount" DESC;

-- Enable RLS
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view votes" ON votes;
DROP POLICY IF EXISTS "Anyone can insert votes" ON votes;
DROP POLICY IF EXISTS "Admin can update votes" ON votes;

-- RLS Policies for votes
CREATE POLICY "Anyone can view votes" ON votes
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert votes" ON votes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can update votes" ON votes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

-- Function to increment server vote count
CREATE OR REPLACE FUNCTION increment_server_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE servers 
  SET "voteCount" = COALESCE("voteCount", 0) + 1
  WHERE id = NEW."serverId";
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_increment_vote_count ON votes;

-- Trigger to auto-increment vote count
CREATE TRIGGER trigger_increment_vote_count
  AFTER INSERT ON votes
  FOR EACH ROW
  EXECUTE FUNCTION increment_server_vote_count();
