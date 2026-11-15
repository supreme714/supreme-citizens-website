# Transportation Spending Accountability Register — Implementation Plan

Snapshot prepared: 2026-11-14. Proposed public page: `/transportation-spending.html`.

## Scope and editorial controls
Nonpartisan USDOT/FAA/FHWA/FTA/FRA/FMCSA/NHTSA/MARAD public funding register. Separate FY and administration tenure. The president requests, Congress enacts, agencies obligate/outlay, auditors and programs document outcomes. Do not imply agency outlay comparisons are presidential spending totals.

## Record schema for phase 2
Use append-only JSON records under `data/transportation/`:

```json
{
  "record_id": "dot-fhwa-2026-budget-authority-v1",
  "fiscal_year": 2026,
  "period_end": "2026-09-30",
  "agency": "FHWA",
  "treasury_account_symbol": null,
  "program": "FHWA total",
  "metric": "program_funding",
  "funding_type": "combined_contract_advance_annual",
  "status": "enacted",
  "amount_usd": 75213000000,
  "nominal_or_real": "nominal",
  "source_title": "CRS R48947 Table 1",
  "source_url": "https://www.everycrsreport.com/reports/R48947.html",
  "source_publication_date": "2026-05-14",
  "retrieved_at": "2026-11-14",
  "verified_at": "2026-11-14",
  "editorial_status": "verified",
  "revision_of": null,
  "notes": "CRS total is not annual discretionary appropriations alone"
}
```

Fields must be source-specific and uniquely identified by FY + agency + federal account + metric + funding type + source vintage. Preserve original records and version supersessions; use null for missing, never 0. For historical comparisons, display revised data version and publication date.

## Seven feeds
1. Requests: OMB President's Budget + DOT budget justification, keyed to original/vintage/request level.
2. Enacted: Congress.gov/public law + CRS reconciliation; identify mandatory, discretionary, contract authority, IIJA advance, supplementals and rescissions.
3. Obligations/outlays: USAspending account datasets by fiscal year and quarter plus DOT AFR; reconcile account coverage, negative adjustments, and prior-year funds.
4. Program reductions: separate proposed cancellation, enacted rescission, deobligation, delayed award, and advance authority sunset; record whether a sum can be legally reallocated.
5. FAA modernization: P.L. 119-21, FAA F&E and GAO project-specific phase costs; flag overlapping amounts and incomplete cost/schedule plans.
6. Deliverables and outcomes: contract/grant IDs, agency milestones, GAO audit findings, DOT performance reports and NHTSA/FAA outcomes; do not infer causation from a change in outcome.
7. Quarterly verification: update history, source URL and hash, review approval, publication log.

## Quarterly workflow (not yet automated)
* FY Q1 close Dec 31, Q2 Mar 31, Q3 Jun 30, Q4 Sep 30.
* Trigger a staged GitHub Actions workflow 30–60 days after quarter end, or when published government data becomes available; fetch only known public government endpoints. Use pinned dependencies, retries, rate limits, and schema validation.
* Save downloaded source metadata and normalized CSV/JSON to a dated snapshot. Mark data missing/stale if no current source.
* Produce a comparison report: records added, revised, removed (tombstone only), newly reported safety outcomes, unexplained differences.
* Open a draft pull request (not a direct production commit). Require human review for all public facts and source reconciliation; use branch protection/status checks.
* Publish only following reviewer approval. Show last source verification and latest observation date separately. Never claim real-time status without a current feed.
* Maintain a correction log and retain prior baselines.

## QA checklist
* Compare 2024–2027 CRS totals against R48947 Table 1 and reconcile with R48728's narrower appropriations scope.
* Ensure FY2027 always displays 'proposed' until an enacted law and authoritative funding table exist.
* Ensure FY2025 is marked 'Biden/Trump transition', not solely either administration.
* Verify all agency figures and rounding against their source tables.
* Validate number units (dollars, thousands, millions), negative obligations, fiscal-year boundaries and missing-value handling.
* Test dropdown selection, mobile overflow, keyboard navigation, source-link reliability and sitemap.
* Check no browser-side API credentials, no unreviewed machine-generated claims, no automatic attribution of safety changes to budgets.

## Sources
- CRS R48947: https://www.everycrsreport.com/reports/R48947.html
- CRS R48728: https://www.everycrsreport.com/reports/R48728.html
- CRS R49341: https://www.everycrsreport.com/reports/R49341.html
- USDOT: https://www.transportation.gov/mission/budget/dot-budget-and-performance-documents
- Treasury API docs: https://api.usaspending.gov/docs/endpoints
- USAspending definitions: https://www.usaspending.gov/federal-spending-guide
- GAO air traffic modernization: https://files.gao.gov/reports/GAO-26-107992/index.html
- FAA fact sheet: https://www.faa.gov/newsroom/brand-new-air-traffic-control-system-bnatcs-fact-sheet
- NHTSA latest half-year estimates: https://www.nhtsa.gov/press-releases/decline-traffic-fatalities-first-half-2026
