-- Migration for AI Grant Research Workflow with Admin Approval
-- This creates tables for storing pending grant changes that require admin review

-- Table to store pending grant changes (new grants or updates)
CREATE TABLE IF NOT EXISTS pending_grant_changes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Reference to existing grant (NULL for new grants)
  existing_grant_id UUID REFERENCES grants(id) ON DELETE CASCADE,

  -- Change type: 'new', 'update', 'deactivate'
  change_type VARCHAR(20) NOT NULL CHECK (change_type IN ('new', 'update', 'deactivate')),

  -- Proposed grant data (full grant object for new/update)
  proposed_data JSONB NOT NULL,

  -- For updates, store what fields changed
  changed_fields JSONB,

  -- AI research metadata
  ai_confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  ai_reasoning TEXT,
  source_urls TEXT[], -- URLs where info was found

  -- Research run reference
  research_run_id UUID,

  -- Admin review status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by VARCHAR(200),
  reviewed_at TIMESTAMP,
  review_notes TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table to track research runs
CREATE TABLE IF NOT EXISTS grant_research_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Run metadata
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),

  -- Results summary
  grants_analyzed INTEGER DEFAULT 0,
  new_grants_found INTEGER DEFAULT 0,
  updates_found INTEGER DEFAULT 0,
  deactivations_found INTEGER DEFAULT 0,

  -- Error tracking
  error_message TEXT,

  -- Full research response stored for reference
  raw_response JSONB,

  -- Trigger info
  triggered_by VARCHAR(50) DEFAULT 'cron' CHECK (triggered_by IN ('cron', 'manual'))
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_pending_changes_status ON pending_grant_changes(status);
CREATE INDEX IF NOT EXISTS idx_pending_changes_type ON pending_grant_changes(change_type);
CREATE INDEX IF NOT EXISTS idx_pending_changes_created ON pending_grant_changes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_research_runs_status ON grant_research_runs(status);
CREATE INDEX IF NOT EXISTS idx_research_runs_started ON grant_research_runs(started_at DESC);

-- Enable RLS
ALTER TABLE pending_grant_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE grant_research_runs ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Only admins can view/manage pending changes
CREATE POLICY "Admins can view pending changes"
  ON pending_grant_changes FOR SELECT
  USING (true);

CREATE POLICY "Admins can update pending changes"
  ON pending_grant_changes FOR UPDATE
  USING (true);

CREATE POLICY "System can insert pending changes"
  ON pending_grant_changes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view research runs"
  ON grant_research_runs FOR SELECT
  USING (true);

CREATE POLICY "System can manage research runs"
  ON grant_research_runs FOR ALL
  USING (true);

-- Function to apply an approved grant change
CREATE OR REPLACE FUNCTION apply_approved_grant_change(change_id UUID, admin_email VARCHAR)
RETURNS JSONB AS $$
DECLARE
  change_record pending_grant_changes%ROWTYPE;
  new_grant_id UUID;
  result JSONB;
BEGIN
  -- Get the pending change
  SELECT * INTO change_record FROM pending_grant_changes WHERE id = change_id;

  IF change_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Change not found');
  END IF;

  IF change_record.status != 'pending' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Change already processed');
  END IF;

  -- Apply the change based on type
  CASE change_record.change_type
    WHEN 'new' THEN
      -- Insert new grant
      INSERT INTO grants (
        title, description, agency, program, category, eligibility,
        application_link, deadline, amount, currency, status, source_url,
        province, is_publicly_available, added_by, notes
      )
      SELECT
        proposed_data->>'title',
        proposed_data->>'description',
        proposed_data->>'agency',
        proposed_data->>'program',
        proposed_data->>'category',
        proposed_data->>'eligibility',
        proposed_data->>'application_link',
        (proposed_data->>'deadline')::DATE,
        proposed_data->>'amount',
        COALESCE(proposed_data->>'currency', 'CAD'),
        COALESCE(proposed_data->>'status', 'active'),
        proposed_data->>'source_url',
        proposed_data->>'province',
        COALESCE((proposed_data->>'is_publicly_available')::BOOLEAN, true),
        'ai-research',
        proposed_data->>'notes'
      FROM pending_grant_changes WHERE id = change_id
      RETURNING id INTO new_grant_id;

      result := jsonb_build_object('success', true, 'action', 'created', 'grant_id', new_grant_id);

    WHEN 'update' THEN
      -- Update existing grant
      UPDATE grants SET
        title = COALESCE(change_record.proposed_data->>'title', title),
        description = COALESCE(change_record.proposed_data->>'description', description),
        agency = COALESCE(change_record.proposed_data->>'agency', agency),
        program = COALESCE(change_record.proposed_data->>'program', program),
        category = COALESCE(change_record.proposed_data->>'category', category),
        eligibility = COALESCE(change_record.proposed_data->>'eligibility', eligibility),
        application_link = COALESCE(change_record.proposed_data->>'application_link', application_link),
        deadline = COALESCE((change_record.proposed_data->>'deadline')::DATE, deadline),
        amount = COALESCE(change_record.proposed_data->>'amount', amount),
        status = COALESCE(change_record.proposed_data->>'status', status),
        source_url = COALESCE(change_record.proposed_data->>'source_url', source_url),
        province = COALESCE(change_record.proposed_data->>'province', province),
        notes = COALESCE(change_record.proposed_data->>'notes', notes),
        last_updated = NOW()
      WHERE id = change_record.existing_grant_id;

      result := jsonb_build_object('success', true, 'action', 'updated', 'grant_id', change_record.existing_grant_id);

    WHEN 'deactivate' THEN
      -- Mark grant as inactive
      UPDATE grants SET status = 'inactive', last_updated = NOW()
      WHERE id = change_record.existing_grant_id;

      result := jsonb_build_object('success', true, 'action', 'deactivated', 'grant_id', change_record.existing_grant_id);

    ELSE
      result := jsonb_build_object('success', false, 'error', 'Unknown change type');
  END CASE;

  -- Mark the change as approved
  UPDATE pending_grant_changes SET
    status = 'approved',
    reviewed_by = admin_email,
    reviewed_at = NOW(),
    updated_at = NOW()
  WHERE id = change_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject a pending change
CREATE OR REPLACE FUNCTION reject_grant_change(change_id UUID, admin_email VARCHAR, rejection_notes TEXT DEFAULT NULL)
RETURNS JSONB AS $$
BEGIN
  UPDATE pending_grant_changes SET
    status = 'rejected',
    reviewed_by = admin_email,
    reviewed_at = NOW(),
    review_notes = rejection_notes,
    updated_at = NOW()
  WHERE id = change_id AND status = 'pending';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Change not found or already processed');
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at
CREATE TRIGGER update_pending_grant_changes_updated_at
  BEFORE UPDATE ON pending_grant_changes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
