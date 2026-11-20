const STEPS = ["step-my", "step-partner", "step-result"];
const WEEKDAYS = "일월화수목금토";

// origin: "own" = 직접 고른 결과, "shared" = 공유 링크로 받은 결과
// myTab / partnerTab: 스티커 판에서 지금 펼쳐 둔 종류(동물·식물…)
// stamp: 결과를 적은 날짜(20261105). 공유 링크에 담겨서 받은 사람도 같은 날짜를 봐요.
const state = { myId: null, partnerId: null, myTab: null, partnerTab: null, origin: "own", step: null, depth: 0, stamp: null };

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function findTaemong(id) {
  return TAEMONG_DATA.find((t) => t.id === id) || null;
}

function taemongByCategory(category) {
  return TAEMONG_DATA.filter((t) => t.카테고리 === category);
}

function iconSrc(item) {
  return "images/taemong/" + escapeHtml(item.id) + ".svg";
}

function todayStamp() {
  const d = new Date();
  return String(d.getFullYear()) + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0");
}

// 20261105 → "2026. 11. 5. 목". 없는 날짜면 빈 값을 돌려줘요.
function dateLabel(stamp) {
  if (!/^\d{8}$/.test(stamp || "")) return "";
  const year = Number(stamp.slice(0, 4));
  const month = Number(stamp.slice(4, 6));
  const day = Number(stamp.slice(6, 8));
  const d = new Date(year, month - 1, day);
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return "";
  return year + ". " + month + ". " + day + ". " + WEEKDAYS[d.getDay()];
}

function firstCategory() {
  return CATEGORY_DATA[0].이름;
}

function snapshot() {
  return {
    step: state.step,
    myId: state.myId,
    partnerId: state.partnerId,
    myTab: state.myTab,
    partnerTab: state.partnerTab,
    origin: state.origin,
    depth: state.depth,
    stamp: state.stamp,
  };
}

function urlForState() {
  const url = new URL(location.href);
  url.search = "";
  if (state.myId) url.searchParams.set("a", state.myId);
  if (state.myId && state.partnerId && state.step === "step-result") {
    url.searchParams.set("b", state.partnerId);
    if (dateLabel(state.stamp)) url.searchParams.set("d", state.stamp);
  }
  return url.toString();
}

function renderSlot(which, stuck) {
  const id = which === "me" ? state.myId : state.partnerId;
  const slot = document.getElementById("slot-" + which);
  const label = which === "me" ? "내 태몽" : "짝꿍 태몽";
  if (!id) {
    slot.className = "slot is-empty";
    slot.removeAttribute("aria-label");
    slot.innerHTML = '<span class="slot-hint">' + label + "<br>여기에 붙여요</span>";
    return;
  }
  const item = findTaemong(id);
  const onResult = state.step === "step-result";
  const tag = onResult ? "a" : "div";
  const href = onResult ? ' href="taemong/' + escapeHtml(item.id) + '.html"' : "";
  slot.className = "slot slot-" + which + (stuck ? " just-stuck" : "");
  slot.setAttribute("aria-label", label + ": " + item.이름 + ", " + item.태그);
  slot.innerHTML =
    '<span class="tape" aria-hidden="true"></span>' +
    "<" + tag + ' class="sticker"' + href + ">" +
    '<img src="' + iconSrc(item) + '" alt="" width="76" height="76">' +
    '<span class="sticker-name">' + escapeHtml(item.이름) + "</span>" +
    '<span class="sticker-tag">' + escapeHtml(item.태그) + "</span>" +
    "</" + tag + ">";
  if (stuck) {
    slot.addEventListener("animationend", () => slot.classList.remove("just-stuck"), { once: true });
  }
}

