# Historical Campaign Promise Research Workflow

This workflow is **separate** from the ongoing Monday Supreme Citizens Mandate Accountability Review.

## Cadence and research order

- Historical research automation: Wednesdays, approximately 8:00 AM, America/New_York (first review November 11, 2026).
- Begin with the **2020 federal election cycle**, then 2016, 2012, 2008, and earlier years as evidence permits.
- The weekly historical research task discovers, compares, and proposes records. GitHub Actions runs structural tests only; it **does not** autonomously research the web or prove a campaign claim is true.
- Do not assume the election-year ordering sets a priority among political parties or officeholders. Within a period, seek varied examples with sufficient documentation and clearly disclose limitations.

## Research stages

1. **Locate the promise:** Establish the candidate, office, election, original statement text, date and archived or original campaign link. Keep quotations short and respect publication rights.
2. **Check eligibility for comparison:** Confirm the election outcome and whether the individual subsequently held the relevant office. If unsuccessful, mark it as historical electoral context rather than a governing-performance judgment.
3. **Trace actions in chronological order:** Link introductions of bills, votes, executive orders, signed legislation, agency changes, vetoes, judicial constraints, appropriations or other official records as applicable. Distinguish direct action by the official from actions by others.
4. **Trace outcomes:** Prefer official reports, government statistics and contemporaneous documentation. A policy action does not automatically demonstrate the promised outcome.
5. **Document qualifications:** Record limitations of legal authority, external dependencies, changes in conditions, exclusions, partial implementation and sources that conflict. Never label a promise broken solely because an action was not located.
6. **Publication review:** Compare proposed entries against `data/mandate-commitments.json`. Source-backed additions belong in a **historical-research branch and PR**. Obtain an editorial accuracy review and passing validation before merging into `main`.

## Historical research queue

`data/historical-research-queue.json` tracks election-cycle coverage. Its `state` values describe **research progress**, not political performance. The queue initially includes no assertions about candidates or promises.

Each researched entry proposed for the public register must satisfy the existing data schema and `.github/MANDATE_REVIEW_POLICY.md`. Source pages must be actually inspected; valid HTTPS links and passing code tests are **necessary but not sufficient** proof.

## Suggested research write-up format

- Cycle, candidate, office, date and exact attributed position (short paraphrase).
- Primary campaign document and archival link.
- Whether the candidate was elected and scope of authority.
- Chronological official actions with dates and official links.
- Documented outcomes and separate outcome sources where available.
- Unknowns, competing interpretations, and specific evidence still needed.
- Proposed register record or explicit reason to defer inclusion.

## Operational separation

The Monday workflow checks **new and changing** commitments and actions. The Wednesday workflow researches **past election cycles and governing records**. Both use the same public register and validation checks, but separate research notes and PR titles allow the work to be audited without duplicate records. Never merge automatically simply because a source URL exists or tests pass.
