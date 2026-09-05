function tagKey(tagA, tagB) {
  return [tagA, tagB].slice().sort().join("|");
}

function findCompatibility(tagA, tagB, compatData) {
  const key = tagKey(tagA, tagB);
  return compatData.find((entry) => tagKey(entry.tags[0], entry.tags[1]) === key) || null;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { tagKey, findCompatibility };
}
