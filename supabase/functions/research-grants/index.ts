// Supabase Edge Function: research-grants
// Multi-step AI pipeline with validation:
// 1. Perplexity Deep Research: Discovers all Indigenous grants in Canada
// 2. Claude Sonnet 4.5: Compares with DB, applies quality filters, checks deadlines
// 3. URL Validation + Page Verification: Checks links for 404/403/redirects, confirms titles on pages
// 4. Perplexity Spot-Check: Re-verifies flagged grants with a quick web search
// 5. Save: Validated results stored as pending changes for admin approval

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
  recurring_closed_grants: Array<{
    title: string;
    reason: string;
    typical_reopen: string;
  }>;
  confidence_score: number;
  sources: string[];
}

interface ValidationResult {
  url: string;
  status: "ok" | "broken" | "redirect" | "forbidden" | "timeout" | "error";
  httpStatus?: number;
  redirectUrl?: string;
  titleFoundOnPage?: boolean;
}

interface GrantValidation {
  grantTitle: string;
  applicationLinkCheck: ValidationResult;
  sourceLinkCheck: ValidationResult;
  titleVerified: boolean;
  issues: string[];
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
  "publicsafety.gc.ca",       // Public Safety Canada
  "justice.gc.ca",             // Department of Justice Canada
  "nutritionnorthcanada.gc.ca", // Nutrition North Canada
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

// Trusted Indigenous organizations and Crown corporations that administer government funding
const TRUSTED_ORG_DOMAINS = [
  // Indigenous National Organizations
  "afn.ca",                 // Assembly of First Nations
  "itk.ca",                 // Inuit Tapiriit Kanatami
  "metisnation.ca",         // Métis National Council
  // Indigenous Funding & Capital
  "nacca.ca",               // National Aboriginal Capital Corporations Association
  "fnfa.ca",                // First Nations Finance Authority
  "fntc.ca",                // First Nations Tax Commission
  "fnfmb.com",              // First Nations Financial Management Board
  // Indigenous Health & Education
  "fnha.ca",                // First Nations Health Authority (BC)
  "indspire.ca",            // Indspire (Indigenous education awards)
  "nafaforestry.org",       // National Aboriginal Forestry Association
  // Crown Corporations & Federal Agencies
  "bdc.ca",                 // Business Development Bank of Canada
  "edc.ca",                 // Export Development Canada
  "nrc-cnrc.gc.ca",         // National Research Council
  "sshrc-crsh.gc.ca",       // Social Sciences & Humanities Research Council
  "cihr-irsc.gc.ca",        // Canadian Institutes of Health Research
  "nserc-crsng.gc.ca",      // Natural Sciences & Engineering Research Council
  "cfc-swc.gc.ca",          // Women and Gender Equality Canada
  "canadacouncil.ca",       // Canada Council for the Arts
  "telefilm.ca",            // Telefilm Canada
  "pch.gc.ca",              // Canadian Heritage
  // Regional Development Agencies
  "feddev-ontario.gc.ca",   // FedDev Ontario
  "wd-deo.gc.ca",           // Western Economic Diversification
  "dec-ced.gc.ca",          // Canada Economic Development for Quebec
  "acoa-apeca.gc.ca",       // Atlantic Canada Opportunities Agency
  "cannor.gc.ca",           // Canadian Northern Economic Development Agency
  "fednor.gc.ca",           // Federal Economic Development Agency for Northern Ontario
  "prairiescanecon.gc.ca",  // PrairiesCan
  "pacificcan.gc.ca",       // PacifiCan
  // Research & Funding Portals
  "researchnet-recherchenet.ca", // Tri-council research grants portal (CIHR, SSHRC, NSERC)
  "fcc-fac.ca",                  // Farm Credit Canada
  // Provincial Specialized Agencies
  "calq.gouv.qc.ca",            // Conseil des arts et des lettres du Québec
  // Provincial Indigenous Agencies
  "bchousing.org",          // BC Housing
  "bcafn.ca",               // BC Assembly of First Nations
  "onhwp.ca",               // Ontario Aboriginal Housing Services
  "ofifc.org",              // Ontario Federation of Indigenous Friendship Centres
  "edo.ca",                 // Economic Developers Council of Ontario (Indigenous programs)
];

// All trusted domains combined for URL validation
const ALL_TRUSTED_DOMAINS = [
  ...FEDERAL_GOV_DOMAINS,
  ...PROVINCIAL_GOV_DOMAINS,
  ...TRUSTED_ORG_DOMAINS,
];

// Validate a single URL — checks if it resolves, returns status
async function validateUrl(url: string): Promise<ValidationResult> {
  if (!url || url === "N/A" || url === "") {
    return { url, status: "broken" };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; GrantPortalBot/1.0)",
      },
    });

    clearTimeout(timeoutId);

    const finalUrl = response.url;
    const httpStatus = response.status;

    if (httpStatus === 404) {
      return { url, status: "broken", httpStatus };
    }
    if (httpStatus === 403) {
      return { url, status: "forbidden", httpStatus };
    }
    if (httpStatus >= 400) {
      return { url, status: "error", httpStatus };
    }

    // Check if we were redirected to a generic homepage (common issue from feedback)
    const urlPath = new URL(url).pathname;
    const finalPath = new URL(finalUrl).pathname;
    const wasRedirectedToHome =
      urlPath.length > 5 && (finalPath === "/" || finalPath === "/en" || finalPath === "/fr" || finalPath === "/eng" || finalPath === "/fra");

    if (wasRedirectedToHome) {
      return { url, status: "redirect", httpStatus, redirectUrl: finalUrl };
    }

    return { url, status: "ok", httpStatus };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return { url, status: "timeout" };
    }
    return { url, status: "error" };
  }
}

