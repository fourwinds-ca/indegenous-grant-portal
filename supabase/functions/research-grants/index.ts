// Supabase Edge Function: research-grants
// Two-step AI workflow:
// 1. Perplexity Deep Research: Finds all Indigenous grants in Canada
// 2. Claude Sonnet 4.5: Compares results with database and identifies changes
// Results are stored as pending changes for admin approval

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.79.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Grant {
  id?: string;
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
  status: string;
  source_url: string;
  province: string;
  is_publicly_available: boolean;
  notes?: string;
}

interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// OpenRouter returns all responses in OpenAI format (same as Perplexity)
// So we can reuse PerplexityResponse interface for Claude too


interface ResearchResult {
  new_grants: Grant[];
  updated_grants: Array<{
    existing_title: string;
    updates: Partial<Grant>;
    reason: string;
  }>;
  deactivated_grants: Array<{
    title: string;
    reason: string;
  }>;
  confidence_score: number;
  sources: string[];
}

// Government domains whitelist
const FEDERAL_GOV_DOMAINS = [
  "canada.ca",
  "gc.ca",
  "isc-sac.gc.ca",
  "rcaanc-cirnac.gc.ca",
  "nrcan-rncan.gc.ca",
  "ec.gc.ca",
  "cmhc-schl.gc.ca",
  "ised-isde.gc.ca",
  "infrastructure.gc.ca",
  "sac-isc.gc.ca",
];

const PROVINCIAL_GOV_DOMAINS = [
  "gov.bc.ca",
  "alberta.ca",
  "ontario.ca",
  "quebec.ca",
  "gov.mb.ca",
  "gov.sk.ca",
  "gov.ns.ca",
  "gnb.ca",
  "gov.nl.ca",
  "gov.pe.ca",
  "gov.nt.ca",
  "gov.nu.ca",
  "gov.yk.ca",
];

// Category-specific search prompts for multi-step research
interface SearchCategory {
  name: string;
  prompt: string;
}

