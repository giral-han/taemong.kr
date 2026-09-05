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


TAEMONG_PAGE_TEMPLATE = """<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{description}">
<link rel="stylesheet" href="../css/style.css">
</head>
<body>
<header class="site-header">
  <a href="../index.html" class="logo">태몽궁합</a>
</header>
<main class="page-narrow">
  <div class="taemong-hero">
    <div class="taemong-emoji">{emoji}</div>
    <h1>{name} 태몽</h1>
    <p class="badge">{category}</p>
  </div>
  <p class="taemong-meaning">{meaning}</p>
  <p class="taemong-tag">키워드: <strong>{tag}</strong></p>
  <a class="btn btn-primary" href="../compatibility.html?a={item_id}">이 태몽으로 궁합 테스트 하러가기</a>

  <section class="recommend">
    <h2>같은 카테고리의 다른 태몽</h2>
    <ul class="recommend-list">
{recommend_items}
    </ul>
  </section>
</main>
<footer class="site-footer">
  <p>이 콘텐츠는 재미로 봐주세요. 태몽 해석은 과학적으로 검증된 사실이 아닙니다.</p>
</footer>
</body>
</html>
"""

TAEMONG_INDEX_TEMPLATE = """<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>태몽 사전 - 태몽궁합</title>
<meta name="description" content="45가지 태몽을 카테고리별로 모아 살펴보는 태몽 사전입니다.">
<link rel="stylesheet" href="../css/style.css">
</head>
<body>
<header class="site-header">
  <a href="../index.html" class="logo">태몽궁합</a>
</header>
<main class="page-narrow">
  <h1>태몽 사전</h1>
{sections}
</main>
<footer class="site-footer">
  <p>이 콘텐츠는 재미로 봐주세요.</p>
</footer>
</body>
</html>
"""


def render_taemong_page(item, group):
    recs = next_three(item, group)
    rec_html = "\n".join(
        f'      <li><a href="{r["id"]}.html">{r["이모지"]} {r["이름"]}</a></li>'
        for r in recs
    )
    return TAEMONG_PAGE_TEMPLATE.format(
        title=f'{item["이름"]} 태몽 뜻과 의미 - 태몽궁합',
        description=item["의미설명"],
        emoji=item["이모지"],
        name=item["이름"],
        category=item["카테고리"],
        meaning=item["의미설명"],
        tag=item["태그"],
        item_id=item["id"],
        recommend_items=rec_html,
    )


def render_taemong_index(groups):
    sections = []
    for category in ["동물", "자연물", "사물"]:
        items = groups.get(category, [])
        lis = "\n".join(
            f'      <li><a href="{item["id"]}.html">{item["이모지"]} {item["이름"]}</a></li>'
            for item in items
        )
        sections.append(
            f'  <section>\n    <h2>{category}</h2>\n    <ul class="recommend-list">\n{lis}\n    </ul>\n  </section>'
        )
    return TAEMONG_INDEX_TEMPLATE.format(sections="\n".join(sections))


def write_taemong_pages(taemong):
    groups = group_by_category(taemong)
    out_dir = os.path.join(BASE_DIR, "taemong")
    os.makedirs(out_dir, exist_ok=True)
    for item in taemong:
        group = groups[item["카테고리"]]
        html = render_taemong_page(item, group)
        with open(os.path.join(out_dir, f'{item["id"]}.html'), "w", encoding="utf-8") as f:
            f.write(html)
    with open(os.path.join(out_dir, "index.html"), "w", encoding="utf-8") as f:
        f.write(render_taemong_index(groups))


def main():
    taemong, compat = load_data()
    write_data_js(taemong, compat)
    write_taemong_pages(taemong)
    print(f"생성 완료: data.js, 태몽 페이지 {len(taemong)}개 + 목록 페이지")


if __name__ == "__main__":
    main()
