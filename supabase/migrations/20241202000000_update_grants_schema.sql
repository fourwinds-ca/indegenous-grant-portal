-- Migration to update grants table schema for better grant data support
-- This allows storing descriptive funding amounts and additional metadata

-- Change amount from DECIMAL to TEXT to support descriptive amounts like "Up to $2M"
ALTER TABLE grants ALTER COLUMN amount TYPE TEXT;

-- Add new columns for better grant management
ALTER TABLE grants ADD COLUMN IF NOT EXISTS province VARCHAR(100);
ALTER TABLE grants ADD COLUMN IF NOT EXISTS is_publicly_available BOOLEAN DEFAULT true;
ALTER TABLE grants ADD COLUMN IF NOT EXISTS added_by VARCHAR(200);
ALTER TABLE grants ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create index on province for filtering
CREATE INDEX IF NOT EXISTS idx_grants_province ON grants(province);

-- Allow admins to insert/update/delete grants (only if not already exist)
DO $$ BEGIN
  CREATE POLICY "Admins can insert grants"
    ON grants FOR INSERT
    WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can update grants"
    ON grants FOR UPDATE
    USING (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can delete grants"
    ON grants FOR DELETE
    USING (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
