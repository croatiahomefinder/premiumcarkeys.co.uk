#!/usr/bin/env python3
"""Non-destructive static checks for Premium Car Keys. No network or credentials."""
import argparse
import json
import pathlib
import re
import xml.etree.ElementTree as ET
from urllib.parse import urlparse, unquote

ROOT = pathlib.Path(__file__).resolve().parents[1]
URL = "premiumcarkeys.co.uk"
PATHS = ["", "porsche-car-keys", "volvo-car-keys",
         "jaguar-land-rover-car-keys", "all-keys-lost",
         "can-phantom-immobiliser", "areas-we-cover", "privacy"]
REQUIRED = ["CNAME", "robots.txt", "sitemap.xml",
            "assets/site.css", "assets/builder.js", "assets/nav.js",
            "assets/catalogue.js", "index.html"]

def audit(root=ROOT):
    problems = []
    pages = {}
    for name in REQUIRED:
        if not (root / name).is_file():
            problems.append("missing required file: " + name)
    cname = root / "CNAME"
    if cname.is_file() and cname.read_text(encoding="utf-8").strip() != URL:
        problems.append("CNAME changed from premiumcarkeys.co.uk")
    for slug in PATHS:
        path = root / slug / "index.html"
        page_url = "https://" + URL + "/" + (slug + "/" if slug else "")
        if not path.is_file():
            problems.append("missing expected landing page: " + str(path.relative_to(root)))
            continue
        html = path.read_text(encoding="utf-8")
        pages[page_url] = str(path.relative_to(root))
        if not re.search(r"<title[^>]*>\s*[^<\s]", html, re.I):
            problems.append("missing page title: " + slug)
        if len(re.findall(r"<h1\b", html, re.I)) != 1:
            problems.append("expected one h1: " + slug)
        canonical = re.search(r'<link\b[^>]*rel=["\']canonical["\'][^>]*href=["\']([^"\']+)', html, re.I)
        if canonical and canonical.group(1).rstrip("/") != page_url.rstrip("/"):
            problems.append("canonical mismatch: " + slug)
        if not canonical:
            problems.append("missing canonical: " + slug)
        if not re.search(r'<meta\b[^>]*name=["\']description["\']', html, re.I):
            problems.append("missing meta description: " + slug)
        if "tel:+447833823384" not in html and "wa.me/447833823384" not in html:
            problems.append("no existing contact method retained: " + slug)
        for href in re.findall(r'<(?:a|link)\b[^>]*href=["\']([^"\']+)', html, re.I):
            parsed = urlparse(href)
            if parsed.scheme or parsed.netloc or not href.startswith("/"):
                continue
            clean = unquote(parsed.path)
            if ".." in pathlib.PurePosixPath(clean).parts:
                problems.append("unsafe relative path: " + slug)
                continue
            dest = root / clean.lstrip("/")
            if not (dest.is_file() or (dest / "index.html").is_file()):
                problems.append(f"local href not found: {slug or '/'} -> {clean}")
    sm = root / "sitemap.xml"
    if sm.is_file():
        try:
            tree = ET.parse(sm)
            ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
            urls = {n.text for n in tree.findall(".//s:loc", ns)}
            for page_url in pages:
                if page_url not in urls:
                    problems.append("page missing from sitemap: " + page_url)
        except ET.ParseError:
            problems.append("sitemap.xml is invalid XML")
    return {"passed": not problems, "checked_pages": len(pages),
            "issues": sorted(set(problems))}


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--report")
    a = p.parse_args()
    result = audit()
    print(json.dumps(result, indent=2))
    if a.report:
        out = pathlib.Path(a.report)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(result, indent=2)+"\n", encoding="utf-8")
    if not result["passed"]:
        raise SystemExit(1)

if __name__ == "__main__":
    main()
