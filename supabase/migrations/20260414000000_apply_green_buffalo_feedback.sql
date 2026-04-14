-- Apply Green Buffalo Grant Tracker feedback (received 2026-04-13)
-- Source: temp/Green Buffalo Grant Tracker - Sheet1.csv
--
-- 37 grants reviewed. 6 approved with minor refinements needed.
-- 31 rejected: broken links, closed windows, non-existent programs, unclear application paths.
--
-- This migration:
--   1. Adds validation_issues column to pending_grant_changes
--   2. Expands change_type CHECK constraint (adds 'reclassify')
--   3. Marks permanently defunct/non-existent grants as inactive
--   4. Marks recurring programs with closed windows as recurring_closed
--   5. Adds notes to approved grants flagging admin refinements needed

-- =============================================================================
-- SCHEMA UPDATES
-- =============================================================================

-- Track validation issues on pending changes (URL checks, title verification, etc.)
ALTER TABLE pending_grant_changes
  ADD COLUMN IF NOT EXISTS validation_issues TEXT[];

-- Expand change_type to support new statuses from the multi-step pipeline
ALTER TABLE pending_grant_changes
  DROP CONSTRAINT IF EXISTS pending_grant_changes_change_type_check;
ALTER TABLE pending_grant_changes
  ADD CONSTRAINT pending_grant_changes_change_type_check
  CHECK (change_type IN ('new', 'update', 'deactivate', 'reclassify'));

-- =============================================================================
-- DEACTIVATIONS: Grants that don't exist, are permanently closed, or are out of scope
-- =============================================================================

-- Nunavut Inuit Community Initiatives Fund — wrongly named (actually "Northern Isolated Community Initiatives Fund")
UPDATE grants SET
  status = 'inactive',
  notes = COALESCE(notes || E'\n\n', '') || '[2026-04-14 feedback] Inappropriately titled. Correct program: Northern Isolated Community Initiatives Fund — https://www.canada.ca/en/atlantic-canada-opportunities/services/northern-isolated-community-initiatives-fund.html. Re-add under correct name.',
  last_updated = NOW()
WHERE title ILIKE '%Nunavut Inuit Community Initiatives Fund%'
   OR title ILIKE '%NICI%';

-- Farm Credit Canada Indigenous Lending — 404
UPDATE grants SET
  status = 'inactive',
  notes = COALESCE(notes || E'\n\n', '') || '[2026-04-14 feedback] Source page returns 404. Program may have been renamed or removed. Re-verify on fcc-fac.ca.',
  last_updated = NOW()
WHERE title ILIKE '%Farm Credit Canada%'
  AND title ILIKE '%Indigenous Lending%';

-- Aboriginal Head Start in Urban and Northern Communities (AHSUNC) — no public application process
UPDATE grants SET
  status = 'inactive',
  notes = COALESCE(notes || E'\n\n', '') || '[2026-04-14 feedback] No clear public application process. Program exists but funding access pathway is not documented. Direct users to Four Winds outreach instead.',
  last_updated = NOW()
WHERE title ILIKE '%Aboriginal Head Start in Urban%'
   OR title ILIKE '%AHSUNC%';

-- Aboriginal Head Start On Reserve (AHSOR) — out of scope
UPDATE grants SET
  status = 'inactive',
  notes = COALESCE(notes || E'\n\n', '') || '[2026-04-14 feedback] Generic page with no funding application path. Out of scope for current project.',
  last_updated = NOW()
WHERE title ILIKE '%Aboriginal Head Start On Reserve%'
   OR title ILIKE '%AHSOR%';

-- First Nations and Inuit Community Policing — no application process
UPDATE grants SET
  status = 'inactive',
  notes = COALESCE(notes || E'\n\n', '') || '[2026-04-14 feedback] No clear way to access funding. Out of scope for current project.',
  last_updated = NOW()
WHERE title ILIKE '%Community Policing%Tripartite%'
   OR title ILIKE '%First Nations and Inuit Community Policing%';