function renderEntry(animate) {
  const entry = document.getElementById("entry");
  if (state.step !== "step-result") {
    entry.hidden = true;
    entry.innerHTML = "";
    return;
  }
  const my = findTaemong(state.myId);
  const partner = findTaemong(state.partnerId);
  const result = resultFor(my, partner, COMPAT_DATA, SPECIAL_DATA);
  entry.className = "entry" + (animate ? " writing" : "");
  entry.innerHTML =
    '<h2 class="entry-title" tabindex="-1"><span class="hl">' + escapeHtml(result ? result.title : my.이름 + " × " + partner.이름) + "</span></h2>" +
    '<p class="entry-pair">' + escapeHtml(my.이름) + " × " + escapeHtml(partner.이름) + "</p>" +
    '<p class="entry-line">' + escapeHtml(result ? result.line : "아직 준비되지 않은 조합이에요.") + "</p>" +
    '<p class="entry-note">재미로 보는 궁합이에요</p>';
  entry.hidden = false;
}

// 두 스티커를 잇는 펜 선과 하트. 결과 화면에만 나와요.
function renderTie(animate) {
  const tie = document.getElementById("tie");
  tie.toggleAttribute("hidden", state.step !== "step-result");
  tie.classList.toggle("drawing", animate);
}

function renderDate() {
  // 결과에는 적은 날짜를, 고르는 동안에는 오늘 날짜를 보여줘요.
  const onResult = state.step === "step-result";
  const label = dateLabel(onResult ? state.stamp : todayStamp());
  const el = document.getElementById("diary-date");
  el.textContent = label;
  el.hidden = !label;
}

function renderActions() {
  const onResult = state.step === "step-result";
  const shared = onResult && state.origin === "shared";
  document.getElementById("diary-brand").hidden = !onResult;
  document.getElementById("shared-note").hidden = !shared;
  document.body.classList.toggle("is-shared-result", shared);
  document.getElementById("share-fallback").hidden = true;
  document.getElementById("actions-shared").hidden = !shared;
  document.getElementById("actions-own").hidden = !(onResult && !shared);
}

// 스티커 판: 위쪽 색인 탭으로 종류를 바꾸고, 아래 판에서 스티커를 골라요.
function renderPicker(which) {
  const isMine = which === "me";
  const prefix = isMine ? "my" : "partner";
  const tabKey = isMine ? "myTab" : "partnerTab";
  const pickedId = isMine ? state.myId : state.partnerId;
  if (!state[tabKey]) state[tabKey] = firstCategory();

  const tabs = document.getElementById(prefix + "-tabs");
  const sheet = document.getElementById(prefix + "-sheet");
  tabs.innerHTML = "";
  CATEGORY_DATA.forEach((category) => {
    const selected = category.이름 === state[tabKey];
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sheet-tab";
    btn.id = prefix + "-tab-" + CATEGORY_DATA.indexOf(category);
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", selected ? "true" : "false");
    btn.setAttribute("aria-controls", prefix + "-sheet");
    btn.tabIndex = selected ? 0 : -1;
    btn.innerHTML =
      "<span>" + escapeHtml(category.이름) + "</span>" +
      '<span class="count">' + taemongByCategory(category.이름).length + "</span>";
    btn.addEventListener("click", () => {
      state[tabKey] = category.이름;
      renderPicker(which);
      history.replaceState(snapshot(), "", urlForState());
      document.getElementById(btn.id).focus();
    });
    btn.addEventListener("keydown", (event) => {
      const i = CATEGORY_DATA.indexOf(category);
      const n = CATEGORY_DATA.length;
      const next = event.key === "ArrowRight" ? (i + 1) % n : event.key === "ArrowLeft" ? (i + n - 1) % n : -1;
      if (next < 0) return;
      event.preventDefault();
      document.getElementById(prefix + "-tab-" + next).click();
    });
    tabs.appendChild(btn);
  });

  const activeIndex = CATEGORY_DATA.findIndex((c) => c.이름 === state[tabKey]);
  sheet.setAttribute("aria-labelledby", prefix + "-tab-" + activeIndex);
  sheet.innerHTML = "";
  taemongByCategory(state[tabKey]).forEach((item) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pick" + (item.id === pickedId ? " is-picked" : "");
    btn.setAttribute("aria-pressed", item.id === pickedId ? "true" : "false");
    btn.innerHTML =
      '<img src="' + iconSrc(item) + '" alt="" width="52" height="52" loading="lazy">' +
      "<span>" + escapeHtml(item.이름) + "</span>";
    btn.addEventListener("click", () => (isMine ? pickMine(item.id) : pickPartner(item.id)));
    sheet.appendChild(btn);
  });
}

