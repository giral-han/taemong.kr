const CATEGORIES = ["동물", "자연물", "사물"];
const CATEGORY_EMOJI = { 동물: "🐾", 자연물: "🌿", 사물: "💎" };

const state = { myId: null, partnerId: null };

function findTaemong(id) {
  return TAEMONG_DATA.find((t) => t.id === id) || null;
}

function taemongByCategory(category) {
  return TAEMONG_DATA.filter((t) => t.카테고리 === category);
}

function showStep(stepId) {
  document.querySelectorAll(".step").forEach((el) => {
    el.hidden = el.id !== stepId;
  });
  updateProgress();
}

function progressIcon(item) {
  return '<img class="icon-xs" src="images/taemong/' + item.id + '.svg" alt="" width="18" height="18" loading="lazy">';
}

function updateProgress() {
  const progress = document.getElementById("progress");
  const parts = [];
  if (state.myId) {
    const my = findTaemong(state.myId);
    parts.push("내 태몽: " + progressIcon(my) + " " + my.이름);
  }
  if (state.partnerId) {
    const partner = findTaemong(state.partnerId);
    parts.push("상대방 태몽: " + progressIcon(partner) + " " + partner.이름);
  }
  progress.innerHTML = parts.join("   ");
}

function renderCategoryButtons(container, onPick) {
  container.innerHTML = "";
  CATEGORIES.forEach((category) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-choice";
    btn.textContent = CATEGORY_EMOJI[category] + " " + category;
    btn.addEventListener("click", () => onPick(category));
    container.appendChild(btn);
  });
}

function renderTaemongButtons(container, category, onPick) {
  container.innerHTML = "";
  taemongByCategory(category).forEach((item) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-choice";
    btn.innerHTML =
      '<img class="icon-md" src="images/taemong/' + item.id + '.svg" alt="" width="32" height="32" loading="lazy">' +
      item.이름;
    btn.addEventListener("click", () => onPick(item.id));
    container.appendChild(btn);
  });
}

function renderResult() {
  const my = findTaemong(state.myId);
  const partner = findTaemong(state.partnerId);
  const match = findCompatibility(my.태그, partner.태그, COMPAT_DATA);
  const card = document.getElementById("result-card");
  card.innerHTML =
    '<div class="result-pair">' +
    '<img class="icon-lg" src="images/taemong/' + my.id + '.svg" alt="' + my.이름 + '" width="64" height="64" loading="lazy">' +
    '<span class="result-x">×</span>' +
    '<img class="icon-lg" src="images/taemong/' + partner.id + '.svg" alt="' + partner.이름 + '" width="64" height="64" loading="lazy">' +
    "</div>" +
    "<h2>" + my.이름 + " × " + partner.이름 + "</h2>" +
    '<p class="result-text">' + (match ? match.궁합문구 : "아직 준비되지 않은 조합이에요.") + "</p>";
  showStep("step-result");

  const url = new URL(location.href);
  url.searchParams.set("a", state.myId);
  url.searchParams.set("b", state.partnerId);
  history.replaceState(null, "", url.toString());
}

function resetAll() {
  state.myId = null;
  state.partnerId = null;
  const url = new URL(location.href);
  url.search = "";
  history.replaceState(null, "", url.toString());
  showStep("step-my-category");
}

function copyLink(url) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(url).then(
      () => alert("링크를 복사했어요!"),
      () => fallbackCopy(url)
    );
  } else {
    fallbackCopy(url);
  }
}

function fallbackCopy(url) {
  const input = document.createElement("input");
  input.value = url;
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.focus();
  input.select();
  input.setSelectionRange(0, url.length);
  try {
    if (document.execCommand("copy")) {
      alert("링크를 복사했어요!");
    } else {
      alert("자동 복사에 실패했어요. 직접 복사해주세요: " + url);
    }
  } catch (e) {
    alert("자동 복사에 실패했어요. 직접 복사해주세요: " + url);
  }
  document.body.removeChild(input);
}

function shareResult(url, text) {
  if (navigator.share && location.protocol !== "file:") {
    navigator.share({ title: "태몽 궁합 결과", text, url }).catch(() => {});
  } else {
    copyLink(url);
  }
}

function renderMyTaemongStep(category) {
  renderTaemongButtons(document.getElementById("my-taemong-buttons"), category, (id) => {
    state.myId = id;
    showStep("step-partner-category");
  });
}

function initSteps() {
  renderCategoryButtons(document.getElementById("my-category-buttons"), (category) => {
    renderMyTaemongStep(category);
    showStep("step-my-taemong");
  });

  renderCategoryButtons(document.getElementById("partner-category-buttons"), (category) => {
    renderTaemongButtons(document.getElementById("partner-taemong-buttons"), category, (id) => {
      state.partnerId = id;
      renderResult();
    });
    showStep("step-partner-taemong");
  });

  document.querySelectorAll("[data-back]").forEach((btn) => {
    btn.addEventListener("click", () => {
      showStep("step-" + btn.getAttribute("data-back"));
    });
  });

  document.getElementById("btn-restart").addEventListener("click", resetAll);

  document.getElementById("btn-copy-link").addEventListener("click", () => {
    copyLink(location.href);
  });

  document.getElementById("btn-share").addEventListener("click", () => {
    const my = findTaemong(state.myId);
    const partner = findTaemong(state.partnerId);
    const text = my && partner ? my.이름 + " × " + partner.이름 + " 태몽 궁합 결과를 확인해보세요!" : "태몽 궁합 결과";
    shareResult(location.href, text);
  });
}

function initFromQuery() {
  const params = new URLSearchParams(location.search);
  const a = params.get("a");
  const b = params.get("b");
  if (a && findTaemong(a) && b && findTaemong(b)) {
    state.myId = a;
    state.partnerId = b;
    renderResult();
    return true;
  }
  if (a && findTaemong(a)) {
    state.myId = a;
    renderMyTaemongStep(findTaemong(a).카테고리);
    showStep("step-partner-category");
    return true;
  }
  return false;
}

document.addEventListener("DOMContentLoaded", () => {
  initSteps();
  if (!initFromQuery()) {
    showStep("step-my-category");
  }
});
