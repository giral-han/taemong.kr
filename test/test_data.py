import json
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def test_taemong_count_and_shape():
    with open(os.path.join(BASE_DIR, "data", "taemong.json"), encoding="utf-8") as f:
        data = json.load(f)
    assert len(data) == 45
    required_keys = {"id", "이름", "카테고리", "의미설명", "태그", "이모지"}
    for item in data:
        assert required_keys.issubset(item.keys())
    ids = [item["id"] for item in data]
    assert len(ids) == len(set(ids))
    categories = {item["카테고리"] for item in data}
    assert categories == {"동물", "자연물", "사물"}


def test_compatibility_count_and_shape():
    with open(os.path.join(BASE_DIR, "data", "compatibility.json"), encoding="utf-8") as f:
        data = json.load(f)
    assert len(data) == 28
    for entry in data:
        assert len(entry["tags"]) == 2
        assert isinstance(entry["동일태그"], bool)
        assert entry["궁합문구"]


if __name__ == "__main__":
    test_taemong_count_and_shape()
    test_compatibility_count_and_shape()
    print("OK: test_data.py")