-- WAGE Gender-Based Violence Program (Indigenous stream) — program doesn't exist
UPDATE grants SET
  status = 'inactive',
  notes = COALESCE(notes || E'\n\n', '') || '[2026-04-14 feedback] No such program exists as a distinct Indigenous stream. WAGE funding opportunities list: https://www.canada.ca/en/women-gender-equality/funding/funding-opportunities.html — AI should monitor this page for Indigenous-eligible opportunities.',
  last_updated = NOW()
WHERE title ILIKE '%WAGE%Gender-Based Violence%'
   OR title ILIKE '%Women and Gender Equality%Gender-Based Violence%Indigenous%';

-- Indigenous Initiatives Fund IV – Social Development Component — inaccessible page
UPDATE grants SET
  status = 'inactive',
  notes = COALESCE(notes || E'\n\n', '') || '[2026-04-14 feedback] Page returns 403 (no permission to view). Re-verify accessibility; possible regional restriction.',
  last_updated = NOW()
WHERE title ILIKE '%Indigenous Initiatives Fund IV%Social Development%'
   OR title ILIKE '%FIA IV%Social Development%';

-- ACOA Indigenous Economic Development Support — program doesn't exist
UPDATE grants SET
  status = 'inactive',
  notes = COALESCE(notes || E'\n\n', '') || '[2026-04-14 feedback] Program does not exist as described. Related ACOA Indigenous programs are listed at https://www.canada.ca/en/atlantic-canada-opportunities/services/indigenous-business-atlantic-canada.html',
  last_updated = NOW()
WHERE title ILIKE '%ACOA%Indigenous Economic Development Support%';

-- Signature Indigenous Tourism Experiences Stream (SITES) — discontinued
UPDATE grants SET
  status = 'inactive',
  notes = COALESCE(notes || E'\n\n', '') || '[2026-04-14 feedback] Program no longer available.',
  last_updated = NOW()
WHERE title ILIKE '%Signature Indigenous Tourism%'
   OR title ILIKE '%SITES%';

-- NAYSPS — unclear how to apply
UPDATE grants SET
  status = 'inactive',
  notes = COALESCE(notes || E'\n\n', '') || '[2026-04-14 feedback] Unclear how communities apply. No documented intake process.',
  last_updated = NOW()
WHERE title ILIKE '%National Aboriginal Youth Suicide Prevention%'
   OR title ILIKE '%NAYSPS%';

-- ISC Health Facilities Program — needs clearer application process
UPDATE grants SET
  status = 'inactive',
  notes = COALESCE(notes || E'\n\n', '') || '[2026-04-14 feedback] Application process unclear. Re-add only if ISC publishes clear intake guidelines.',
  last_updated = NOW()
WHERE title ILIKE '%ISC Health Facilities%';

-- =============================================================================
-- RECURRING_CLOSED: Legitimate programs whose current window is closed
-- =============================================================================

-- First Nations Environmental Contaminants Program — closed window, typically reopens
UPDATE grants SET
  status = 'recurring_closed',
  notes = COALESCE(notes || E'\n\n', '') || '[2026-04-14 feedback] Funding window closed. Program recurs — monitor for reopening. Correct URL: https://www.sac-isc.gc.ca/eng/1583779185601/1583779243216',
  last_updated = NOW()
WHERE title ILIKE '%First Nations Environmental Contaminants%';

-- Family Violence Prevention Program — closed December 2024, recurring
UPDATE grants SET
  status = 'recurring_closed',
  notes = COALESCE(notes || E'\n\n', '') || '[2026-04-14 feedback] Closed December 2024. Typically reopens annually — monitor for new intake window.',
  last_updated = NOW()
WHERE title ILIKE '%Family Violence Prevention Program%';

-- SSHRC/NSERC/CIHR Indigenous Capacity and Leadership Connection Grants — annual recurrence
UPDATE grants SET
  status = 'recurring_closed',
  notes = COALESCE(notes || E'\n\n', '') || '[2026-04-14 feedback] Closed. Opens annually — typically once per year. Monitor sshrc-crsh.canada.ca for next intake.',
  last_updated = NOW()
WHERE title ILIKE '%Indigenous Capacity and Leadership in Research%'
   OR title ILIKE '%SSHRC%Indigenous Capacity%';