// Verify that a grant title actually appears on the source page
async function verifyGrantOnPage(
  url: string,
  grantTitle: string
): Promise<boolean> {
  if (!url || url === "N/A") return false;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; GrantPortalBot/1.0)",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) return false;

    const html = await response.text();
    const pageText = html.toLowerCase();

    // Check for exact title match
    if (pageText.includes(grantTitle.toLowerCase())) {
      return true;
    }

    // Check for key words from the title (at least 3 significant words must appear)
    const significantWords = grantTitle
      .toLowerCase()
      .split(/[\s\-–—()]+/)
      .filter((w) => w.length > 3)
      .filter((w) => !["program", "fund", "grant", "canada", "indigenous", "first", "nations", "the", "for", "and"].includes(w));

    if (significantWords.length === 0) return true; // Generic title, skip word check

    const matchCount = significantWords.filter((word) =>
      pageText.includes(word)
    ).length;

    return matchCount >= Math.min(3, significantWords.length);
  } catch {
    return false; // Can't verify — treat as unverified, don't block
  }
}

// Validate all grants in a research result — checks URLs and verifies titles
async function validateGrants(
  grants: Grant[]
): Promise<Map<string, GrantValidation>> {
  const validations = new Map<string, GrantValidation>();

  // Process in batches of 5 to avoid overwhelming servers
  const batchSize = 5;
  for (let i = 0; i < grants.length; i += batchSize) {
    const batch = grants.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (grant) => {
        const [appLinkCheck, sourceLinkCheck, titleOnApp, titleOnSource] =
          await Promise.all([
            validateUrl(grant.application_link),
            validateUrl(grant.source_url),
            verifyGrantOnPage(grant.application_link, grant.title),
            verifyGrantOnPage(grant.source_url, grant.title),
          ]);

        const issues: string[] = [];

        if (appLinkCheck.status === "broken") {
          issues.push(`Application link returns 404: ${grant.application_link}`);
        }
        if (appLinkCheck.status === "forbidden") {
          issues.push(`Application link returns 403 Forbidden: ${grant.application_link}`);
        }
        if (appLinkCheck.status === "redirect") {
          issues.push(`Application link redirects to homepage: ${grant.application_link} → ${appLinkCheck.redirectUrl}`);
        }
        if (appLinkCheck.status === "timeout") {
          issues.push(`Application link timed out: ${grant.application_link}`);
        }

        if (sourceLinkCheck.status === "broken") {
          issues.push(`Source link returns 404: ${grant.source_url}`);
        }
        if (sourceLinkCheck.status === "redirect") {
          issues.push(`Source link redirects to homepage: ${grant.source_url} → ${sourceLinkCheck.redirectUrl}`);
        }

        const titleVerified = titleOnApp || titleOnSource;
        if (!titleVerified && appLinkCheck.status === "ok" && sourceLinkCheck.status === "ok") {
          issues.push(`Grant title "${grant.title}" not found on either the application or source page — possible hallucination`);
        }

        const validation: GrantValidation = {
          grantTitle: grant.title,
          applicationLinkCheck: appLinkCheck,
          sourceLinkCheck: sourceLinkCheck,
          titleVerified,
          issues,
        };

        return { title: grant.title, validation };
      })
    );

    for (const result of batchResults) {
      validations.set(result.title, result.validation);
    }
  }

  return validations;
}

