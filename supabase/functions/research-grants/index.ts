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

interface ClaudeResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
}

interface PerplexityRawGrant {
  title: string;
  description: string;
  agency: string;
  program: string;
  category: string;
  eligibility: string;
  application_link: string;
  deadline: string;
  amount: string;
  source_url: string;
  province: string;
}

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

// STEP 1: Build Perplexity research prompt (raw discovery, no comparison)
function buildPerplexityPrompt(): string {
  return `You are a grant research specialist focused on Indigenous funding programs in Canada.

TASK: Find ALL Indigenous-focused grants, funding programs, and financial assistance currently available in Canada (2024-2026).

SEARCH FOCUS AREAS:

SEARCH FOCUS AREAS:
- Federal Canadian government Indigenous programs (ISC, CIRNAC, NRCan, ECCC)
- Provincial Indigenous funding (Ontario, BC, Alberta, Quebec, Manitoba, Saskatchewan)
- Indigenous business development and entrepreneurship grants
- Clean energy and environmental programs for Indigenous communities
- Infrastructure funding for First Nations, Métis, and Inuit
- Economic development corporations and regional programs
- New 2024-2025 funding announcements

RESPONSE FORMAT (JSON only, no markdown):
{
  "grants": [
    {
      "title": "Full official grant name",
      "description": "Detailed description of the program",
      "agency": "Administering agency name",
      "program": "Program code or short name",
      "category": "One of: Environment, Economic Development, Infrastructure, Electric Vehicles, Housing, Health, Education, Culture",
      "eligibility": "Who can apply - be specific about Indigenous eligibility",
      "application_link": "Direct URL to application page",
      "deadline": "YYYY-MM-DD format or 'Ongoing'",
      "amount": "Funding amount description (e.g., 'Up to $500K per project')",
      "source_url": "URL where you found this information",
      "province": "Federal, Ontario, British Columbia, Alberta, Quebec, Manitoba, Saskatchewan, etc."
    }
  ],
  "sources": ["https://source1.com", "https://source2.com"]
}

Important:
- Only include grants specifically for Indigenous peoples, communities, or organizations in Canada
- Verify information is current (2024-2026)
- Include direct application links when possible
- Be thorough and comprehensive - find as many as possible
- Return ONLY valid JSON, no explanatory text`;
}

// STEP 2: Build Claude comparison prompt (compares Perplexity results with database)
function buildClaudeComparisonPrompt(
  perplexityGrants: PerplexityRawGrant[],
  existingGrants: Grant[]
): string {
  const perplexityJson = JSON.stringify(perplexityGrants, null, 2);
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

DATASET 1 - PERPLEXITY RESEARCH (Fresh web research):
${perplexityJson}

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
- Return ONLY valid JSON, no markdown or explanatory text`;
}

// Call Perplexity Deep Research via OpenRouter (raw grant discovery)
async function callPerplexityDeepResearch(
  prompt: string,
  apiKey: string
): Promise<{ grants: PerplexityRawGrant[]; sources: string[] }> {
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
        model: "perplexity/sonar-pro",
        messages: [
          {
            role: "system",
            content:
              "You are an expert grant researcher specializing in Canadian Indigenous funding programs. Always respond with valid JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 8000,
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

  // Parse JSON from response (handle potential markdown code blocks)
  let jsonContent = content;
  if (content.includes("```json")) {
    jsonContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "");
  } else if (content.includes("```")) {
    jsonContent = content.replace(/```\n?/g, "");
  }

  try {
    return JSON.parse(jsonContent.trim());
  } catch {
    console.error("Failed to parse JSON:", jsonContent);
    throw new Error("Failed to parse Perplexity response as JSON");
  }
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
        model: "anthropic/claude-sonnet-4-5",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 8000,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${response.status} - ${error}`);
  }

  const data: ClaudeResponse = await response.json();
  const content = data.content?.[0]?.text;

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
      source_urls: results.sources,
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

    const { error } = await supabase.from("pending_grant_changes").insert({
      existing_grant_id: existing.id,
      change_type: "update",
      proposed_data: { ...existing, ...update.updates },
      changed_fields: changedFields,
      ai_confidence_score: results.confidence_score,
      ai_reasoning: update.reason,
      source_urls: results.sources,
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
      source_urls: results.sources,
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

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get environment variables
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
      if (body?.triggered_by === "cron") {
        triggeredBy = "cron";
      }
    } catch {
      // No body or invalid JSON - manual trigger
    }

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create research run record
    const { data: runData, error: runError } = await supabase
      .from("grant_research_runs")
      .insert({
        triggered_by: triggeredBy,
        status: "running",
      })
      .select()
      .single();

    if (runError) {
      throw new Error(`Failed to create research run: ${runError.message}`);
    }

    const runId = runData.id;

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

      // STEP 1: Call Perplexity (via OpenRouter) for raw grant discovery
      const perplexityPrompt = buildPerplexityPrompt();
      console.log("STEP 1: Calling Perplexity Sonar Pro (via OpenRouter)...");

      const perplexityResults = await callPerplexityDeepResearch(
        perplexityPrompt,
        openrouterApiKey
      );
      console.log(
        `Perplexity found ${perplexityResults.grants?.length || 0} grants`
      );

      // STEP 2: Call Claude (via OpenRouter) for comparison and analysis
      console.log("STEP 2: Calling Claude Sonnet 4.5 (via OpenRouter)...");
      const claudePrompt = buildClaudeComparisonPrompt(
        perplexityResults.grants || [],
        existingGrants || []
      );

      const results = await callClaudeComparison(claudePrompt, openrouterApiKey);
      console.log("Claude comparison completed:", {
        new: results.new_grants?.length || 0,
        updates: results.updated_grants?.length || 0,
        deactivations: results.deactivated_grants?.length || 0,
      });

      // Merge sources from both AI calls
      results.sources = [
        ...(perplexityResults.sources || []),
        ...(results.sources || []),
      ];

      // Process results and create pending changes
      const counts = await processResearchResults(
        supabase,
        results,
        existingGrants || [],
        runId
      );

      // Update research run with results
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

      return new Response(
        JSON.stringify({
          success: true,
          run_id: runId,
          grants_analyzed: existingGrants?.length || 0,
          pending_changes: {
            new_grants: counts.newCount,
            updates: counts.updateCount,
            deactivations: counts.deactivateCount,
          },
          message:
            "Research completed. Pending changes await admin approval in the dashboard.",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } catch (error) {
      // Update research run with error
      await supabase
        .from("grant_research_runs")
        .update({
          status: "failed",
          completed_at: new Date().toISOString(),
          error_message: error instanceof Error ? error.message : String(error),
        })
        .eq("id", runId);

      throw error;
    }
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