function buildSearchCategories(): SearchCategory[] {
  const govSourceInstruction = `
CRITICAL SOURCE RESTRICTION:
- ONLY search and cite official Canadian government websites ending in .gc.ca or provincial government domains.
- Allowed federal domains: ${FEDERAL_GOV_DOMAINS.join(", ")}
- Allowed provincial domains: ${PROVINCIAL_GOV_DOMAINS.join(", ")}
- Do NOT include results from non-government websites, news articles, blogs, or third-party aggregators.
- Only include grants where you can provide a direct government URL as the source.
- If you cannot find a government URL for a grant, do NOT include it.

For each grant/program you find, provide:
- Full official name
- Administering agency
- What the funding is for (description)
- Who is eligible (be specific about Indigenous eligibility requirements)
- Funding amount or range
- Application deadline (or whether it is ongoing/rolling)
- Where to apply (direct government URL only)
- Province/territory or Federal
- Program category`;

  return [
    {
      name: "Federal Indigenous Programs (ISC, CIRNAC)",
      prompt: `Research all Indigenous-focused grants and funding programs currently available from Indigenous Services Canada (ISC) and Crown-Indigenous Relations and Northern Affairs Canada (CIRNAC) for 2025-2026.

Search ONLY on these government websites:
- isc-sac.gc.ca / sac-isc.gc.ca
- rcaanc-cirnac.gc.ca
- canada.ca/en/indigenous-services-canada
- canada.ca/en/crown-indigenous-relations-northern-affairs

Include programs for First Nations, Métis, and Inuit communities covering: education, health, social services, governance, land claims, treaty obligations, and community development.
${govSourceInstruction}`,
    },
    {
      name: "Energy & Environment (NRCan, ECCC)",
      prompt: `Research all Indigenous-focused grants and funding programs currently available from Natural Resources Canada (NRCan) and Environment and Climate Change Canada (ECCC) for 2025-2026.

Search ONLY on these government websites:
- nrcan-rncan.gc.ca
- ec.gc.ca
- canada.ca/en/natural-resources
- canada.ca/en/environment-climate-change

Include programs for: clean energy, renewable energy, climate action, environmental monitoring, Indigenous climate leadership, diesel reduction, and energy efficiency for Indigenous communities.
${govSourceInstruction}`,
    },
    {
      name: "Housing & Infrastructure (CMHC, Infrastructure Canada)",
      prompt: `Research all Indigenous-focused grants and funding programs currently available from Canada Mortgage and Housing Corporation (CMHC) and Infrastructure Canada for 2025-2026.

Search ONLY on these government websites:
- cmhc-schl.gc.ca
- infrastructure.gc.ca
- canada.ca/en/office-infrastructure

Include programs for: housing, water and wastewater, broadband connectivity, community infrastructure, roads, bridges, and building projects for Indigenous communities.
${govSourceInstruction}`,
    },
    {
      name: "Economic Development (ISED, Regional Agencies)",
      prompt: `Research all Indigenous-focused economic development grants and funding programs currently available from Innovation, Science and Economic Development Canada (ISED) and federal regional development agencies for 2025-2026.

Search ONLY on these government websites:
- ised-isde.gc.ca
- canada.ca/en/innovation-science-economic-development
- feddev-ontario.gc.ca
- wd-deo.gc.ca
- dec-ced.gc.ca

Include programs for: Indigenous business development, entrepreneurship, innovation, technology, tourism, and economic diversification.
${govSourceInstruction}`,
    },
    {
      name: "Provincial Indigenous Programs",
      prompt: `Research all Indigenous-focused grants and funding programs currently available from Canadian provincial and territorial governments for 2025-2026.

Search ONLY on provincial government websites:
- gov.bc.ca, alberta.ca, ontario.ca, quebec.ca, gov.mb.ca, gov.sk.ca
- gov.ns.ca, gnb.ca, gov.nl.ca, gov.pe.ca, gov.nt.ca, gov.nu.ca, gov.yk.ca

Include programs from all provinces and territories covering: Indigenous community development, business grants, housing, education, health, cultural programs, and reconciliation initiatives.
${govSourceInstruction}`,
    },
  ];
}

// Legacy single prompt (kept for reference, no longer used)
function buildPerplexityPrompt(): string {
  return buildSearchCategories()[0].prompt;
}

