
(() => {
  "use strict";
  const R = window.JIA_party.register;

  /* ---------- Mafia in English ---------- */
  R({ key: "mafia", title: "Mafia in English", sub: "Find the Mafia. Speak English!", host: "jamol", theme: ["#262b48", "#05060b"], run(A) {
    const P = [{ w: "me" }, ...["dilnoza", "timur", "madina", "asadbek", "sardor", "laylo", "nilufar"].filter(w => A.PEOPLE()[w]).map(w => ({ w }))].slice(0, 8);
    const roles = A.shuffle(["mafia", "mafia", "doctor", "detective", "citizen", "citizen", "citizen", "citizen"]).slice(0, P.length);
    P.forEach((p, i) => { p.role = roles[i]; p.alive = true; p.sus = 0; });
    const me = P[0], RN = { mafia: "Mafia", doctor: "Doctor", detective: "Detective", citizen: "Citizen" }, RI = { mafia: "🔪", doctor: "💊", detective: "🔍", citizen: "🏠" };
    const RD = { mafia: "Each night, choose someone to eliminate with your partner. Don't get caught!", doctor: "Each night, choose one person to save.", detective: "Each night, check one player: Mafia or not?", citizen: "Find the Mafia in the day chat and vote them out." };
    const nm2 = w => w === "me" ? JG_ME.firstName : A.nm(w); /* JG-PROD: identity */
    const alive = () => P.filter(p => p.alive), mafia = () => alive().filter(p => p.role === "mafia"), town = () => alive().filter(p => p.role !== "mafia");
    const known = {}; let day = 0;
    const b = A.body();
    b.innerHTML = `<div class="mf-card" id="mf-card" role="button" tabindex="0" aria-label="Tap to see your role"><div class="mf-back">?</div><div class="mf-front"><p class="mf-ri">${RI[me.role]}</p><h3>You are the ${RN[me.role]}</h3><p>${RD[me.role]}</p></div></div><button class="pa-btn" id="mf-go" type="button">Start the night</button>`;
    A.host("wave", "Welcome to Mafia! Eight players, two of them are Mafia. Tap your card to see your role.");
    A.$("mf-card").onclick = () => A.$("mf-card").classList.add("flip");
    A.$("mf-go").onclick = () => { A.$("mf-card").classList.add("flip"); A.later(night, 900); };
    const card = (p, extra) => `<button type="button" class="mf-p" data-i="${P.indexOf(p)}">${A.face(p.w)}<b>${A.esc(nm2(p.w))}</b>${extra || ""}</button>`;
    function night() {
      day++; A.sub(`Night ${day}`); A.view.classList.add("night");
      A.host("sad", "The city falls asleep… 🌙");
      if (!me.alive || me.role === "citizen") { b.innerHTML = `<div class="mf-sleep"><p class="mf-z">😴</p><p>${me.alive ? "You're asleep… The night is busy." : "You're out. Watching the night…"}</p></div>`; A.later(() => resolve(null), 3600); return; }
      const targets = alive().filter(p => me.role === "mafia" ? p.role !== "mafia" : me.role === "detective" ? p !== me : true);
      const partner = P.find(p => p.role === "mafia" && p !== me);
      b.innerHTML = `<p class="mf-h">${RI[me.role]} ${{ mafia: "Who will the Mafia eliminate?", doctor: "Who will you save tonight?", detective: "Who will you check?" }[me.role]}</p>
        ${me.role === "mafia" && partner ? `<p class="mf-note">Your partner: <b>${A.esc(nm2(partner.w))}</b>${partner.alive ? "" : " (out)"}</p>` : ""}
        <div class="mf-grid">${targets.map(p => card(p, known[P.indexOf(p)] ? `<em>${known[P.indexOf(p)]}</em>` : "")).join("")}</div>`;
      b.querySelectorAll(".mf-p").forEach(x => x.onclick = () => { b.querySelectorAll(".mf-p").forEach(y => { y.disabled = true; }); x.classList.add("sel"); resolve(+x.dataset.i); });
    }
    function resolve(choice) {
      const al = alive(), townNow = town();
      const target = me.role === "mafia" && me.alive && choice != null ? P[choice] : A.pick(townNow);
      const doc = al.find(p => p.role === "doctor"), det = al.find(p => p.role === "detective");
      const save = doc ? (doc === me ? (choice != null ? P[choice] : null) : A.pick(al)) : null;
      if (det === me && choice != null) { const t = P[choice]; known[choice] = t.role === "mafia" ? "🔪 Mafia!" : "✓ Not Mafia"; A.toast(`${nm2(t.w)} is ${t.role === "mafia" ? "MAFIA! 🔪" : "not Mafia ✓"}`); }
      if (det && det !== me) { const c = A.pick(al.filter(p => p !== det)); if (c && c.role === "mafia") det.found = c; }
      const saved = !!(save && target && save === target);
      if (target && !saved) target.alive = false;
      A.later(() => morning(target, saved), det === me ? 1900 : 700);
    }
    function morning(t, saved) {
      A.view.classList.remove("night"); A.sub(`Day ${day}`);
      const who = t === me ? "you" : nm2(t.w);
      A.host(saved ? "cele" : "sad", saved ? `Good morning! The doctor saved ${who} last night. Nobody died!` : t === me ? "Good morning… The Mafia got you last night. You can still watch." : `Good morning… ${who} was eliminated last night. ${who} was a ${RN[t.role]}.`);
      b.innerHTML = `<div class="mf-out">${A.face(t.w)}<p>${saved ? `💊 <b>${A.esc(who)}</b> was saved!` : `<b>${A.esc(t === me ? "You" : who)}</b> ${t === me ? "were" : "was"} eliminated`}</p>${saved ? "" : `<p class="mf-role">${RI[t.role]} ${RN[t.role]}</p>`}</div>`;
      if (check()) return;
      A.later(discuss, 3400);
    }
    function discuss() {
      const others = alive().filter(p => p !== me);
      b.innerHTML = `<p class="mf-h">☀️ Day chat: who is the Mafia?</p><div class="mf-chat" id="mf-chat" aria-live="polite"></div>${me.alive ? `<div class="mf-quick" id="mf-quick"></div><div class="pa-in"><input id="mf-inp" type="text" placeholder="Say something in English" aria-label="Your message" maxlength="140"><button class="pa-btn" id="mf-send" type="button">Send</button></div>` : `<p class="mf-note">You're out. Watch the city decide…</p>`}`;
      if (me.alive) {
        const x = A.pick(others), y = A.pick(others);
        const qk = ["I'm innocent! 😇", `I think ${nm2(x.w)} is the Mafia.`, `I trust ${nm2(y.w)}.`, "Who has evidence?"];
        Object.keys(known).forEach(i => { if (known[i].includes("Mafia!") && P[i].alive) qk.unshift(`I'm the detective: ${nm2(P[i].w)} is Mafia! 🔍`); });
        A.$("mf-quick").innerHTML = qk.map(t => `<button type="button">${A.esc(t)}</button>`).join("");
        A.$("mf-quick").onclick = e => { const bt = e.target.closest("button"); if (bt) say(me, bt.textContent); };
        const send = () => { const inp = A.$("mf-inp"), v = inp.value.trim(); if (v) { say(me, v); inp.value = ""; } };
        A.$("mf-send").onclick = send; A.$("mf-inp").addEventListener("keydown", e => { if (e.key === "Enter") send(); });
      }
      A.host("point", "Discuss! Who is acting strange?", { voice: false });
      let n = 0; const talk = A.every(() => { const sp = A.pick(alive().filter(p => p !== me)); if (sp) say(sp, line(sp)); if (++n >= 7) { clearInterval(talk); A.later(vote, 1600); } }, 1900);
    }
    function say(p, text) {
      const ch = A.$("mf-chat"); if (!ch) return;
      ch.insertAdjacentHTML("beforeend", `<p class="${p === me ? "me" : ""}">${A.face(p.w)}<span><b>${A.esc(p === me ? "You" : nm2(p.w))}</b>${A.esc(text)}</span></p>`); ch.scrollTop = ch.scrollHeight;
      P.forEach(q => { if (q.alive && q !== p && text.includes(nm2(q.w)) && /mafia|suspicious|vote/i.test(text) && !/not mafia|trust/i.test(text)) q.sus += p === me ? 2 : 1; });
    }
    function line(p) {
      const others = alive().filter(q => q !== p), x = A.pick(others), v = A.pick(others);
      if (p.role === "detective" && p.found && p.found.alive && Math.random() < .6) return `I'm the detective. ${nm2(p.found.w)} is Mafia! 🔍`;
      if (p.role === "mafia" && Math.random() < .5) { const t = A.pick(others.filter(q => q.role !== "mafia")) || x; return A.pick([`${nm2(t.w)} is too quiet today. Suspicious… 🤨`, `I think ${nm2(t.w)} is the Mafia.`, "I was sleeping all night, I promise! 😇"]); }
      return A.pick([`I think ${nm2(x.w)} is the Mafia.`, `${nm2(x.w)}, where were you last night? 👀`, "Let's not rush. Who has evidence?", `I trust ${nm2(v.w)}.`, "I was sleeping all night, I promise! 😇", `${nm2(x.w)} is too quiet today. Suspicious… 🤨`, `Vote ${nm2(x.w)}! Trust me.`]);
    }
    function vote() {
      A.host("point", "Time to vote! Who is the Mafia?");
      if (!me.alive) { A.later(() => tally(null), 1500); return; }
      b.innerHTML = `<p class="mf-h">🗳️ Vote someone out</p><div class="mf-grid">${alive().filter(p => p !== me).map(p => card(p, known[P.indexOf(p)] ? `<em>${known[P.indexOf(p)]}</em>` : "")).join("")}</div>`;
      b.querySelectorAll(".mf-p").forEach(x => x.onclick = () => { b.querySelectorAll(".mf-p").forEach(y => { y.disabled = true; }); x.classList.add("sel"); tally(+x.dataset.i); });
    }
    function tally(mine) {
      const al = alive(), votes = {}; const add = i => { votes[i] = (votes[i] || 0) + 1; };
      if (mine != null) add(mine);
      al.filter(p => p !== me).forEach(p => {
        let t;
        if (p.role === "detective" && p.found && p.found.alive) t = p.found;
        else if (p.role === "mafia") t = A.pick(al.filter(q => q.role !== "mafia" && q !== p));
        else { const pool = al.filter(q => q !== p), wt = pool.map(q => 1 + q.sus * 2 + (q.role === "mafia" ? .6 : 0)); let r = Math.random() * wt.reduce((a, c) => a + c, 0); t = pool.find((q, k) => (r -= wt[k]) <= 0) || pool[0]; }
        if (t) add(P.indexOf(t));
      });
      const top = Object.entries(votes).sort((a, c) => c[1] - a[1]), out = P[+top[0][0]];
      out.alive = false; P.forEach(p => { p.sus = 0; });
      b.innerHTML = `<div class="mf-out">${A.face(out.w)}<p><b>${A.esc(out === me ? "You" : nm2(out.w))}</b> ${out === me ? "were" : "was"} voted out with ${top[0][1]} votes.</p><p class="mf-role">${RI[out.role]} ${RN[out.role]}</p></div>`;
      A.host(out.role === "mafia" ? "cele" : "sad", out.role === "mafia" ? `${out === me ? "You were" : nm2(out.w) + " was"} Mafia! Well done, city!` : `Oh no… ${out === me ? "you were" : nm2(out.w) + " was"} a ${RN[out.role]}.`);
      A.later(() => { if (!check()) night(); }, 3600);
    }
    function check() {
      const m = mafia().length, t = town().length;
      if (m > 0 && m < t) return false;
      const townWin = m === 0, meWin = (me.role === "mafia") !== townWin;
      A.later(() => A.end({ win: meWin, title: townWin ? "The city wins! 🏙️" : "The Mafia wins! 🔪", text: `You were the ${RN[me.role]}. Mafia: ${P.filter(p => p.role === "mafia").map(p => p === me ? "you" : nm2(p.w)).join(" and ")}.`, coins: meWin ? 30 : 10, say: townWin ? "The city is safe again! Great teamwork!" : "The Mafia took over the city!" }), 2600);
      return true;
    }
  } });
})();
