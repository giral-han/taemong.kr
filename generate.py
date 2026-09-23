import html
import json
import os
from collections import defaultdict

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_URL = "https://www.taemong.kr"


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
<meta property="og:title" content="{title}">
<meta property="og:description" content="{description}">
<meta property="og:url" content="{og_url}">
<meta property="og:type" content="website">
<link rel="stylesheet" href="../css/style.css">
</head>
<body>
<header class="site-header">
  <a href="../index.html" class="logo">태몽궁합</a>
</header>
<main class="page-narrow">
  <div class="taemong-hero">
    <div class="taemong-emoji"><img src="../images/taemong/{item_id}.svg" alt="{name}" width="72" height="72" loading="lazy"></div>
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
  <p class="credit">아이콘: <a href="https://twemoji.twitter.com/" target="_blank" rel="noopener">Twemoji</a> (CC-BY 4.0)</p>
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
<meta property="og:title" content="태몽 사전 - 태몽궁합">
<meta property="og:description" content="45가지 태몽을 카테고리별로 모아 살펴보는 태몽 사전입니다.">
<meta property="og:url" content="{og_url}">
<meta property="og:type" content="website">
<link rel="stylesheet" href="../css/style.css">
</head>
<body>
<header class="site-header">
  <a href="../index.html" class="logo">태몽궁합</a>
</header>
<main class="page-narrow">
  <h1>태몽 사전</h1>
  <a class="btn btn-primary" href="../compatibility.html">💞 궁합 테스트 하러가기</a>
{sections}
</main>
<footer class="site-footer">
  <p>이 콘텐츠는 재미로 봐주세요.</p>
  <p class="credit">아이콘: <a href="https://twemoji.twitter.com/" target="_blank" rel="noopener">Twemoji</a> (CC-BY 4.0)</p>
</footer>
</body>
</html>
"""


def render_taemong_page(item, group):
    recs = next_three(item, group)
    rec_html = "\n".join(
        f'      <li><a href="{html.escape(r["id"])}.html"><img class="icon-sm" src="../images/taemong/{html.escape(r["id"])}.svg" alt="" width="24" height="24" loading="lazy"> {html.escape(r["이름"])}</a></li>'
        for r in recs
    )
    item_id = item["id"]
    return TAEMONG_PAGE_TEMPLATE.format(
        title=html.escape(f'{item["이름"]} 태몽 뜻과 의미 - 태몽궁합'),
        description=html.escape(item["의미설명"]),
        name=html.escape(item["이름"]),
        category=html.escape(item["카테고리"]),
        meaning=html.escape(item["의미설명"]),
        tag=html.escape(item["태그"]),
        item_id=html.escape(item_id),
        recommend_items=rec_html,
        og_url=f"{BASE_URL}/taemong/{html.escape(item_id)}.html",
    )


def render_taemong_index(groups):
    sections = []
    for category in ["동물", "자연물", "사물"]:
        items = groups.get(category, [])
        lis = "\n".join(
            f'      <li><a href="{html.escape(item["id"])}.html"><img class="icon-sm" src="../images/taemong/{html.escape(item["id"])}.svg" alt="" width="24" height="24" loading="lazy"> {html.escape(item["이름"])}</a></li>'
            for item in items
        )
        sections.append(
            f'  <section>\n    <h2>{html.escape(category)}</h2>\n    <ul class="recommend-list">\n{lis}\n    </ul>\n  </section>'
        )
    return TAEMONG_INDEX_TEMPLATE.format(
        sections="\n".join(sections),
        og_url=f"{BASE_URL}/taemong/index.html",
    )


def write_taemong_pages(taemong):
    groups = group_by_category(taemong)
    out_dir = os.path.join(BASE_DIR, "taemong")
    os.makedirs(out_dir, exist_ok=True)
    for item in taemong:
        group = groups[item["카테고리"]]
        page_html = render_taemong_page(item, group)
        with open(os.path.join(out_dir, f'{item["id"]}.html'), "w", encoding="utf-8") as f:
            f.write(page_html)
    with open(os.path.join(out_dir, "index.html"), "w", encoding="utf-8") as f:
        f.write(render_taemong_index(groups))


def write_sitemap(taemong):
    urls = [
        f"{BASE_URL}/index.html",
        f"{BASE_URL}/compatibility.html",
        f"{BASE_URL}/taemong/index.html",
    ]
    urls += [f"{BASE_URL}/taemong/{html.escape(item['id'])}.html" for item in taemong]
    body = "\n".join(f"  <url><loc>{u}</loc></url>" for u in urls)
    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        f"{body}\n"
        "</urlset>\n"
    )
    with open(os.path.join(BASE_DIR, "sitemap.xml"), "w", encoding="utf-8") as f:
        f.write(xml)


def write_robots():
    content = f"User-agent: *\nAllow: /\n\nSitemap: {BASE_URL}/sitemap.xml\n"
    with open(os.path.join(BASE_DIR, "robots.txt"), "w", encoding="utf-8") as f:
        f.write(content)


def main():
    taemong, compat = load_data()
    write_data_js(taemong, compat)
    write_taemong_pages(taemong)
    write_sitemap(taemong)
    write_robots()
    print(f"생성 완료: data.js, 태몽 페이지 {len(taemong)}개, sitemap.xml, robots.txt")


if __name__ == "__main__":
    main()
