
(() => {
  "use strict";
  /* ==========================================================
     PARTY GAMES — a shared stage for games hosted by Jamol and
     Jamola. Today it runs Mafia in English.
     ========================================================== */
  const $ = id => document.getElementById(id);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const PEOPLE = () => window.JIA_PEOPLE || {}, AVS = () => window.JIA_AV || {};
  const photo = () => (getComputedStyle(document.querySelector(".avatar")).getPropertyValue("--photo") || "").trim().replace(/"/g, "'");
  const nm = w => w === "me" ? "You" : ((PEOPLE()[w] || {}).name || w).split(" ")[0];
  const face = (w, cls) => w === "me" ? `<span class="pa-av me ${cls || ""}" style="background-image:${photo()}"></span>` : `<img class="pa-av ${cls || ""}" src="${AVS()[w]}" alt="">`;
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const ART = window.JIA_PARTY_ART = { mafia: "/d/student-desktop/media/d6b92aed4d226aa3.webp" };
  const view = $("pa-view");
  const T = [];
  const later = (fn, ms) => { const t = setTimeout(fn, ms); T.push(t); return t; };
  const every = (fn, ms) => { const t = setInterval(fn, ms); T.push(t); return t; };
  const stopAll = () => { T.splice(0).forEach(t => { clearTimeout(t); clearInterval(t); }); if (window.speechSynthesis) speechSynthesis.cancel(); };
  let hostWho = "jamol";
  function speak(text, who, onEnd) {
    const S = window.JIA_SETTINGS || {};
    if (!window.speechSynthesis || S.voice === false) { if (onEnd) later(onEnd, 900 + text.length * 25); return; }
    try {
      const u = new SpeechSynthesisUtterance(text.replace(/[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/gu, ""));
      u.lang = "en-US"; u.rate = who === "jamola" ? 1.06 : 1.02; u.pitch = who === "jamola" ? 1.4 : .92;
      const vs = speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang)), want = who === "jamola" ? /female|samantha|zira|karen|victoria|google us english/i : /male|daniel|alex|david|fred/i;
      u.voice = vs.find(v => want.test(v.name)) || vs[0] || null;
      let done = false; const fin = () => { if (!done) { done = true; if (onEnd) onEnd(); } };
      u.onend = fin; if (onEnd) later(fin, 1500 + text.length * 70);
      speechSynthesis.cancel(); speechSynthesis.speak(u);
    } catch (e) { if (onEnd) later(onEnd, 1000); }
  }
  let actx = null;
  function tone(f, d, type, vol, when) {
    if (window.JIA_SETTINGS && window.JIA_SETTINGS.sounds === false) return;
    try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); const t = actx.currentTime + (when || 0), o = actx.createOscillator(), g = actx.createGain();
      o.type = type || "sine"; o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(vol || .07, t); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + d + .02); } catch (e) {}
  }
  const SFX = {
    pop: () => tone(760, .08, "sine", .07), tick: () => tone(1250, .035, "square", .03),
    right: () => { tone(660, .08, "triangle"); tone(990, .13, "triangle", .06, .08); }, wrong: () => tone(150, .3, "sawtooth", .05),
    boom: () => { tone(90, .6, "sawtooth", .12); tone(55, .8, "square", .08, .05); },
    drum: () => { for (let i = 0; i < 16; i++) tone(90 + (i % 2) * 14, .06, "triangle", .06, i * .1); },
    win: () => [523, 659, 784, 1046, 1318].forEach((f, k) => tone(f, .25, "triangle", .07, k * .11)), lose: () => [392, 330, 262].forEach((f, k) => tone(f, .3, "sine", .07, k * .16)),
  };
  const M = () => window.JIA_M || { jamol: {}, jamola: {} };
  function host(pose, text, o) {
    o = o || {};
    const m = M()[hostWho] || {}; $("pa-mascot").innerHTML = m[pose] || m.wave || m.point || "";
    $("pa-host").className = `pa-host ${o.mood || ""}`;
    if (text != null) { $("pa-bub").textContent = text; if (o.voice !== false) speak(text, hostWho, o.then); else if (o.then) later(o.then, 900); }
  }
  let toastT = 0;
  function toast(msg) { const t = $("pa-toast"); t.textContent = msg; t.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("on"), 2400); }
  function confetti() {
    if (reduce) return; const cols = ["#f5c542", "#66c69a", "#ef6c9a", "#4f8fdf", "#fff", "#b58cff"];
    for (let i = 0; i < 90; i++) { const c = document.createElement("i"); c.className = "gm-conf"; c.style.cssText = `left:${Math.random() * 100}%;background:${cols[i % 6]};--dx:${(Math.random() - .5) * 200}px;--r:${Math.random() * 900}deg;animation-delay:${Math.random() * .6}s;animation-duration:${2 + Math.random() * 1.6}s`; view.appendChild(c); setTimeout(() => c.remove(), 4200); }
  }
  function countdown(sec, tick, done) { let left = sec; tick(left); const t = every(() => { left--; tick(Math.max(0, left)); if (left <= 0) { clearInterval(t); done(); } }, 1000); return () => clearInterval(t); }
  const GAMES = {}; let cur = null;
  function end(o) {
    stopAll(); view.classList.remove("night");
    const m = M()[hostWho] || {};
    $("pa-end-art").innerHTML = m[o.win ? "cele" : "comfort"] || "";
    $("pa-end-t").textContent = o.title; $("pa-end-s").textContent = o.text || ""; $("pa-end-c").textContent = o.coins ? `+${o.coins} coins` : "";
    $("pa-end").hidden = false;
    if (o.coins && window.JIA_coins) window.JIA_coins.add(o.coins, { reason: "game", ref: "party", outcome: o.win ? "win" : "played" });   /* JG-PROD: S27, a game credit the server caps (Q13) */
    (o.win ? SFX.win : SFX.lose)(); if (o.win) confetti();
    if (o.say) speak(o.say, hostWho);
    if (window.JIA_notify && o.coins) window.JIA_notify({ icon: ART[cur.key], text: `<b>${esc(cur.title)}:</b> ${esc(o.title)} +${o.coins} coins` });
    setTimeout(() => $("pa-again").focus({ preventScroll: true }), 80);
  }
  function start(key) {
    const g = GAMES[key]; if (!g) return;
    stopAll(); cur = g; hostWho = g.host;
    view.dataset.game = key; view.classList.remove("night");
    view.style.setProperty("--pa1", g.theme[0]); view.style.setProperty("--pa2", g.theme[1]);
    $("pa-title").textContent = g.title; $("pa-sub").textContent = g.sub || ""; $("pa-stat").innerHTML = "";
    $("pa-body").innerHTML = ""; $("pa-bub").textContent = ""; $("pa-mascot").innerHTML = ""; $("pa-end").hidden = true;
    if ($("gh-view")) $("gh-view").hidden = true;
    view.style.zIndex = String(window.JIA_z ? window.JIA_z() : 66); view.hidden = false;
    try { g.run(API); } catch (e) { console.error(e); }
    setTimeout(() => $("pa-close").focus({ preventScroll: true }), 60);
  }
  function close() { stopAll(); view.hidden = true; view.classList.remove("night"); if (window.JIA_openGames) window.JIA_openGames(); }
  $("pa-close").addEventListener("click", close); $("pa-exit").addEventListener("click", close); $("pa-again").addEventListener("click", () => start(cur.key));
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !view.hidden) { e.preventDefault(); e.stopImmediatePropagation(); close(); } }, true);
  const API = { $, esc, nm, face, shuffle, pick, later, every, countdown, host, SFX, toast, confetti, end, speak: (t, cb) => speak(t, hostWho, cb),
    body: () => $("pa-body"), stat: h => { $("pa-stat").innerHTML = h; }, sub: t => { $("pa-sub").textContent = t; }, PEOPLE, AVS, photo, reduce, ART, view };
  window.JIA_party = { register(g) { GAMES[g.key] = g; }, open: start, api: API };
  const norm = s => s.toLowerCase().trim().replace(/^(a|an|the)\s+/, "").replace(/[^a-z]/g, "");
  API.norm = norm;
  const timer = (s, low, extra) => `<span class="pa-timer${s <= low ? " low" : ""}">⏱ ${s}s</span>${extra || ""}`;
  API.timer = timer;


})();
