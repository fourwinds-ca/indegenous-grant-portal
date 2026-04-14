# Trusted Grant Providers

This document lists all approved source domains for the AI Grant Research pipeline. The system will **only** return grants sourced from these domains. Any grants from unlisted domains (news sites, blogs, consulting firms, aggregators) are automatically excluded.

To add a new trusted source, update this list **and** the corresponding arrays in `supabase/functions/research-grants/index.ts`.

---

## Federal Government Domains

| Domain | Organization |
|--------|-------------|
| `canada.ca` | Government of Canada (central portal) |
| `gc.ca` | Government of Canada (general) |
| `isc-sac.gc.ca` | Indigenous Services Canada |
| `sac-isc.gc.ca` | Indigenous Services Canada (alternate) |
| `rcaanc-cirnac.gc.ca` | Crown-Indigenous Relations and Northern Affairs Canada |
| `nrcan-rncan.gc.ca` | Natural Resources Canada |
| `ec.gc.ca` | Environment and Climate Change Canada |
| `cmhc-schl.gc.ca` | Canada Mortgage and Housing Corporation |
| `ised-isde.gc.ca` | Innovation, Science and Economic Development Canada |
| `infrastructure.gc.ca` | Infrastructure Canada |
| `pch.gc.ca` | Canadian Heritage |
| `cfc-swc.gc.ca` | Women and Gender Equality Canada |
| `publicsafety.gc.ca` | Public Safety Canada |
| `justice.gc.ca` | Department of Justice Canada |
| `nutritionnorthcanada.gc.ca` | Nutrition North Canada |

---

## Provincial & Territorial Government Domains

| Domain | Province/Territory |
|--------|--------------------|
| `gov.bc.ca` | British Columbia |
| `alberta.ca` | Alberta |
| `gov.sk.ca` | Saskatchewan |
| `gov.mb.ca` | Manitoba |
| `ontario.ca` | Ontario |
| `quebec.ca` | Quebec |
| `gnb.ca` | New Brunswick |
| `gov.ns.ca` | Nova Scotia |
| `gov.pe.ca` | Prince Edward Island |
| `gov.nl.ca` | Newfoundland and Labrador |
| `gov.nt.ca` | Northwest Territories |
| `gov.nu.ca` | Nunavut |
| `gov.yk.ca` | Yukon |

---

## Indigenous National Organizations

| Domain | Organization | What They Fund |
|--------|-------------|----------------|
| `afn.ca` | Assembly of First Nations | Advocacy, policy programs for First Nations |
| `itk.ca` | Inuit Tapiriit Kanatami | Inuit-specific programs and advocacy |
| `metisnation.ca` | Metis National Council | Metis-specific programs and governance |

---

## Indigenous Funding & Financial Institutions

| Domain | Organization | What They Fund |
|--------|-------------|----------------|
| `nacca.ca` | National Aboriginal Capital Corporations Association | Business loans, entrepreneurship support via Aboriginal Financial Institutions |
| `fnfa.ca` | First Nations Finance Authority | Long-term loans and investment income for First Nations |
| `fntc.ca` | First Nations Tax Commission | Taxation frameworks and revenue tools for First Nations |
| `fnfmb.com` | First Nations Financial Management Board | Financial management capacity building |

---

## Indigenous Health & Education Organizations

| Domain | Organization | What They Fund |
|--------|-------------|----------------|
| `fnha.ca` | First Nations Health Authority (BC) | Health programs, wellness grants for BC First Nations |
| `indspire.ca` | Indspire | Scholarships, bursaries, and education awards for Indigenous students |
| `nafaforestry.org` | National Aboriginal Forestry Association | Forestry sector capacity building |

---

## Crown Corporations & Federal Agencies

| Domain | Organization | What They Fund |
|--------|-------------|----------------|
| `bdc.ca` | Business Development Bank of Canada | Indigenous business loans and advisory services |
| `edc.ca` | Export Development Canada | Export financing for Indigenous businesses |
| `canadacouncil.ca` | Canada Council for the Arts | Arts grants including Indigenous arts programs |
| `telefilm.ca` | Telefilm Canada | Film, TV, and digital media funding including Indigenous streams |
| `fcc-fac.ca` | Farm Credit Canada | Agricultural lending including Indigenous farming programs |