-- SSHRC Indigenous Innovation and Leadership Network Grants — annual recurrence
UPDATE grants SET
  status = 'recurring_closed',
  notes = COALESCE(notes || E'\n\n', '') || '[2026-04-14 feedback] Closed. Opens annually. Monitor for next intake.',
  last_updated = NOW()
WHERE title ILIKE '%Indigenous Innovation and Leadership%Network%'
   OR title ILIKE '%Indigenous Research Network Grants%';

-- SSDIC Stream One/Two/Three — recurring, closed
UPDATE grants SET
  status = 'recurring_closed',
  notes = COALESCE(notes || E'\n\n', '') || '[2026-04-14 feedback] Current window closed. Program recurs — Stream Three typically reopens 2027 per source.',
  last_updated = NOW()
WHERE title ILIKE '%Sport for Social Development in Indigenous Communities%'
   OR title ILIKE '%SSDIC%';

-- Indigenous Justice Program — Capacity-Building Fund — closed, recurring; wrong link
UPDATE grants SET
  status = 'recurring_closed',
  application_link = 'https://www.justice.gc.ca/eng/fund-fina/acf-fca/ajs-sja/cf-fc/index.html',
  source_url = 'https://www.justice.gc.ca/eng/fund-fina/acf-fca/ajs-sja/cf-fc/index.html',
  notes = COALESCE(notes || E'\n\n', '') || '[2026-04-14 feedback] Funding closed. Updated to correct URL. Monitor justice.gc.ca for reopening.',
  last_updated = NOW()
WHERE title ILIKE '%Indigenous Justice Program%Capacity-Building%';

-- Supporting Indigenous Women's and 2SLGBTQI+ Organizations Program — closed, expected to reopen
UPDATE grants SET
  status = 'recurring_closed',
  notes = COALESCE(notes || E'\n\n', '') || '[2026-04-14 feedback] Funding window closed, likely reopens in coming months. Monitor rcaanc-cirnac.gc.ca.',
  last_updated = NOW()
WHERE title ILIKE '%Supporting Indigenous Women%'
   OR title ILIKE '%2SLGBTQI+ Organizations%';

-- Reserve Land and Environment Management Program (RLEMP)
UPDATE grants SET
  status = 'recurring_closed',
  source_url = 'https://sac-isc.gc.ca/eng/1571829044381/1571829074923',
  notes = COALESCE(notes || E'\n\n', '') || '[2026-04-14 feedback] Updated to correct URL. General reference: https://sac-isc.gc.ca/eng/1571829044381/1571829074923',
  last_updated = NOW()
WHERE title ILIKE '%Reserve Land and Environment Management%'
   OR title ILIKE '%RLEMP%';

-- =============================================================================
-- LINK/DESCRIPTION UPDATES: Approved grants needing refinement
-- =============================================================================

-- Nutrition North Canada – Harvesters Support Grant — approved, needs stream detail
UPDATE grants SET
  description = COALESCE(description, '') || E'\n\n[FUNDING STREAMS] This grant has multiple distinct funding streams — review nutritionnorthcanada.gc.ca for each stream''s specific eligibility and amounts.',
  notes = COALESCE(notes || E'\n\n', '') || '[2026-04-14 feedback] APPROVED. Action: expand description to describe each funding stream so communities can pick the right one.',
  last_updated = NOW()
WHERE title ILIKE '%Nutrition North%Harvesters Support%';

-- CIHR NEIHR — approved, needs direct funding stream link
UPDATE grants SET
  notes = COALESCE(notes || E'\n\n', '') || '[2026-04-14 feedback] APPROVED. Current link goes to NEIHR Operating Grant for Yukon — should be linked to main NEIHR direct funding stream instead.',
  last_updated = NOW()
WHERE title ILIKE '%CIHR%NEIHR%'
   OR title ILIKE '%Network Environments for Indigenous Health Research%';