// STEP 2: Build Claude comparison prompt (parses Perplexity report + compares with database)
function buildClaudeComparisonPrompt(
  perplexityReport: string,
  existingGrants: Grant[]
): string {
  const existingJson = JSON.stringify(
    existingGrants.map((g) => ({
      id: g.id,
      title: g.title,
      agency: g.agency,
      province: g.province,
      deadline: g.deadline,
      amount: g.amount,
      status: g.status,
      application_link: g.application_link,
    })),
    null,
    2
  );

  return `You are Claude, an AI assistant specializing in data comparison and analysis.

TASK: Compare two datasets of Indigenous grants in Canada and identify what has changed.

DATASET 1 - PERPLEXITY RESEARCH REPORT (Fresh deep web research):
${perplexityReport}

DATASET 2 - CURRENT DATABASE (Existing grants):
${existingJson}

YOUR JOB:
1. **NEW GRANTS**: Identify grants in Perplexity results that are NOT in the database
   - Compare by title, agency, and program name (allow for minor title variations)
   - Only mark as new if it's genuinely a different grant

2. **UPDATED GRANTS**: Identify grants that exist in both but have changes
   - Compare: deadline, amount, application_link, status, eligibility
   - Specify exactly what changed (old value → new value)
   - Provide reasoning for why you believe this is an update

3. **DEACTIVATED GRANTS**: Identify grants in database that are NOT found in Perplexity results
   - Only flag if the grant appears to be discontinued/expired
   - Provide reasoning (e.g., "past deadline", "no longer listed on agency website")

RESPONSE FORMAT (JSON only):
{
  "new_grants": [
    {
      "title": "...",
      "description": "...",
      "agency": "...",
      "program": "...",
      "category": "...",
      "eligibility": "...",
      "application_link": "...",
      "deadline": "YYYY-MM-DD or Ongoing",
      "amount": "...",
      "currency": "CAD",
      "status": "active",
      "source_url": "...",
      "province": "...",
      "is_publicly_available": true
    }
  ],
  "updated_grants": [
    {
      "existing_title": "Exact title from database",
      "existing_grant_id": "grant ID from database",
      "updates": {
        "deadline": "new value",
        "amount": "new value"
      },
      "reason": "Deadline extended from 2024-12-31 to 2025-06-30 per updated website"
    }
  ],
  "deactivated_grants": [
    {
      "title": "Exact title from database",
      "grant_id": "grant ID from database",
      "reason": "Grant deadline passed and no renewal found"
    }
  ],
  "confidence_score": 0.9
}

IMPORTANT:
- Be precise with title matching (account for slight variations)
- Only flag updates if you're confident the change is real
- Provide detailed reasoning for all updates and deactivations
- Return ONLY valid JSON, no markdown or explanatory text
- CRITICAL: Only include grants that have a source URL from an official Canadian government website (.gc.ca or provincial government domain). Reject any grants sourced from non-government sites.
- Every application_link and source_url MUST be a government website URL
- CRITICAL: Each grant MUST have its own unique, specific source_url and application_link pointing to that specific grant's page. Do NOT reuse the same URL across multiple grants. Each source_url should be the exact government page where that particular grant is described.`;
}

