-- Fix RLS policy for contact_submissions to allow anonymous inserts
-- Run this in Supabase SQL Editor

-- Drop the existing insert policy
DROP POLICY IF EXISTS "Anyone can submit contact form" ON contact_submissions;

-- Create a new policy that explicitly allows the anon role to insert
-- The key is using 'TO anon, authenticated' to explicitly grant to anonymous users
CREATE POLICY "Anyone can submit contact form"
  ON contact_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Verify the policy was created
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'contact_submissions';
