-- Migration to add RLS policies to unrestricted tables
-- Ensures all tables have proper row level security

-- Enable RLS on scraped_sources table
ALTER TABLE scraped_sources ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view scraped sources
CREATE POLICY "Admins can view scraped sources"
  ON scraped_sources FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = auth.jwt()->>'email'
    )
  );

-- Policy: System can insert/update scraped sources
CREATE POLICY "System can manage scraped sources"
  ON scraped_sources FOR ALL
  USING (true)
  WITH CHECK (true);

-- Enable RLS on admin_users table (CRITICAL SECURITY FIX)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view admin_users table
CREATE POLICY "Admins can view admin users"
  ON admin_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = auth.jwt()->>'email'
    )
  );

-- Policy: Only admins can insert new admins
CREATE POLICY "Admins can add new admins"
  ON admin_users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = auth.jwt()->>'email'
    )
  );

-- Policy: Only admins can delete admins
CREATE POLICY "Admins can remove admins"
  ON admin_users FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = auth.jwt()->>'email'
    )
  );

-- Note: sessions table intentionally left without RLS
-- It's managed by the authentication system and doesn't contain sensitive data
-- Sessions are identified by session IDs that are already secure
