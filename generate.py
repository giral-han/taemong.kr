import json
import os
from collections import defaultdict

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_URL = "https://taemong-gunghap.example.com"


def load_data():
    with open(os.path.join(BASE_DIR, "data", "taemong.json"), encoding="utf-8") as f:
        taemong = json.load(f)
    with open(os.path.join(BASE_DIR, "data", "compatibility.json"), encoding="utf-8") as f:
        compat = json.load(f)
    return taemong, compat


def write_data_js(taemong, compat):
    path = os.path.join(BASE_DIR, "js", "data.js")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write("const TAEMONG_DATA = " + json.dumps(taemong, ensure_ascii=False) + ";\n")
        f.write("const COMPAT_DATA = " + json.dumps(compat, ensure_ascii=False) + ";\n")


def group_by_category(taemong):
    groups = defaultdict(list)
    for item in taemong:
        groups[item["카테고리"]].append(item)
    return groups


def next_three(item, group):
    ids = [t["id"] for t in group]
    i = ids.index(item["id"])
    n = len(ids)
    return [group[(i + 1) % n], group[(i + 2) % n], group[(i + 3) % n]]


def main():
    taemong, compat = load_data()
    write_data_js(taemong, compat)
    print(f"생성 완료: data.js ({len(taemong)}개 태몽, {len(compat)}개 궁합)")


if __name__ == "__main__":
    main()
