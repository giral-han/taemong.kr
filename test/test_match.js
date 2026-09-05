const assert = require("assert");
const { findCompatibility } = require("../js/match.js");
const compatData = require("../data/compatibility.json");

const wealthHonor = findCompatibility("재물", "명예", compatData);
assert.ok(wealthHonor, "재물+명예 조합을 찾아야 함");
assert.strictEqual(
  wealthHonor.궁합문구,
  "재물과 명예가 만났으니, 부와 명성을 함께 쌓아가는 환상의 파트너십! 서로의 야망을 응원하며 크게 성장할 궁합이에요."
);

const honorWealth = findCompatibility("명예", "재물", compatData);
assert.strictEqual(honorWealth.궁합문구, wealthHonor.궁합문구, "태그 순서가 달라도 같은 결과여야 함");

const sameWealth = findCompatibility("재물", "재물", compatData);
assert.ok(sameWealth);
assert.strictEqual(sameWealth.동일태그, true);

const noMatch = findCompatibility("재물", "존재하지않는태그", compatData);
assert.strictEqual(noMatch, null);

console.log("OK: test_match.js");
