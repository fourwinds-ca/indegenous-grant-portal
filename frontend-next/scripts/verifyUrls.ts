/**
 * Script to verify all grant URLs in the database
 * Run with: npx tsx scripts/verifyUrls.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface Grant {
  id: string;
  title: string;
  application_link: string;
  source_url: string;
  status: string;
}

interface UrlCheckResult {
  id: string;
  title: string;
  applicationLink: string;
  applicationLinkStatus: number | string;
  sourceUrl: string;
  sourceUrlStatus: number | string;
}

async function checkUrl(url: string): Promise<number | string> {
  if (!url || url.trim() === '') {
    return 'empty';
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });

    clearTimeout(timeoutId);
    return response.status;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return 'timeout';
    }
    // Try GET if HEAD fails
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
      });

      clearTimeout(timeoutId);
      return response.status;
    } catch (getError: any) {
      if (getError.name === 'AbortError') {
        return 'timeout';
      }
      return `error: ${getError.message}`;
    }
  }
}

async function main() {
  console.log('Fetching grants from database...\n');

  const { data: grants, error } = await supabase
    .from('grants')
    .select('id, title, application_link, source_url, status')
    .order('title');

  if (error) {
    console.error('Error fetching grants:', error);
    process.exit(1);
  }

  if (!grants || grants.length === 0) {
    console.log('No grants found in database');
    process.exit(0);
  }

  console.log(`Found ${grants.length} grants. Checking URLs...\n`);
  console.log('='.repeat(80));

  const results: UrlCheckResult[] = [];
  const brokenLinks: UrlCheckResult[] = [];

  for (let i = 0; i < grants.length; i++) {
    const grant = grants[i] as Grant;
    console.log(`\n[${i + 1}/${grants.length}] ${grant.title}`);
    console.log(`  Status: ${grant.status}`);

    const appLinkStatus = await checkUrl(grant.application_link);
    const sourceUrlStatus = await checkUrl(grant.source_url);

    console.log(`  Application Link: ${appLinkStatus} - ${grant.application_link || '(empty)'}`);
    console.log(`  Source URL: ${sourceUrlStatus} - ${grant.source_url || '(empty)'}`);

    const result: UrlCheckResult = {
      id: grant.id,
      title: grant.title,
      applicationLink: grant.application_link,
      applicationLinkStatus: appLinkStatus,
      sourceUrl: grant.source_url,
      sourceUrlStatus: sourceUrlStatus,
    };

    results.push(result);

    // Check if either URL is broken
    const appBroken = typeof appLinkStatus === 'string' || (typeof appLinkStatus === 'number' && appLinkStatus >= 400);
    const sourceBroken = typeof sourceUrlStatus === 'string' || (typeof sourceUrlStatus === 'number' && sourceUrlStatus >= 400);

    if (appBroken || sourceBroken) {
      brokenLinks.push(result);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n📊 SUMMARY\n');
  console.log(`Total grants: ${grants.length}`);
  console.log(`Grants with broken links: ${brokenLinks.length}`);

  if (brokenLinks.length > 0) {
    console.log('\n❌ BROKEN LINKS:\n');
    brokenLinks.forEach((result, index) => {
      console.log(`${index + 1}. ${result.title}`);
      console.log(`   ID: ${result.id}`);
      if (typeof result.applicationLinkStatus === 'string' || (typeof result.applicationLinkStatus === 'number' && result.applicationLinkStatus >= 400)) {
        console.log(`   ⚠️  Application Link (${result.applicationLinkStatus}): ${result.applicationLink}`);
      }
      if (typeof result.sourceUrlStatus === 'string' || (typeof result.sourceUrlStatus === 'number' && result.sourceUrlStatus >= 400)) {
        console.log(`   ⚠️  Source URL (${result.sourceUrlStatus}): ${result.sourceUrl}`);
      }
      console.log('');
    });
  }

  // Output working links too for verification
  const workingLinks = results.filter(r => !brokenLinks.includes(r));
  if (workingLinks.length > 0) {
    console.log('\n✅ WORKING LINKS:\n');
    workingLinks.forEach((result, index) => {
      console.log(`${index + 1}. ${result.title} - App: ${result.applicationLinkStatus}, Source: ${result.sourceUrlStatus}`);
    });
  }
}

main().catch(console.error);
