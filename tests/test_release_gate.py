import unittest
from scripts.release_gate import audit, ROOT, PATHS

class ReleaseGateTests(unittest.TestCase):
    def test_existing_routes_and_assets(self):
        result = audit(ROOT)
        self.assertTrue(result["passed"], result["issues"])

    def test_every_landing_page_checked(self):
        result = audit(ROOT)
        self.assertEqual(result["checked_pages"], len(PATHS))

if __name__ == "__main__":
    unittest.main()
