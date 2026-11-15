#!/usr/bin/env python3
"""Create an evidence-only quarterly DOT source-review snapshot.

Never publishes financial figures to the public website. The output is a
review draft that must be reconciled with federal account/CRS documents.
"""
from __future__ import annotations
import argparse
import datetime as dt
import hashlib
import json
import pathlib
import urllib.error
import urllib.request

BASE = pathlib.Path(__file__).resolve().parent.parent
OUT = BASE / "data" / "transportation" / "quarterly-reviews"
API = "https://api.usaspending.gov/api/v2"
DOCS = {
    "DOT official budget and financial documents":
        "https://www.transportation.gov/mission/budget/dot-budget-and-performance-documents",
    "FAA air traffic modernization":
        "https://www.faa.gov/newsroom/brand-new-air-traffic-control-system-bnatcs-fact-sheet",
    "GAO air traffic control audit":
        "https://www.gao.gov/products/gao-26-107992",
    "NHTSA safety news":
        "https://www.nhtsa.gov/press-releases",
    "Treasury monthly outlay data":
        "https://fiscaldata.treasury.gov/datasets/monthly-treasury-statement/"
}
MAX_BYTES = 2_000_000
TIMEOUT = 18


def quarter_for(date: dt.date) -> tuple[int, int, dt.date]:
    """Most recently COMPLETED federal quarter, no early-quarter assumption."""
    fy = date.year + int(date.month >= 10)
    quarter = ((date.month - 10) % 12) // 3 + 1
    if date.month in (10, 1, 4, 7):
        # preceding quarter if run immediately on first day of current one
        pass
    # FY quarters: Oct-Dec Q1, Jan-Mar Q2, Apr-Jun Q3, Jul-Sep Q4
    quarter = {10: 1, 11: 1, 12: 1, 1: 2, 2: 2, 3: 2,
               4: 3, 5: 3, 6: 3, 7: 4, 8: 4, 9: 4}[date.month]
    first = dt.date(date.year, ((date.month - 1) // 3) * 3 + 1, 1)
    end_previous = first - dt.timedelta(days=1)
    return end_previous.year + int(end_previous.month >= 10), {
        12: 1, 3: 2, 6: 3, 9: 4
    }[end_previous.month], end_previous


def read_url(url: str) -> dict:
    req = urllib.request.Request(
        url, headers={"User-Agent": "SupremeCitizens-SourceReview/1.0 (+https://supremecitizens.org)"}
    )
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as res:
            payload = res.read(MAX_BYTES + 1)
            if len(payload) > MAX_BYTES:
                raise ValueError("source exceeds 2 MB review limit")
            record = {
                "status": "retrieved",
                "url": url,
                "http_status": res.status,
                "sha256": hashlib.sha256(payload).hexdigest(),
                "content_type": res.headers.get("Content-Type", ""),
                "last_modified": res.headers.get("Last-Modified"),
                "etag": res.headers.get("ETag"),
                "bytes": len(payload)
            }
            if "json" in record["content_type"].lower():
                obj = json.loads(payload)
                if not isinstance(obj, (dict, list)):
                    raise ValueError("unexpected JSON root")
                record["json_keys"] = sorted(obj.keys()) if isinstance(obj, dict) else []
                record["data_rows"] = len(obj.get("results", obj.get("data", []))) if isinstance(obj, dict) and isinstance(obj.get("results", obj.get("data", [])), list) else None
            return record
    except (urllib.error.URLError, TimeoutError, ValueError, json.JSONDecodeError) as exc:
        return {"status": "needs_review", "url": url, "error": str(exc)[:280]}


def report(date: dt.date, fetch=read_url) -> dict:
    fiscal_year, quarter, end = quarter_for(date)
    sources = {}
    for label, url in DOCS.items():
        sources[label] = fetch(url)
    # The DOT USAspending top-tier agency code is 069.
    # The endpoint returns budgetary resources and obligations, NOT enacted DOT
    # appropriations, and MUST NOT be summed with CRS budget authority figures.
    sources["USAspending DOT agency budgetary resources and obligations"] = fetch(
        f"{API}/agency/069/budgetary_resources/?fiscal_year={fiscal_year}"
    )
    sources["USAspending DOT agency submission reporting"] = fetch(
        f"{API}/reporting/agencies/069/overview/"
    )
    # Treasury table 5 covers agency outlays but is intentionally linked to
    # source documentation; amounts need separate row/category reconciliation.
    sources["Treasury MTS table 5 outlays"] = fetch(
        "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/"
        "v1/accounting/mts/mts_table_5?page%5Bsize%5D=1"
    )
    return {
        "review_type": "source_evidence_only",
        "fiscal_year": fiscal_year,
        "fiscal_quarter": quarter,
        "period_end": end.isoformat(),
        "review_date_utc": date.isoformat(),
        "publish_to_website": False,
        "source_checks": sources,
        "source_errors": [label for label, value in sources.items()
                          if value["status"] != "retrieved"],
        "methodology": [
            "No numerical values automatically published.",
            "A source HTTP success or checksum is not substantive verification.",
            "Agency resources, budget authority, obligations, outlays and safety outcomes require distinct reconciliation.",
            "Do not treat previous-year balances, rescissions, or expirations as cash savings.",
            "Editor must check relevant account scope, units, source vintage and fiscal period.",
        ],
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--date", help="UTC review date YYYY-MM-DD (default: today)")
    args = parser.parse_args()
    today = dt.date.fromisoformat(args.date) if args.date else dt.datetime.now(dt.timezone.utc).date()
    result = report(today)
    dest = OUT / f"FY{result['fiscal_year']}-Q{result['fiscal_quarter']}.json"
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(result, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    summary = BASE / "TRANSPORTATION_QUARTERLY_REVIEW.md"
    lines = [
        "# Transportation spending: quarterly source review (editorial draft)",
        "",
        f"- Fiscal period: FY{result['fiscal_year']} Q{result['fiscal_quarter']}",
        f"- Quarter ended: {result['period_end']}",
        f"- Review generated (UTC): {today}",
        "- Publication status: **NOT VERIFIED — NOT FOR AUTOMATIC WEBSITE PUBLICATION**",
        "",
        "## Source retrieval checks",
        "",
        "| Source | Retrieval | Evidence |",
        "|---|---|---|",
    ]
    for label, row in result["source_checks"].items():
        evidence = row.get("sha256", row.get("error", "n/a"))
        lines.append(f"| {label} | {row['status']} | \`{evidence}\` |")
    lines += [
        "",
        "## Required human approval",
        "",
        "1. Review official presidential requests, enacted laws and CRS scope notes separately.",
        "2. Reconcile USAspending budgetary resources/obligations with agency financial reports.",
        "3. Reconcile Treasury outlays by agency/account and fiscal period; do not infer outlays from obligations.",
        "4. Review FAA modernization amounts for phase/account overlap and GAO schedule findings.",
        "5. Review safety outcomes, completion evidence, revised estimates and their periods.",
        "6. Mark missing/failed sources as pending; never infer zero or absence of a program.",
        "7. Manually update source-verified public page only after reviewer approval.",
        "",
        f"Evidence snapshot: \`{dest.relative_to(BASE)}\`.",
    ]
    summary.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(dest.relative_to(BASE))
    print("Sources needing review:", ", ".join(result["source_errors"]) or "none")


if __name__ == "__main__":
    main()
