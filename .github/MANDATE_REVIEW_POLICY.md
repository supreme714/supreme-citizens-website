# Supreme Citizens: weekly register publication protocol

**Recurring editorial research:** ChatGPT weekly review — Mondays at 8:00 AM America/New_York, starting November 16, 2026.

**Automated GitHub checks:** `.github/workflows/validate-mandate-register.yml` runs on proposed register changes, pushes to main, manual dispatch and a supplementary Monday UTC schedule. Technical checks are not fact-checking. The supplementary UTC cron is not the exact-time Eastern research task.

## Inclusion requirements
1. Identify a clearly attributed campaign commitment and an accessible, dated, original source URL. Preserve the actual statement's date, not the entry's editorial review date.
2. Link official .gov/.mil records and exact action date when an action is claimed. A related government action is not automatically proof the original promise was fulfilled.
3. Note meaningful limitations, eligibility provisions, and uncertainty. Distinguish campaign commitment, related action, documented outcome and reasons voters supported an official.
4. Compare against existing records by ID and official/date/commitment; avoid duplication.
5. Keep the public register nonpartisan: no scores, recommended candidates, mandate determinations, or selective unsupported claims.
6. Preserve `schema_version: 2`, ISO dates, chronology and supporting URLs.

## Publication gate
Research proposes changes in a **pull request**, not directly on `main`. GitHub Actions fails structurally invalid entries. A human editor should open the original cited statement and the official action source, confirm attribution and context, review factual accuracy and equal treatment of sources, and approve the proposed change. Merge an approved, passing PR to `main`; the existing GitHub→Netlify deployment then publishes the update automatically.

**Safety:** Do not grant scheduled research or untrusted source content permission to bypass editorial approval, commit directly to `main`, or auto-merge source assertions. This gate prevents a valid-looking URL from being mistaken for verified evidence. The weekly review may report no updates when reliable new material is insufficient.

## Manual verification checklist
- [ ] Original campaign statement was opened and relevant language verified
- [ ] Event date and election cycle are accurate
- [ ] Official governmental action source and date confirmed, or action field omitted
- [ ] Context explains limits and uncertainty without overstating outcomes
- [ ] Duplicate and chronology checks passed
- [ ] GitHub Actions test suite passed
- [ ] Approved PR merged and Netlify deployment confirmed ready
