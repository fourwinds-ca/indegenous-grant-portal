-- Fix admin_users RLS - version 2
-- The previous attempts didn't work. Using a simpler, more explicit approach.

-- Step 1: Drop all existing policies
DROP POLICY IF EXISTS "Admins can view admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can add new admins" ON admin_users;
DROP POLICY IF EXISTS "Admins can remove admins" ON admin_users;
DROP POLICY IF EXISTS "Only admins can view admin_users" ON admin_users;
DROP POLICY IF EXISTS "Only admins can add new admins" ON admin_users;
DROP POLICY IF EXISTS "Only admins can remove admins" ON admin_users;

-- Step 2: Ensure RLS is enabled (this should block ALL access by default)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Step 3: Force restrictive defaults - deny all access by default
ALTER TABLE admin_users FORCE ROW LEVEL SECURITY;

-- Step 4: Revoke all public access
REVOKE ALL ON admin_users FROM anon;
REVOKE ALL ON admin_users FROM authenticated;

-- Step 5: Grant only what's needed
GRANT SELECT ON admin_users TO authenticated;

-- Step 6: Use the security definer function for policies
-- This function was created in a previous migration and bypasses RLS
CREATE POLICY "Authenticated admins can view"
  ON admin_users FOR SELECT
  TO authenticated
  USING (is_user_admin());

CREATE POLICY "Authenticated admins can insert"
  ON admin_users FOR INSERT
  TO authenticated
  WITH CHECK (is_user_admin());

CREATE POLICY "Authenticated admins can delete"
  ON admin_users FOR DELETE
  TO authenticated
  USING (is_user_admin());
