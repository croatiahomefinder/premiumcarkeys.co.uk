import re
import unittest
from scripts.release_gate import audit, ROOT, PATHS

class ReleaseGateTests(unittest.TestCase):
    def test_existing_routes_and_assets(self):
        result = audit(ROOT)
        self.assertTrue(result["passed"], result["issues"])

    def test_every_landing_page_checked(self):
        result = audit(ROOT)
        self.assertEqual(result["checked_pages"], len(PATHS))

    def test_whatsapp_color_contrast(self):
        """Guard white button text on the current normal and hover colours."""
        css = (ROOT / "assets/site.css").read_text(encoding="utf-8")
        for token in ("wa", "wa-dark"):
            with self.subTest(token=token):
                match = re.search(
                    rf"--{token}:\s*#([0-9a-fA-F]{{6}})\s*;", css
                )
                self.assertIsNotNone(match, f"Missing six-digit colour token: {token}")
                channels = [
                    int(match.group(1)[i:i + 2], 16) / 255
                    for i in (0, 2, 4)
                ]
                linear = [
                    v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4
                    for v in channels
                ]
                luminance = sum(w * v for w, v in zip((0.2126, 0.7152, 0.0722), linear))
                ratio = 1.05 / (luminance + 0.05)
                self.assertGreaterEqual(ratio, 4.5, f"{token}: white text contrast {ratio:.2f}:1")


if __name__ == "__main__":
    unittest.main()