// 화면을 한 단계로 맞춰요. push가 true면 휴대폰 뒤로가기로 돌아올 수 있게 기록해요.
function showStep(stepId, options) {
  const opts = Object.assign({ push: true, focus: true, stuck: null }, options);
  state.step = stepId;
  document.querySelectorAll(".step").forEach((el) => {
    el.hidden = el.id !== stepId;
  });
  if (stepId === "step-my") renderPicker("me");
  if (stepId === "step-partner") renderPicker("partner");
  // stuck: "me" = 내 스티커만, "partner" = 짝꿍 스티커, "both" = 공유 링크로 열었을 때 둘 다
  const sticksPartner = opts.stuck === "partner" || opts.stuck === "both";
  renderSlot("me", opts.stuck === "me" || opts.stuck === "both");
  renderSlot("partner", sticksPartner);
  renderEntry(sticksPartner);
  renderTie(sticksPartner);
  renderDate();
  renderActions();

  if (opts.push) {
    state.depth += 1;
    history.pushState(snapshot(), "", urlForState());
  } else {
    history.replaceState(snapshot(), "", urlForState());
  }

  if (opts.focus) {
    // 결과 화면에서는 궁합 이름으로 이동해야 화면 낭독기가 결과부터 읽어요.
    const onResult = stepId === "step-result";
    const heading = document.querySelector(onResult ? "#entry h2" : "#" + stepId + " h2");
    if (heading) heading.focus({ preventScroll: onResult });
    if (onResult) {
      const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: calm ? "auto" : "smooth" });
    }
  }
}

function pickMine(id) {
  state.myId = id;
  state.partnerId = null;
  state.partnerTab = null;
  showStep("step-partner", { stuck: "me" });
}

function pickPartner(id) {
  state.partnerId = id;
  state.stamp = todayStamp();
  showStep("step-result", { stuck: "partner" });
}

function pickRandom(which) {
  const item = TAEMONG_DATA[Math.floor(Math.random() * TAEMONG_DATA.length)];
  toast(item.이름 + " 스티커를 골랐어요. 진짜 태몽은 부모님께 여쭤보세요.");
  if (which === "me") pickMine(item.id);
  else pickPartner(item.id);
}

function startOwn() {
  state.myId = null;
  state.partnerId = null;
  state.myTab = null;
  state.partnerTab = null;
  state.origin = "own";
  state.stamp = null;
  showStep("step-my");
}

function goBackToMine() {
  // 이 페이지 안에서 쌓인 기록이 있으면 휴대폰 뒤로가기와 똑같이 움직여요.
  if (state.depth > 0) {
    history.back();
    return;
  }
  const mine = findTaemong(state.myId);
  if (mine) state.myTab = mine.카테고리;
  showStep("step-my", { push: false });
}

let toastTimer = null;
function toast(message) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 3200);
}

function copyLink(url) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(url).then(
      () => toast("링크를 복사했어요. 원하는 곳에 붙여 넣어 보내 주세요."),
      () => fallbackCopy(url)
    );
  } else {
    fallbackCopy(url);
  }
}

function fallbackCopy(url) {
  const input = document.createElement("input");
  input.value = url;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  input.setSelectionRange(0, url.length);
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch (e) {
    copied = false;
  }
  document.body.removeChild(input);
  if (copied) toast("링크를 복사했어요. 원하는 곳에 붙여 넣어 보내 주세요.");
  else showManualCopy(url);
}

