-- Migration for Email Subscriptions
-- Stores user emails for grant reminders and updates

-- Email subscriptions table
CREATE TABLE IF NOT EXISTS email_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(320) NOT NULL UNIQUE,
  name VARCHAR(200),
  is_active BOOLEAN DEFAULT true,
  subscription_type VARCHAR(50) DEFAULT 'all', -- all, new_grants, deadline_reminders, updates
  categories TEXT[], -- optional: specific grant categories to follow
  provinces TEXT[], -- optional: specific provinces to follow
  unsubscribe_token UUID DEFAULT gen_random_uuid(),
  subscribed_at TIMESTAMP DEFAULT NOW(),
  unsubscribed_at TIMESTAMP,
  last_email_sent TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON email_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON email_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_subscriptions_type ON email_subscriptions(subscription_type);
CREATE INDEX IF NOT EXISTS idx_subscriptions_token ON email_subscriptions(unsubscribe_token);

-- Enable Row Level Security
ALTER TABLE email_subscriptions ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe (insert)
CREATE POLICY "Anyone can subscribe"
  ON email_subscriptions FOR INSERT
  WITH CHECK (true);

-- Users can unsubscribe using their token (update their own record)
CREATE POLICY "Users can unsubscribe with token"
  ON email_subscriptions FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Only admins can view all subscriptions
CREATE POLICY "Admins can view subscriptions"
  ON email_subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = auth.jwt()->>'email'
    )
  );

-- Only admins can delete subscriptions
CREATE POLICY "Admins can delete subscriptions"
  ON email_subscriptions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = auth.jwt()->>'email'
    )
  );

-- Email send log table (to track sent emails)
CREATE TABLE IF NOT EXISTS email_send_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES email_subscriptions(id) ON DELETE SET NULL,
  email VARCHAR(320) NOT NULL,
  email_type VARCHAR(50) NOT NULL, -- new_grant, deadline_reminder, weekly_digest, etc.
  subject VARCHAR(500),
  grant_ids UUID[], -- grants included in the email
  status VARCHAR(20) DEFAULT 'sent', -- sent, failed, bounced
  error_message TEXT,
  sent_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_log_subscription ON email_send_log(subscription_id);
CREATE INDEX IF NOT EXISTS idx_email_log_sent_at ON email_send_log(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_log_type ON email_send_log(email_type);

-- Enable RLS on email log
ALTER TABLE email_send_log ENABLE ROW LEVEL SECURITY;

-- Only admins and system can access email log
CREATE POLICY "Admins can view email log"
  ON email_send_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "System can insert email log"
  ON email_send_log FOR INSERT
  WITH CHECK (true);

-- Trigger to update updated_at
CREATE TRIGGER update_email_subscriptions_updated_at
  BEFORE UPDATE ON email_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to handle subscription (upsert)
CREATE OR REPLACE FUNCTION subscribe_email(
  p_email VARCHAR,
  p_name VARCHAR DEFAULT NULL,
  p_subscription_type VARCHAR DEFAULT 'all',
  p_categories TEXT[] DEFAULT NULL,
  p_provinces TEXT[] DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  existing_sub email_subscriptions%ROWTYPE;
  result_id UUID;
BEGIN
  -- Check if email already exists
  SELECT * INTO existing_sub FROM email_subscriptions WHERE email = LOWER(p_email);

  IF existing_sub.id IS NOT NULL THEN
    -- Reactivate if previously unsubscribed
    IF NOT existing_sub.is_active THEN
      UPDATE email_subscriptions SET
        is_active = true,
        name = COALESCE(p_name, existing_sub.name),
        subscription_type = p_subscription_type,
        categories = COALESCE(p_categories, existing_sub.categories),
        provinces = COALESCE(p_provinces, existing_sub.provinces),
        unsubscribed_at = NULL,
        updated_at = NOW()
      WHERE id = existing_sub.id;

      RETURN jsonb_build_object('success', true, 'message', 'Subscription reactivated', 'id', existing_sub.id);
    ELSE
      -- Already subscribed
      RETURN jsonb_build_object('success', true, 'message', 'Already subscribed', 'id', existing_sub.id);
    END IF;
  ELSE
    -- New subscription
    INSERT INTO email_subscriptions (email, name, subscription_type, categories, provinces)
    VALUES (LOWER(p_email), p_name, p_subscription_type, p_categories, p_provinces)
    RETURNING id INTO result_id;

    RETURN jsonb_build_object('success', true, 'message', 'Successfully subscribed', 'id', result_id);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to unsubscribe using token
CREATE OR REPLACE FUNCTION unsubscribe_email(p_token UUID)
RETURNS JSONB AS $$
BEGIN
  UPDATE email_subscriptions SET
    is_active = false,
    unsubscribed_at = NOW(),
    updated_at = NOW()
  WHERE unsubscribe_token = p_token AND is_active = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid or already unsubscribed');
  END IF;

  RETURN jsonb_build_object('success', true, 'message', 'Successfully unsubscribed');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
