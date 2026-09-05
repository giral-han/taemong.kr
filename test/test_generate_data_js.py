import json
import os
import subprocess
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def test_data_js_round_trips_source_json():
    subprocess.run([sys.executable, os.path.join(BASE_DIR, "generate.py")], check=True, cwd=BASE_DIR)

    with open(os.path.join(BASE_DIR, "js", "data.js"), encoding="utf-8") as f:
        lines = f.read().splitlines()
    taemong_line = next(l for l in lines if l.startswith("const TAEMONG_DATA = "))
    compat_line = next(l for l in lines if l.startswith("const COMPAT_DATA = "))
    taemong_from_js = json.loads(taemong_line[len("const TAEMONG_DATA = "):-1])
    compat_from_js = json.loads(compat_line[len("const COMPAT_DATA = "):-1])

    with open(os.path.join(BASE_DIR, "data", "taemong.json"), encoding="utf-8") as f:
        taemong_source = json.load(f)
    with open(os.path.join(BASE_DIR, "data", "compatibility.json"), encoding="utf-8") as f:
        compat_source = json.load(f)

    assert taemong_from_js == taemong_source
    assert compat_from_js == compat_source


if __name__ == "__main__":
    test_data_js_round_trips_source_json()
    print("OK: test_generate_data_js.py")
