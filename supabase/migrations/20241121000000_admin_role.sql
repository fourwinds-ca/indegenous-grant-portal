-- Migration: Add admin role support for grant management

-- Add is_admin column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create admin_users table to track admin emails (for easier management)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  added_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add province column to grants table for provincial filtering
ALTER TABLE grants ADD COLUMN IF NOT EXISTS province VARCHAR(50);

-- Add additional grant fields for better management
ALTER TABLE grants ADD COLUMN IF NOT EXISTS is_publicly_available BOOLEAN DEFAULT TRUE;
ALTER TABLE grants ADD COLUMN IF NOT EXISTS added_by VARCHAR(255);
ALTER TABLE grants ADD COLUMN IF NOT EXISTS notes TEXT;

-- RLS Policy for admin users to manage grants
CREATE POLICY "Admins can insert grants"
  ON grants FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Admins can update grants"
  ON grants FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Admins can delete grants"
  ON grants FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = auth.jwt()->>'email'
    )
  );

-- Index for province filtering
CREATE INDEX IF NOT EXISTS idx_grants_province ON grants(province);

-- Insert initial admin users (Doug and Dan - update emails as needed)
-- These can be updated via Supabase dashboard
INSERT INTO admin_users (email, added_by) VALUES
  ('doug@greenbuffalo.ca', 'system'),
  ('dan@greenbuffalo.ca', 'system')
ON CONFLICT (email) DO NOTHING;
