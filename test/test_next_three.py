import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

import generate


def test_next_three_wraps_within_category():
    taemong, _ = generate.load_data()
    groups = generate.group_by_category(taemong)
    animal_group = groups["동물"]
    ids = [t["id"] for t in animal_group]

    dragon = next(t for t in animal_group if t["id"] == "dragon")
    result_ids = [r["id"] for r in generate.next_three(dragon, animal_group)]
    assert result_ids == ids[1:4]

    last_item = animal_group[-1]
    result_ids = [r["id"] for r in generate.next_three(last_item, animal_group)]
    assert result_ids == ids[:3]


if __name__ == "__main__":
    test_next_three_wraps_within_category()
    print("OK: test_next_three.py")
