-- Fix RLS policy for contact_submissions - ensure anon role can insert
-- Run this in Supabase SQL Editor

-- First, let's see what policies exist
SELECT policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'contact_submissions';

-- Drop ALL existing policies on the table and recreate them properly
DROP POLICY IF EXISTS "Anyone can submit contact form" ON contact_submissions;
DROP POLICY IF EXISTS "Admins can view contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Admins can update contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Admins can delete contact submissions" ON contact_submissions;

-- Recreate INSERT policy with explicit role grants
CREATE POLICY "Anyone can submit contact form"
  ON contact_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Recreate admin policies
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

-- Verify policies with roles
SELECT policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'contact_submissions';