// 복사까지 막힌 브라우저에서는 링크를 화면에 꺼내 줘요. 메신저 안 브라우저는 주소창이 잘 안 보여요.
function showManualCopy(url) {
  const input = document.getElementById("share-url");
  input.value = url;
  document.getElementById("share-fallback").hidden = false;
  input.focus();
  input.select();
}

function shareResult() {
  const my = findTaemong(state.myId);
  const partner = findTaemong(state.partnerId);
  const url = urlForState();
  const result = my && partner ? resultFor(my, partner, COMPAT_DATA, SPECIAL_DATA) : null;
  const text = result
    ? result.title + "! " + my.이름 + " × " + partner.이름 + " 태몽 궁합 결과를 확인해보세요"
    : "태몽 궁합 결과";
  if (navigator.share && location.protocol !== "file:") {
    // 공유창을 직접 닫은 경우(AbortError)만 그대로 두고, 그 밖의 실패는 링크 복사로 넘어가요.
    navigator.share({ title: "태몽 궁합 결과", text, url }).catch((error) => {
      if (!error || error.name !== "AbortError") copyLink(url);
    });
  } else {
    copyLink(url);
  }
}

function initSteps() {
  document.querySelectorAll("[data-random]").forEach((btn) => {
    btn.addEventListener("click", () => pickRandom(btn.getAttribute("data-random")));
  });
  document.querySelectorAll("[data-back]").forEach((btn) => {
    btn.addEventListener("click", goBackToMine);
  });
  document.querySelectorAll("[data-share]").forEach((btn) => {
    btn.addEventListener("click", shareResult);
  });
  document.getElementById("btn-start-own").addEventListener("click", startOwn);
  document.getElementById("btn-restart").addEventListener("click", startOwn);

  window.addEventListener("popstate", (event) => {
    if (!event.state || !STEPS.includes(event.state.step)) return;
    Object.assign(state, event.state);
    showStep(state.step, { push: false });
  });
}

// 공유 링크로 열 때 손글씨 글꼴이 오면 연출을 시작해요. 늦어도 0.8초 뒤에는 시작해요.
function releaseRevealWhenFontsReady() {
  const release = () => document.body.classList.remove("fonts-waiting");
  const text = document.getElementById("entry").textContent;
  const fonts = document.fonts
    ? Promise.all([document.fonts.load("700 16px Gaegu", text), document.fonts.load("400 16px Gaegu", text)])
    : Promise.resolve();
  const timeout = new Promise((done) => setTimeout(done, 800));
  Promise.race([fonts, timeout]).then(release, release);
}

function initFromQuery() {
  const params = new URLSearchParams(location.search);
  const a = params.get("a");
  const b = params.get("b");
  const my = a ? findTaemong(a) : null;
  const partner = b ? findTaemong(b) : null;

  if (my && partner) {
    state.myId = my.id;
    state.partnerId = partner.id;
    state.stamp = params.get("d");
    // 새로고침해도 history.state는 남아 있어서, 내가 만든 결과가 받은 결과로 바뀌지 않아요.
    const saved = history.state;
    const reloadedOwn = !!saved && saved.origin === "own" && saved.step === "step-result";
    if (reloadedOwn) {
      state.depth = saved.depth;
      showStep("step-result", { push: false, focus: false });
      return;
    }
    state.origin = "shared";
    document.body.classList.add("fonts-waiting");
    showStep("step-result", { push: false, focus: false, stuck: "both" });
    releaseRevealWhenFontsReady();
    return;
  }
  if (my) {
    state.myId = my.id;
    state.myTab = my.카테고리;
    showStep("step-partner", { push: false, focus: false });
    if (b) toast("링크 일부가 잘렸어요. 짝꿍 태몽을 다시 골라 주세요.");
    return;
  }
  showStep("step-my", { push: false, focus: false });
  if (a || b) toast("링크가 잘려서 결과를 찾지 못했어요. 처음부터 골라 주세요.");
}

document.addEventListener("DOMContentLoaded", () => {
  initSteps();
  initFromQuery();
});
