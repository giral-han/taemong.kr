import json
import os
import subprocess
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def test_all_taemong_pages_generated_with_unique_seo_tags():
    subprocess.run([sys.executable, os.path.join(BASE_DIR, "generate.py")], check=True, cwd=BASE_DIR)

    with open(os.path.join(BASE_DIR, "data", "taemong.json"), encoding="utf-8") as f:
        taemong = json.load(f)

    titles = set()
    for item in taemong:
        path = os.path.join(BASE_DIR, "taemong", f'{item["id"]}.html')
        assert os.path.exists(path)
        with open(path, encoding="utf-8") as f:
            html = f.read()
        assert f"<title>{item['이름']} 태몽" in html
        assert item["의미설명"] in html
        assert f'compatibility.html?a={item["id"]}' in html
        titles.add(item["이름"])

    assert len(titles) == 45

    index_path = os.path.join(BASE_DIR, "taemong", "index.html")
    assert os.path.exists(index_path)
    with open(index_path, encoding="utf-8") as f:
        index_html = f.read()
    for item in taemong:
        assert f'{item["id"]}.html' in index_html


if __name__ == "__main__":
    test_all_taemong_pages_generated_with_unique_seo_tags()
    print("OK: test_pages.py")