// Call Perplexity Deep Research via OpenRouter - returns raw research report text
async function callPerplexityDeepResearch(
  prompt: string,
  apiKey: string
): Promise<string> {
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://greenbuffalo.ca",
        "X-Title": "Four Winds Grant Portal",
      },
      body: JSON.stringify({
        model: "perplexity/sonar-deep-research",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 16000,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Perplexity via OpenRouter error: ${response.status} - ${error}`);
  }

  const data: PerplexityResponse = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("No content in Perplexity response");
  }

  console.log(`Perplexity report length: ${content.length} chars`);
  return content;
}

// Multi-step search: Run Perplexity for each category and merge results
async function callPerplexityMultiStep(
  apiKey: string
): Promise<string> {
  const categories = buildSearchCategories();
  const reports: string[] = [];

  for (const category of categories) {
    console.log(`Researching category: ${category.name}...`);
    try {
      const report = await callPerplexityDeepResearch(category.prompt, apiKey);
      reports.push(`\n=== ${category.name} ===\n${report}`);
      console.log(`Category "${category.name}" complete (${report.length} chars)`);
    } catch (error) {
      console.error(`Category "${category.name}" failed:`, error);
      reports.push(`\n=== ${category.name} ===\nResearch failed for this category.`);
    }
  }

  return reports.join("\n\n");
}

// Call Claude Sonnet 4.5 via OpenRouter API (comparison and analysis)
async function callClaudeComparison(
  prompt: string,
  apiKey: string
): Promise<ResearchResult> {
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://greenbuffalo.ca",
        "X-Title": "Four Winds Grant Portal",
      },
      body: JSON.stringify({
        model: "anthropic/claude-sonnet-4-5-20250514",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 16000,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${response.status} - ${error}`);
  }

  // OpenRouter returns responses in OpenAI format for all models
  const data: PerplexityResponse = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("No content in Claude response");
  }

  // Parse JSON from response (handle potential markdown code blocks)
  let jsonContent = content;
  if (content.includes("```json")) {
    jsonContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "");
  } else if (content.includes("```")) {
    jsonContent = content.replace(/```\n?/g, "");
  }

  try {
    const parsed = JSON.parse(jsonContent.trim());
    // Add sources array if not present (Claude doesn't provide sources)
    if (!parsed.sources) {
      parsed.sources = [];
    }
    return parsed;
  } catch {
    console.error("Failed to parse JSON from Claude:", jsonContent);
    throw new Error("Failed to parse Claude response as JSON");
  }
}

// Find matching existing grant by title (fuzzy match)
function findMatchingGrant(
  title: string,
  existingGrants: Grant[]
): Grant | undefined {
  const normalizedTitle = title.toLowerCase().trim();

  // Exact match first
  let match = existingGrants.find(
    (g) => g.title.toLowerCase().trim() === normalizedTitle
  );
  if (match) return match;

  // Partial match (title contains or is contained)
  match = existingGrants.find(
    (g) =>
      g.title.toLowerCase().includes(normalizedTitle) ||
      normalizedTitle.includes(g.title.toLowerCase())
  );

  return match;
}

// Process research results and create pending changes
async function processResearchResults(
  supabase: ReturnType<typeof createClient>,
  results: ResearchResult,
  existingGrants: Grant[],
  runId: string
): Promise<{ newCount: number; updateCount: number; deactivateCount: number }> {
  let newCount = 0;
  let updateCount = 0;
  let deactivateCount = 0;

  // Process new grants
  for (const grant of results.new_grants || []) {
    // Check if this grant already exists (avoid duplicates)
    const existing = findMatchingGrant(grant.title, existingGrants);
    if (existing) {
      console.log(`Skipping duplicate: ${grant.title}`);
      continue;
    }

    const { error } = await supabase.from("pending_grant_changes").insert({
      change_type: "new",
      proposed_data: grant,
      ai_confidence_score: results.confidence_score,
      ai_reasoning: `New grant discovered during research`,
      source_urls: [grant.source_url, grant.application_link].filter(Boolean),
      research_run_id: runId,
    });

    if (error) {
      console.error(`Error inserting new grant change:`, error);
    } else {
      newCount++;
    }
  }

  // Process updates
  for (const update of results.updated_grants || []) {
    const existing = findMatchingGrant(update.existing_title, existingGrants);
    if (!existing) {
      console.log(`Could not find grant to update: ${update.existing_title}`);
      continue;
    }

    // Determine what fields changed
    const changedFields: Record<string, { old: unknown; new: unknown }> = {};
    for (const [key, value] of Object.entries(update.updates)) {
      if (
        value !== undefined &&
        value !== existing[key as keyof Grant]
      ) {
        changedFields[key] = {
          old: existing[key as keyof Grant],
          new: value,
        };
      }
    }

    if (Object.keys(changedFields).length === 0) {
      console.log(`No actual changes for: ${update.existing_title}`);
      continue;
    }

    // Use the grant-specific source URLs, falling back to existing ones
    const updateSourceUrl = update.updates.source_url || existing.source_url;
    const updateAppLink = update.updates.application_link || existing.application_link;

    const { error } = await supabase.from("pending_grant_changes").insert({
      existing_grant_id: existing.id,
      change_type: "update",
      proposed_data: { ...existing, ...update.updates },
      changed_fields: changedFields,
      ai_confidence_score: results.confidence_score,
      ai_reasoning: update.reason,
      source_urls: [updateSourceUrl, updateAppLink].filter(Boolean),
      research_run_id: runId,
    });

    if (error) {
      console.error(`Error inserting update change:`, error);
    } else {
      updateCount++;
    }
  }

  // Process deactivations
  for (const deactivation of results.deactivated_grants || []) {
    const existing = findMatchingGrant(deactivation.title, existingGrants);
    if (!existing) {
      console.log(
        `Could not find grant to deactivate: ${deactivation.title}`
      );
      continue;
    }

    if (existing.status === "inactive") {
      console.log(`Grant already inactive: ${deactivation.title}`);
      continue;
    }

    const { error } = await supabase.from("pending_grant_changes").insert({
      existing_grant_id: existing.id,
      change_type: "deactivate",
      proposed_data: { ...existing, status: "inactive" },
      ai_confidence_score: results.confidence_score,
      ai_reasoning: deactivation.reason,
      source_urls: [existing.source_url, existing.application_link].filter(Boolean),
      research_run_id: runId,
    });

    if (error) {
      console.error(`Error inserting deactivation change:`, error);
    } else {
      deactivateCount++;
    }
  }

  return { newCount, updateCount, deactivateCount };
}

// Run the full research pipeline in the background
async function performResearch(
  supabase: ReturnType<typeof createClient>,
  runId: string,
  openrouterApiKey: string
): Promise<void> {
  try {
    // Fetch all existing grants
    const { data: existingGrants, error: grantsError } = await supabase
      .from("grants")
      .select("*")
      .order("title");

    if (grantsError) {
      throw new Error(`Failed to fetch grants: ${grantsError.message}`);
    }

    console.log(`Fetched ${existingGrants?.length || 0} existing grants`);

    // STEP 1: Multi-step Perplexity Deep Research (category-by-category)
    console.log("STEP 1: Running multi-step Perplexity deep research across 5 categories...");
    const perplexityReport = await callPerplexityMultiStep(openrouterApiKey);
    console.log("STEP 1 complete: All category reports received");

    // STEP 2: Claude parses the merged report and compares with database
    console.log("STEP 2: Calling Claude Sonnet 4.5 for comparison...");
    const results = await callClaudeComparison(
      buildClaudeComparisonPrompt(perplexityReport, existingGrants || []),
      openrouterApiKey
    );
    console.log("STEP 2 complete:", {
      new: results.new_grants?.length || 0,
      updates: results.updated_grants?.length || 0,
      deactivations: results.deactivated_grants?.length || 0,
    });

    // Save pending changes
    const counts = await processResearchResults(
      supabase,
      results,
      existingGrants || [],
      runId
    );

    // Mark run as completed
    await supabase
      .from("grant_research_runs")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        grants_analyzed: existingGrants?.length || 0,
        new_grants_found: counts.newCount,
        updates_found: counts.updateCount,
        deactivations_found: counts.deactivateCount,
        raw_response: results,
      })
      .eq("id", runId);

    console.log(`Research run ${runId} completed successfully`);
  } catch (error) {
    console.error(`Research run ${runId} failed:`, error);
    await supabase
      .from("grant_research_runs")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        error_message: error instanceof Error ? error.message : String(error),
      })
      .eq("id", runId);
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const openrouterApiKey = Deno.env.get("OPENROUTER_API_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }
    if (!openrouterApiKey) {
      throw new Error("Missing OPENROUTER_API_KEY environment variable");
    }

    // Determine trigger type
    let triggeredBy = "manual";
    try {
      const body = await req.json();
      if (body?.triggered_by === "cron") triggeredBy = "cron";
    } catch {
      // No body - manual trigger
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create the run record synchronously (fast)
    const { data: runData, error: runError } = await supabase
      .from("grant_research_runs")
      .insert({ triggered_by: triggeredBy, status: "running" })
      .select()
      .single();

    if (runError) {
      throw new Error(`Failed to create research run: ${runError.message}`);
    }

    const runId = runData.id;

    // Run the actual research in the background so we can respond immediately
    // This avoids CORS issues from long-running requests timing out
    // deno-lint-ignore no-explicit-any
    (globalThis as any).EdgeRuntime?.waitUntil(
      performResearch(supabase, runId, openrouterApiKey)
    );

    // Return immediately — frontend polls grant_research_runs for completion
    return new Response(
      JSON.stringify({
        success: true,
        run_id: runId,
        message: "Research started. Check the dashboard in 3-5 minutes for results.",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Research function error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
