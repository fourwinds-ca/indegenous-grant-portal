// Supabase Edge Function: research-grants
// Uses Perplexity Deep Research to find and validate Indigenous grants in Canada
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

// Build the research prompt with existing grants context
function buildResearchPrompt(existingGrants: Grant[]): string {
  const grantSummaries = existingGrants
    .map(
      (g) =>
        `- "${g.title}" by ${g.agency} (${g.province || "Federal"}) - Deadline: ${g.deadline || "Ongoing"} - Status: ${g.status}`
    )
    .join("\n");

  return `You are a grant research specialist focused on Indigenous funding programs in Canada. Your task is to:

1. IDENTIFY NEW GRANTS: Search for Indigenous-focused grants, funding programs, and financial assistance that are NOT in the existing database below.

2. VALIDATE EXISTING GRANTS: Check if any grants in our database have:
   - Changed deadlines
   - Updated funding amounts
   - New eligibility criteria
   - Status changes (closed, suspended, etc.)
   - Updated application links

3. FLAG INACTIVE GRANTS: Identify any grants that appear to be discontinued, expired, or no longer available.

CURRENT DATABASE (${existingGrants.length} grants):
${grantSummaries}

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
  "new_grants": [
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
      "currency": "CAD",
      "status": "active or inactive",
      "source_url": "URL where you found this information",
      "province": "Federal, Ontario, British Columbia, Alberta, Quebec, Manitoba, Saskatchewan, etc.",
      "is_publicly_available": true
    }
  ],
  "updated_grants": [
    {
      "existing_title": "Exact title from existing database",
      "updates": {
        "deadline": "new deadline if changed",
        "amount": "new amount if changed",
        "status": "new status if changed"
      },
      "reason": "Why this update is needed"
    }
  ],
  "deactivated_grants": [
    {
      "title": "Exact title from existing database",
      "reason": "Why this should be deactivated"
    }
  ],
  "confidence_score": 0.85,
  "sources": ["https://source1.com", "https://source2.com"]
}

Important:
- Only include grants specifically for Indigenous peoples, communities, or organizations in Canada
- Verify information is current (2024-2025)
- Include direct application links when possible
- Be thorough but accurate - quality over quantity
- Return ONLY valid JSON, no explanatory text`;
}

// Call Perplexity Deep Research API
async function callPerplexityDeepResearch(
  prompt: string,
  apiKey: string
): Promise<ResearchResult> {
  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar-deep-research",
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
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Perplexity API error: ${response.status} - ${error}`);
  }

  const data: PerplexityResponse = await response.json();
  const content = data.choices[0]?.message?.content;

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
    const perplexityApiKey = Deno.env.get("PERPLEXITY_API_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    if (!perplexityApiKey) {
      throw new Error("Missing PERPLEXITY_API_KEY environment variable");
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

      // Build and execute research prompt
      const prompt = buildResearchPrompt(existingGrants || []);
      console.log("Calling Perplexity Deep Research API...");

      const results = await callPerplexityDeepResearch(prompt, perplexityApiKey);
      console.log("Research completed:", {
        new: results.new_grants?.length || 0,
        updates: results.updated_grants?.length || 0,
        deactivations: results.deactivated_grants?.length || 0,
      });

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
