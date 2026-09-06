import os
import subprocess
import sys
import xml.etree.ElementTree as ET

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def test_sitemap_has_56_urls():
    subprocess.run([sys.executable, os.path.join(BASE_DIR, "generate.py")], check=True, cwd=BASE_DIR)
    tree = ET.parse(os.path.join(BASE_DIR, "sitemap.xml"))
    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    urls = tree.findall("sm:url", ns)
    assert len(urls) == 56


def test_robots_references_sitemap():
    with open(os.path.join(BASE_DIR, "robots.txt"), encoding="utf-8") as f:
        content = f.read()
    assert "Sitemap:" in content
    assert "sitemap.xml" in content


if __name__ == "__main__":
    test_sitemap_has_56_urls()
    test_robots_references_sitemap()
    print("OK: test_sitemap.py")