// Build a single comprehensive Perplexity Deep Research prompt
function buildPerplexityPrompt(): string {
  return `Conduct a comprehensive deep research study of ALL Indigenous-focused grants, funding programs, scholarships, loans, and financial support currently available in Canada for 2025-2026.

Search across ALL of these source categories:

1. FEDERAL GOVERNMENT — Indigenous Services Canada (ISC), Crown-Indigenous Relations (CIRNAC), Natural Resources Canada (NRCan), Environment and Climate Change Canada (ECCC), CMHC, Infrastructure Canada, ISED, Canadian Heritage, Public Safety Canada, Department of Justice, Nutrition North Canada
   - Websites: ${FEDERAL_GOV_DOMAINS.join(", ")}

2. PROVINCIAL & TERRITORIAL GOVERNMENTS — All 13 provinces and territories
   - Websites: ${PROVINCIAL_GOV_DOMAINS.join(", ")}

3. INDIGENOUS ORGANIZATIONS & CROWN CORPORATIONS — NACCA, Indspire, First Nations Finance Authority, First Nations Health Authority, BDC, Canada Council for the Arts, research councils (SSHRC, CIHR, NSERC, NRC), regional development agencies (FedDev, ACOA, CanNor, PacifiCan, PrairiesCan, etc.), Farm Credit Canada, ResearchNet portal
   - Websites: ${TRUSTED_ORG_DOMAINS.join(", ")}

4. PROVINCIAL SPECIALIZED AGENCIES — Conseil des arts et des lettres du Québec (CALQ)
   - Websites: calq.gouv.qc.ca

Include programs covering: education, health, housing, infrastructure, clean energy, economic development, business loans, scholarships, arts & culture, environmental monitoring, governance, capacity building, and community development for First Nations, Métis, and Inuit communities.

CRITICAL FILTERING RULES:

SOURCE RESTRICTION:
- ONLY include grants sourced from the domains listed above.
- Do NOT include results from news articles, blogs, consulting firms, or third-party grant aggregator websites.
- Only include grants where you can provide a direct URL from one of the allowed domains.
- If you cannot find a URL from an allowed domain for a grant, do NOT include it.

APPLICATION PROCESS REQUIREMENT:
- ONLY include grants/programs that have a CLEAR, publicly accessible application process, intake form, or documented way for communities to apply for funding.
- Do NOT include government programs where there is no documented application pathway (e.g., programs that exist but have no public intake process).
- If the only way to access funding is unclear or requires contacting the department with no published guidelines, EXCLUDE it.

SEPARATE FUNDING STREAMS:
- If an organization offers MULTIPLE distinct funding streams or grant programs under one umbrella, list EACH ONE SEPARATELY with its own eligibility criteria, amount, deadline, and specific application link.
- Do NOT combine multiple programs into a single entry. For example, if CALQ has 8 separate Indigenous artist grants, list all 8 individually.

DEADLINE & STATUS ACCURACY:
- For each grant, clearly indicate whether the application window is currently OPEN, CLOSED, or ROLLING/ONGOING.
- If a grant's application window is currently closed but it is a recurring program that reopens periodically, mark it as "Recurring - currently closed" and note when it typically reopens.
- If a deadline has passed and there is no indication the program will reopen, mark it as "Closed".
- Do NOT list grants with closed deadlines as if they are currently available.

LINK SPECIFICITY:
- The application link MUST point to the SPECIFIC grant/program page, NOT a generic department homepage or parent listing page.
- If a grant application requires navigating from a general page to a specific sub-page, provide the deepest/most specific URL available.
- Each grant MUST have its own unique URL — do not reuse the same URL for multiple grants.

For each grant/program you find, provide:
- Full official name (use the EXACT name as it appears on the source website)
- Administering agency
- What the funding is for (description) — include HOW to apply (online form, email, mail, etc.)
- Who is eligible (be specific about Indigenous eligibility requirements)
- Funding amount or range
- Application deadline status: "Open - deadline YYYY-MM-DD" OR "Open - Rolling/Ongoing" OR "Recurring - currently closed, typically reopens [month/season]" OR "Closed"
- Where to apply (direct URL to the SPECIFIC grant page from an allowed domain only)
- Province/territory or Federal
- Program category

Be as thorough as possible. Find every active program across all sources.`;
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
   - ONLY include grants with a CLEAR application process. If the research describes a "program" but no way to apply, EXCLUDE it.
   - The grant title MUST be the EXACT official name as it appears on the source website. Do not invent or paraphrase grant names.
   - The description MUST explain HOW to apply (online form, email submission, mailing address, etc.)
   - Set status to "active" only if the application window is currently open
   - Set status to "recurring_closed" if the grant is a recurring program whose current window is closed but will reopen
   - Set status to "inactive" if the grant is permanently closed or discontinued

2. **UPDATED GRANTS**: Identify grants that exist in both but have changes
   - Compare: deadline, amount, application_link, status, eligibility
   - Specify exactly what changed (old value → new value)
   - Provide reasoning for why you believe this is an update
   - If an existing active grant now has a closed deadline, update its status to "recurring_closed" (if it recurs) or "inactive" (if discontinued)

3. **DEACTIVATED GRANTS**: Identify grants in database that are NOT found in Perplexity results
   - Only flag if the grant appears to be discontinued/expired
   - Provide reasoning (e.g., "past deadline", "no longer listed on agency website")

4. **RECURRING CLOSED GRANTS**: Identify grants that are legitimate recurring programs but whose application window is currently closed
   - Include grants from BOTH datasets that fit this pattern
   - Note when they typically reopen (e.g., "annually in January", "every 2 years, next in 2027")

QUALITY CHECKS — Apply these to ALL grants (new and existing):
- REJECT any grant where the description does not explain how to apply for funding
- REJECT any grant that is actually a government program with no public intake/application process
- REJECT any grant where the application_link points to a generic agency homepage rather than the specific grant page
- FLAG any grant where multiple funding streams are lumped into one entry — these should be split into separate entries
- VERIFY that the grant title matches what appears on the source page. If you are not confident the exact program name exists, set confidence to "low"

RESPONSE FORMAT (JSON only):
{
  "new_grants": [
    {
      "title": "...",
      "description": "... Include how to apply: [online form / email / mail]",
      "agency": "...",
      "program": "...",
      "category": "...",
      "eligibility": "...",
      "application_link": "... (specific grant page URL, NOT a generic homepage)",
      "deadline": "YYYY-MM-DD or Ongoing",
      "amount": "...",
      "currency": "CAD",
      "status": "active | recurring_closed | inactive",
      "source_url": "...",
      "province": "...",
      "is_publicly_available": true,
      "confidence": "high | medium | low",
      "typical_reopen": "... (only if status is recurring_closed, e.g., 'annually in March')"
    }
  ],
  "updated_grants": [
    {
      "existing_title": "Exact title from database",
      "existing_grant_id": "grant ID from database",
      "updates": {
        "deadline": "new value",
        "amount": "new value",
        "status": "active | recurring_closed | inactive"
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
  "recurring_closed_grants": [
    {
      "title": "Exact title",
      "reason": "Application window closed, next intake expected [date/season]",
      "typical_reopen": "annually in January"
    }
  ],
  "confidence_score": 0.9
}

IMPORTANT:
- Be precise with title matching (account for slight variations)
- Only flag updates if you're confident the change is real
- Provide detailed reasoning for all updates and deactivations
- Return ONLY valid JSON, no markdown or explanatory text
- CRITICAL: Only include grants that have a source URL from an official Canadian government website (.gc.ca or provincial government domain) OR a trusted Indigenous organization/Crown corporation. Reject any grants sourced from news sites, blogs, consulting firms, or third-party aggregators.
- Every application_link and source_url MUST be from a government website or trusted organization
- CRITICAL: Each grant MUST have its own unique, specific source_url and application_link pointing to that specific grant's page. Do NOT reuse the same URL across multiple grants. Each source_url should be the exact page where that particular grant is described.
- CRITICAL: Do NOT invent grant names. If you cannot confirm the exact name of a program from the source material, do not include it. Set confidence to "low" for any grant where you are uncertain about the exact name.`;
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

// Call Perplexity (fast sonar model) to verify specific grants — spot-checks flagged grants
async function callPerplexityVerification(
  grantsToVerify: Array<{ title: string; source_url: string; issues: string[] }>,
  apiKey: string
): Promise<string> {
  const grantList = grantsToVerify
    .map((g, i) => `${i + 1}. "${g.title}" — Source: ${g.source_url} — Issues: ${g.issues.join(", ")}`)
    .join("\n");

  const prompt = `For each of the following Canadian Indigenous grants, verify whether:
1. The grant actually exists with that exact name
2. The source URL is correct and leads to the grant page
3. The application window is currently open or closed
4. There is a clear way to apply

Grants to verify:
${grantList}

For each grant, respond with:
- VERIFIED: if the grant exists with that name and the URL works
- CORRECTED: if the grant exists but with a different name or URL (provide the correct ones)
- NOT FOUND: if you cannot find evidence this grant exists
- CLOSED: if the grant exists but applications are currently closed (note if it's recurring)

Be specific and concise.`;

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
        model: "perplexity/sonar",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 4000,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error(`Perplexity verification error: ${response.status} - ${error}`);
    return "Verification unavailable";
  }

  const data: PerplexityResponse = await response.json();
  return data.choices?.[0]?.message?.content || "No verification response";
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
        model: "anthropic/claude-sonnet-4.5",
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

// Process research results and create pending changes (with validation data)
async function processResearchResults(
  supabase: ReturnType<typeof createClient>,
  results: ResearchResult,
  existingGrants: Grant[],
  runId: string,
  validations: Map<string, GrantValidation>
): Promise<{ newCount: number; updateCount: number; deactivateCount: number; rejectedCount: number; recurringClosedCount: number }> {
  let newCount = 0;
  let updateCount = 0;
  let deactivateCount = 0;
  let rejectedCount = 0;
  let recurringClosedCount = 0;

  // Process new grants
  for (const grant of results.new_grants || []) {
    // Check if this grant already exists (avoid duplicates)
    const existing = findMatchingGrant(grant.title, existingGrants);
    if (existing) {
      console.log(`Skipping duplicate: ${grant.title}`);
      continue;
    }

    // Get validation results for this grant
    const validation = validations.get(grant.title);
    const issues = validation?.issues || [];
    const hasBlockingIssues = validation && (
      validation.applicationLinkCheck.status === "broken" ||
      (!validation.titleVerified && validation.applicationLinkCheck.status === "ok")
    );

    // Auto-reject grants with broken links or unverified titles
    if (hasBlockingIssues) {
      console.log(`Rejecting grant with validation issues: ${grant.title} — ${issues.join("; ")}`);

      // Still save it as a pending change but flagged for rejection
      const { error } = await supabase.from("pending_grant_changes").insert({
        change_type: "new",
        proposed_data: { ...grant, _auto_rejected: true },
        ai_confidence_score: results.confidence_score,
        ai_reasoning: `AUTO-FLAGGED: ${issues.join("; ")}`,
        source_urls: [grant.source_url, grant.application_link].filter(Boolean),
        research_run_id: runId,
        validation_issues: issues,
      });

      if (!error) rejectedCount++;
      continue;
    }

    const { error } = await supabase.from("pending_grant_changes").insert({
      change_type: "new",
      proposed_data: grant,
      ai_confidence_score: results.confidence_score,
      ai_reasoning: `New grant discovered during research`,
      source_urls: [grant.source_url, grant.application_link].filter(Boolean),
      research_run_id: runId,
      validation_issues: issues.length > 0 ? issues : null,
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

  // Process recurring closed grants
  for (const recurring of results.recurring_closed_grants || []) {
    const existing = findMatchingGrant(recurring.title, existingGrants);
    if (!existing) {
      console.log(`Could not find recurring grant: ${recurring.title}`);
      continue;
    }

    if (existing.status === "recurring_closed") {
      console.log(`Grant already marked recurring_closed: ${recurring.title}`);
      continue;
    }

    const { error } = await supabase.from("pending_grant_changes").insert({
      existing_grant_id: existing.id,
      change_type: "update",
      proposed_data: {
        ...existing,
        status: "recurring_closed",
        notes: `${recurring.reason}. Typically reopens: ${recurring.typical_reopen}`,
      },
      changed_fields: {
        status: { old: existing.status, new: "recurring_closed" },
      },
      ai_confidence_score: results.confidence_score,
      ai_reasoning: recurring.reason,
      source_urls: [existing.source_url, existing.application_link].filter(Boolean),
      research_run_id: runId,
    });

    if (error) {
      console.error(`Error inserting recurring_closed change:`, error);
    } else {
      recurringClosedCount++;
    }
  }

  return { newCount, updateCount, deactivateCount, rejectedCount, recurringClosedCount };
}

// Run the full multi-step research pipeline in the background
// Pipeline: Perplexity Discovery → Claude Comparison → URL Validation + Page Verification → Perplexity Spot-Check → Save
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

    // STEP 1: Perplexity Deep Research — discover grants from the web
    console.log("STEP 1: Running Perplexity Deep Research...");
    const perplexityReport = await callPerplexityDeepResearch(buildPerplexityPrompt(), openrouterApiKey);
    console.log(`STEP 1 complete: Perplexity report received (${perplexityReport.length} chars)`);

    // STEP 2: Claude comparison — parse report, compare with DB, apply quality filters
    console.log("STEP 2: Calling Claude Sonnet 4.5 for comparison and quality filtering...");
    const results = await callClaudeComparison(
      buildClaudeComparisonPrompt(perplexityReport, existingGrants || []),
      openrouterApiKey
    );
    console.log("STEP 2 complete:", {
      new: results.new_grants?.length || 0,
      updates: results.updated_grants?.length || 0,
      deactivations: results.deactivated_grants?.length || 0,
      recurring_closed: results.recurring_closed_grants?.length || 0,
    });

    // STEP 3: URL validation & page verification — check all new grant links
    console.log("STEP 3: Validating URLs and verifying grant titles on pages...");
    const newGrantsToValidate = results.new_grants || [];
    const validations = await validateGrants(newGrantsToValidate);

    const validationSummary = {
      total: newGrantsToValidate.length,
      passed: 0,
      broken_links: 0,
      title_not_found: 0,
      redirected: 0,
    };

    for (const [, v] of validations) {
      if (v.issues.length === 0) {
        validationSummary.passed++;
      }
      if (v.applicationLinkCheck.status === "broken" || v.sourceLinkCheck.status === "broken") {
        validationSummary.broken_links++;
      }
      if (!v.titleVerified && v.applicationLinkCheck.status === "ok") {
        validationSummary.title_not_found++;
      }
      if (v.applicationLinkCheck.status === "redirect" || v.sourceLinkCheck.status === "redirect") {
        validationSummary.redirected++;
      }
    }

    console.log("STEP 3 complete:", validationSummary);

    // STEP 4: Perplexity spot-check verification — verify flagged grants with a quick web search
    const flaggedGrants = Array.from(validations.entries())
      .filter(([, v]) => v.issues.length > 0)
      .map(([title, v]) => ({
        title,
        source_url: newGrantsToValidate.find((g) => g.title === title)?.source_url || "",
        issues: v.issues,
      }));

    let verificationReport = "";
    if (flaggedGrants.length > 0) {
      console.log(`STEP 4: Verifying ${flaggedGrants.length} flagged grants with Perplexity...`);
      verificationReport = await callPerplexityVerification(flaggedGrants, openrouterApiKey);
      console.log("STEP 4 complete: Verification report received");
    } else {
      console.log("STEP 4: No flagged grants to verify, skipping");
    }

    // STEP 5: Save validated pending changes
    console.log("STEP 5: Saving validated results...");
    const counts = await processResearchResults(
      supabase,
      results,
      existingGrants || [],
      runId,
      validations
    );

    // Mark run as completed with full stats
    await supabase
      .from("grant_research_runs")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        grants_analyzed: existingGrants?.length || 0,
        new_grants_found: counts.newCount,
        updates_found: counts.updateCount,
        deactivations_found: counts.deactivateCount,
        raw_response: {
          ...results,
          validation_summary: validationSummary,
          verification_report: verificationReport || null,
          rejected_count: counts.rejectedCount,
          recurring_closed_count: counts.recurringClosedCount,
        },
      })
      .eq("id", runId);

    console.log(`Research run ${runId} completed successfully:`, {
      new: counts.newCount,
      updated: counts.updateCount,
      deactivated: counts.deactivateCount,
      rejected: counts.rejectedCount,
      recurring_closed: counts.recurringClosedCount,
    });
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
