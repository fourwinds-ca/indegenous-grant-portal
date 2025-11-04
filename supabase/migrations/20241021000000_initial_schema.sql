-- Initial migration for Indigenous Grant Tracker
-- This creates all the necessary tables for the application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Session storage table for authentication
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions(expire);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  email VARCHAR UNIQUE,
  first_name VARCHAR,
  last_name VARCHAR,
  profile_image_url VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Grants table - stores discovered grants and programs
CREATE TABLE IF NOT EXISTS grants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  agency VARCHAR(200),
  program VARCHAR(200),
  category VARCHAR(100),
  eligibility TEXT,
  application_link VARCHAR(1000),
  deadline DATE,
  amount DECIMAL,
  currency VARCHAR(3) DEFAULT 'CAD',
  status VARCHAR(50) DEFAULT 'active',
  source_url VARCHAR(1000),
  scraped_at TIMESTAMP DEFAULT NOW(),
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- User grant applications - tracks which grants users have applied to
CREATE TABLE IF NOT EXISTS user_grant_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  grant_id UUID NOT NULL REFERENCES grants(id),
  application_status VARCHAR(50) DEFAULT 'planning',
  application_date DATE,
  submission_date DATE,
  response_date DATE,
  amount_requested DECIMAL,
  amount_approved DECIMAL,
  notes TEXT,
  documents JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Reporting requirements tracking
CREATE TABLE IF NOT EXISTS reporting_requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES user_grant_applications(id),
  requirement_type VARCHAR(100) NOT NULL,
  description TEXT,
  due_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  submission_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Scraped sources tracking - to avoid duplicate scraping
CREATE TABLE IF NOT EXISTS scraped_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url VARCHAR(1000) NOT NULL UNIQUE,
  domain VARCHAR(200),
  last_scraped TIMESTAMP DEFAULT NOW(),
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  grants_found INTEGER DEFAULT 0
);

-- Analytics/metrics tracking
CREATE TABLE IF NOT EXISTS metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR REFERENCES users(id),
  metric_type VARCHAR(100) NOT NULL,
  value DECIMAL,
  date DATE NOT NULL,
  grant_id UUID REFERENCES grants(id),
  application_id UUID REFERENCES user_grant_applications(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_grants_status ON grants(status);
CREATE INDEX IF NOT EXISTS idx_grants_deadline ON grants(deadline);
CREATE INDEX IF NOT EXISTS idx_grants_agency ON grants(agency);
CREATE INDEX IF NOT EXISTS idx_user_applications_user_id ON user_grant_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_applications_grant_id ON user_grant_applications(grant_id);
CREATE INDEX IF NOT EXISTS idx_user_applications_status ON user_grant_applications(application_status);
CREATE INDEX IF NOT EXISTS idx_reporting_requirements_application_id ON reporting_requirements(application_id);
CREATE INDEX IF NOT EXISTS idx_reporting_requirements_due_date ON reporting_requirements(due_date);
CREATE INDEX IF NOT EXISTS idx_metrics_user_id ON metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_metrics_date ON metrics(date);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_grant_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reporting_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid()::TEXT = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid()::TEXT = id);

-- RLS Policies for user_grant_applications
CREATE POLICY "Users can view their own applications"
  ON user_grant_applications FOR SELECT
  USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can create their own applications"
  ON user_grant_applications FOR INSERT
  WITH CHECK (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can update their own applications"
  ON user_grant_applications FOR UPDATE
  USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can delete their own applications"
  ON user_grant_applications FOR DELETE
  USING (auth.uid()::TEXT = user_id);

-- RLS Policies for reporting_requirements
CREATE POLICY "Users can view their own reporting requirements"
  ON reporting_requirements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_grant_applications
      WHERE user_grant_applications.id = reporting_requirements.application_id
      AND user_grant_applications.user_id = auth.uid()::TEXT
    )
  );

CREATE POLICY "Users can manage their own reporting requirements"
  ON reporting_requirements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_grant_applications
      WHERE user_grant_applications.id = reporting_requirements.application_id
      AND user_grant_applications.user_id = auth.uid()::TEXT
    )
  );

-- RLS Policies for metrics
CREATE POLICY "Users can view their own metrics"
  ON metrics FOR SELECT
  USING (auth.uid()::TEXT = user_id);

-- Grants table is publicly readable (no RLS needed as it's public data)
-- But we'll add RLS just in case we want to restrict it later
ALTER TABLE grants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Grants are publicly readable"
  ON grants FOR SELECT
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_grant_applications_updated_at
  BEFORE UPDATE ON user_grant_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reporting_requirements_updated_at
  BEFORE UPDATE ON reporting_requirements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
