
(() => {
  "use strict";

  /* ==========================================================
     IQ BATTLE — 45 seconds, 10 logic puzzles, one on one.
     Looks for an opponent (the clock keeps running until one is
     found), plays the round, then shows who won and roughly where
     the student's IQ sits. Add or edit puzzles in POOL.
     ========================================================== */
  const POOL = [
    { q: "2, 4, 8, 16, ?", a: ["24", "30", "32", "64"], c: 2 },
    { q: "Which one does not belong?", a: ["Square", "Circle", "Triangle", "Cube"], c: 3 },
    { q: "1, 1, 2, 3, 5, 8, ?", a: ["11", "12", "13", "15"], c: 2 },
    { q: "3, 6, 11, 18, ?", a: ["24", "25", "27", "29"], c: 2 },
    { q: "All Bims are Zets. All Zets are Rols. So all Bims are…", a: ["Rols", "Some Rols", "Not Rols", "We can't tell"], c: 0 },
    { q: "Book is to reading as fork is to…", a: ["Eating", "Kitchen", "Metal", "Cutting"], c: 0 },
    { q: "Which number is the odd one out?", a: ["9", "16", "25", "30"], c: 3 },
    { q: "100, 50, 25, ?", a: ["10", "12.5", "15", "20"], c: 1 },
    { q: "If A=1, B=2, C=3, what is A + B + C?", a: ["5", "6", "7", "9"], c: 1 },
    { q: "Which shape has the most sides?", a: ["Square", "Pentagon", "Hexagon", "Octagon"], c: 3 },
    { q: "7, 14, 28, ?", a: ["42", "48", "56", "60"], c: 2 },
    { q: "Monday is to Tuesday as June is to…", a: ["May", "July", "Year", "Week"], c: 1 },
    { q: "Which is heavier: 1 kg of iron or 1 kg of cotton?", a: ["Iron", "Cotton", "The same", "It depends"], c: 2 },
    { q: "2, 3, 5, 7, 11, ?", a: ["12", "13", "14", "15"], c: 1 },
  ];
  const NAMES = window.JG_GAMES ? ["Computer"] /* JG-PROD: owner 20 Oct M1 games, the opponent is the computer, never a teacher's name */ : ["Dilnoza R.", "Javlon T.", "Aziza K.", "Sardor M.", "Kamila S.", "Bekzod A.", "Nilufar X.", "Asadbek Y."];
  const ROUND = 45, COUNT = 10, OP_SKILL = .62;                // seconds, puzzles, how often the opponent is right

  const $ = id => document.getElementById(id);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  /* ---------- the fighters: a light rook with green gloves, a dark bishop with red ---------- */
  const BODIES = {
    rook: `<path class="pc" d="M31 97c1-16 4-28 4-40h26c0 12 3 24 4 40z"/>
           <rect class="pc" x="28.5" y="47" width="39" height="10.5" rx="3"/>
           <path class="pc" d="M28.5 48V26H36v7h7.5v-7H52v7h7.5v-7H67v22z"/>`,
    bishop: `<path class="pc" d="M34 97c0-15 4-23 9.5-31h9c5.5 8 9.5 16 9.5 31z"/>
             <path class="pc" d="M48 23c9.5 0 16.5 9.2 16.5 20.7 0 9.6-6.6 17.6-16.5 17.6s-16.5-8-16.5-17.6C31.5 32.2 38.5 23 48 23z"/>
             <path class="slit" d="M43.5 38.5L54.5 29"/>
             <circle class="pc" cx="48" cy="19.5" r="5.2"/>`,
  };
  const ARMS = {
    guard: `<g class="arm arm-b"><path class="limb" d="M36 68c-7.5 2-12.5 5-15.5 9.5"/><rect class="cuff" x="21.5" y="80.5" width="7" height="7.5" rx="2.6"/><circle class="glove" cx="17.5" cy="81.5" r="9.6"/><circle class="gl-hi" cx="14.6" cy="78.4" r="3"/></g>
            <g class="arm arm-f"><path class="limb" d="M60 68c8 0 14.5 3 18.5 7"/><rect class="cuff" x="70" y="73.5" width="7.5" height="8" rx="2.8"/><circle class="glove" cx="82" cy="77" r="10.6"/><circle class="gl-hi" cx="78.8" cy="73.4" r="3.3"/></g>`,
    up: `<g class="arm arm-b"><path class="limb" d="M37 66c-4-10-6-18-6-26"/><rect class="cuff" x="27.5" y="39" width="7" height="7" rx="2.6"/><circle class="glove" cx="29.5" cy="33" r="9.6"/><circle class="gl-hi" cx="26.8" cy="30" r="3"/></g>
         <g class="arm arm-f"><path class="limb" d="M59 66c4-10 6-18 6-26"/><rect class="cuff" x="61.5" y="39" width="7" height="7" rx="2.6"/><circle class="glove" cx="66.5" cy="33" r="9.6"/><circle class="gl-hi" cx="63.8" cy="30" r="3"/></g>`,
  };
  const BARBELL = `<g class="weights"><rect class="bar" x="10" y="21" width="76" height="6" rx="3"/>
      <rect class="plate" x="4" y="12" width="11" height="24" rx="3.5"/><rect class="plate" x="81" y="12" width="11" height="24" rx="3.5"/>
      <rect class="plate" x="17" y="16" width="7" height="16" rx="2.5"/><rect class="plate" x="72" y="16" width="7" height="16" rx="2.5"/></g>`;
  const STARS = `<g class="stars" transform="translate(48 18)">
      <path class="star" d="M-22-4l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/><path class="star" d="M18-10l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6z"/>
      <path class="star" d="M0-16l1.4 3.6 3.6 1.4-3.6 1.4L0-6l-1.4-3.6-3.6-1.4 3.6-1.4z"/></g>`;
  const CRACKS = `<g class="cracks">
      <g class="ck1"><path d="M48 62l-6 11 4 8-5 9"/><path class="hi" d="M48 62l-6 11 4 8-5 9"/></g>
      <g class="ck2"><path d="M42 73l-11 4M52 81l10-3 6 7"/><path class="hi" d="M42 73l-11 4M52 81l10-3 6 7"/></g>
      <g class="ck3"><path d="M46 90l-9 6M57 55l7-9 9 3M40 55l-8-6"/><path class="hi" d="M46 90l-9 6M57 55l7-9 9 3M40 55l-8-6"/></g>
    </g>`;
  const CLASH = `<svg viewBox="0 0 80 80" aria-hidden="true"><path d="M40 2l7.5 16.5L64 10l-6.5 17.5L76 26l-14 11 14 11-18.5-1.5L64 64l-16.5-8.5L40 72l-7.5-16.5L16 64l6.5-17.5L4 48l14-11L4 26l18.5 1.5L16 10l16.5 8.5z" fill="#ffd24a" stroke="#fff" stroke-width="3" stroke-linejoin="round"/></svg>`;

  function fighter({ kind, glove, mirror = false, pose = "guard", arms = "guard", bar = false, stars = false, dmg = 0, cls = "" }) {
    return `<svg class="fig-svg ${cls}" viewBox="0 0 96 124" aria-hidden="true">
        <g class="fig ${kind} g-${glove}" data-pose="${pose}" data-dmg="${dmg}"${mirror ? ' transform="translate(96 0) scale(-1 1)"' : ""}>
          <g class="fig-bob"><g class="fig-in">
            <ellipse class="sh" cx="48" cy="117" rx="27" ry="4.5"/>
            <path class="pc" d="M18 115h60l-5-12H23z"/><path class="pc" d="M24 103h48l-4-9H28z"/>
            ${BODIES[kind]}${CRACKS}${ARMS[arms]}${bar ? BARBELL : ""}
          </g></g>${stars ? STARS : ""}
        </g>
      </svg>`;
  }
  const ME = { kind: "rook", glove: "green" }, OP = { kind: "bishop", glove: "red", mirror: true };
  const setPose = (el, pose) => { const f = el && el.querySelector(".fig"); if (f) f.dataset.pose = pose; };
  const flash = el => { el.classList.remove("go"); void el.offsetWidth; el.classList.add("go"); };

  const layer = $("iq-layer"), goBtn = $("iq-go"), note = $("iq-note"), vsView = $("iq-found"), clashQ = $("iq-clash-q");
  const figMe = $("iq-fig-me"), figOp = $("iq-fig-op");
  $("iq-fig-search").innerHTML = fighter(ME);
  figMe.innerHTML = fighter(ME); figOp.innerHTML = fighter(OP);
  $("vs-op").innerHTML = fighter(OP);
  const photo = getComputedStyle(document.querySelector(".avatar")).getPropertyValue("--photo");
  if (photo) $("vs-me").style.backgroundImage = photo.trim();
  clashQ.innerHTML = CLASH;
  const restart = (el, cls) => { el.classList.remove(cls); void el.getBoundingClientRect(); el.classList.add(cls); };
  const shakeArena = () => restart(layer, "shake");
  $("pf-av-me").style.backgroundImage = photo ? photo.trim() : "";
  $("pf-av-op").innerHTML = fighter(OP);

  /* ---------- voices: Jamola, you and your opponent ---------- */
  const synth = "speechSynthesis" in window ? window.speechSynthesis : null;
  const VOICE = { host: { pitch: 1.35, rate: 1.02 }, me: { pitch: 1.12, rate: 1.06 }, op: { pitch: .78, rate: .98 } };
  let voice = null;
  const pickVoice = () => {
    const vs = synth ? synth.getVoices().filter(v => /^en[-_]/i.test(v.lang)) : [];
    return vs.find(v => /Samantha|Google US English|Jenny|Aria|Zira/i.test(v.name)) || vs[0] || null;
  };
  if (synth) { voice = pickVoice(); synth.addEventListener("voiceschanged", () => { voice = pickVoice(); }); }
  function speak(text, who, onEnd) {
    if (window.JIA_SETTINGS && window.JIA_SETTINGS.voice === false) { if (onEnd) setTimeout(onEnd, 300); return; }
    if (!synth) { if (onEnd) setTimeout(onEnd, text.length * 55); return; }
    try {
      if (who !== "op") synth.cancel();                        // a reply waits its turn; anything else speaks now
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US"; if (voice) u.voice = voice;
      u.pitch = VOICE[who].pitch; u.rate = VOICE[who].rate;
      if (onEnd) { u.onend = onEnd; u.onerror = onEnd; }
      synth.speak(u);
    } catch (e) { if (onEnd) onEnd(); }
  }

  /* ---------- Jamola hosts: she says how it went ---------- */
  const HOST = { win: window.JIA_MIMG("jamola", "delighted"), draw: window.JIA_MIMG("jamola", "curious"), lose: window.JIA_MIMG("jamola", "concern") };
  window.JIA_HOST = HOST;
  let outcome = "draw";
  function hostSay(text) {
    const el = $("host-say"), av = $("host-av");
    av.classList.add("talking");
    if (reduce) el.textContent = text;
    else {
      let n = 0;
      const type = () => { el.textContent = text.slice(0, ++n); if (n < text.length) later(type, 24); };
      type();
    }
    speak(text, "host", () => av.classList.remove("talking"));
    later(() => av.classList.remove("talking"), Math.max(2600, text.length * 64));
  }
  function showPlayers(myIQ, opIQ, used) {
    outcome = mine > ops ? "win" : mine < ops ? "lose" : "draw";
    $("pf-nm-op").textContent = opName;
    $("pf-sc-me").innerHTML = `${mine} of ${COUNT} in ${Math.round(used)}s${window.JG_GAMES ? "" /* JG-PROD: owner 20 Oct M1 games, a score, never an IQ */ : `<br><i>IQ ${myIQ}</i>`}`;
    $("pf-sc-op").innerHTML = `${ops} of ${COUNT}${window.JG_GAMES ? "" /* JG-PROD: owner 20 Oct M1 games */ : `<br><i>IQ ${opIQ}</i>`}`;
    $("pf-me").classList.toggle("win", outcome === "win");
    $("pf-op").classList.toggle("win", outcome === "lose");
    $("host-av").innerHTML = HOST[outcome];
    $("host-say").textContent = "";
    [$("pf-b-me"), $("pf-b-op")].forEach(b => b.classList.remove("show"));
  }
  function hostLine(myIQ) {
    const first = opName.split(" ")[0];
    if (outcome === "win") return window.JG_GAMES ? `Brilliant! You beat the computer ${mine} to ${ops}.` /* JG-PROD: owner 20 Oct M1 games */ : `Brilliant! You beat ${first} ${mine} to ${ops}. That's IQ ${myIQ} thinking!` + (newBest ? " A new personal best!" : "");
    if (outcome === "lose") return `So close! ${window.JG_GAMES ? "The computer" /* JG-PROD: owner 20 Oct M1 games */ : first} was a little faster this time. Train a bit, then take the rematch!`;
    return `A perfect tie, ${mine} each! Let's settle it with a rematch.`;
  }

  /* ---------- quick messages: tap an emoji, it's said out loud, they answer ---------- */
  const EMOTES = [
    { e: "👏", t: "Good game!" }, { e: "😂", t: "Haha, nice one!" }, { e: "🔥", t: "You're on fire!" },
    { e: "😤", t: "Rematch? Let's go!" }, { e: "🤝", t: "Well played!" }, { e: "😮", t: "Wow, so fast!" },
  ];
  const REPLIES = { win: [0, 3, 4, 5], lose: [1, 4, 0], draw: [3, 4, 0] };   // what the other player tends to say back
  const emoBox = $("emotes");
  emoBox.innerHTML = EMOTES.map((m, i) => `<button class="emo" type="button" data-i="${i}" aria-label="Send: ${m.t}">${m.e}</button>`).join("");
  function message(who, m) {
    const b = $(who === "me" ? "pf-b-me" : "pf-b-op");
    b.innerHTML = `<span class="em">${m.e}</span>${m.t}`;
    restart(b, "show");
    clearTimeout(b._t); b._t = setTimeout(() => b.classList.remove("show"), 2800);
    $("chat-live").textContent = `${who === "me" ? "You" : opName}: ${m.t}`;
    speak(m.t, who);
  }
  emoBox.addEventListener("click", e => {
    const btn = e.target.closest(".emo");
    if (!btn || btn.disabled) return;
    const i = +btn.dataset.i;
    message("me", EMOTES[i]);
    [...emoBox.children].forEach(x => { x.disabled = true; });
    setTimeout(() => [...emoBox.children].forEach(x => { x.disabled = false; }), 1600);
    const pool = REPLIES[outcome].filter(k => k !== i);
    later(() => message("op", EMOTES[pool[Math.floor(Math.random() * pool.length)]]), 1500 + Math.random() * 700);
  });
  const views = { search: $("iq-search"), found: $("iq-found"), quiz: $("iq-quiz"), result: $("iq-result") };
  const bar = $("iq-bar"), barWrap = $("iq-barwrap"), leftEl = $("iq-left"), myEl = $("iq-my"), opEl = $("iq-ops"), optsEl = $("iq-opts");
  let dmgMe = 0, dmgOp = 0;
  function trade(winner) {                                    // wind up, strike, and the struck piece cracks
    const a = winner === "me" ? figMe : figOp, d = winner === "me" ? figOp : figMe;
    const hurt = () => {
      const f = d.querySelector(".fig");
      f.dataset.dmg = winner === "me" ? Math.min(3, ++dmgOp) : Math.min(3, ++dmgMe);
    };
    if (reduce) { hurt(); return; }
    setPose(a, "wind");                                       // pull back first
    later(() => {
      setPose(a, "punch"); setPose(d, "hit");                 // then the strike lands
      flash(clashQ); shakeArena(); hurt();
    }, 160);
    later(() => { setPose(a, "guard"); setPose(d, "guard"); }, 640);
  }
  let timers = [], raf = 0, best = parseInt(document.querySelector(".iq").dataset.best, 10) || 0, lastFocus = null, newBest = false;
  let qs = [], step = 0, mine = 0, ops = 0, opDone = 0, endAt = 0, playing = false, opName = "";

  const later = (fn, ms) => { timers.push(setTimeout(fn, ms)); };
  const clearAll = () => {
    timers.forEach(clearTimeout); timers = []; cancelAnimationFrame(raf); raf = 0; playing = false;
    if ("speechSynthesis" in window) speechSynthesis.cancel();
  };
  const show = name => { Object.entries(views).forEach(([k, v]) => { v.hidden = k !== name; }); };
  const pop = el => { el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop"); };
  const mmss = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  /* ---------- looking for an opponent ---------- */
  function search() {
    show("search");
    if (window.JG_GAMES) $("iq-h").textContent = "Your opponent: the computer"; $("iq-search-sub").textContent = window.JG_GAMES ? "10 puzzles in 45 seconds" : "Matching you with someone at your level";   /* JG-PROD: owner 20 Oct M1 games, nobody is being matched */
    const t0 = Date.now();
    const tick = () => {
      const s = (Date.now() - t0) / 1000;
      $("iq-clock").textContent = mmss(s);
      if (s > 4 && !window.JG_GAMES /* JG-PROD: owner 20 Oct M1 games */) $("iq-search-sub").textContent = "Still looking. Hang on…";
      raf = requestAnimationFrame(tick);
    };
    tick();
    $("iq-cancel").focus({ preventScroll: true });
    later(found, reduce ? 800 : 2600 + Math.random() * 3800);
  }
  function found() {
    cancelAnimationFrame(raf); raf = 0;
    opName = NAMES[Math.floor(Math.random() * NAMES.length)];
    $("iq-op-name").textContent = opName;
    $("vs-op-iq").textContent = window.JG_GAMES ? "" /* JG-PROD: owner 20 Oct M1 games, no invented IQ */ : `IQ ${102 + Math.floor(Math.random() * 26)}`;
    $("vs-me-iq").textContent = best ? (window.JG_GAMES ? `Best: ${best} of ${COUNT}` /* JG-PROD: owner 20 Oct M1 games */ : `IQ ${best}`) : "First battle";
    show("found");
    restart(vsView, "slam");                                  // VS slams in between the two profiles
    later(shakeArena, 320);
    if (reduce) { later(start, 500); return; }
    let n = 3;
    const el = $("iq-count");
    el.textContent = n; pop(el);
    const beat = () => {
      n -= 1;
      if (n === 0) return start();
      el.textContent = n; el.classList.remove("tick"); void el.offsetWidth; el.classList.add("tick");
      later(beat, 750);
    };
    later(beat, 750);
  }

  /* ---------- the round ---------- */
  function start() {
    qs = [...POOL].sort(() => Math.random() - .5).slice(0, COUNT);
    step = 0; mine = 0; ops = 0; opDone = 0;
    myEl.textContent = "0"; opEl.textContent = "0";
    endAt = performance.now() + ROUND * 1000;
    playing = true;
    dmgMe = 0; dmgOp = 0;
    [figMe, figOp].forEach(f => { setPose(f, "guard"); f.querySelector(".fig").dataset.dmg = 0; });
    show("quiz");
    render();
    tick();
    opponentTurn();
  }
  function tick() {
    const left = Math.max(0, (endAt - performance.now()) / 1000);
    leftEl.textContent = Math.ceil(left);
    bar.style.width = `${(left / ROUND * 100).toFixed(1)}%`;
    barWrap.classList.toggle("low", left <= 10);
    if (left <= 0) return finish();
    raf = requestAnimationFrame(tick);
  }
  function opponentTurn() {
    if (!playing || opDone >= COUNT) return;
    later(() => {
      if (!playing) return;
      opDone++;
      if (Math.random() < OP_SKILL) { ops++; opEl.textContent = ops; pop(opEl); trade("op"); }
      opponentTurn();
    }, 2300 + Math.random() * 2300);
  }
  function render() {
    const q = qs[step];
    $("iq-qn").textContent = `Question ${step + 1} of ${COUNT}`;
    $("iq-q").textContent = q.q;
    optsEl.innerHTML = q.a.map((t, i) => `<button class="iq-opt" type="button" data-i="${i}">${t}</button>`).join("");
    [...optsEl.children].forEach(b => b.addEventListener("click", () => answer(+b.dataset.i, b)));
  }
  function answer(i, btn) {
    if (!playing) return;
    const q = qs[step];
    [...optsEl.children].forEach(b => { b.disabled = true; });
    btn.classList.add(i === q.c ? "right" : "wrong");
    if (i !== q.c) optsEl.children[q.c].classList.add("right");
    if (i === q.c) { mine++; myEl.textContent = mine; pop(myEl); trade("me"); }
    later(() => {
      if (!playing) return;
      step++;
      if (step >= COUNT) return finish();
      render();
    }, reduce ? 150 : 520);
  }
  function finish() {
    if (!playing) return;
    const left = Math.max(0, (endAt - performance.now()) / 1000);
    clearAll();
    // the opponent keeps answering for as long as the clock would have allowed
    const couldStill = Math.round(left / 3.4);
    for (let k = 0; k < Math.min(COUNT - opDone, couldStill); k++) { opDone++; if (Math.random() < OP_SKILL) ops++; }
    opEl.textContent = ops;
    const used = clamp(ROUND - left, 1, ROUND);
    const myIQ = window.JG_GAMES ? mine /* JG-PROD: owner 20 Oct M1 games: her score is her right answers, never an "IQ" from a 45-second round */ : clamp(Math.round(82 + mine * 4.4 + (1 - used / ROUND) * 11), 78, 148);
    const opIQ = window.JG_GAMES ? ops /* JG-PROD: owner 20 Oct M1 games */ : clamp(Math.round(82 + ops * 4.4 + 5), 78, 148);
    const iWon = mine > ops;
    $("iq-art").innerHTML = iWon
      ? fighter({ ...ME, arms: "up", bar: true, cls: "lift" }) + fighter({ ...OP, pose: "down", stars: true, dmg: 3, cls: "flat" })
      : fighter({ ...ME, pose: "down", stars: true, dmg: 3, cls: "flat" }) + fighter({ ...OP, arms: "up", bar: true, cls: "lift" });
    const v = $("iq-verdict");
    v.className = "iq-verdict " + (mine > ops ? "win" : mine < ops ? "lose" : "");
    v.textContent = mine > ops ? "You won" : mine < ops ? "You lost" : "It's a draw";
    $("iq-value").textContent = window.JG_GAMES ? `${myIQ} of ${COUNT}` : myIQ;   /* JG-PROD: owner 20 Oct M1 games, "Your score 8 of 10" */
    showPlayers(myIQ, opIQ, used);
    newBest = myIQ > best;
    if (newBest) { prevBest = best; best = myIQ; showBest(); }
    show("result");
    $("iq-again").focus({ preventScroll: true });
    later(() => hostSay(hostLine(myIQ)), reduce ? 0 : 1000);   // Jamola talks about the match
  }

  /* ---------- opening and closing ---------- */
  function open() {
    clearAll();
    lastFocus = document.activeElement;
    layer.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => layer.classList.add("open")));
    document.addEventListener("keydown", onKey);
    search();
  }
  function close() {
    if (layer.hidden) return;
    clearAll();
    layer.classList.remove("open");
    document.removeEventListener("keydown", onKey);
    setTimeout(() => { layer.hidden = true; }, reduce ? 0 : 320);
    const record = newBest; newBest = false;                    // back out of the well; a new record counts up in gold
    setTimeout(() => riseOut(record ? prevBest : best, record), reduce ? 0 : 380);
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }
  function onKey(e) {
    if (e.key === "Escape") { e.preventDefault(); close(); }
  }
  // the best score stands in a well: it rises out counting from 0, sinks when pressed, drops in to start
  const well = $("iq-well"), bestEl = $("iq-best");
  let countRaf = 0, isDown = false, actx = null, prevBest = best;
  function tone(from, to, dur, vol) {                        // a small wooden clack or a plop
    try {
      if (window.JIA_SETTINGS && window.JIA_SETTINGS.sounds === false) return;
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const t = actx.currentTime, o = actx.createOscillator(), g = actx.createGain();
      o.type = "triangle";
      o.frequency.setValueAtTime(from, t); o.frequency.exponentialRampToValueAtTime(to, t + dur * .75);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .005); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(g).connect(actx.destination); o.start(t); o.stop(t + dur + .03);
    } catch (e) {}
  }
  function showBest() {
    goBtn.setAttribute("aria-label", best ? (window.JG_GAMES ? `Play IQ battle. Your best score is ${best} of ${COUNT}.` /* JG-PROD: owner 20 Oct M1 games */ : `Play IQ battle. Your best IQ is ${best}.`) : "Play IQ battle");
  }
  function countTo(target, from, dur) {
    cancelAnimationFrame(countRaf);
    if (reduce || !target) { bestEl.textContent = target || "–"; return; }
    const t0 = performance.now();
    const step = now => {
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      bestEl.textContent = Math.round(from + (target - from) * e);
      if (k < 1) countRaf = requestAnimationFrame(step);
    };
    bestEl.textContent = from; countRaf = requestAnimationFrame(step);
  }
  function riseOut(from, gold) {                              // up out of the well, counting
    well.classList.remove("dive", "rise", "down", "gold");
    void well.offsetWidth;
    if (!reduce) well.classList.add("rise");
    if (gold) { well.classList.add("gold"); setTimeout(() => well.classList.remove("gold"), 1900); }
    countTo(best, from, gold ? 1100 : 1400);
  }
  well.addEventListener("animationend", e => { if (e.animationName === "numRise") well.classList.remove("rise"); });
  showBest();
  bestEl.textContent = reduce ? best : 0;
  // every time the Today page opens, the score climbs out of the well from 0
  const todayPage = document.getElementById("tv-today");
  let todayShown = false;
  new MutationObserver(() => {
    const on = todayPage.classList.contains("show");
    if (on && !todayShown) setTimeout(() => riseOut(0, false), 250);
    todayShown = on;
  }).observe(todayPage, { attributes: true, attributeFilter: ["class"] });
  function setDown(v) {
    if (v === isDown) return;
    isDown = v; well.classList.toggle("down", v);
    tone(v ? 230 : 460, v ? 70 : 190, v ? .12 : .08, v ? .28 : .14);
  }
  goBtn.addEventListener("pointerdown", e => { if (e.button === 0) setDown(true); });
  ["pointerup", "pointercancel", "pointerleave"].forEach(t => goBtn.addEventListener(t, () => setDown(false)));
  goBtn.addEventListener("keydown", e => { if ((e.key === " " || e.key === "Enter") && !e.repeat) setDown(true); });
  goBtn.addEventListener("keyup", e => { if (e.key === " " || e.key === "Enter") setDown(false); });
  goBtn.addEventListener("click", () => {                     // a little hop, then it drops into the well
    if (isDown) setDown(false);
    if (reduce) return open();
    well.classList.remove("rise", "down"); void well.offsetWidth; well.classList.add("dive");
    setTimeout(() => tone(260, 48, .22, .32), 300);
    setTimeout(open, 600);
  });
  $("iq-cancel").addEventListener("click", close);
  $("iq-close").addEventListener("click", close);
  $("iq-again").addEventListener("click", () => { clearAll(); search(); });
})();
