-- Migration to create a cron job that triggers grant research every 30 days
-- This requires the pg_cron extension which is available on Supabase

-- Enable pg_cron extension (may already be enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a function to trigger the research edge function
CREATE OR REPLACE FUNCTION trigger_grant_research()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  supabase_url TEXT;
  service_role_key TEXT;
  request_id BIGINT;
BEGIN
  -- Get the Supabase URL from environment (this will be set in the Supabase dashboard)
  -- Note: In production, these should be stored securely
  supabase_url := current_setting('app.supabase_url', true);
  service_role_key := current_setting('app.service_role_key', true);

  -- If settings are not configured, log and exit
  IF supabase_url IS NULL OR service_role_key IS NULL THEN
    RAISE NOTICE 'Grant research cron: Supabase URL or service role key not configured';
    RETURN;
  END IF;

  -- Make HTTP request to the edge function
  SELECT net.http_post(
    url := supabase_url || '/functions/v1/research-grants',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body := '{"triggered_by": "cron"}'::jsonb
  ) INTO request_id;

  RAISE NOTICE 'Grant research triggered, request_id: %', request_id;
END;
$$;

-- Schedule the cron job to run every 30 days at 3:00 AM UTC
-- Format: minute hour day-of-month month day-of-week
-- '0 3 1 * *' means: at 3:00 AM on the 1st of every month
-- To run every 30 days more precisely, we use '0 3 */30 * *'
SELECT cron.schedule(
  'grant-research-monthly',           -- job name
  '0 3 1 * *',                        -- every 1st of the month at 3 AM UTC
  $$SELECT trigger_grant_research()$$ -- command to run
);

-- Create a table to track cron job execution history
CREATE TABLE IF NOT EXISTS cron_job_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_name VARCHAR(100) NOT NULL,
  executed_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'completed',
  details JSONB
);

-- Grant permissions
ALTER TABLE cron_job_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow viewing cron history"
  ON cron_job_history FOR SELECT
  USING (true);

-- Note: To configure the cron job, you need to set the following in Supabase Dashboard:
-- 1. Go to Database > Extensions > Enable pg_cron and pg_net
-- 2. Go to SQL Editor and run:
--    ALTER DATABASE postgres SET app.supabase_url = 'https://your-project.supabase.co';
--    ALTER DATABASE postgres SET app.service_role_key = 'your-service-role-key';
--
-- IMPORTANT: The service role key should be kept secret and not exposed to clients.
-- Consider using Supabase Vault for storing sensitive credentials.

COMMENT ON FUNCTION trigger_grant_research() IS
'Triggers the grant research edge function via HTTP request.
Called by pg_cron every 30 days to automatically discover new Indigenous grants.';
