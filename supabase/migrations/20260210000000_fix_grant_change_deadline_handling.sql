-- Fix deadline handling in apply_approved_grant_change function
-- This fixes 400 errors when deadline is NULL or empty string

CREATE OR REPLACE FUNCTION apply_approved_grant_change(change_id UUID, admin_email VARCHAR)
RETURNS JSONB AS $$
DECLARE
  change_record pending_grant_changes%ROWTYPE;
  new_grant_id UUID;
  result JSONB;
  deadline_value DATE;
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
      -- Safely parse deadline (handle NULL and empty strings)
      BEGIN
        deadline_value := CASE
          WHEN change_record.proposed_data->>'deadline' IS NULL OR
               change_record.proposed_data->>'deadline' = '' THEN NULL
          ELSE (change_record.proposed_data->>'deadline')::DATE
        END;
      EXCEPTION
        WHEN OTHERS THEN
          deadline_value := NULL;
      END;

      -- Insert new grant
      INSERT INTO grants (
        title, description, agency, program, category, eligibility,
        application_link, deadline, amount, currency, status, source_url,
        province, is_publicly_available, added_by, notes
      )
      VALUES (
        change_record.proposed_data->>'title',
        change_record.proposed_data->>'description',
        change_record.proposed_data->>'agency',
        change_record.proposed_data->>'program',
        change_record.proposed_data->>'category',
        change_record.proposed_data->>'eligibility',
        change_record.proposed_data->>'application_link',
        deadline_value,
        change_record.proposed_data->>'amount',
        COALESCE(change_record.proposed_data->>'currency', 'CAD'),
        COALESCE(change_record.proposed_data->>'status', 'active'),
        change_record.proposed_data->>'source_url',
        change_record.proposed_data->>'province',
        COALESCE((change_record.proposed_data->>'is_publicly_available')::BOOLEAN, true),
        'ai-research',
        change_record.proposed_data->>'notes'
      )
      RETURNING id INTO new_grant_id;

      result := jsonb_build_object('success', true, 'action', 'created', 'grant_id', new_grant_id);

    WHEN 'update' THEN
      -- Safely parse deadline for updates
      BEGIN
        deadline_value := CASE
          WHEN change_record.proposed_data->>'deadline' IS NULL OR
               change_record.proposed_data->>'deadline' = '' THEN NULL
          ELSE (change_record.proposed_data->>'deadline')::DATE
        END;
      EXCEPTION
        WHEN OTHERS THEN
          deadline_value := NULL;
      END;

      -- Update existing grant
      UPDATE grants SET
        title = COALESCE(change_record.proposed_data->>'title', title),
        description = COALESCE(change_record.proposed_data->>'description', description),
        agency = COALESCE(change_record.proposed_data->>'agency', agency),
        program = COALESCE(change_record.proposed_data->>'program', program),
        category = COALESCE(change_record.proposed_data->>'category', category),
        eligibility = COALESCE(change_record.proposed_data->>'eligibility', eligibility),
        application_link = COALESCE(change_record.proposed_data->>'application_link', application_link),
        deadline = COALESCE(deadline_value, deadline),
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
