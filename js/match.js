function tagKey(tagA, tagB) {
  return [tagA, tagB].slice().sort().join("|");
}

function findCompatibility(tagA, tagB, compatData) {
  const key = tagKey(tagA, tagB);
  return compatData.find((entry) => tagKey(entry.tags[0], entry.tags[1]) === key) || null;
}

function findSpecialPair(idA, idB, specialData) {
  const key = tagKey(idA, idB);
  return (specialData || []).find((entry) => tagKey(entry.ids[0], entry.ids[1]) === key) || null;
}

// 내 태몽(왼쪽)과 짝꿍 태몽(오른쪽) 순서에 맞는 조합 이름과 궁합 문구를 돌려줘요.
function resultFor(myItem, partnerItem, compatData, specialData) {
  const entry = findCompatibility(myItem.태그, partnerItem.태그, compatData);
  if (!entry) return null;
  const special = findSpecialPair(myItem.id, partnerItem.id, specialData);
  const reversed = !entry.동일태그 && myItem.태그 !== entry.tags[0];
  return {
    title: special ? special.조합이름 : entry.조합이름,
    line: reversed && entry.역순문구 ? entry.역순문구 : entry.궁합문구,
    tags: [myItem.태그, partnerItem.태그],
  };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { tagKey, findCompatibility, findSpecialPair, resultFor };
}