---

## Research & Funding Portals

| Domain | Organization | What They Fund |
|--------|-------------|----------------|
| `researchnet-recherchenet.ca` | ResearchNet (Tri-council portal) | Central portal for CIHR, SSHRC, NSERC grant applications |

---

## Provincial Specialized Agencies

| Domain | Organization | What They Fund |
|--------|-------------|----------------|
| `calq.gouv.qc.ca` | Conseil des arts et des lettres du Québec (CALQ) | Arts grants including Indigenous artist programs in Quebec |

---

## Federal Research Councils

| Domain | Organization | What They Fund |
|--------|-------------|----------------|
| `nrc-cnrc.gc.ca` | National Research Council (IRAP) | Industrial research assistance, innovation funding |
| `sshrc-crsh.gc.ca` | Social Sciences & Humanities Research Council | Research grants including Indigenous research programs |
| `cihr-irsc.gc.ca` | Canadian Institutes of Health Research | Health research grants including Indigenous health |
| `nserc-crsng.gc.ca` | Natural Sciences & Engineering Research Council | Science and engineering research grants |

---

## Regional Development Agencies

| Domain | Organization | Region |
|--------|-------------|--------|
| `feddev-ontario.gc.ca` | FedDev Ontario | Southern Ontario |
| `fednor.gc.ca` | FedNor | Northern Ontario |
| `wd-deo.gc.ca` | Western Economic Diversification | Western Canada |
| `prairiescanecon.gc.ca` | PrairiesCan | Prairie provinces |
| `pacificcan.gc.ca` | PacifiCan | British Columbia |
| `dec-ced.gc.ca` | Canada Economic Development for Quebec | Quebec |
| `acoa-apeca.gc.ca` | Atlantic Canada Opportunities Agency | Atlantic provinces |
| `cannor.gc.ca` | CanNor | Northern Canada (Yukon, NWT, Nunavut) |

---

## Provincial Indigenous Agencies

| Domain | Organization | What They Fund |
|--------|-------------|----------------|
| `bchousing.org` | BC Housing | Housing programs including Indigenous housing |
| `bcafn.ca` | BC Assembly of First Nations | BC-specific First Nations programs |
| `onhwp.ca` | Ontario Aboriginal Housing Services | Indigenous housing in Ontario |
| `ofifc.org` | Ontario Federation of Indigenous Friendship Centres | Urban Indigenous community programs |
| `edo.ca` | Economic Developers Council of Ontario | Economic development including Indigenous programs |

---

## Research Pipeline

The AI research pipeline runs a **5-step process**:

1. **Perplexity Deep Research** — Comprehensive web search across all trusted domains to discover grants
2. **Claude Comparison** — Parses the research report, compares with the existing database, applies quality filters (must have application process, correct title, separate funding streams)
3. **URL Validation & Page Verification** — Checks every new grant's links (404/403/redirect detection) and verifies that the grant title actually appears on the source page (anti-hallucination)
4. **Perplexity Spot-Check** — Grants flagged with issues in step 3 get re-verified with a quick Perplexity web search to confirm whether the grant exists, has the right name, and is currently open
5. **Save & Flag** — Validated grants are saved as pending changes for admin review. Grants with broken links or unverified titles are auto-flagged for rejection.

### Grant Statuses

| Status | Meaning |
|--------|---------|
| `active` | Application window is currently open |
| `recurring_closed` | Legitimate recurring program, current window closed, will reopen |
| `inactive` | Permanently closed or discontinued |

---

## How to Add a New Provider

1. Add the domain to the appropriate array in `supabase/functions/research-grants/index.ts`:
   - `FEDERAL_GOV_DOMAINS` for federal government
   - `PROVINCIAL_GOV_DOMAINS` for provincial/territorial government
   - `TRUSTED_ORG_DOMAINS` for Indigenous orgs, Crown corporations, research portals, and provincial specialized agencies
2. Update `buildPerplexityPrompt()` to mention the new provider in the relevant search category
3. Update this document with the new domain, organization name, and what they fund
4. Deploy the updated edge function: `npx supabase functions deploy research-grants --project-ref bjjoiwnhqtizqryragco`
