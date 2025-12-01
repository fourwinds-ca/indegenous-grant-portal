# Green Buffalo Indigenous Grant Portal - Development Tasks

## Priority Tasks

### 1. Build V1 of the Canadian Grant Database
**Status:** In Progress
**Description:** Create a comprehensive list of grants organized by province, focusing on EV-related grants aligned with NRCN priorities.

**Subtasks:**
- [ ] Research and compile federal EV grants
- [ ] Research provincial grants (Ontario, BC, Alberta, Quebec, Manitoba, Saskatchewan)
- [ ] Categorize grants by: Province, Category (EV, Infrastructure, Environment, Economic Development)
- [ ] Include grant details: Amount, Deadline, Eligibility, Application Link
- [ ] Integrate real grant data into the application

---

### 2. Build V1 of the Admin Dashboard
**Status:** Not Started
**Description:** A simple portal so Doug/Dan can control the website and manually add grants that aren't publicly available online.

**Features Required:**
- [ ] Admin authentication (separate from regular users)
- [ ] Grant management (CRUD operations)
  - [ ] Add new grants
  - [ ] Edit existing grants
  - [ ] Delete/archive grants
  - [ ] Mark grants as active/inactive
- [ ] View all grants in a table format
- [ ] Filter/search grants
- [ ] Bulk import capability (CSV/Excel)

---

## Ongoing/Background Items

### 3. Automate Grant Discovery
**Status:** Future
**Description:** Set up a monthly process that checks for new grants or closed grants (audit of the database).

**Considerations:**
- Web scraping of government grant portals
- API integrations where available
- Email alerts for grant changes
- Monthly audit report generation

---

### 4. Account Transfer Setup
**Status:** Future
**Description:** When there's breathing space, set up backend accounts that Doug's team controls and transfer everything over.

**Items to Transfer:**
- [ ] Supabase project ownership
- [ ] Vercel project ownership
- [ ] GitHub repository access
- [ ] Domain management (if applicable)
- [ ] Documentation for ongoing maintenance

---

## Working Approach

As agreed with Doug:
- ✅ Make minor decisions independently and inform him
- ⚠️ Flag critical decisions for discussion
- ✅ Keep the project moving without waiting on input for everything

---

## Completed Tasks

- [x] Port application to Next.js
- [x] Set up Tailwind CSS styling
- [x] Implement authentication (email/password)
- [x] Create landing page with grants list
- [x] Deploy to Vercel
- [x] Update grant categories for beta (Environment, Infrastructure, EV, Economic Development)
- [x] Add Green Buffalo favicon
- [x] Move grants list higher on landing page
