-- FINAL FIX: Grant table-level permissions AND fix RLS policy
-- Run this in Supabase SQL Editor

-- Step 1: Grant table-level INSERT permission to anon and authenticated roles
-- This is REQUIRED in addition to RLS policies
GRANT INSERT ON contact_submissions TO anon;
GRANT INSERT ON contact_submissions TO authenticated;

-- Grant SELECT/UPDATE/DELETE to authenticated (for admins)
GRANT SELECT, UPDATE, DELETE ON contact_submissions TO authenticated;

-- Step 2: Ensure RLS is enabled
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop and recreate all policies
DROP POLICY IF EXISTS "Anyone can submit contact form" ON contact_submissions;
DROP POLICY IF EXISTS "Admins can view contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Admins can update contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Admins can delete contact submissions" ON contact_submissions;

-- Recreate INSERT policy for anonymous users
CREATE POLICY "Anyone can submit contact form"
  ON contact_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Recreate admin-only policies
CREATE POLICY "Admins can view contact submissions"
  ON contact_submissions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Admins can update contact submissions"
  ON contact_submissions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Admins can delete contact submissions"
  ON contact_submissions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = auth.jwt()->>'email'
    )
  );

-- Verify permissions
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'contact_submissions';

-- Verify policies
SELECT policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'contact_submissions';
