import datetime as dt
import importlib.util
import pathlib
import unittest

SCRIPT = pathlib.Path(__file__).resolve().parents[1] / "scripts" / "transportation-quarterly-review.py"
spec = importlib.util.spec_from_file_location("transportation_quarterly", SCRIPT)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class TransportationQuarterlyReviewTests(unittest.TestCase):
    def test_federal_quarters(self):
        self.assertEqual(module.quarter_for(dt.date(2027, 1, 20)),
                         (2027, 1, dt.date(2026, 12, 31)))
        self.assertEqual(module.quarter_for(dt.date(2027, 4, 20)),
                         (2027, 2, dt.date(2027, 3, 31)))
        self.assertEqual(module.quarter_for(dt.date(2027, 7, 20)),
                         (2027, 3, dt.date(2027, 6, 30)))
        self.assertEqual(module.quarter_for(dt.date(2027, 10, 20)),
                         (2027, 4, dt.date(2027, 9, 30)))
        self.assertEqual(module.quarter_for(dt.date(2026, 11, 14)),
                         (2026, 4, dt.date(2026, 9, 30)))

    def test_no_publication_and_missing_sources_explicit(self):
        seen = []
        def fake_fetch(url):
            seen.append(url)
            if "budgetary_resources" in url:
                return {"status": "needs_review", "url": url, "error": "test outage"}
            return {"status": "retrieved", "url": url, "sha256": "test-checksum"}
        result = module.report(dt.date(2027, 1, 20), fetch=fake_fetch)
        self.assertFalse(result["publish_to_website"])
        self.assertEqual(result["review_type"], "source_evidence_only")
        self.assertEqual(result["fiscal_year"], 2027)
        self.assertIn("USAspending DOT agency budgetary resources and obligations", result["source_errors"])
        self.assertTrue(any("/agency/069/budgetary_resources/?fiscal_year=2027" in u for u in seen))
        self.assertTrue(any("mts_table_5" in u for u in seen))
        self.assertNotIn("enacted_funding_usd", result)


if __name__ == "__main__":
    unittest.main()
