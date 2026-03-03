-- Create a SECURITY DEFINER function to bypass RLS for contact form submissions
-- This is the same pattern used for email subscriptions
-- Run this in Supabase SQL Editor

-- Create the RPC function for submitting contact forms
CREATE OR REPLACE FUNCTION submit_contact_form(
  p_name VARCHAR(200),
  p_email VARCHAR(320),
  p_subject VARCHAR(500) DEFAULT NULL,
  p_message TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER  -- This runs with the function owner's privileges, bypassing RLS
SET search_path = public
AS $$
DECLARE
  v_id UUID;
  v_created_at TIMESTAMP;
BEGIN
  -- Validate required fields
  IF p_name IS NULL OR p_name = '' THEN
    RETURN json_build_object('success', false, 'message', 'Name is required');
  END IF;

  IF p_email IS NULL OR p_email = '' THEN
    RETURN json_build_object('success', false, 'message', 'Email is required');
  END IF;

  IF p_message IS NULL OR p_message = '' THEN
    RETURN json_build_object('success', false, 'message', 'Message is required');
  END IF;

  -- Insert the contact submission
  INSERT INTO contact_submissions (name, email, subject, message, status, created_at, updated_at)
  VALUES (p_name, p_email, p_subject, p_message, 'new', NOW(), NOW())
  RETURNING id, created_at INTO v_id, v_created_at;

  RETURN json_build_object(
    'success', true,
    'message', 'Thank you for your message! We will get back to you soon.',
    'id', v_id,
    'created_at', v_created_at
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', 'An error occurred. Please try again.');
END;
$$;

-- Grant execute permission to anonymous and authenticated users
GRANT EXECUTE ON FUNCTION submit_contact_form TO anon;
GRANT EXECUTE ON FUNCTION submit_contact_form TO authenticated;

-- Verify the function was created
SELECT proname, prosecdef FROM pg_proc WHERE proname = 'submit_contact_form';