-- Indigenous Justice Program – Community-Based Justice Fund — approved, needs correct link
UPDATE grants SET
  application_link = 'https://www.justice.gc.ca/eng/fund-fina/acf-fca/ajs-sja/cf-pc/index.html',
  source_url = 'https://www.justice.gc.ca/eng/fund-fina/acf-fca/ajs-sja/cf-pc/index.html',
  notes = COALESCE(notes || E'\n\n', '') || '[2026-04-14 feedback] APPROVED. Updated to correct link.',
  last_updated = NOW()
WHERE title ILIKE '%Indigenous Justice Program%Community-Based Justice%';

-- Indigenous Initiatives Fund IV – Community Infrastructure Component — approved, needs application email
UPDATE grants SET
  notes = COALESCE(notes || E'\n\n', '') || '[2026-04-14 feedback] APPROVED. Action: add the application submission email address from the source page to the description.',
  last_updated = NOW()
WHERE title ILIKE '%Indigenous Initiatives Fund IV%Community Infrastructure%'
   OR title ILIKE '%FIA IV%Community Infrastructure%';

-- Indigenous Initiatives Fund IV – Economic Development Component — approved
UPDATE grants SET
  notes = COALESCE(notes || E'\n\n', '') || '[2026-04-14 feedback] APPROVED. Action: link directly to the Economic Development component page instead of the general fund page.',
  last_updated = NOW()
WHERE title ILIKE '%Indigenous Initiatives Fund IV%Economic Development%'
   OR title ILIKE '%FIA IV%Economic Development%';

-- ACOA Elevate Tourism Initiative — approved, needs application roadmap
UPDATE grants SET
  description = COALESCE(description, '') || E'\n\n[HOW TO APPLY] Navigate from the program page to the general ACOA application form at https://www.canada.ca/en/atlantic-canada-opportunities/services/application-for-financial-assistance.html',
  notes = COALESCE(notes || E'\n\n', '') || '[2026-04-14 feedback] APPROVED. Users need a roadmap — the program page links to the general application form.',
  last_updated = NOW()
WHERE title ILIKE '%ACOA%Elevate Tourism%';

-- ACOA REGI – Business Scale-up and Productivity — wrong link
UPDATE grants SET
  notes = COALESCE(notes || E'\n\n', '') || '[2026-04-14 feedback] Program exists but current application_link is wrong. Admin: find correct Business Scale-up and Productivity stream URL.',
  last_updated = NOW()
WHERE title ILIKE '%ACOA%Regional Economic Growth%'
   OR title ILIKE '%REGI%Business Scale-up%';

-- CALQ Indigenous Artists Programs — too broad, needs to be split into 8 separate grants
UPDATE grants SET
  status = 'inactive',
  notes = COALESCE(notes || E'\n\n', '') || '[2026-04-14 feedback] Entry is too generic — CALQ has 8 distinct Indigenous artist grants. Deactivating this umbrella entry. Admin: add each of the 8 programs as separate grants. Source: https://www.calq.gouv.qc.ca/en/grants/grants-programs/artists?tx_solr[q]=indigenous',
  last_updated = NOW()
WHERE title ILIKE '%Conseil des arts et des lettres du Québec%Indigenous%'
   OR title ILIKE '%CALQ%Indigenous Artists%';

-- =============================================================================
-- AUDIT LOG
-- =============================================================================

-- Create a record of this bulk feedback application (helpful for auditing)
INSERT INTO grant_research_runs (
  triggered_by,
  status,
  started_at,
  completed_at,
  grants_analyzed,
  error_message,
  raw_response
) VALUES (
  'manual',
  'completed',
  NOW(),
  NOW(),
  37,
  NULL,
  jsonb_build_object(
    'source', 'Green Buffalo Grant Tracker feedback CSV',
    'date', '2026-04-13',
    'grants_reviewed', 37,
    'approved_with_refinement', 6,
    'rejected', 31,
    'applied_by_migration', '20260414000000_apply_green_buffalo_feedback.sql'
  )
)
ON CONFLICT DO NOTHING;

-- Rollback guidance (do NOT run this unless reverting):
-- UPDATE grants SET status = 'active' WHERE notes LIKE '%[2026-04-14 feedback]%';
-- ALTER TABLE pending_grant_changes DROP COLUMN IF EXISTS validation_issues;
