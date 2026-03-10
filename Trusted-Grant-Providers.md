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
| `cib.ca` | Canada Infrastructure Bank | Equity and debt financing for Indigenous community infrastructure projects |

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

## International Organizations

| Domain | Organization | What They Fund |
|--------|-------------|----------------|
| `un.org` | United Nations | Indigenous Peoples funding, UNPFII programs, global Indigenous grants |
| `undp.org` | UN Development Programme | Development grants including Indigenous community programs |

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

## Search Categories

The AI research pipeline runs **6 category-specific searches**:

1. **Federal Indigenous Programs** — ISC, CIRNAC
2. **Energy & Environment** — NRCan, ECCC
3. **Housing & Infrastructure** — CMHC, Infrastructure Canada
4. **Economic Development** — ISED, Regional Development Agencies
5. **Provincial Programs** — All 13 provincial/territorial governments
6. **Indigenous Organizations & Crown Corporations** — NACCA, Indspire, BDC, research councils, etc.

---

## How to Add a New Provider

1. Add the domain to the appropriate array in `supabase/functions/research-grants/index.ts`:
   - `FEDERAL_GOV_DOMAINS` for federal government
   - `PROVINCIAL_GOV_DOMAINS` for provincial/territorial government
   - `TRUSTED_ORG_DOMAINS` for Indigenous orgs and Crown corporations
2. If the new provider warrants its own search category, add it to `buildSearchCategories()`
3. Update this document with the new domain, organization name, and what they fund
4. Deploy the updated edge function: `npx supabase functions deploy research-grants --project-ref bjjoiwnhqtizqryragco`
