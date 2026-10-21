
(() => {
  "use strict";

  /* ==========================================================
     MINI GAMES — chess, checkers (Russian rules), the IQ battle
     and the team game. Chess and checkers play full screen
     against a rated opponent, with clocks, ranks and results.
     Chess pieces: Cburnett, CC BY-SA 3.0 (Wikimedia Commons).
     ========================================================== */
  const $ = id => document.getElementById(id);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const z = () => String(window.JIA_z ? window.JIA_z() : 64);
  const PEOPLE = () => window.JIA_PEOPLE || {}, AVS = () => window.JIA_AV || {};
  const photo = () => (getComputedStyle(document.querySelector(".avatar")).getPropertyValue("--photo") || "").trim().replace(/"/g, "'");
  const notify = x => { if (window.JIA_notify) window.JIA_notify(x); };
  const IMG = () => window.JIA_IMG || {};
  const PIECES = {"wp": "/d/student-mobile/media/d8095521fbe9005a.svg", "wb": "/d/student-mobile/media/fec4656d60db339d.svg", "wq": "/d/student-mobile/media/425c9d02363e5b89.svg", "bn": "/d/student-mobile/media/a758910b2b01c0a8.svg", "bk": "/d/student-mobile/media/67279b3236dd5303.svg", "bq": "/d/student-mobile/media/dabe25fec05c8645.svg", "bb": "/d/student-mobile/media/adac333de5346e5b.svg", "br": "/d/student-mobile/media/d8c430cdbd428259.svg", "wr": "/d/student-mobile/media/52ba9654ba4382ee.svg", "wk": "/d/student-mobile/media/65d45349b79bd99a.svg", "bp": "/d/student-mobile/media/ba4ef0fb28273d96.svg", "wn": "/d/student-mobile/media/083eef57035b3b57.svg"};
  const ART = { knight: "/d/student-mobile/media/47dec9b03e82cb17.webp", checkers: "/d/student-mobile/media/53963bc6e0126ffc.webp", buzzers: "/d/student-mobile/media/026b5f480edf81ad.webp", scale: "/d/student-mobile/media/5accc426dbfb6df3.webp", calc: "/d/student-mobile/media/dcbbd2b5ce6efd8f.webp" };


  // sounds, made on the fly (they follow Settings)
  let actx = null;
  function tone(f, d, type, vol, when) {
    if (window.JIA_SETTINGS && window.JIA_SETTINGS.sounds === false) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const t = actx.currentTime + (when || 0), o = actx.createOscillator(), g = actx.createGain();
      o.type = type || "sine"; o.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(vol || .08, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
      o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + d + .02);
    } catch (e) {}
  }
  const SND = {
    move: () => { tone(330, .06, "triangle", .09); tone(160, .08, "sine", .07, .01); },
    capture: () => { tone(520, .05, "square", .05); tone(240, .12, "triangle", .1, .02); },
    check: () => { tone(880, .09, "sawtooth", .04); tone(660, .12, "sawtooth", .035, .08); },
    win: () => [523, 659, 784, 1046].forEach((f, k) => tone(f, .22, "triangle", .07, k * .12)),
    lose: () => [392, 330, 262].forEach((f, k) => tone(f, .28, "sine", .07, k * .16)),
    tick: () => tone(1200, .03, "square", .02),
    pop: () => tone(740, .07, "sine", .07),
  };

  // ratings and ranks
  const RANKS = [[0, "Bronze", "#c9895b"], [1000, "Silver", "#98a6b3"], [1200, "Gold", "#d9a43a"], [1400, "Platinum", "#4fa3c7"], [1600, "Diamond", "#8b6bd6"], [1800, "Master", "#c94b5f"]];
  const rankOf = r => { let k = 0; RANKS.forEach((x, i) => { if (r >= x[0]) k = i; }); const x = RANKS[k], nx = RANKS[k + 1]; const tier = nx ? ["III", "II", "I"][Math.min(2, Math.floor((r - x[0]) / ((nx[0] - x[0]) / 3)))] : ""; return { name: `${x[1]}${tier ? " " + tier : ""}`, color: x[2] }; };
  const rankChip = r => { const k = rankOf(r); return `<span class="gm-rank" style="--rk:${k.color}"><i></i>${k.name}</span>`; };
  const ME = window.JG_GAMES ? window.JG_GAMES.me : { chess: 1350, checkers: 1280, iq: 124, coins: 0 };   /* JG-PROD: owner 20 Oct M1 games, a real student's rating is her own, 0 until the server rates her (GAMES_SERVER), never the design's 1350 */
  const POOL = window.JG_GAMES ? window.JG_GAMES.bots /* JG-PROD: owner 20 Oct M1 games, her opponent is the computer and is named so, never a classmate */ : [["asadbek", 1420], ["dilnoza", 1310], ["timur", 1180], ["sardor", 1365], ["jasur", 1240], ["nilufar", 1290], ["madina", 1210], ["laylo", 1150]];

  /* ---------- the hub ---------- */
  const hub = $("gh-view");
  function paintHub() {                                         // three shelves: board, brain and party games
    const PA = window.JIA_PARTY_ART || {}, img = src => src ? `<img class="obj" src="${src}" alt="">` : "", NEW = `<span class="gh-r gh-new">New</span>`;
    const SECTIONS = [
      ["Board games", [
        { k: "chess", t: "Chess", s: "Rated · 10 min", art: img(ART.knight), foot: `<span class="gh-r">${window.JG_GAMES && !ME.chess ? "Practice" /* JG-PROD: owner 20 Oct M1 games, no rating that nothing saved */ : `${ME.chess} ${rankChip(ME.chess)}`}</span>` },
        { k: "checkers", t: "Checkers", s: "Russian rules · 5 min", art: img(ART.checkers), foot: `<span class="gh-r">${window.JG_GAMES && !ME.checkers ? "Practice" /* JG-PROD: owner 20 Oct M1 games, no rating that nothing saved */ : `${ME.checkers} ${rankChip(ME.checkers)}`}</span>` }]],
      ["Party games", [
        { k: "team", t: "Team game", s: "Girls vs Boys · 6 players", art: img(ART.buzzers), foot: NEW },
        { k: "halal", t: "Team game", s: "Girls vs Boys · everyone is equal", art: img(ART.scale), foot: `<span class="gh-r"><span class="gh-tag-halal">⚖️ Halal version</span></span>` },
        { k: "math", t: "Math battle", s: "Roulette, gifts and time inflation", art: img(ART.calc), foot: NEW },
        { k: "mathh", t: "Math battle", s: "Same tricks, but luck picks the side", art: `${img(ART.calc)}<img class="b2" src="${ART.scale}" alt="">`, foot: `<span class="gh-r"><span class="gh-tag-halal">⚖️ Halal version</span></span>` }]],
    ];
    if (window.JG_HUB) window.JG_HUB(SECTIONS); if (window.JG_GAMES) window.JG_GAMES.hub(SECTIONS); /* JG-PROD: owner 20 Oct M1 games: no classic team game, Math battle or Mafia for a real student; the computer named (public/runtime/jg-games.js) */ $("gh-grid").innerHTML = SECTIONS.map(([h, list]) => `<h3 class="gh-sec">${h}</h3>` + list.map(c => `<button class="gh-card gh-${c.k}${c.wide ? " wide" : ""}" type="button" data-g="${c.k}"><span class="gh-art" aria-hidden="true">${c.art}</span><b>${c.t}</b><small>${c.s}</small>${c.foot}</button>`).join("")).join("");
  }
  function openHub() { paintHub(); hub.style.zIndex = z(); hub.hidden = false; setTimeout(() => $("gh-back").focus({ preventScroll: true }), 60); }
  window.JIA_openGames = openHub;
  $("gh-back").addEventListener("click", () => { hub.hidden = true; });
  $("gh-grid").addEventListener("click", e => {
    const b = e.target.closest("[data-g]"); if (!b) return;
    const g = b.dataset.g;
    if ((window.JG_GAMES && window.JG_GAMES.go(g)) || (window.JG_HUB_GO && window.JG_HUB_GO(g))) return;   /* JG-PROD: owner 20 Oct M1 games, JG Daily without invented percentages, discussion or XP (jg-games.js) */
    if (g === "chess" || g === "checkers") startGame(g);
    else if (g === "iq") { hub.hidden = true; const L = $("iq-layer"); if (L) L.style.zIndex = z(); const go = $("iq-go"); if (go) go.click(); }
    else if (g === "team" && window.JIA_openTeam) window.JIA_openTeam();
    else if (g === "halal" && window.JIA_openTeam) window.JIA_openTeam("halal");
    else if (g === "math" && window.JIA_openTeam) window.JIA_openTeam("math");
    else if (g === "mathh" && window.JIA_openTeam) window.JIA_openTeam("mathh");
    else if (window.JIA_party) window.JIA_party.open(g);
  });
  const todayCard = $("mg-card"); if (todayCard) todayCard.addEventListener("click", openHub);
  if ($("mg-art")) $("mg-art").innerHTML = `<i class="mg-o k"><img src="${ART.knight}" alt=""></i><i class="mg-o c"><img src="${ART.checkers}" alt=""></i><i class="mg-o br"><img src="${ART.calc}" alt=""></i><i class="mg-o bz"><img src="${ART.buzzers}" alt=""></i>`;

  // the IQ battle shows both ranks on its VS screen
  const found = $("iq-found");
  if (found) new MutationObserver(() => {
    if (found.hidden || window.JG_GAMES) return;   /* JG-PROD: owner 20 Oct M1 games, no IQ number and no rank on the VS screen */
    found.querySelectorAll(".gm-vsrank").forEach(x => x.remove());
    const opName = ($("iq-op-name") || {}).textContent || "Opponent", opIq = 108 + (opName.length * 7) % 30;
    found.insertAdjacentHTML("beforeend", `<span class="gm-vsrank l">IQ ${ME.iq} ${rankChip(ME.iq * 10)}</span><span class="gm-vsrank r">IQ ${opIq} ${rankChip(opIq * 10)}</span>`);
  }).observe(found, { attributes: true, attributeFilter: ["hidden"] });

  /* ---------- one screen for both board games ---------- */
  const view = $("gp-view"), boardEl = $("gp-board");
  let G = null;                                                // the running game
  const clockTxt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  function playerCard(el, who, rating, side) {
    const me = who === "me", p = PEOPLE()[who] || {};
    el.innerHTML = `<span class="gp-av"${me ? ` style="background-image:${photo()}"` : ""}>${me ? "" : `<img src="${AVS()[who]}" alt="">`}<i class="gp-dot"></i></span>
      <span class="gp-id"><b>${me ? JG_ME.fullName /* JG-PROD: identity */ : esc(p.name || who)} ${me || !window.JG_GAMES ? "<em>🇺🇿</em>" : "" /* JG-PROD: owner 20 Oct M1 games: the computer has no flag and no rating, hers only when the server rates her */}</b><span class="gp-sub">${window.JG_GAMES && !(me && rating) ? (me ? "Practice" : "") : `${rating} ${rankChip(rating)}`}</span><span class="gp-caps" id="gp-caps-${side}"></span></span>
      <span class="gp-clock" id="gp-clock-${side}">${clockTxt(G.time[side])}</span>`;
  }
  function startGame(kind) {
    hub.hidden = true;
    const [who, r] = POOL[Math.floor(Math.random() * POOL.length)];
    G = { kind, op: who, opR: r, myR: ME[kind], time: { me: kind === "chess" ? 600 : 300, op: kind === "chess" ? 600 : 300 }, turn: "me", over: false, timer: 0, moves: [] };
    const game = G;
    view.className = `gm-layer gp-view gp-${kind}`;
    $("gp-title").textContent = kind === "chess" ? "Chess" : "Checkers";
    $("gp-mode").textContent = window.JG_GAMES ? window.JG_GAMES.mode(kind) /* JG-PROD: owner 20 Oct M1 games, "vs Computer" */ : kind === "chess" ? "Rated · 10 min" : "Rated · 5 min · Russian rules";
    $("gp-over").hidden = true; $("gp-promo").hidden = true;
    view.style.zIndex = z(); view.hidden = false;
    // find an opponent, like the big apps do
    const f = $("gp-find"); f.hidden = false; f.classList.remove("done");
    $("gp-find-t").textContent = window.JG_GAMES ? "You play the computer" : "Finding an opponent…";   /* JG-PROD: owner 20 Oct M1 games, nobody is being found */
    const faces = POOL.map(p => AVS()[p[0]]).filter(Boolean);
    let k = 0; const spin = setInterval(() => { $("gp-find-av").src = faces[k++ % faces.length]; }, 120);
    setTimeout(() => {
      clearInterval(spin); $("gp-find-av").src = AVS()[who];
      $("gp-find-t").innerHTML = window.JG_GAMES ? `<b>${esc(PEOPLE()[who].name)}</b>` /* JG-PROD: owner 20 Oct M1 games */ : `<b>${esc(PEOPLE()[who].name)}</b> · ${r} ${rankChip(r)}`; f.classList.add("done"); SND.pop();
      setTimeout(() => { f.hidden = true; if (G === game && !view.hidden) begin(); }, reduce ? 300 : 1300);
    }, reduce ? 200 : 1600);
    playerCard($("gp-op"), who, r, "op"); playerCard($("gp-me"), "me", G.myR, "me");
    (kind === "chess" ? CH : DR).setup();
  }
  function begin() {
    clearInterval(G.timer);
    G.timer = setInterval(() => {
      if (G.over) return;
      const s = G.turn; G.time[s] = Math.max(0, G.time[s] - .1);
      const el = $(`gp-clock-${s}`); if (el) el.textContent = clockTxt(G.time[s]);
      if (G.time[s] <= 0) finish(s === "me" ? "lose" : "win", "on time");
    }, 100);
    paintTurn();
  }
  function paintTurn() {
    $("gp-me").classList.toggle("on", G.turn === "me" && !G.over); $("gp-op").classList.toggle("on", G.turn === "op" && !G.over);
    $("gp-op").classList.toggle("thinking", G.turn === "op" && !G.over);
  }
  function logMove(txt) { G.moves.push(txt); const n = G.moves.length; $("gp-moves").innerHTML = G.moves.map((m, i) => `${i % 2 === 0 ? `<em>${i / 2 + 1}.</em>` : ""}<span${i === n - 1 ? ' class="last"' : ""}>${esc(m)}</span>`).join(""); $("gp-moves").scrollLeft = 9999; }
  function finish(res, why) {
    if (G.over) return;
    G.over = true; clearInterval(G.timer); paintTurn();
    const d = res === "win" ? 8 + Math.round(Math.max(0, G.opR - G.myR) / 25) : res === "lose" ? -(6 + Math.round(Math.max(0, G.myR - G.opR) / 25)) : 0;
    const before = ME[G.kind]; if (!window.JG_GAMES) ME[G.kind] += d;   /* JG-PROD: owner 20 Oct M1 games, her rating moves only on the server */
    const o = $("gp-over");
    o.className = `gp-over ${res}`;
    $("gp-over-t").textContent = res === "win" ? "You won!" : res === "lose" ? "You lost" : "Draw";
    $("gp-over-why").textContent = why;
    $("gp-over-r").innerHTML = window.JG_GAMES ? '<span id="gp-over-n" hidden></span>' /* JG-PROD: owner 20 Oct M1 games: the server's rating, when it rates (jg-games.js done) */ : `<span id="gp-over-n">${before}</span> <b class="${d >= 0 ? "up" : "down"}">${d >= 0 ? "+" : ""}${d}</b> ${rankChip(ME[G.kind])}`;
    $("gp-over-c").textContent = window.JG_GAMES ? window.JG_GAMES.done(G, res, why, rankChip) /* JG-PROD: owner 20 Oct M1 games: pays what it says, through the server */ : res === "win" ? "+20 coins" : res === "draw" ? "+5 coins" : "";
    o.hidden = false;
    (res === "win" ? SND.win : res === "lose" ? SND.lose : SND.pop)();
    const t0 = performance.now(), dur = reduce ? 1 : 900;
    const step = now => { const p = Math.min(1, (now - t0) / dur); $("gp-over-n").textContent = Math.round(before + d * p); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
    if (res === "win" && !reduce) confetti($("gp-over"));
    if (res === "win" && !window.JG_GAMES /* JG-PROD: owner 20 Oct M1 games, no invented rating in the note */) notify({ icon: G.kind === "chess" ? PIECES.wn : ART.checkers, text: `<b>You beat ${esc(PEOPLE()[G.op].name)}</b> at ${G.kind === "chess" ? "chess" : "checkers"}. Rating ${ME[G.kind]} (+${d})` });
    if (rankOf(before).name !== rankOf(ME[G.kind]).name && d > 0) setTimeout(() => { $("gp-over-why").textContent = `Promoted to ${rankOf(ME[G.kind]).name}! 🎉`; }, dur + 100);
  }
  function confetti(host) {
    const cols = ["#f5c542", "#66c69a", "#ef6c57", "#4fa3c7", "#d9467c", "#fff"];
    for (let i = 0; i < 70; i++) {
      const c = document.createElement("i"); c.className = "gm-conf";
      c.style.cssText = `left:${Math.random() * 100}%;background:${cols[i % cols.length]};--dx:${(Math.random() - .5) * 160}px;--r:${Math.random() * 720}deg;animation-delay:${Math.random() * .5}s;animation-duration:${1.8 + Math.random() * 1.4}s`;
      host.appendChild(c); setTimeout(() => c.remove(), 3600);
    }
  }
  // an in-app question instead of confirm(), which embedded pages can block
  const askEl = $("gp-ask"); let askYes = null, askFrom = null;
  function ask(text, yes, onYes, from) {
    $("gp-ask-t").textContent = text; $("gp-ask-yes").textContent = yes;
    askYes = onYes; askFrom = from || null; askEl.hidden = false;
    $("gp-ask-no").focus({ preventScroll: true });
  }
  function closeAsk(ok) {
    if (askEl.hidden) return;
    askEl.hidden = true; const fn = askYes, from = askFrom; askYes = null; askFrom = null;
    if (ok && fn) fn();
    if (from && !from.closest("[hidden]")) from.focus({ preventScroll: true });
  }
  $("gp-ask-no").addEventListener("click", () => closeAsk(false));
  $("gp-ask-yes").addEventListener("click", () => closeAsk(true));
  askEl.addEventListener("click", e => { if (e.target === askEl) closeAsk(false); });            // tapping the backdrop cancels
  document.addEventListener("keydown", e => {
    if (askEl.hidden) return;
    if (e.key === "Escape") { e.preventDefault(); e.stopImmediatePropagation(); closeAsk(false); }
    else if (e.key === "Tab") { const f = [$("gp-ask-no"), $("gp-ask-yes")]; e.preventDefault(); f[(f.indexOf(document.activeElement) + 1) % 2].focus(); }
  }, true);
  function leaveGame() { clearInterval(G && G.timer); view.hidden = true; openHub(); }
  $("gp-back").addEventListener("click", e => {
    if (G && !G.over && G.moves.length) ask("Leave the game? It counts as a loss.", "Leave", () => { finish("lose", "left the game"); leaveGame(); }, e.currentTarget);
    else leaveGame();
  });
  $("gp-resign").addEventListener("click", e => { if (G && !G.over) ask("Resign this game?", "Resign", () => { if (G && !G.over) finish("lose", "by resignation"); }, e.currentTarget); });
  $("gp-draw").addEventListener("click", () => {
    if (!G || G.over) return;
    const accept = (G.kind === "chess" ? CH.evalForOp() : DR.evalForOp()) < -60;
    toastG(accept ? `${PEOPLE()[G.op].name.split(" ")[0]} accepted the draw` : `${PEOPLE()[G.op].name.split(" ")[0]} declined the draw`);
    if (accept) setTimeout(() => finish("draw", "by agreement"), 600);
  });
  $("gp-hint").addEventListener("click", () => { if (G && !G.over && G.turn === "me") (G.kind === "chess" ? CH : DR).hint(); });
  $("gp-again").addEventListener("click", () => startGame(G.kind));
  $("gp-exit").addEventListener("click", () => { view.hidden = true; openHub(); });
  let toastT = 0;
  function toastG(msg) { const t = $("gp-toast"); t.textContent = msg; t.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("on"), 2200); }
  const sqName = (r, c) => "abcdefgh"[c] + (8 - r);
  function buildBoard(dark) {
    boardEl.innerHTML = Array.from({ length: 64 }, (_, i) => { const r = i >> 3, c = i & 7, d = (r + c) % 2 === 1;
      return `<div class="sq ${d ? "d" : "l"}" data-i="${i}">${c === 0 ? `<span class="co r">${8 - r}</span>` : ""}${r === 7 ? `<span class="co f">${"abcdefgh"[c]}</span>` : ""}</div>`; }).join("");
  }
  const SQ = i => boardEl.children[i];
  function flip(pieceEl, fromI) {                              // slide a piece from its old square
    if (reduce || fromI == null) return;
    const a = SQ(fromI).getBoundingClientRect(), b = pieceEl.parentElement.getBoundingClientRect();
    pieceEl.animate([{ transform: `translate(${a.left - b.left}px, ${a.top - b.top}px)` }, { transform: "none" }], { duration: 220, easing: "cubic-bezier(.2,.8,.2,1)" });
  }

  /* ---------- chess (rules by chess.js; the opponent searches ahead) ---------- */
  const PV = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };
  const PST = {
    p: [0,0,0,0,0,0,0,0, 50,50,50,50,50,50,50,50, 10,10,20,30,30,20,10,10, 5,5,10,25,25,10,5,5, 0,0,0,20,20,0,0,0, 5,-5,-10,0,0,-10,-5,5, 5,10,10,-20,-20,10,10,5, 0,0,0,0,0,0,0,0],
    n: [-50,-40,-30,-30,-30,-30,-40,-50, -40,-20,0,0,0,0,-20,-40, -30,0,10,15,15,10,0,-30, -30,5,15,20,20,15,5,-30, -30,0,15,20,20,15,0,-30, -30,5,10,15,15,10,5,-30, -40,-20,0,5,5,0,-20,-40, -50,-40,-30,-30,-30,-30,-40,-50],
    b: [-20,-10,-10,-10,-10,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,10,10,5,0,-10, -10,5,5,10,10,5,5,-10, -10,0,10,10,10,10,0,-10, -10,10,10,10,10,10,10,-10, -10,5,0,0,0,0,5,-10, -20,-10,-10,-10,-10,-10,-10,-20],
    r: [0,0,0,0,0,0,0,0, 5,10,10,10,10,10,10,5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, 0,0,0,5,5,0,0,0],
    q: [-20,-10,-10,-5,-5,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,5,5,5,0,-10, -5,0,5,5,5,5,0,-5, 0,0,5,5,5,5,0,-5, -10,5,5,5,5,5,0,-10, -10,0,5,0,0,0,0,-10, -20,-10,-10,-5,-5,-10,-10,-20],
    k: [-30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -20,-30,-30,-40,-40,-30,-30,-20, -10,-20,-20,-20,-20,-20,-20,-10, 20,20,0,0,0,0,20,20, 20,30,10,0,0,10,30,20],
  };
  const idxOf = sq => (8 - +sq[1]) * 8 + "abcdefgh".indexOf(sq[0]);
  const CH = (() => {
    let g = null, sel = null, targets = [], last = null, drag = null;
    function evalW() {
      let s = 0; const bd = g.board();
      for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) { const p = bd[r][c]; if (!p) continue;
        const v = PV[p.type] + PST[p.type][p.color === "w" ? r * 8 + c : (7 - r) * 8 + c]; s += p.color === "w" ? v : -v; }
      return s;
    }
    const order = ms => ms.sort((a, b) => (b.captured ? PV[b.captured] * 10 - PV[b.piece] + 1000 : 0) + (b.promotion ? 800 : 0) - (a.captured ? PV[a.captured] * 10 - PV[a.piece] + 1000 : 0) - (a.promotion ? 800 : 0));
    function qs(alpha, beta, color, d) {
      const stand = color * evalW(); if (d === 0 || stand >= beta) return stand; if (stand > alpha) alpha = stand;
      for (const m of order(g.moves({ verbose: true }).filter(x => x.captured))) { g.move(m); const v = -qs(-beta, -alpha, -color, d - 1); g.undo(); if (v >= beta) return v; if (v > alpha) alpha = v; }
      return alpha;
    }
    function negamax(depth, alpha, beta, color) {
      if (depth === 0) return qs(alpha, beta, color, 2);
      const ms = order(g.moves({ verbose: true }));
      if (!ms.length) return g.in_check() ? -100000 - depth : 0;
      let best = -Infinity;
      for (const m of ms) { g.move(m); const v = -negamax(depth - 1, -beta, -alpha, -color); g.undo(); if (v > best) best = v; if (v > alpha) alpha = v; if (alpha >= beta) break; }
      return best;
    }
    function bestMove(col, depth, noise) {
      const color = col === "w" ? 1 : -1; let bm = null, bv = -Infinity;
      for (const m of order(g.moves({ verbose: true }))) { g.move(m); const v = -negamax(depth - 1, -Infinity, Infinity, -color) + (Math.random() - .5) * noise; g.undo(); if (v > bv) { bv = v; bm = m; } }
      return bm;
    }
    function findKing(col) { const bd = g.board(); for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) { const p = bd[r][c]; if (p && p.type === "k" && p.color === col) return r * 8 + c; } return null; }
    function caps() {
      const START = { q: 1, r: 2, b: 2, n: 2, p: 8 }, have = { w: { q: 0, r: 0, b: 0, n: 0, p: 0 }, b: { q: 0, r: 0, b: 0, n: 0, p: 0 } };
      g.board().forEach(row => row.forEach(p => { if (p && p.type !== "k") have[p.color][p.type]++; }));
      const lost = col => Object.keys(START).flatMap(t => Array(Math.max(0, START[t] - have[col][t])).fill(t));
      const mat = col => Object.keys(START).reduce((a, t) => a + have[col][t] * PV[t], 0), diff = Math.round((mat("w") - mat("b")) / 100);
      const row = (col, plus) => lost(col).map(t => `<img src="${PIECES[col + t]}" alt="">`).join("") + (plus > 0 ? `<em>+${plus}</em>` : "");
      $("gp-caps-me").innerHTML = row("b", diff); $("gp-caps-op").innerHTML = row("w", -diff);
    }
    function render(anim) {
      for (let i = 0; i < 64; i++) { const s = SQ(i); s.querySelectorAll(".pc,.dk").forEach(p => p.remove()); s.classList.remove("sel", "tg", "tgc", "last", "chk", "hint", "must"); }
      g.board().forEach((row, r) => row.forEach((p, c) => { if (!p) return; const img = document.createElement("img"); img.className = "pc"; img.src = PIECES[p.color + p.type]; img.alt = ""; img.draggable = false; SQ(r * 8 + c).appendChild(img); }));
      if (last) { SQ(last.from).classList.add("last"); SQ(last.to).classList.add("last"); }
      if (g.in_check()) { const k = findKing(g.turn()); if (k != null) SQ(k).classList.add("chk"); }
      if (sel != null) { SQ(sel).classList.add("sel"); targets.forEach(t => SQ(t.i).classList.add(t.cap ? "tgc" : "tg")); }
      if (anim) { const img = SQ(anim.to).querySelector(".pc"); if (img) flip(img, anim.from); }
      caps();
    }
    function checkEnd() {
      if (g.in_checkmate()) { finish(g.turn() === "w" ? "lose" : "win", "by checkmate"); return true; }
      if (g.in_stalemate()) { finish("draw", "by stalemate"); return true; }
      if (g.in_threefold_repetition()) { finish("draw", "by repetition"); return true; }
      if (g.insufficient_material()) { finish("draw", "insufficient material"); return true; }
      if (g.in_draw()) { finish("draw", "by the 50-move rule"); return true; }
      return false;
    }
    function doMove(mv) {
      const m = g.move(mv);
      sel = null; targets = [];
      if (!m) { render(); return; }
      last = { from: idxOf(m.from), to: idxOf(m.to) };
      render(last);
      (m.captured ? SND.capture : SND.move)(); if (g.in_check()) setTimeout(SND.check, 140);
      logMove(m.san);
      if (checkEnd()) return;
      G.turn = G.turn === "me" ? "op" : "me"; paintTurn();
      if (G.turn === "op") setTimeout(opMove, 450 + Math.random() * 900);
    }
    function opMove() {
      if (G.over || G.kind !== "chess") return;
      const m = bestMove("b", 2, G.opR > 1350 ? 24 : 70);
      if (m) doMove({ from: m.from, to: m.to, promotion: m.promotion ? "q" : undefined });
    }
    function tryMove(fromI, toI) {
      const from = sqName(fromI >> 3, fromI & 7), to = sqName(toI >> 3, toI & 7), p = g.get(from);
      if (p && p.type === "p" && to[1] === "8") {                // promotion: pick a piece
        const pr = $("gp-promo"); pr.hidden = false;
        pr.innerHTML = ["q", "r", "b", "n"].map(t => `<button type="button" data-p="${t}"><img src="${PIECES["w" + t]}" alt="${{ q: "Queen", r: "Rook", b: "Bishop", n: "Knight" }[t]}"></button>`).join("");
        pr.onclick = e => { const b = e.target.closest("[data-p]"); if (!b) return; pr.hidden = true; doMove({ from, to, promotion: b.dataset.p }); };
        return;
      }
      doMove({ from, to });
    }
    function select(i) {
      const sq = sqName(i >> 3, i & 7), p = g.get(sq);
      if (p && p.color === "w") { sel = i; targets = g.moves({ square: sq, verbose: true }).map(m => ({ i: idxOf(m.to), cap: !!m.captured })); }
      else { sel = null; targets = []; }
      render();
    }
    function down(e) {
      if (!G || G.kind !== "chess" || G.over || G.turn !== "me") return;
      const s = e.target.closest(".sq"); if (!s) return;
      const i = +s.dataset.i;
      if (sel != null && targets.some(t => t.i === i)) { tryMove(sel, i); return; }
      select(i);
      const img = SQ(i).querySelector(".pc");
      if (sel === i && img) {                                    // drag it, or tap the destination
        const r = img.getBoundingClientRect(), ghost = img.cloneNode(); ghost.className = "pc-drag";
        ghost.style.width = `${r.width}px`; ghost.style.height = `${r.height}px`; document.body.appendChild(ghost);
        drag = { i, ghost, img, moved: false, w: r.width };
        const mv = ev => { drag.moved = true; img.style.opacity = ".3"; ghost.style.transform = `translate(${ev.clientX - drag.w / 2}px, ${ev.clientY - drag.w / 2}px) scale(1.15)`; };
        const up = ev => {
          document.removeEventListener("pointermove", mv); document.removeEventListener("pointerup", up);
          ghost.remove(); img.style.opacity = "";
          if (drag.moved) { const el = document.elementFromPoint(ev.clientX, ev.clientY), t = el && el.closest(".sq"); if (t && targets.some(x => x.i === +t.dataset.i)) tryMove(drag.i, +t.dataset.i); }
          drag = null;
        };
        mv(e); ghost.style.transform = `translate(${e.clientX - r.width / 2}px, ${e.clientY - r.width / 2}px)`; drag.moved = false;
        document.addEventListener("pointermove", mv); document.addEventListener("pointerup", up);
      }
    }
    boardEl.addEventListener("pointerdown", e => { if (G && G.kind === "chess") down(e); });
    return {
      setup() {
        if (!window.Chess) { toastG("Chess needs an internet connection to load"); return; }
        g = new window.Chess(); sel = null; targets = []; last = null;
        buildBoard(); render(); $("gp-moves").innerHTML = "";
      },
      hint() { const m = bestMove("w", 2, 0); if (!m) return; const a = idxOf(m.from), b = idxOf(m.to); SQ(a).classList.add("hint"); SQ(b).classList.add("hint"); setTimeout(() => { SQ(a).classList.remove("hint"); SQ(b).classList.remove("hint"); }, 1600); },
      evalForOp: () => -evalW(),
    };
  })();

  /* ---------- checkers, Russian rules (flying kings, captures both ways, mandatory) ---------- */
  const DR = (() => {
    const DIRS = [[-1, -1], [-1, 1], [1, -1], [1, 1]], inB = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8, sideOf = v => v > 0 ? 1 : v < 0 ? -1 : 0;
    let b = null, sel = null, opts = [], last = null, plies = 0;
    const free = (bd, i, start) => bd[i] === 0 || i === start;
    function canCap(bd, r, c, king, side, taken, start) {
      for (const [dr, dc] of DIRS) {
        if (!king) {
          const r2 = r + 2 * dr, c2 = c + 2 * dc; if (!inB(r2, c2)) continue;
          const mid = (r + dr) * 8 + c + dc; if (sideOf(bd[mid]) === -side && !taken.includes(mid) && free(bd, r2 * 8 + c2, start)) return true;
        } else {
          let r1 = r + dr, c1 = c + dc; while (inB(r1, c1) && free(bd, r1 * 8 + c1, start)) { r1 += dr; c1 += dc; }
          if (!inB(r1, c1)) continue; const mid = r1 * 8 + c1; if (sideOf(bd[mid]) !== -side || taken.includes(mid)) continue;
          const r2 = r1 + dr, c2 = c1 + dc; if (inB(r2, c2) && free(bd, r2 * 8 + c2, start)) return true;
        }
      }
      return false;
    }
    function dfs(bd, r, c, king, side, taken, path, out, start) {
      let found = false;
      for (const [dr, dc] of DIRS) {
        if (!king) {
          const r2 = r + 2 * dr, c2 = c + 2 * dc; if (!inB(r2, c2)) continue;
          const mid = (r + dr) * 8 + c + dc, land = r2 * 8 + c2;
          if (sideOf(bd[mid]) === -side && !taken.includes(mid) && free(bd, land, start)) {
            found = true; const promo = (side > 0 && r2 === 0) || (side < 0 && r2 === 7);
            dfs(bd, r2, c2, promo, side, [...taken, mid], [...path, land], out, start);     // a man crowned mid-capture goes on as a king
          }
        } else {
          let r1 = r + dr, c1 = c + dc; while (inB(r1, c1) && free(bd, r1 * 8 + c1, start)) { r1 += dr; c1 += dc; }
          if (!inB(r1, c1)) continue; const mid = r1 * 8 + c1; if (sideOf(bd[mid]) !== -side || taken.includes(mid)) continue;
          const lands = []; let r2 = r1 + dr, c2 = c1 + dc; while (inB(r2, c2) && free(bd, r2 * 8 + c2, start)) { lands.push([r2, c2]); r2 += dr; c2 += dc; }
          if (!lands.length) continue;
          const t2 = [...taken, mid], cont = lands.filter(([lr, lc]) => canCap(bd, lr, lc, true, side, t2, start));
          for (const [lr, lc] of (cont.length ? cont : lands)) { found = true; dfs(bd, lr, lc, true, side, t2, [...path, lr * 8 + lc], out, start); }
        }
      }
      if (!found && taken.length) out.push({ path, caps: taken, king });
    }
    function movesFor(bd, side) {
      const caps = [], quiet = [];
      for (let i = 0; i < 64; i++) {
        if (sideOf(bd[i]) !== side) continue;
        const r = i >> 3, c = i & 7, king = Math.abs(bd[i]) === 2, out = [];
        dfs(bd, r, c, king, side, [], [i], out, i);
        out.forEach(o => caps.push({ from: i, to: o.path[o.path.length - 1], path: o.path, caps: o.caps, king: o.king }));
        if (caps.length) continue;
        for (const [dr, dc] of DIRS) {
          if (!king) { if (dr !== -side) continue; const r1 = r + dr, c1 = c + dc; if (inB(r1, c1) && bd[r1 * 8 + c1] === 0) quiet.push({ from: i, to: r1 * 8 + c1, path: [i, r1 * 8 + c1], caps: [], king: false }); }
          else { let r1 = r + dr, c1 = c + dc; while (inB(r1, c1) && bd[r1 * 8 + c1] === 0) { quiet.push({ from: i, to: r1 * 8 + c1, path: [i, r1 * 8 + c1], caps: [], king: true }); r1 += dr; c1 += dc; } }
        }
      }
      return caps.length ? caps : quiet;
    }
    function apply(bd, m, side) {
      const nb = bd.slice(), v = nb[m.from]; nb[m.from] = 0; m.caps.forEach(i => { nb[i] = 0; });
      const r = m.to >> 3, crown = m.king || Math.abs(v) === 2 || (side > 0 && r === 0) || (side < 0 && r === 7);
      nb[m.to] = crown ? 2 * side : side; return nb;
    }
    function evalB(bd) {
      let s = 0;
      for (let i = 0; i < 64; i++) { const v = bd[i]; if (!v) continue; const r = i >> 3, c = i & 7;
        let val = Math.abs(v) === 2 ? 290 : 100 + (v > 0 ? 7 - r : r) * 6;
        if (c >= 2 && c <= 5 && r >= 2 && r <= 5) val += 8;
        if (Math.abs(v) === 1 && ((v > 0 && r === 7) || (v < 0 && r === 0))) val += 12;
        s += v > 0 ? val : -val; }
      return s;
    }
    function search(bd, depth, alpha, beta, side) {
      const ms = movesFor(bd, side); if (!ms.length) return -100000 - depth; if (depth === 0) return side * evalB(bd);
      let best = -Infinity;
      for (const m of ms) { const v = -search(apply(bd, m, side), depth - 1, -beta, -alpha, -side); if (v > best) best = v; if (v > alpha) alpha = v; if (alpha >= beta) break; }
      return best;
    }
    function bestFor(side, depth, noise) {
      let bm = null, bv = -Infinity;
      for (const m of movesFor(b, side)) { const v = -search(apply(b, m, side), depth - 1, -Infinity, Infinity, -side) + (Math.random() - .5) * noise; if (v > bv) { bv = v; bm = m; } }
      return bm;
    }
    const nm = i => sqName(i >> 3, i & 7);
    function render() {
      for (let i = 0; i < 64; i++) { const s = SQ(i); s.querySelectorAll(".pc,.dk").forEach(p => p.remove()); s.classList.remove("sel", "tg", "tgc", "last", "chk", "hint", "must", "path"); }
      b.forEach((v, i) => { if (!v) return; const d = document.createElement("i"); d.className = `dk ${v > 0 ? "w" : "b"}${Math.abs(v) === 2 ? " king" : ""}`; SQ(i).appendChild(d); });
      if (last) { SQ(last.from).classList.add("last"); SQ(last.to).classList.add("last"); }
      const mine = G.turn === "me" && !G.over ? movesFor(b, 1) : [];
      if (mine.length && mine[0].caps.length) new Set(mine.map(m => m.from)).forEach(i => SQ(i).classList.add("must"));
      if (sel != null) { SQ(sel).classList.add("sel"); opts.forEach(m => { SQ(m.to).classList.add(m.caps.length ? "tgc" : "tg"); m.path.slice(1, -1).forEach(i => SQ(i).classList.add("path")); }); }
      const count = side => b.filter(v => sideOf(v) === side).length;
      $("gp-caps-me").innerHTML = 12 - count(-1) ? `<i class="dk b mini"></i><em>×${12 - count(-1)}</em>` : "";
      $("gp-caps-op").innerHTML = 12 - count(1) ? `<i class="dk w mini"></i><em>×${12 - count(1)}</em>` : "";
    }
    function play(m, side) {
      const disc = SQ(m.from).querySelector(".dk"), pts = m.path.map(i => SQ(i).getBoundingClientRect()), o = pts[0];
      m.caps.forEach(i => { const d = SQ(i).querySelector(".dk"); if (d) d.classList.add("gone"); });
      const dur = reduce ? 0 : 200 * (m.path.length - 1);
      if (disc && dur) { disc.style.zIndex = 3; disc.animate(pts.map(p => ({ transform: `translate(${p.left - o.left}px, ${p.top - o.top}px)` })), { duration: dur, easing: "ease-in-out", fill: "forwards" }); }
      setTimeout(() => {
        b = apply(b, m, side); last = { from: m.from, to: m.to }; sel = null; opts = []; plies++;
        (m.caps.length ? SND.capture : SND.move)();
        logMove(m.caps.length ? m.path.map(nm).join(":") : `${nm(m.from)}-${nm(m.to)}`);
        const next = -side, nextMoves = movesFor(b, next);
        G.turn = G.turn === "me" ? "op" : "me";
        render(); paintTurn();
        if (!nextMoves.length) { finish(next === 1 ? "lose" : "win", b.some(v => sideOf(v) === next) ? "no moves left" : "all pieces captured"); return; }
        if (plies >= 160) { finish("draw", "move limit"); return; }
        if (G.turn === "op") setTimeout(opMove, 500 + Math.random() * 800);
      }, dur + 30);
    }
    function opMove() { if (G.over || G.kind !== "checkers") return; const m = bestFor(-1, G.opR > 1300 ? 5 : 4, G.opR > 1300 ? 20 : 60); if (m) play(m, -1); }
    boardEl.addEventListener("pointerdown", e => {
      if (!G || G.kind !== "checkers" || G.over || G.turn !== "me") return;
      const s = e.target.closest(".sq"); if (!s) return;
      const i = +s.dataset.i;
      if (sel != null) {
        const hits = opts.filter(m => m.to === i);
        if (hits.length) { play(hits.sort((a, x) => x.caps.length - a.caps.length)[0], 1); return; }
      }
      if (sideOf(b[i]) === 1) {
        const all = movesFor(b, 1), mine = all.filter(m => m.from === i);
        if (!mine.length && all.length && all[0].caps.length) { toastG("You must capture. Take with a glowing piece."); sel = null; opts = []; render(); return; }
        sel = mine.length ? i : null; opts = mine;
      } else { sel = null; opts = []; }
      render();
    });
    return {
      setup() {
        b = Array(64).fill(0);
        for (let i = 0; i < 64; i++) { const r = i >> 3, c = i & 7; if ((r + c) % 2 === 1) { if (r < 3) b[i] = -1; else if (r > 4) b[i] = 1; } }
        sel = null; opts = []; last = null; plies = 0;
        buildBoard(); render(); $("gp-moves").innerHTML = "";
      },
      hint() { const m = bestFor(1, 4, 0); if (!m) return; [m.from, m.to].forEach(i => SQ(i).classList.add("hint")); setTimeout(() => [m.from, m.to].forEach(i => SQ(i).classList.remove("hint")), 1600); },
      evalForOp: () => -evalB(b),
      _test: { movesFor, apply, set: nb => { b = nb; }, get: () => b },
    };
  })();
  window.JIA_games = { CH, DR };
})();
