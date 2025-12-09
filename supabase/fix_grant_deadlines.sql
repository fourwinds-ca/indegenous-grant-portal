-- Fix grant deadlines to be more accurate
-- The deadline field now stores actual dates where applicable
-- The notes field contains the original deadline description

-- Add deadline_type column to indicate if deadline is fixed or ongoing
ALTER TABLE grants ADD COLUMN IF NOT EXISTS deadline_type VARCHAR(50) DEFAULT 'fixed';

-- Update grants with accurate deadline information

-- ONGOING PROGRAMS (set deadline far in future, mark as ongoing)
UPDATE grants SET deadline = '2099-12-31', deadline_type = 'ongoing'
WHERE title IN (
  'Canada Infrastructure Bank Indigenous Community Infrastructure Initiative (ICII)',
  'Canada Infrastructure Bank Indigenous Equity Initiative (IEI)',
  'Wah-ila-toos / Clean Energy for Rural and Remote Communities (CERRC)',
  'Northern REACHE Program',
  'First Nation Adapt Program',
  'Indigenous-led Natural Climate Solutions',
  'Strategic Partnerships Initiative (SPI)',
  'Aboriginal Entrepreneurship Program - Access to Capital',
  'First Nation Infrastructure Fund (FNIF)',
  'Disaster Mitigation and Adaptation Fund (DMAF)',
  'Indigenous Skills and Employment Training (ISET) Program',
  'Indigenous Opportunities Financing Program (IOFP)',
  'BC Indigenous Clean Energy Initiative (BCICEI)',
  'Indigenous Communities Conservation Program (ICCP)',
  'Alberta Indigenous Opportunities Corporation (AIOC)',
  'Alberta Indigenous Clean Energy Initiative (AICEI)',
  'Indigenous Economic Development Fund (Manitoba)',
  'First Peoples Economic Growth Fund',
  'Saskatchewan Indigenous Enterprise Foundation (SIEF)'
);

-- CLOSED/INACTIVE - Keep current deadline, status already inactive
UPDATE grants SET deadline_type = 'closed'
WHERE title IN (
  'Zero Emission Vehicle Infrastructure Program (ZEVIP)',
  'Indigenous Leadership Fund (Low Carbon Economy Fund)',
  'Smart Renewables and Electrification Pathways Program - Indigenous-Led Clean Energy Stream',
  'Indigenous Energy Support Program (IESP)',
  'First Nations Clean Energy Business Fund (FNCEBF)'
);

-- SPECIFIC DEADLINES
-- Community Opportunity Readiness Program - March 31, 2026
UPDATE grants SET deadline = '2026-03-31', deadline_type = 'fixed'
WHERE title = 'Community Opportunity Readiness Program (CORP)';

-- Green and Inclusive Community Buildings - March 2029 (periodic intakes)
UPDATE grants SET deadline = '2029-03-31', deadline_type = 'periodic'
WHERE title = 'Green and Inclusive Community Buildings Program (GICB)';

-- EV ChargeON Program - December 15, 2025
UPDATE grants SET deadline = '2025-12-15', deadline_type = 'fixed'
WHERE title = 'EV ChargeON Program';

-- Indigenous Economic Development Fund (Ontario) - December 1, 2025
UPDATE grants SET deadline = '2025-12-01', deadline_type = 'fixed'
WHERE title = 'Indigenous Economic Development Fund (IEDF)' AND province = 'Ontario';

-- Aboriginal Business Investment Fund - Annual (fiscal year basis)
UPDATE grants SET deadline = '2026-03-31', deadline_type = 'annual'
WHERE title = 'Aboriginal Business Investment Fund (ABIF)';

-- Northern and Regional Economic Development - Annual intakes
UPDATE grants SET deadline = '2026-03-31', deadline_type = 'annual'
WHERE title = 'Northern and Regional Economic Development Program (NRED)';

-- Indigenous Initiatives Fund IV (Quebec) - 2027 program end
UPDATE grants SET deadline = '2027-12-31', deadline_type = 'program_end'
WHERE title = 'Indigenous Initiatives Fund IV (IIF IV)';

-- First Nations and Métis Community Partnership - October 31 annually
UPDATE grants SET deadline = '2025-10-31', deadline_type = 'annual'
WHERE title = 'First Nations and Métis Community Partnership Projects';

-- BC First Nations Clean Energy Business Fund - Early 2026 intake expected
UPDATE grants SET deadline = '2026-03-31', deadline_type = 'periodic', status = 'inactive'
WHERE title = 'First Nations Clean Energy Business Fund (FNCEBF)';

-- Update the notes to include original deadline info where not already present
UPDATE grants SET notes = CONCAT('Deadline type: ', deadline_type, '. ', COALESCE(notes, ''))
WHERE notes NOT LIKE '%Deadline type:%';
