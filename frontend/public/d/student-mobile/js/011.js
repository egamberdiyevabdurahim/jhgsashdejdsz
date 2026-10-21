
(() => {
  "use strict";

  /* ==========================================================
     SETTINGS — opened from the photo on Home (or the tune icon).
     Choices are remembered on this device. Sound, voice and
     reduce motion take effect across the app right away.
     ========================================================== */
  const $ = id => document.getElementById(id);
  const KEY = "jia.settings";
  const S = { daily: 2, reminders: true, nMessages: true, nLive: true, nEvents: true, nSocial: false,
              privateProfile: false, dmFrom: "follow", hideScores: false, sounds: true, voice: true, calm: document.documentElement.classList.contains("calm"), lang: "en", theme: "light", push: true };   /* JG-PROD: owner 4 Oct R7, the switch starts from the page's real motion setting (the runtime's: the student's own choice, else the device's) */
  try { Object.assign(S, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) {}
  window.JIA_SETTINGS = S;
  const darkQ = matchMedia("(prefers-color-scheme: dark)");
  const apply = () => {
    document.documentElement.classList.toggle("calm", !!S.calm);
    document.documentElement.classList.remove("dark");               // dark mode comes in V2
    document.documentElement.classList.toggle("demo-tools", !!S.demo && !window.JG_ENGINE);   /* JG-PROD: owner 4 Oct R11, the demo controls (they can overwrite a real student's answers) never switch on for a real student */
  };
  if (darkQ.addEventListener) darkQ.addEventListener("change", () => apply());
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} apply(); };
  apply();

  const CHEV = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
  const SECTIONS = [
    ["Study", [
      { k: "daily", type: "seg", label: "Daily study goal", opts: [[1, "1 hour"], [2, "2 hours"], [3, "3 hours"]] },
      { k: "reminders", type: "sw", label: "Study reminders", sub: "A nudge every evening at 19:00" }]],
    ["Notifications", [
      { k: "push", type: "sw", label: "Push notifications", sub: "Reminders on your phone for lessons and events" },
      { k: "nMessages", type: "sw", label: "Messages" }, { k: "nLive", type: "sw", label: "Live lessons" },
      { k: "nEvents", type: "sw", label: "Events" }, { k: "nSocial", type: "sw", label: "Likes and comments" }]],
    ["Privacy and safety", [
      { k: "privateProfile", type: "sw", label: "Private profile", sub: "Only people you approve see your posts and reels" },
      { k: "dmFrom", type: "seg", label: "Who can message you", opts: [["follow", "Teachers and people I follow"], ["everyone", "Everyone at JIA"], ["teachers", "Teachers only"]] },
      { k: "hideScores", type: "sw", label: "Hide my scores", sub: "SAT, IELTS and AP stay on your Home only" },
      { type: "link", label: "Blocked accounts", value: "None" }]],
    ["Sound and motion", [
      { k: "sounds", type: "sw", label: "Sound effects", sub: "Buttons, coins and games" },
      { k: "voice", type: "sw", label: "Voice in reels and battles" },
      { k: "calm", type: "sw", label: "Reduce motion", sub: "Fewer animations across the app" }]],
    ["Language", [
      { k: "lang", type: "seg", label: "App language", opts: [["en", "English"], ["uz", window.JG_ENGINE ? "Oʻzbek" : "O'zbek"], ["ru", "Русский"]] }]],   /* JG-PROD: owner 6 Oct P4h H1 review, a real student reads Uzbek's own name with U+02BB in any UI language (the glossary's oʻ); the demo keeps the design's */
    ["Prototype", [
      { k: "demo", type: "sw", label: "Demo controls", sub: "Show the preview buttons used in presentations" }]],
    ["Support", [
      { type: "link", label: "Help center" }, { type: "link", label: "Contact JIA support" },
      { type: "link", label: "Terms of use" }, { type: "link", label: "Privacy policy" },
      { type: "info", label: "Version", value: "1.0 prototype" }]],
  ].filter(([h]) => !(window.JG_ENGINE && h === "Prototype"));   /* JG-PROD: owner 4 Oct R11, no "Prototype · Demo controls" in a real student's Settings */
  const photo = (getComputedStyle(document.querySelector(".avatar")).getPropertyValue("--photo") || "").trim().replace(/"/g, "'");
  const row = r => {
    if (r.type === "sw") return `<div class="set-row"><div class="t"><b id="sl-${r.k}">${r.label}</b>${r.sub ? `<small>${r.sub}</small>` : ""}</div><button class="set-sw" type="button" role="switch" aria-labelledby="sl-${r.k}" aria-checked="${!!S[r.k]}" data-k="${r.k}"></button></div>`;
    if (r.type === "seg") return `<div class="set-row col"><div class="t"><b>${r.label}</b></div><div class="set-seg" role="group" aria-label="${r.label}">${r.opts.map(([v, l]) => `<button type="button" data-k="${r.k}" data-v="${v}" aria-pressed="${String(S[r.k]) === String(v)}">${l}</button>`).join("")}</div></div>`;
    if (r.type === "link") return `<button class="set-row set-link" type="button" data-link="${r.label}"><span class="t"><b>${r.label}</b></span>${r.value ? `<span class="v">${r.value}</span>` : ""}${CHEV}</button>`;
    return `<div class="set-row"><div class="t"><b>${r.label}</b></div><span class="v">${r.value}</span></div>`;
  };
  $("set-scroll").innerHTML = `<div class="set-me"><i style="background-image:${photo}"${window.JG_ENGINE ? ' class="jg-photo-edit" role="button" tabindex="0" aria-label="Change your photo"' : ""}></i><div><b>${JG_ME.fullName}</b><span>${window.JG_ENGINE ? window.JG_ENGINE.meLine(", ").replace(/[&<>"]/g, c => `&#${c.charCodeAt(0)};`) : "Grade 11, JIA"}</span></div><button type="button" id="set-profile">View profile</button></div><button class="set-plan" id="set-plan" type="button"><img id="set-plan-img" alt=""><span><b id="set-plan-t">Free plan</b><small id="set-plan-s"></small></span><em id="set-plan-b">See plans</em></button>` /* JG-PROD: identity */ /* JG-PROD: owner 4 Oct P4g S4, a real student taps his photo here to change it (public/runtime/jg-photo.js) */ /* JG-PROD: owner 4 Oct R12, a real student's own grade and school type under their name, never "Grade 11, JIA" */
    + SECTIONS.map(([h, rows]) => `<p class="set-h">${h}</p><div class="set-card">${rows.map(row).join("")}</div>`).join("")
    + `<button class="set-out" id="set-out" type="button">Log out</button>`;

  let toastT = 0;
  const say = msg => { const t = $("set-toast"); t.textContent = msg; t.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("on"), 2400); };
  $("set-scroll").addEventListener("click", e => {
    const sw = e.target.closest(".set-sw"), seg = e.target.closest(".set-seg button"), link = e.target.closest("[data-link]");
    if (sw) {
      S[sw.dataset.k] = !S[sw.dataset.k]; sw.setAttribute("aria-checked", String(S[sw.dataset.k])); save();
      if (sw.dataset.k === "push" && S.push && window.Notification && Notification.permission === "default") { try { Notification.requestPermission(); } catch (err) {} }
    }
    else if (seg) {
      const k = seg.dataset.k, raw = seg.dataset.v; S[k] = /^\d+$/.test(raw) ? +raw : raw; save();
      seg.parentElement.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(b === seg)));
      if (k === "lang" && window.JG_I18N) window.JG_I18N.choose(raw); else if (k === "lang" && raw !== "en") say("Uzbek and Russian are on the way. The app stays in English for now.");   /* JG-PROD: owner 6 Oct P4h H1, a real student's App language is real: the account's UI language and the roadmap's change together and the page reloads in it (public/runtime/jg-i18n.js); the demo keeps the design's note */
    } else if (link) { if (link.dataset.link === "Blocked accounts" && window.JIA_openBlocked) window.JIA_openBlocked(); else say(`${link.dataset.link} opens in the full app.`); }
    else if (e.target.closest("#set-profile") && window.JIA_openProfile) window.JIA_openProfile("me");
    else if (e.target.closest("#set-out")) { $("set-dlg").hidden = false; $("set-dlg-no").focus(); }
  });
  $("set-dlg-no").addEventListener("click", () => { $("set-dlg").hidden = true; $("set-out").focus(); });
  $("set-dlg-yes").addEventListener("click", () => { $("set-dlg").hidden = true; if (window.JG_RUNTIME) window.JG_RUNTIME.signOut(); else say("Logged out. In the real app you'd see the sign-in screen now."); }); /* JG-PROD: a real sign-out (Ruling R12): saves, then Auth.js's CSRF-checked POST, then /signin; the dev preview has no runtime and keeps the design's note */

  // open and close
  const view = $("set-view");
  let back = null;
  function open(fromPull) {
    back = document.activeElement;
    view.classList.toggle("drop", fromPull === true);
    view.style.zIndex = String(window.JIA_z ? window.JIA_z() : 60);
    view.hidden = false; $("set-scroll").scrollTop = 0;
    setTimeout(() => $("set-back").focus({ preventScroll: true }), 50);
  }
  function close() { view.hidden = true; $("set-dlg").hidden = true; if (back) back.focus({ preventScroll: true }); }
  window.JIA_openSettings = open;
  $("set-back").addEventListener("click", close);
  document.addEventListener("keydown", e => {
    if (e.key !== "Escape" || view.hidden) return;
    const top = +view.style.zIndex, higher = [...document.querySelectorAll(".pf-view:not([hidden]), .cm-sheet:not([hidden])")].some(el => +el.style.zIndex > top);
    if (higher) return;
    e.preventDefault(); if (!$("set-dlg").hidden) { $("set-dlg").hidden = true; return; } close();
  });
  // the photo on Home is the way in
  const avatar = document.querySelector(".avatar");
  avatar.setAttribute("role", "button"); avatar.setAttribute("tabindex", "0");
  avatar.setAttribute("aria-label", "Your photo. Open settings");
  avatar.addEventListener("click", open);
  avatar.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
  const tune = $("tune-btn"); if (tune) tune.addEventListener("click", open);
})();
