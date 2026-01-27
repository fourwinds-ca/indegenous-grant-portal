-- Properly secure admin_users table using a security definer function
-- This avoids infinite recursion while still protecting the table with RLS

-- Step 1: Create a security definer function to check if current user is admin
-- SECURITY DEFINER means it runs with the privileges of the function owner (bypasses RLS)
CREATE OR REPLACE FUNCTION is_user_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the current user's email exists in admin_users
  -- Since this function is SECURITY DEFINER, it bypasses RLS on admin_users
  RETURN EXISTS (
    SELECT 1
    FROM admin_users
    WHERE email = auth.jwt() ->> 'email'
  );
END;
$$;

-- Step 2: Re-enable RLS on admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop old problematic policies if they exist
DROP POLICY IF EXISTS "Admins can view admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can add new admins" ON admin_users;
DROP POLICY IF EXISTS "Admins can remove admins" ON admin_users;

-- Step 4: Create new policies using the security definer function
-- This avoids infinite recursion because is_user_admin() bypasses RLS

-- Allow admins to view all admin users
DO $$ BEGIN
  CREATE POLICY "Admins can view admin users"
    ON admin_users FOR SELECT
    USING (is_user_admin());
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Allow admins to add new admins
DO $$ BEGIN
  CREATE POLICY "Admins can add new admins"
    ON admin_users FOR INSERT
    WITH CHECK (is_user_admin());
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Allow admins to remove admins
DO $$ BEGIN
  CREATE POLICY "Admins can remove admins"
    ON admin_users FOR DELETE
    USING (is_user_admin());
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Step 5: Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION is_user_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_user_admin() TO anon;
