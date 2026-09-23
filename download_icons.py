import json
import os
import urllib.request

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TWEMOJI_BASE = "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/"
OUT_DIR = os.path.join(BASE_DIR, "images", "taemong")


def codepoints(emoji, strip_fe0f):
    cps = [ord(ch) for ch in emoji]
    if strip_fe0f:
        cps = [c for c in cps if c != 0xFE0F]
    return "-".join(f"{c:x}" for c in cps)


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            if resp.status == 200:
                return resp.read()
    except Exception:
        return None
    return None


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    with open(os.path.join(BASE_DIR, "data", "taemong.json"), encoding="utf-8") as f:
        taemong = json.load(f)

    ok, failed = [], []
    for item in taemong:
        emoji = item["이모지"]
        candidates = [codepoints(emoji, False), codepoints(emoji, True)]
        data = None
        used = None
        for cp in candidates:
            data = fetch(TWEMOJI_BASE + cp + ".svg")
            if data:
                used = cp
                break
        out_path = os.path.join(OUT_DIR, f'{item["id"]}.svg')
        if data:
            with open(out_path, "wb") as f:
                f.write(data)
            ok.append((item["id"], item["이름"], used))
        else:
            failed.append((item["id"], item["이름"], emoji, candidates))

    print(f"성공: {len(ok)}개, 실패: {len(failed)}개")
    if failed:
        print("실패 목록:")
        for id_, name, emoji, candidates in failed:
            print(f"  {id_} ({name}) emoji={emoji!r} tried={candidates}")


if __name__ == "__main__":
    main()
