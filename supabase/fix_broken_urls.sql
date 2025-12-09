-- Fix broken grant URLs identified by URL verification
-- Run this in Supabase SQL Editor
-- Verified: December 9, 2025

-- ============================================================================
-- BROKEN URLs IDENTIFIED (returning 404 or certificate errors)
-- ============================================================================

-- 1. Indigenous Initiatives Fund IV (IIF IV) - Quebec
-- Old URL returned 404, updating to correct Quebec government page
UPDATE grants
SET application_link = 'https://www.quebec.ca/en/government/quebec-at-a-glance/first-nations-and-inuit/indigenous-financial-assistance/indigenous-initiatives-fund-iv',
    source_url = 'https://www.quebec.ca/en/government/quebec-at-a-glance/first-nations-and-inuit/indigenous-financial-assistance/indigenous-initiatives-fund-iv'
WHERE title = 'Indigenous Initiatives Fund IV (IIF IV)';

-- 2. First Nations and Metis Community Partnership Projects (Saskatchewan)
-- Old URL returned 404 (was pointing to a news article that no longer exists)
-- Updating to the official program page
UPDATE grants
SET application_link = 'https://www.saskatchewan.ca/residents/first-nations-citizens/saskatchewan-first-nations-metis-and-northern-initiatives/first-nations-and-metis-community-partnership-projects',
    source_url = 'https://www.saskatchewan.ca/residents/first-nations-citizens/saskatchewan-first-nations-metis-and-northern-initiatives/first-nations-and-metis-community-partnership-projects'
WHERE title = 'First Nations and Métis Community Partnership Projects';

-- 3. Indigenous Communities Conservation Program (ICCP) - BC
-- Old URL (betterhomesbc.ca) has SSL certificate issues
-- Updating to BC Hydro's direct program page
UPDATE grants
SET application_link = 'https://www.bchydro.com/powersmart/indigenous-communities/indigenous-governing-bodies-program/energy-saving-measures.html',
    source_url = 'https://www.bchydro.com/powersmart/indigenous-communities/indigenous-governing-bodies-program/energy-saving-measures.html',
    notes = 'Program provides free energy-saving products and support for Indigenous communities through BC Hydro and FortisBC.'
WHERE title = 'Indigenous Communities Conservation Program (ICCP)';

-- 4. Indigenous Opportunities Financing Program (IOFP) - Ontario
-- Old URL was text ("Contact Ontario Ministry of Energy") not a valid URL
-- PDF source was not appropriate for application link
-- Program now managed by Building Ontario Fund with $3B expanded envelope (2025)
UPDATE grants
SET application_link = 'https://buildingonfund.ca/iofp/',
    source_url = 'https://buildingonfund.ca/iofp/',
    notes = 'Program expanded to $3B in 2025 Ontario Budget. Now covers energy, critical minerals, pipelines, and resource development sectors. Contact: iofp@buildingonfund.ca'
WHERE title = 'Indigenous Opportunities Financing Program (IOFP)';

-- ============================================================================
-- VERIFIED WORKING URLs (no changes needed)
-- ============================================================================
-- The following grant URLs were verified as working on December 9, 2025:
--
-- FEDERAL:
-- - Zero Emission Vehicle Infrastructure Program (ZEVIP) - natural-resources.canada.ca ✓
-- - Canada Infrastructure Bank ICII - cib-bic.ca ✓
-- - Canada Infrastructure Bank IEI - cib-bic.ca ✓
-- - Clean Energy for Rural and Remote Communities (CERRC) - natural-resources.canada.ca ✓
-- - Northern REACHE Program - rcaanc-cirnac.gc.ca ✓
-- - Indigenous Leadership Fund - canada.ca ✓
-- - SREPs Indigenous-Led Clean Energy Stream - natural-resources.canada.ca ✓
-- - First Nation Adapt Program - rcaanc-cirnac.gc.ca ✓
-- - Indigenous-led Natural Climate Solutions - canada.ca ✓
-- - Community Opportunity Readiness Program (CORP) - sac-isc.gc.ca ✓
-- - Strategic Partnerships Initiative (SPI) - sac-isc.gc.ca ✓
-- - Aboriginal Entrepreneurship Program - sac-isc.gc.ca ✓
-- - First Nation Infrastructure Fund (FNIF) - sac-isc.gc.ca ✓
-- - Green and Inclusive Community Buildings Program - housing-infrastructure.canada.ca ✓
-- - Disaster Mitigation and Adaptation Fund - housing-infrastructure.canada.ca ✓
-- - Indigenous Skills and Employment Training (ISET) - canada.ca ✓
--
-- ONTARIO:
-- - EV ChargeON Program - ovinhub.ca ✓
-- - Indigenous Energy Support Program (IESP) - ieso.ca ✓
-- - Indigenous Economic Development Fund (IEDF) - ontario.ca ✓
--
-- BRITISH COLUMBIA:
-- - First Nations Clean Energy Business Fund (FNCEBF) - gov.bc.ca ✓
-- - BC Indigenous Clean Energy Initiative (BCICEI) - newrelationshiptrust.ca ✓
--
-- ALBERTA:
-- - Alberta Indigenous Opportunities Corporation (AIOC) - theaioc.com ✓
-- - Alberta Indigenous Clean Energy Initiative (AICEI) - canada.ca ✓
-- - Aboriginal Business Investment Fund (ABIF) - alberta.ca ✓
-- - Northern and Regional Economic Development Program (NRED) - alberta.ca ✓
--
-- MANITOBA:
-- - Indigenous Economic Development Fund (Manitoba) - gov.mb.ca ✓
-- - First Peoples Economic Growth Fund - cfmanitoba.ca ✓
--
-- SASKATCHEWAN:
-- - Saskatchewan Indigenous Enterprise Foundation (SIEF) - sief.sk.ca ✓

-- ============================================================================
-- Verify the updates
-- ============================================================================
SELECT title, application_link, source_url, status, notes
FROM grants
WHERE title IN (
    'Indigenous Initiatives Fund IV (IIF IV)',
    'First Nations and Métis Community Partnership Projects',
    'Indigenous Communities Conservation Program (ICCP)',
    'Indigenous Opportunities Financing Program (IOFP)'
)
ORDER BY title;
