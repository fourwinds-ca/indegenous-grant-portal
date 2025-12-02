/**
 * Seed script to import grants from JSON file into Supabase
 *
 * Usage: npx ts-node scripts/seedGrants.ts
 * Or: npx tsx scripts/seedGrants.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Read environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Interface for the JSON file format
interface JsonGrant {
  grant_title: string;
  administering_agency: string;
  program_name: string;
  category: string;
  jurisdiction: string;
  eligibility: string;
  funding_amount: string;
  application_deadline: string;
  application_link: string;
  source_url: string;
  description: string;
}

// Interface for database format
interface GrantDB {
  title: string;
  description: string;
  agency: string;
  program: string;
  category: string;
  eligibility: string;
  application_link: string;
  deadline: string;
  amount: string;
  currency: string;
  status: 'active' | 'inactive' | 'closed';
  source_url: string;
  province: string;
  is_publicly_available: boolean;
  added_by: string;
  notes: string;
}

// Map jurisdiction to province format
function mapJurisdiction(jurisdiction: string): string {
  const mapping: Record<string, string> = {
    'Federal': 'Federal',
    'Ontario': 'Ontario',
    'British Columbia': 'British Columbia',
    'Alberta': 'Alberta',
    'Quebec': 'Quebec',
    'Manitoba': 'Manitoba',
    'Saskatchewan': 'Saskatchewan',
  };
  return mapping[jurisdiction] || jurisdiction;
}

// Determine status based on deadline text
function determineStatus(deadlineText: string): 'active' | 'inactive' | 'closed' {
  const lower = deadlineText.toLowerCase();
  if (lower.includes('closed') || lower.includes('passed')) {
    return 'inactive';
  }
  return 'active';
}

// Parse deadline to a date string (or use a far future date for ongoing)
function parseDeadline(deadlineText: string): string {
  const lower = deadlineText.toLowerCase();

  // Check for specific dates
  const datePatterns = [
    /(\w+ \d{1,2}, \d{4})/,           // December 15, 2025
    /(\d{4}-\d{2}-\d{2})/,             // 2025-12-15
    /(\w+ \d{1,2}) ?, ?(\d{4})/,       // December 15, 2025
  ];

  for (const pattern of datePatterns) {
    const match = deadlineText.match(pattern);
    if (match) {
      const parsed = new Date(match[0]);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0];
      }
    }
  }

  // For ongoing programs, set deadline to end of 2025
  if (lower.includes('ongoing') || lower.includes('no deadline')) {
    return '2025-12-31';
  }

  // Default to end of 2025
  return '2025-12-31';
}

// Transform JSON grant to database format
function transformGrant(jsonGrant: JsonGrant): GrantDB {
  return {
    title: jsonGrant.grant_title,
    description: jsonGrant.description,
    agency: jsonGrant.administering_agency,
    program: jsonGrant.program_name,
    category: jsonGrant.category,
    eligibility: jsonGrant.eligibility,
    application_link: jsonGrant.application_link,
    deadline: parseDeadline(jsonGrant.application_deadline),
    amount: jsonGrant.funding_amount,
    currency: 'CAD',
    status: determineStatus(jsonGrant.application_deadline),
    source_url: jsonGrant.source_url,
    province: mapJurisdiction(jsonGrant.jurisdiction),
    is_publicly_available: true,
    added_by: 'seed-script',
    notes: `Original deadline info: ${jsonGrant.application_deadline}`,
  };
}

async function seedGrants() {
  console.log('Starting grant seeding process...\n');

  // Read the JSON file
  const jsonPath = path.resolve('/Users/rohit/Downloads/indigenous_grants_database_v1.json');

  if (!fs.existsSync(jsonPath)) {
    console.error(`JSON file not found at: ${jsonPath}`);
    process.exit(1);
  }

  const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
  const jsonGrants: JsonGrant[] = JSON.parse(jsonContent);

  console.log(`Found ${jsonGrants.length} grants in JSON file\n`);

  // Transform grants
  const dbGrants = jsonGrants.map(transformGrant);

  // Log sample transformation
  console.log('Sample transformation:');
  console.log('Original:', JSON.stringify(jsonGrants[0], null, 2));
  console.log('\nTransformed:', JSON.stringify(dbGrants[0], null, 2));
  console.log('\n---\n');

  // Insert grants in batches
  const batchSize = 10;
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < dbGrants.length; i += batchSize) {
    const batch = dbGrants.slice(i, i + batchSize);

    const { data, error } = await supabase
      .from('grants')
      .insert(batch)
      .select();

    if (error) {
      console.error(`Error inserting batch ${i / batchSize + 1}:`, error.message);
      errorCount += batch.length;
    } else {
      console.log(`Inserted batch ${i / batchSize + 1}: ${data.length} grants`);
      successCount += data.length;
    }
  }

  console.log('\n---');
  console.log(`Seeding complete!`);
  console.log(`Successfully inserted: ${successCount} grants`);
  console.log(`Errors: ${errorCount}`);
}

seedGrants().catch(console.error);
