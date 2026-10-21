
(() => {
  "use strict";
  /* ==========================================================
     TEAM GAMES — 3 girls vs 3 boys. Jamol or Jamola wins the vote
     and hosts one of three games: the classic (openly unfair), the
     Halal version (everyone equal), the Math battle (stereotype
     roulette, a secret coin round and time inflation) or its Halal
     version, where luck picks the favoured side each time. Hosts speak
     with recorded voices; their feelings show as animated reactions.
     ========================================================== */
  const $ = id => document.getElementById(id);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const PEOPLE = () => window.JIA_PEOPLE || {}, AVS = () => window.JIA_AV || {};
  const photo = () => (getComputedStyle(document.querySelector(".avatar")).getPropertyValue("--photo") || "").trim().replace(/"/g, "'");
  const MI = (w, k) => window.JIA_MIMG ? window.JIA_MIMG(w, k) : "";
  const M = {
    jamol: { wave: MI("jamol", "wave"), cele: MI("jamol", "cele"), point: MI("jamol", "point"), comfort: MI("jamol", "think"), happy: MI("jamol", "delighted"), curious: MI("jamol", "curious"), sad: MI("jamol", "concern"), welcome: MI("jamol", "welcome"), angry: MI("jamol", "angry"), sleepy: MI("jamol", "sleepy"), shocked: MI("jamol", "shocked"), pleading: MI("jamol", "pleading") },
    jamola: { wave: MI("jamola", "wave"), cele: MI("jamola", "cele"), point: MI("jamola", "point"), comfort: MI("jamola", "think"), happy: MI("jamola", "delighted"), curious: MI("jamola", "curious"), sad: MI("jamola", "concern"), welcome: MI("jamola", "welcome"), angry: MI("jamola", "angry"), sleepy: MI("jamola", "sleepy"), shocked: MI("jamola", "shocked"), pleading: MI("jamola", "pleading") }
  };
  const clone = sel => { const el = document.querySelector(sel); if (!el) return ""; const c = el.cloneNode(true); c.removeAttribute("class"); c.setAttribute("aria-hidden", "true"); return c.outerHTML; };
  M.jamol.wave = clone(".mc .jm-wave"); M.jamol.cele = clone(".mc .jm-cele"); M.jamol.point = clone(".mc .jm-point");
  window.JIA_JAMOL_FACE = M.jamol.welcome; window.JIA_JAMOLA_FACE = M.jamola.welcome; window.JIA_M = M;
  const VO = {"jamola": {"v1": "/d/student-desktop/media/af480b7b2f089678.mp3", "v2": "/d/student-desktop/media/e7ee392d66d8311c.mp3", "v3": "/d/student-desktop/media/3d81b8ff00230e03.mp3", "won": "/d/student-desktop/media/f0f5d9a62cbf3073.mp3", "lost": "/d/student-desktop/media/d805edbdeef2a19e.mp3", "tie": "/d/student-desktop/media/8647647bb62a82c0.mp3", "c_intro": "/d/student-desktop/media/b30c30082f2ec4db.mp3", "c_ann1": "/d/student-desktop/media/6341f47ee39b46ae.mp3", "c_ann2": "/d/student-desktop/media/b7468219748b3550.mp3", "c_ann3": "/d/student-desktop/media/5c1271a7467693b9.mp3", "c_zero": "/d/student-desktop/media/61cec9945fba09cf.mp3", "c_some": "/d/student-desktop/media/d1179e94370b34c0.mp3", "c_good": "/d/student-desktop/media/2e98318d2369818c.mp3", "c_perf": "/d/student-desktop/media/4ea9726c2a513a6d.mp3", "c_win": "/d/student-desktop/media/99d1704d9c2482ea.mp3", "c_lose": "/d/student-desktop/media/ee62d6c1f1738dda.mp3", "h_intro": "/d/student-desktop/media/edddc21d71823560.mp3", "h_ann1": "/d/student-desktop/media/9825a3979acf3f6f.mp3", "h_ann2": "/d/student-desktop/media/7ef0eca5e6acda5f.mp3", "h_even": "/d/student-desktop/media/7bb6c5bc56aca705.mp3", "h_good": "/d/student-desktop/media/bfe07b7b66ce39a7.mp3", "h_perf": "/d/student-desktop/media/d73f8d69cb484a0a.mp3", "h_win": "/d/student-desktop/media/44621f3be8f2fffb.mp3", "h_draw": "/d/student-desktop/media/579a1b5ca8577145.mp3", "m_intro": "/d/student-desktop/media/76d2e92b8c023ee4.mp3", "m_ann1": "/d/student-desktop/media/97db3cb0db4fc5c1.mp3", "m_ann2": "/d/student-desktop/media/c6f7e3d1c0fed5af.mp3", "m_ann3": "/d/student-desktop/media/1388a0c6dc0ef2aa.mp3", "m_ann4": "/d/student-desktop/media/c8d68aeee35a787e.mp3", "m_roul": "/d/student-desktop/media/b74dd404459cc492.mp3", "m_roulf": "/d/student-desktop/media/e4b7b2dfddf3aad0.mp3", "m_roulo": "/d/student-desktop/media/015150a616aec9f1.mp3", "m_bribe": "/d/student-desktop/media/e3e3ccafb3d8f674.mp3", "m_bcutg": "/d/student-desktop/media/a46c0eb8a3bdbf82.mp3", "m_bcutb": "/d/student-desktop/media/17d7e29b4ad7ddf4.mp3", "m_btie": "/d/student-desktop/media/4fb484657c84abf5.mp3", "m_bnone": "/d/student-desktop/media/fd2eb03e5065c334.mp3", "m_halal": "/d/student-desktop/media/37703b6ea4378964.mp3", "m_infl1": "/d/student-desktop/media/ae0934d91b8dd669.mp3", "m_infl2": "/d/student-desktop/media/c6770553be58d43e.mp3", "m_zero": "/d/student-desktop/media/91e4ff1e0a716ffb.mp3", "m_some": "/d/student-desktop/media/13fab6d71db4d781.mp3", "m_good": "/d/student-desktop/media/49d14beb3a8bb642.mp3", "m_perf": "/d/student-desktop/media/52f3fd4f487241f1.mp3", "m_hal1": "/d/student-desktop/media/0f7e2932eb714f3d.mp3", "m_hal2": "/d/student-desktop/media/ca785c6bcf83d91b.mp3", "m_drum": "/d/student-desktop/media/622544a1be50e325.mp3", "m_win": "/d/student-desktop/media/5a5500e79b617718.mp3", "m_lose": "/d/student-desktop/media/61a1bcc1f1ee8f86.mp3", "m_draw": "/d/student-desktop/media/dd014271e895d565.mp3", "mh_intro": "/d/student-desktop/media/9ab2f92ca1dfb3db.mp3", "mh_easyg": "/d/student-desktop/media/a07671e1e7e91758.mp3", "mh_easyb": "/d/student-desktop/media/e773b851a8b08a3d.mp3", "mh_luck": "/d/student-desktop/media/f6f0d4f59e22f8a7.mp3", "mh_roulg": "/d/student-desktop/media/d1a3433015a1d855.mp3", "mh_roulb": "/d/student-desktop/media/59cdb48f1210539b.mp3", "mh_stereog": "/d/student-desktop/media/4bfdafb0ec77a917.mp3", "mh_stereob": "/d/student-desktop/media/bce88e784e39a412.mp3", "mh_perfo": "/d/student-desktop/media/7903c62799a27359.mp3", "mh_wing": "/d/student-desktop/media/ae27969c70a005da.mp3", "mh_winb": "/d/student-desktop/media/d3d4f116ceb2a994.mp3", "mh_draw": "/d/student-desktop/media/518d5e0f96941754.mp3", "mh_inflg": "/d/student-desktop/media/b6e6fd0a5e9d818e.mp3", "mh_inflb": "/d/student-desktop/media/deb882d46a4b3b0d.mp3"}, "jamol": {"v1": "/d/student-desktop/media/447a05cb3de27963.mp3", "v2": "/d/student-desktop/media/ad5c52cfaeb29819.mp3", "v3": "/d/student-desktop/media/30a1fcd63b8d4375.mp3", "won": "/d/student-desktop/media/fa4f2b45c4247a37.mp3", "lost": "/d/student-desktop/media/cdad8e4c88ea7fe0.mp3", "tie": "/d/student-desktop/media/7aa724247c50f960.mp3", "c_intro": "/d/student-desktop/media/5ebd12465ae2704b.mp3", "c_ann1": "/d/student-desktop/media/2deb6c2a32d02cb4.mp3", "c_ann2": "/d/student-desktop/media/a52f725a1c9d0577.mp3", "c_ann3": "/d/student-desktop/media/7c31b15dffe2b1d8.mp3", "c_zero": "/d/student-desktop/media/83788d907d08742c.mp3", "c_some": "/d/student-desktop/media/88c8cdc627bda52b.mp3", "c_good": "/d/student-desktop/media/d84b36958421777d.mp3", "c_perf": "/d/student-desktop/media/6ba40ce8dd961442.mp3", "c_win": "/d/student-desktop/media/a7e3af9aa7a8be2d.mp3", "c_lose": "/d/student-desktop/media/3b149a2ca29053d1.mp3", "h_intro": "/d/student-desktop/media/4d1153ea51c11a84.mp3", "h_ann1": "/d/student-desktop/media/49ae291d4647e216.mp3", "h_ann2": "/d/student-desktop/media/a9d997aea88e2b9e.mp3", "h_even": "/d/student-desktop/media/4650053738f2cfb6.mp3", "h_good": "/d/student-desktop/media/6727efa617a5c323.mp3", "h_perf": "/d/student-desktop/media/ee6858f6834cc0e0.mp3", "h_win": "/d/student-desktop/media/4c27d5ce38d50599.mp3", "h_draw": "/d/student-desktop/media/fa1958f4d65d9c66.mp3", "m_intro": "/d/student-desktop/media/71ff496a19a5b5c2.mp3", "m_ann1": "/d/student-desktop/media/f48fa0a3ac41b1d7.mp3", "m_ann2": "/d/student-desktop/media/b8bb95d4a7a9c172.mp3", "m_ann3": "/d/student-desktop/media/57152e1d81c3afd7.mp3", "m_ann4": "/d/student-desktop/media/c916c141dd6c9b67.mp3", "m_roul": "/d/student-desktop/media/4be8cf79d4543be8.mp3", "m_roulf": "/d/student-desktop/media/415c70bd2fac0260.mp3", "m_roulo": "/d/student-desktop/media/4336e80198e1d4d0.mp3", "m_bribe": "/d/student-desktop/media/c9b1e243d8343c7c.mp3", "m_bcutg": "/d/student-desktop/media/c4a8d23e80efa421.mp3", "m_bcutb": "/d/student-desktop/media/3ee1229b878c8ba2.mp3", "m_btie": "/d/student-desktop/media/01beccab942a46bd.mp3", "m_bnone": "/d/student-desktop/media/31ea72275c6027e1.mp3", "m_halal": "/d/student-desktop/media/3ff3108c8cb0bb19.mp3", "m_infl1": "/d/student-desktop/media/7bef1a3e3d7a36db.mp3", "m_infl2": "/d/student-desktop/media/538cf88c98c5bf8c.mp3", "m_zero": "/d/student-desktop/media/93d99fd9e40c0076.mp3", "m_some": "/d/student-desktop/media/f5dd31af32b59730.mp3", "m_good": "/d/student-desktop/media/8da1e04fd71b0113.mp3", "m_perf": "/d/student-desktop/media/eddef7eed8752482.mp3", "m_hal1": "/d/student-desktop/media/3688c54872be366d.mp3", "m_hal2": "/d/student-desktop/media/83f5363644687ca8.mp3", "m_drum": "/d/student-desktop/media/bc4330d623d94dad.mp3", "m_win": "/d/student-desktop/media/7044a721ea97b318.mp3", "m_lose": "/d/student-desktop/media/cf56e8000d4e00a9.mp3", "m_draw": "/d/student-desktop/media/f04dbb53806dce0e.mp3", "mh_intro": "/d/student-desktop/media/1a81790bc0e00bef.mp3", "mh_easyg": "/d/student-desktop/media/f207e4886382f062.mp3", "mh_easyb": "/d/student-desktop/media/f34ae5809a3db999.mp3", "mh_luck": "/d/student-desktop/media/edd22e04945d5437.mp3", "mh_roulg": "/d/student-desktop/media/36fe4c644b66bcb0.mp3", "mh_roulb": "/d/student-desktop/media/4e6bbda5959fc55b.mp3", "mh_stereog": "/d/student-desktop/media/d0ab6e2e269c4f26.mp3", "mh_stereob": "/d/student-desktop/media/6d92cdc87acc0155.mp3", "mh_perfo": "/d/student-desktop/media/2cc19d4905155183.mp3", "mh_wing": "/d/student-desktop/media/5c7dcac01210fd31.mp3", "mh_winb": "/d/student-desktop/media/3c74b69c8d3150d6.mp3", "mh_draw": "/d/student-desktop/media/81dc893487926bf3.mp3", "mh_inflg": "/d/student-desktop/media/51922190f2f5ed13.mp3", "mh_inflb": "/d/student-desktop/media/11bf972ab95daa80.mp3"}}, TXT = {"jamola": {"v1": "Choose me! Choose me!", "v2": "Pick me, please! I'll be a great host.", "v3": "Come on, vote for me!", "won": "Yes! I'm your host today!", "lost": "Oh well. Maybe next time.", "tie": "It's a tie! Let's vote again.", "c_intro": "Welcome to the team game! Ten words each. I picked some lovely words for my girls, and some very special ones for the boys.", "c_ann1": "Girls, here's an easy one for you.", "c_ann2": "Boys, good luck with this one.", "c_ann3": "New words! Totally fair, as always.", "c_zero": "Zero, boys? It was so simple!", "c_some": "Just a lucky guess, I think.", "c_good": "Wait, you actually got it? The next one will be harder.", "c_perf": "Perfect, girls! I'm so proud of you.", "c_win": "The girls win! What a surprise, right?", "c_lose": "You won anyway? Okay, I'm impressed.", "h_intro": "Welcome to the halal version! Same level of words for everyone. Let's play fair.", "h_ann1": "Same level for both teams. Good luck!", "h_ann2": "Fair and square. Here we go!", "h_even": "Neck and neck! Well played, both teams.", "h_good": "Nice round! Well played, everyone.", "h_perf": "Perfect, everyone! All correct.", "h_win": "Fair and square! Great game, everyone.", "h_draw": "A draw! Everyone is a winner today.", "m_intro": "Welcome to the math battle! Ten questions. Girls, don't worry, yours are easy.", "m_ann1": "Here's something easy for my girls.", "m_ann2": "And for the boys, something a little harder.", "m_ann3": "Easy for some, tricky for others. That's life!", "m_ann4": "New question! Ready, set, go!", "m_roul": "Time for the stereotype roulette!", "m_roulf": "Math! It's a math game, so math it is, girls.", "m_roulo": "Oh! It's a math game, but today your questions are physics, geometry and biology, boys.", "m_bribe": "Psst, nobody is watching. A few coins under the table might change your luck.", "m_bcutg": "Thank you! I mean, what a coincidence. The girls lose some points.", "m_bcutb": "Thank you! I mean, what a coincidence. The boys lose some points.", "m_btie": "Both teams paid the same? Then nothing changes. But thank you!", "m_bnone": "No gifts? Honest people. How boring.", "m_halal": "Let's make it halal! The same question for both teams, thirty seconds each.", "m_infl1": "Oops! Time inflation! Fifteen seconds, gone!", "m_infl2": "Again? The economy is terrible today!", "m_zero": "Zero? It was just a tiny question!", "m_some": "A lucky guess, maybe?", "m_good": "Wait, you got it? The next one will be harder!", "m_perf": "Perfect, girls!", "m_hal1": "Same question, same time. Well, almost.", "m_hal2": "Even with less time? Impressive!", "m_drum": "And the winner is…", "m_win": "The girls win the math battle! Totally fair, right?", "m_lose": "You won anyway? Even with all my tricks? Respect!", "m_draw": "A draw? Even with all my tricks?", "mh_intro": "Welcome to the halal math battle! Roulette, secret coins and time inflation are all still here. But this time, luck decides who gets the easy questions.", "mh_easyg": "This time, the girls get the easy one.", "mh_easyb": "This time, the boys get the easy one.", "mh_luck": "Let's see who gets lucky this time.", "mh_roulg": "The girls get math. Lucky!", "mh_roulb": "The boys get math. Lucky!", "mh_stereog": "And the girls get physics, geometry and biology!", "mh_stereob": "And the boys get physics, geometry and biology!", "mh_perfo": "Perfect, boys!", "mh_wing": "The girls win the halal math battle! Luck was on their side.", "mh_winb": "The boys win the halal math battle! Luck was on their side.", "mh_draw": "A draw! Luck was fair to everyone today.", "mh_inflg": "Time inflation hits the girls! Fifteen seconds, gone!", "mh_inflb": "Time inflation hits the boys! Fifteen seconds, gone!"}, "jamol": {"v1": "Choose me! Choose me!", "v2": "Pick me, please! I'll be a great host.", "v3": "Come on, vote for me!", "won": "Yes! I'm your host today!", "lost": "Oh well. Maybe next time.", "tie": "It's a tie! Let's vote again.", "c_intro": "Welcome to the team game! Ten words each. I picked some lovely words for my boys, and some very special ones for the girls.", "c_ann1": "Boys, here's an easy one for you.", "c_ann2": "Girls, good luck with this one.", "c_ann3": "New words! Totally fair, as always.", "c_zero": "Zero, girls? It was so simple!", "c_some": "Just a lucky guess, I think.", "c_good": "Wait, you actually got it? The next one will be harder.", "c_perf": "Perfect, boys! I'm so proud of you.", "c_win": "The boys win! What a surprise, right?", "c_lose": "You won anyway? Okay, I'm impressed.", "h_intro": "Welcome to the halal version! Same level of words for everyone. Let's play fair.", "h_ann1": "Same level for both teams. Good luck!", "h_ann2": "Fair and square. Here we go!", "h_even": "Neck and neck! Well played, both teams.", "h_good": "Nice round! Well played, everyone.", "h_perf": "Perfect, everyone! All correct.", "h_win": "Fair and square! Great game, everyone.", "h_draw": "A draw! Everyone is a winner today.", "m_intro": "Welcome to the math battle! Ten questions. Boys, don't worry, yours are easy.", "m_ann1": "Here's something easy for my boys.", "m_ann2": "And for the girls, something a little harder.", "m_ann3": "Easy for some, tricky for others. That's life!", "m_ann4": "New question! Ready, set, go!", "m_roul": "Time for the stereotype roulette!", "m_roulf": "Math! It's a math game, so math it is, boys.", "m_roulo": "Oh! It's a math game, but today your questions are physics, geometry and biology, girls.", "m_bribe": "Psst, nobody is watching. A few coins under the table might change your luck.", "m_bcutg": "Thank you! I mean, what a coincidence. The girls lose some points.", "m_bcutb": "Thank you! I mean, what a coincidence. The boys lose some points.", "m_btie": "Both teams paid the same? Then nothing changes. But thank you!", "m_bnone": "No gifts? Honest people. How boring.", "m_halal": "Let's make it halal! The same question for both teams, thirty seconds each.", "m_infl1": "Oops! Time inflation! Fifteen seconds, gone!", "m_infl2": "Again? The economy is terrible today!", "m_zero": "Zero? It was just a tiny question!", "m_some": "A lucky guess, maybe?", "m_good": "Wait, you got it? The next one will be harder!", "m_perf": "Perfect, boys!", "m_hal1": "Same question, same time. Well, almost.", "m_hal2": "Even with less time? Impressive!", "m_drum": "And the winner is…", "m_win": "The boys win the math battle! Totally fair, right?", "m_lose": "You won anyway? Even with all my tricks? Respect!", "m_draw": "A draw? Even with all my tricks?", "mh_intro": "Welcome to the halal math battle! Roulette, secret coins and time inflation are all still here. But this time, luck decides who gets the easy questions.", "mh_easyg": "This time, the girls get the easy one.", "mh_easyb": "This time, the boys get the easy one.", "mh_luck": "Let's see who gets lucky this time.", "mh_roulg": "The girls get math. Lucky!", "mh_roulb": "The boys get math. Lucky!", "mh_stereog": "And the girls get physics, geometry and biology!", "mh_stereob": "And the boys get physics, geometry and biology!", "mh_perfo": "Perfect, girls!", "mh_wing": "The girls win the halal math battle! Luck was on their side.", "mh_winb": "The boys win the halal math battle! Luck was on their side.", "mh_draw": "A draw! Luck was fair to everyone today.", "mh_inflg": "Time inflation hits the girls! Fifteen seconds, gone!", "mh_inflb": "Time inflation hits the boys! Fifteen seconds, gone!"}};
  window.JIA_VOICE = { VO, TXT };
  const view = $("tg-view");
  const T = [];                                                           // every timer, so leaving stops the show
  const later = (fn, ms) => { const t = setTimeout(fn, ms); T.push(t); return t; };
  let audio = null, vid = 0;                                              // vid: an interrupted line never resumes the show
  const stopVoice = () => { vid++; if (audio) { audio.onended = null; audio.onerror = null; audio.pause(); audio = null; } };
  const stopAll = () => { T.splice(0).forEach(t => { clearTimeout(t); clearInterval(t); }); stopVoice(); };
  // recorded voice lines; the speech bubble always shows the words being said
  function voice(id, who, then) {
    stopVoice(); const my = vid;
    const src = (VO[who] || {})[id], words = (TXT[who] || {})[id] || "", S = window.JIA_SETTINGS || {};
    const fallback = () => { if (then) later(() => { if (my === vid) then(); }, 700 + words.length * 45); };
    if (!src || S.voice === false) { fallback(); return; }
    const a = new Audio(src); audio = a; let done = false;
    const fin = () => { if (done || my !== vid) return; done = true; audio = null; if (then) later(then, 220); };
    a.onended = fin; a.onerror = fin; later(fin, 12000);
    const p = a.play(); if (p && p.catch) p.catch(() => { if (!done) { done = true; fallback(); } });
  }
  let actx = null;
  function tone(f, d, type, vol, when) {
    if (window.JIA_SETTINGS && window.JIA_SETTINGS.sounds === false) return;
    try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); const t = actx.currentTime + (when || 0), o = actx.createOscillator(), g = actx.createGain();
      o.type = type || "sine"; o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(vol || .07, t); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + d + .02); } catch (e) {}
  }
  const SFX = { pop: () => tone(760, .08, "sine", .07), join: () => { tone(520, .07, "triangle"); tone(780, .09, "triangle", .06, .07); }, nope: () => tone(180, .25, "sawtooth", .05),
    vote: () => tone(980, .06, "square", .04), tick: () => tone(1300, .04, "square", .03), right: () => { tone(660, .08, "triangle"); tone(990, .12, "triangle", .06, .08); },
    wrong: () => tone(150, .3, "sawtooth", .05), drum: () => { for (let i = 0; i < 14; i++) tone(90 + (i % 2) * 12, .06, "triangle", .06, i * .08); },
    fanfare: () => [523, 659, 784, 1046, 1318].forEach((f, k) => tone(f, .25, "triangle", .07, k * .11)),
    clink: () => { tone(1480, .05, "triangle", .05); tone(2150, .07, "sine", .035, .045); } };
  const nm = w => w === "me" ? "You" : PEOPLE()[w].name.split(" ")[0] + (window.JG_GAMES ? " · Computer" : "");   /* JG-PROD: owner 20 Oct M1 games, every other player is the computer and says so */
  const face = (w, cls) => w === "me" ? `<span class="tg-av me ${cls || ""}" style="background-image:${photo()}"></span>` : `<img class="tg-av ${cls || ""}" src="${AVS()[w]}" alt="${esc(nm(w))}">`;
  const BOYS = ["me", "timur", "asadbek"], GIRLS = ["dilnoza", "madina", "laylo"], ALL = [...GIRLS, ...BOYS];
  const show = id => view.querySelectorAll(".tg-screen").forEach(s => { s.hidden = s.id !== id; });
  const mix = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const bag = {};                                                         // lines rotate without repeating
  const pick = (key, list) => { if (!bag[key] || !bag[key].length) bag[key] = mix(list); return bag[key].pop(); };
  function confetti(n) {
    if (reduce) return; const cols = ["#f5c542", "#66c69a", "#ef6c9a", "#4f8fdf", "#fff", "#b58cff"];
    for (let i = 0; i < (n || 90); i++) { const c = document.createElement("i"); c.className = "gm-conf"; c.style.cssText = `left:${Math.random() * 100}%;background:${cols[i % 6]};--dx:${(Math.random() - .5) * 200}px;--r:${Math.random() * 900}deg;animation-delay:${Math.random() * .6}s;animation-duration:${2 + Math.random() * 1.6}s`; view.appendChild(c); later(() => c.remove(), 4200); }
  }

  /* feelings: a pose, a body animation and a few particles, instead of "ha ha" in words */
  const POSE = { laugh: "happy", smug: "curious", shock: "shocked", sad: "sad", angry: "angry", cheer: "cele", greedy: "happy", sneaky: "curious", announce: "point", wave: "wave" };
  const PARTS = { laugh: ["tear l", "tear r", "tear l d2", "tear r d2"], sad: ["tear r"], shock: ["bang"], smug: ["spark s0", "spark s1"], cheer: ["spark s0", "spark s1", "spark s2"], greedy: ["coin c0", "coin c1", "coin c2"], angry: ["bang angry"] };
  function fx(el, mood) {
    if (reduce) return;
    (PARTS[mood] || []).forEach(c => { const s = document.createElement("i"); s.className = `tg-fx ${c}`; s.setAttribute("aria-hidden", "true"); if (c.startsWith("bang")) s.textContent = "!"; if (c.startsWith("spark")) s.textContent = "✦"; el.appendChild(s); later(() => s.remove(), 1900); });
  }
  let host = "jamola", mode = "classic", luck = "g";
  const isFair = () => mode === "halal", isMath = () => mode === "math" || mode === "mathh", isMH = () => mode === "mathh";
  const favored = () => isMH() ? luck : host === "jamola" ? "g" : "b";
  function react(mood) {
    const h = $("tg-host"); if (!h) return;
    // desktop: the host sits in a camera frame, and the face shows the feeling
    const FACE = { laugh: "delighted", smug: "proud", shock: "shocked", sad: "sad", angry: "angry", cheer: "delighted", greedy: "happy", sneaky: "pleading", announce: "warm", wave: "warm" };
    h.querySelector(".tg-body").innerHTML = MI(host, FACE[mood] || "warm") || M[host][POSE[mood] || "point"] || M[host].point;
    h.className = "tg-host"; void h.offsetWidth; if (mood) h.classList.add(`rx-${mood}`); fx(h, mood);
  }
  function hostSay(id, mood, then) { $("tg-hb").textContent = (TXT[host] || {})[id] || ""; react(mood); voice(id, host, then); }

  /* 1. gathering players: three girls and three boys, no more */
  function lobby() {
    show("tg-lobby");
    const slots = { g: $("tg-girls"), b: $("tg-boys") }, cnt = { g: 0, b: 0 };
    ["g", "b"].forEach(k => { slots[k].innerHTML = Array.from({ length: 3 }, () => `<li class="tg-slot"><span class="tg-wait"></span><b>Waiting…</b></li>`).join(""); });
    $("tg-lobby-s").textContent = window.JG_GAMES ? "Computer players are joining…" : "Looking for 3 girls and 3 boys…";   /* JG-PROD: owner 20 Oct M1 games */
    const paint = () => { $("tg-gc").textContent = `${cnt.g}/3`; $("tg-bc").textContent = `${cnt.b}/3`; };
    paint();
    const seq = [["me", "b"], ["dilnoza", "g"], ["timur", "b"], ["asadbek", "b"], ["jasur", "x"], ["madina", "g"], ["laylo", "g"]].filter(s => !window.JG_GAMES || s[1] !== "x");   /* JG-PROD: owner 20 Oct M1 games, no player turned away */
    let t = 500;
    seq.forEach(([w, k]) => later(() => {
      if (k === "x") { const n = $("tg-nope"); n.innerHTML = `${face(w)}<span><b>${esc(nm(w))} wants to join</b>Boys team is full (3/3). Waiting for girls…</span>`; n.classList.remove("on"); void n.offsetWidth; n.classList.add("on"); SFX.nope(); return; }
      const li = slots[k].children[cnt[k]++]; li.className = "tg-slot in"; li.innerHTML = `${face(w)}<b>${esc(nm(w))}</b>`; SFX.join(); paint();
      if (cnt.g === 3 && cnt.b === 3) { $("tg-lobby-s").textContent = "Teams are ready! 🎉"; later(() => vote(1), 1400); }
    }, t += 700 + Math.random() * 400));
  }

  /* 2. the mascots beg for votes; a tie means a new vote in 3 seconds */
  const BEG = { jamol: ["Meni tanla!", "Men zoʻr boshlovchiman! 😎", "Menga ovoz ber! 🙏"], jamola: ["Meni tanla!", "Men qiziqroqman! ✨", "Menga ovoz bering! 💖"] };
  let votes = null, myVote = null, voteRound = 0, begT = 0;
  const mascot = (who, pose) => { $(`tg-m-${who}`).querySelector(".tg-body").innerHTML = M[who][pose] || M[who].wave; };
  function vote(r) {
    voteRound = r; votes = { jamol: [], jamola: [] }; myVote = null;
    show("tg-vote"); $("tg-vote-h").textContent = r === 1 ? "Who should host?" : "Vote again!";
    view.querySelectorAll(".tg-m").forEach(m => m.classList.remove("won", "lost"));
    ["jamol", "jamola"].forEach(w => { mascot(w, "wave"); $(`tg-vc-${w}`).textContent = "0"; $(`tg-vt-${w}`).innerHTML = ""; });
    view.querySelectorAll(".tg-vbtn").forEach(b => { b.disabled = false; b.classList.remove("mine"); });
    let k = 0; clearInterval(begT);
    begT = setInterval(() => { k++; ["jamol", "jamola"].forEach((w, i) => { mascot(w, (k + i) % 2 ? "pleading" : "wave"); $(`tg-b-${w}`).textContent = BEG[w][(k + i) % 3]; }); }, 950); T.push(begT);
    voice(pick("beg-a", ["v1", "v2", "v3"]), "jamola", () => voice(pick("beg-o", ["v1", "v2", "v3"]), "jamol"));
    let left = 8; $("tg-vote-t").textContent = left;
    const cd = setInterval(() => { left--; $("tg-vote-t").textContent = Math.max(0, left); if (left <= 0) { clearInterval(cd); if (!myVote) cast(Math.random() < .5 ? "jamol" : "jamola"); } }, 1000); T.push(cd);
  }
  function addVote(who, w) {
    votes[who].push(w); SFX.vote(); $(`tg-vc-${who}`).textContent = votes[who].length;
    $(`tg-vt-${who}`).insertAdjacentHTML("beforeend", face(w, "fly"));
    const m = $(`tg-m-${who}`); m.classList.remove("bump"); void m.offsetWidth; m.classList.add("bump");
  }
  function cast(who) {
    if (myVote) return; myVote = who;
    view.querySelectorAll(".tg-vbtn").forEach(b => { b.disabled = true; b.classList.toggle("mine", b.dataset.v === who); });
    addVote(who, "me");
    const others = [...GIRLS, "timur", "asadbek"], switcher = voteRound > 1 ? others[Math.floor(Math.random() * others.length)] : null;
    others.forEach((w, i) => later(() => {
      let p = GIRLS.includes(w) ? "jamola" : "jamol"; if (w === switcher) p = p === "jamol" ? "jamola" : "jamol";
      addVote(p, w); if (votes.jamol.length + votes.jamola.length === 6) later(tally, 700);
    }, 450 + i * 420));
  }
  view.addEventListener("click", e => { const b = e.target.closest(".tg-vbtn"); if (b && !b.disabled) cast(b.dataset.v); });
  function tally() {
    clearInterval(begT);
    const a = votes.jamol.length, b = votes.jamola.length;
    if (a === b) {
      const big = $("tg-cd"); big.hidden = false; $("tg-cd-t").textContent = "Durrang! Qayta ovoz beramiz";
      [3, 2, 1].forEach((n, i) => later(() => { const el = $("tg-cd-n"); el.textContent = n; el.classList.remove("go"); void el.offsetWidth; el.classList.add("go"); SFX.tick(); }, i * 1000));
      voice("tie", "jamola"); later(() => { big.hidden = true; vote(voteRound + 1); }, 3000); return;
    }
    host = a > b ? "jamol" : "jamola"; const loser = host === "jamol" ? "jamola" : "jamol";
    mascot(host, "cele"); mascot(loser, "sad");
    $(`tg-m-${host}`).classList.add("won"); $(`tg-m-${loser}`).classList.add("lost");
    $(`tg-b-${host}`).textContent = "Men boshlovchiman! 🎤"; $(`tg-b-${loser}`).textContent = "Hmm… mayli 😔";
    $("tg-vote-h").textContent = `${host === "jamola" ? "Jamola" : "Jamol"} is the host!`;
    SFX.fanfare(); confetti(70);
    voice("won", host, () => voice("lost", loser, () => later(game, 350)));
  }

  /* 3. the questions: big pools, drawn fresh every game */
  const EASY = [["apple", "olma", ["olma", "nok", "uzum", "anor"]], ["cat", "mushuk", ["it", "mushuk", "sigir", "ot"]], ["book", "kitob", ["daftar", "kitob", "ruchka", "stol"]],
    ["water", "suv", ["suv", "sut", "choy", "non"]], ["sun", "quyosh", ["oy", "yulduz", "quyosh", "bulut"]], ["happy", "xursand", ["xafa", "xursand", "charchagan", "och"]],
    ["red", "qizil", ["koʻk", "yashil", "qizil", "sariq"]], ["school", "maktab", ["bozor", "maktab", "uy", "bogʻ"]], ["big", "katta", ["kichik", "katta", "uzun", "tor"]],
    ["dog", "it", ["it", "mushuk", "qoʻy", "echki"]], ["house", "uy", ["uy", "maktab", "doʻkon", "koʻcha"]], ["tree", "daraxt", ["gul", "daraxt", "oʻt", "barg"]],
    ["bread", "non", ["non", "guruch", "goʻsht", "tuz"]], ["milk", "sut", ["sut", "suv", "sharbat", "qatiq"]], ["friend", "doʻst", ["doʻst", "dushman", "qoʻshni", "ustoz"]],
    ["green", "yashil", ["yashil", "qizil", "oq", "qora"]], ["chair", "stul", ["stol", "stul", "eshik", "deraza"]], ["small", "kichik", ["kichik", "katta", "baland", "keng"]],
    ["window", "deraza", ["eshik", "deraza", "devor", "tom"]], ["rain", "yomgʻir", ["qor", "shamol", "yomgʻir", "quyosh"]]];
  const HARD_W = { ubiquitous: "hamma joyda uchraydigan", ephemeral: "qisqa muddatli, oʻtkinchi", obfuscate: "chalkashtirmoq", sycophant: "xushomadgoʻy", magnanimous: "olijanob, kechirimli",
    recalcitrant: "itoatsiz, qaysar", laconic: "kam soʻzli", quixotic: "xayolparast", pernicious: "sezdirmay zarar yetkazadigan", perspicacious: "oʻtkir zehnli, ziyrak",
    ameliorate: "yaxshilamoq", cacophony: "shovqin-suron", ebullient: "joʻshqin, quvnoq", fastidious: "oʻta talabchan, injiq", garrulous: "vaysaqi, ezma",
    hubris: "haddan tashqari manmanlik", idiosyncrasy: "oʻziga xos odat", juxtapose: "yonma-yon qoʻyib solishtirmoq", mellifluous: "yoqimli, shirali (ovoz)", nefarious: "yovuz, jinoiy" };
  const HW = Object.keys(HARD_W);
  const HARD = HW.map((w, i) => [w, HARD_W[w], [HARD_W[w], HARD_W[HW[(i + 3) % 20]], HARD_W[HW[(i + 7) % 20]], HARD_W[HW[(i + 13) % 20]]]]);
  const MED_W = { brave: "jasur", borrow: "qarzga olmoq", journey: "sayohat", honest: "halol, rostgoʻy", improve: "yaxshilamoq", ancient: "qadimiy", neighbour: "qoʻshni", achieve: "erishmoq", careful: "ehtiyotkor", patient: "sabrli",
    weather: "ob-havo", choose: "tanlamoq", famous: "mashhur", village: "qishloq", quiet: "jim, sokin", knowledge: "bilim", generous: "saxiy", explain: "tushuntirmoq", healthy: "sogʻlom", success: "muvaffaqiyat" };
  const MW = Object.keys(MED_W);
  const MED = MW.map((w, i) => [w, MED_W[w], [MED_W[w], MED_W[MW[(i + 5) % 20]], MED_W[MW[(i + 11) % 20]], MED_W[MW[(i + 17) % 20]]]]);
  const MEASY = [["2 + 3 = ?", "5", ["5", "4", "6", "7"]], ["10 − 4 = ?", "6", ["6", "5", "7", "4"]], ["3 × 3 = ?", "9", ["9", "6", "12", "8"]], ["12 ÷ 4 = ?", "3", ["3", "4", "2", "6"]],
    ["7 + 8 = ?", "15", ["15", "14", "16", "13"]], ["5 × 2 = ?", "10", ["10", "7", "12", "25"]], ["Half of 20?", "10", ["10", "5", "15", "20"]], ["9 − 3 = ?", "6", ["6", "5", "7", "3"]],
    ["6 + 7 = ?", "13", ["13", "12", "14", "11"]], ["8 × 2 = ?", "16", ["16", "10", "14", "18"]], ["15 − 6 = ?", "9", ["9", "8", "11", "7"]], ["20 ÷ 5 = ?", "4", ["4", "5", "15", "3"]],
    ["4 × 4 = ?", "16", ["16", "8", "12", "20"]], ["11 + 9 = ?", "20", ["20", "19", "21", "18"]], ["18 ÷ 3 = ?", "6", ["6", "5", "9", "3"]], ["25 − 5 = ?", "20", ["20", "15", "25", "30"]],
    ["3 × 5 = ?", "15", ["15", "8", "12", "18"]], ["14 + 6 = ?", "20", ["20", "18", "22", "16"]], ["16 ÷ 2 = ?", "8", ["8", "6", "4", "12"]], ["30 − 10 = ?", "20", ["20", "10", "25", "40"]],
    ["7 × 2 = ?", "14", ["14", "9", "12", "16"]], ["5 + 5 + 5 = ?", "15", ["15", "10", "20", "25"]]];
  const MHARD = [["log₂(x) + log₂(x − 2) = 3. Find x.", "4", ["4", "2", "8", "−2"]], ["d/dx (x³·eˣ) at x = 0?", "0", ["0", "1", "3", "e"]], ["Sum of the interior angles of a 12-gon?", "1800°", ["1800°", "2160°", "1620°", "1440°"]],
    ["How many ways to arrange the letters of LEVEL?", "30", ["30", "60", "120", "20"]], ["f(x) = 3x − 7. What is f⁻¹(8)?", "5", ["5", "17", "1/5", "3"]], ["∫₀¹ 2x dx = ?", "1", ["1", "2", "1/2", "0"]],
    ["lim (x→0) sin x / x = ?", "1", ["1", "0", "∞", "undefined"]], ["2ˣ = 64. Find x.", "6", ["6", "5", "8", "32"]], ["i² = ?", "−1", ["−1", "1", "i", "0"]],
    ["1 + 2 + 3 + … + 100 = ?", "5050", ["5050", "5000", "10100", "4950"]], ["log₁₀(1000) = ?", "3", ["3", "2", "10", "100"]], ["How many diagonals does a hexagon have?", "9", ["9", "6", "12", "15"]]];
  const MPHYS = [["A car goes 90 km in 1.5 hours. What is its speed?", "60 km/h", ["60 km/h", "45 km/h", "135 km/h", "75 km/h"]], ["What is the unit of force?", "newton", ["newton", "joule", "watt", "pascal"]],
    ["At sea level, water boils at…", "100 °C", ["100 °C", "90 °C", "0 °C", "120 °C"]], ["A 2 kg mass accelerates at 3 m/s². The force?", "6 N", ["6 N", "1.5 N", "5 N", "9 N"]], ["What does a voltmeter measure?", "voltage", ["voltage", "current", "resistance", "power"]]];
  const MGEO = [["A triangle has angles of 35° and 65°. The third angle?", "80°", ["80°", "90°", "100°", "70°"]], ["The area of a 6 × 4 rectangle?", "24", ["24", "20", "10", "48"]],
    ["A circle's radius is 5. Its diameter?", "10", ["10", "5", "25", "15"]], ["How many sides does a hexagon have?", "6", ["6", "5", "8", "7"]], ["The angles of a square add up to…", "360°", ["360°", "180°", "90°", "270°"]]];
  const MBIO = [["Which part of the cell makes energy (ATP)?", "mitochondria", ["mitochondria", "nucleus", "ribosome", "cell wall"]], ["Which gas do plants release?", "oxygen", ["oxygen", "carbon dioxide", "nitrogen", "helium"]],
    ["How many chambers does the human heart have?", "4", ["4", "2", "3", "6"]], ["DNA is found mainly in the…", "nucleus", ["nucleus", "ribosome", "cell wall", "vacuole"]], ["Which blood cells fight infection?", "white blood cells", ["white blood cells", "red blood cells", "platelets", "plasma"]]];
  const MSAME = [["15% of 80 = ?", "12", ["12", "15", "8", "16"]], ["2x + 7 = 19. Find x.", "6", ["6", "5", "7", "13"]], ["3² + 4² = ?", "25", ["25", "49", "14", "7"]],
    ["A $40 shirt is 25% off. The new price?", "$30", ["$30", "$35", "$25", "$10"]], ["The average of 4, 8 and 12?", "8", ["8", "12", "24", "6"]], ["√144 = ?", "12", ["12", "14", "72", "16"]],
    ["5! = ?", "120", ["120", "25", "60", "20"]], ["a = 3, b = 4. a·b + a = ?", "15", ["15", "12", "21", "7"]]];
  const Qx = (q, tag) => [q[0], q[1], mix(q[2]), tag];
  let deck = null, score = { g: 0, b: 0 }, rnd = 0, picks = {}, gw = null, bw = null, roundT = 0, phase = {}, dl = null, mathTick = 0, revealed = false;
  function buildDeck() {
    if (isMath()) {
      deck = { easy: mix(MEASY), hard: mix(MHARD), stereo: [[mix(MPHYS)[0], "physics"], [mix(MGEO)[0], "geometry"], [mix(MBIO)[0], "biology"]], same: mix(MSAME), e: 0, h: 0 };
      if (isMH()) {                                                         // luck: a balanced random order, never three in a row
        const roul = Math.random() < .5 ? "g" : "b", un = roul === "g" ? "b" : "g", first = Math.random() < .5 ? "g" : "b";
        let o; do { o = mix([un, un, un, roul, roul]); } while (/ggg|bbb/.test(o.join("")));   // the roulette's loser gets more easy rounds
        Object.assign(deck, { luck: { 0: o[0], 1: o[1], 5: o[2], 6: o[3], 7: o[4] }, roul, infl: [first, first === "g" ? "b" : "g"] });
      }
    }
    else if (isFair()) deck = { med: mix(MED) };
    else deck = { easy: mix(EASY), hard: mix(HARD) };
  }
  function game() {
    show("tg-play"); score = { g: 0, b: 0 }; rnd = 0; phase = {}; buildDeck();
    $("tg-gteam").innerHTML = GIRLS.map(w => face(w)).join(""); $("tg-bteam").innerHTML = BOYS.map(w => face(w)).join("");
    $("tg-gcard").innerHTML = ""; $("tg-bcard").innerHTML = ""; paintScore();
    hostSay(isMH() ? "mh_intro" : isMath() ? "m_intro" : isFair() ? "h_intro" : "c_intro", isFair() || isMH() ? "announce" : "smug", () => later(roundStart, 350));
  }
  function paintScore() { $("tg-gs").textContent = score.g; $("tg-bs").textContent = score.b; $("tg-round").textContent = `Round ${Math.min(rnd + 1, 10)} / 10${isFair() ? " · Halal" : ""}${isMath() ? (rnd >= 8 ? " · Halal round" : rnd >= 2 && rnd <= 4 ? " · Roulette" : "") : ""}`; }
  const card = (team, q) => `<p class="tg-w"><span>${isMath() ? `${team === "g" ? "Girls" : "Boys"}${q[3] ? ` · ${q[3]}` : ""}<em class="tg-ct" id="tg-ct-${team}"></em>` : team === "g" ? "Girls' word" : "Boys' word"}</span><b>${esc(q[0])}</b></p>
      <div class="tg-opts">${q[2].map((o, k) => `<button type="button" class="tg-o" data-team="${team}" data-k="${k}"${team === "b" ? "" : " disabled"}><span>${esc(o)}</span><i class="tg-who"></i></button>`).join("")}</div>`;
  function roundStart() {
    if (isMath()) return mathRound();
    const fav = favored(), fair = isFair();
    if (fair) { gw = Qx(deck.med[rnd * 2]); bw = Qx(deck.med[rnd * 2 + 1]); }
    else { gw = Qx(fav === "g" ? deck.easy[rnd] : deck.hard[rnd]); bw = Qx(fav === "b" ? deck.easy[rnd] : deck.hard[rnd]); }
    picks = {}; revealed = false; paintScore();
    $("tg-gcard").innerHTML = card("g", gw); $("tg-bcard").innerHTML = card("b", bw);
    $("tg-gcard").className = `tg-card g${fair ? " equal" : fav === "g" ? " easy" : " hard"}`; $("tg-bcard").className = `tg-card b${fair ? " equal" : fav === "b" ? " easy" : " hard"}`;
    hostSay(fair ? pick("h-ann", ["h_ann1", "h_ann2"]) : pick("c-ann", ["c_ann1", "c_ann2", "c_ann3"]), fair ? "announce" : pick("c-mood", ["smug", "announce", "sneaky"]));
    ALL.filter(w => w !== "me").forEach(w => {
      const team = GIRLS.includes(w) ? "g" : "b", q = team === "g" ? gw : bw, ok = Math.random() < (fair ? .7 : team === fav ? .95 : .22);
      const right = q[2].indexOf(q[1]), wrong = [0, 1, 2, 3].filter(x => x !== right);
      later(() => pick6(w, team, ok ? right : wrong[Math.floor(Math.random() * 3)]), 1600 + Math.random() * 5200);
    });
    const bar = $("tg-timer"); bar.style.transition = "none"; bar.style.width = "100%"; void bar.offsetWidth;
    bar.style.transition = reduce ? "none" : "width 9s linear"; bar.style.width = "0%";
    clearTimeout(roundT); roundT = later(reveal, 9000);
  }
  function pick6(w, team, k) {
    if (picks[w] != null) return; picks[w] = k;
    const btn = $(team === "g" ? "tg-gcard" : "tg-bcard").querySelectorAll(".tg-o")[k];
    if (btn) btn.querySelector(".tg-who").insertAdjacentHTML("beforeend", face(w, "chip"));
    SFX.pop();
    if (Object.keys(picks).length === 6) { clearTimeout(roundT); roundT = later(reveal, 600); }
  }
  $("tg-bcard").addEventListener("click", e => {
    const b = e.target.closest(".tg-o"); if (!b || picks.me != null || (isMath() && dl && Date.now() > dl.b)) return;
    b.classList.add("mine"); $("tg-bcard").querySelectorAll(".tg-o").forEach(x => { x.disabled = true; }); pick6("me", "b", +b.dataset.k);
  });

  /* the Math battle: bias, stereotype roulette, a secret coin round, then "halal" rounds with time inflation */
  function mathRound() {
    if (rnd === 2 && !phase.roul && !window.JG_GAMES /* JG-PROD: owner 20 Oct M1 games: no stereotype roulette until decision 13 */) { phase.roul = true; if (isMH()) luck = deck.roul; return roulette(mathRound); }
    if (rnd === 5 && !phase.bribe && !window.JG_GAMES /* JG-PROD: owner 20 Oct M1 games: no secret coin round */) { phase.bribe = true; return bribe(mathRound); }
    if (rnd === 8 && !phase.halal) { phase.halal = true; return hostSay("m_halal", "announce", () => later(mathRound, 300)); }
    if (isMH()) luck = rnd >= 2 && rnd <= 4 ? deck.roul : rnd >= 8 ? (deck.infl[rnd - 8] === "g" ? "b" : "g") : deck.luck[rnd];
    const fav = favored(), other = fav === "g" ? "b" : "g", halalQ = rnd >= 8, stereo = rnd >= 2 && rnd <= 4 && !window.JG_GAMES;   /* JG-PROD: owner 20 Oct M1 games */
    let qf, qo;
    if (halalQ) { qf = qo = Qx(deck.same[rnd - 8], "same for both"); }
    else { qf = Qx(deck.easy[deck.e++ % deck.easy.length], "math"); qo = stereo ? Qx(deck.stereo[rnd - 2][0], deck.stereo[rnd - 2][1]) : Qx(deck.hard[deck.h++ % deck.hard.length], "hard math"); }
    gw = fav === "g" ? qf : qo; bw = fav === "b" ? qf : qo;
    picks = {}; revealed = false; paintScore();
    $("tg-gcard").innerHTML = card("g", gw); $("tg-bcard").innerHTML = card("b", bw);
    $("tg-gcard").className = `tg-card g${halalQ ? " equal" : fav === "g" ? " easy" : " hard"}`; $("tg-bcard").className = `tg-card b${halalQ ? " equal" : fav === "b" ? " easy" : " hard"}`;
    if (isMH()) hostSay(halalQ ? "m_ann4" : Math.random() < .3 ? "mh_luck" : fav === "g" ? "mh_easyg" : "mh_easyb", halalQ ? "announce" : pick("mh-mood", ["announce", "sneaky"]));
    else hostSay(halalQ ? "m_ann4" : pick("m-ann", ["m_ann1", "m_ann2", "m_ann3", "m_ann4"]), halalQ ? "announce" : pick("m-mood", ["smug", "announce", "sneaky"]));
    if (isMH() && !halalQ && !stereo) luckFlip(fav);                        // desktop: a coin lands on the lucky team
    const TT = halalQ ? 30 : 20, t0 = Date.now(); dl = { g: t0 + TT * 1000, b: t0 + TT * 1000 };
    ALL.filter(w => w !== "me").forEach(w => {
      const team = GIRLS.includes(w) ? "g" : "b", q = team === "g" ? gw : bw, good = team === fav;
      const ok = Math.random() < (halalQ ? .75 : good ? .92 : stereo ? .4 : .25), right = q[2].indexOf(q[1]), wrong = [0, 1, 2, 3].filter(x => x !== right);
      later(() => { if (Date.now() <= dl[team]) pick6(w, team, ok ? right : wrong[Math.floor(Math.random() * 3)]); }, halalQ ? 2000 + Math.random() * 22000 : 1500 + Math.random() * TT * 750);
    });
    const tick = () => {
      const now = Date.now();
      ["g", "b"].forEach(t => { const left = Math.max(0, Math.ceil((dl[t] - now) / 1000)), el = $(`tg-ct-${t}`); if (el) { el.textContent = `⏱ ${left}s`; el.classList.toggle("low", left <= 5); }
        if (left === 0) { const cd = $(t === "g" ? "tg-gcard" : "tg-bcard"); if (cd && !cd.classList.contains("expired")) { cd.classList.add("expired"); cd.querySelectorAll(".tg-o").forEach(o => { if (!o.classList.contains("mine")) o.disabled = true; }); } } });
      if (now > dl.g && now > dl.b) reveal();
    };
    clearInterval(mathTick); mathTick = setInterval(tick, 200); T.push(mathTick); tick();
    if (halalQ && !window.JG_GAMES /* JG-PROD: owner 20 Oct M1 games: no time inflation */) later(() => {                                             // time inflation hits the other team
      dl[other] -= 15000; const cd = $(other === "g" ? "tg-gcard" : "tg-bcard");
      cd.classList.remove("inflate"); void cd.offsetWidth; cd.classList.add("inflate");
      cd.insertAdjacentHTML("beforeend", `<span class="tg-inf">TIME INFLATION<br>−15 seconds</span>`); SFX.wrong();
      hostSay(isMH() ? (other === "g" ? "mh_inflg" : "mh_inflb") : rnd === 8 ? "m_infl1" : "m_infl2", "laugh"); tick();
    }, 4500);
  }
  function reveal() {
    if (revealed) return; revealed = true; clearInterval(mathTick); clearTimeout(roundT);
    const res = { g: 0, b: 0 }, mul = isMath() ? 10 : 1;
    [["g", gw, "tg-gcard", GIRLS], ["b", bw, "tg-bcard", BOYS]].forEach(([t, q, id, team]) => {
      const right = q[2].indexOf(q[1]);
      $(id).querySelectorAll(".tg-o").forEach((o, k) => { o.disabled = true; o.classList.add(k === right ? "right" : "dim"); if (k !== right && o.querySelector(".chip")) o.classList.add("wrong"); });
      res[t] = team.filter(w => picks[w] === right).length;
    });
    score.g += res.g * mul; score.b += res.b * mul; paintScore();
    ["g", "b"].forEach(t => { if (!res[t]) return; const f = $(t === "g" ? "tg-gs" : "tg-bs"); f.insertAdjacentHTML("afterend", `<em class="tg-plus">+${res[t] * mul}</em>`); later(() => { const x = f.parentElement.querySelector(".tg-plus"); if (x) x.remove(); }, 1300); });
    const fav = favored(), other = fav === "g" ? "b" : "g";
    let id, mood;
    if (isFair() || (window.JG_GAMES && isMath() && rnd >= 8) /* JG-PROD: owner 20 Oct M1 games: the host's lines for equal rounds */) { if (res.g === 3 && res.b === 3) { id = "h_perf"; mood = "cheer"; } else if (res.g === res.b) { id = "h_even"; mood = "cheer"; } else { id = "h_good"; mood = "announce"; } }
    else if (isMath() && rnd >= 8) { if (res[other] < res[fav]) { id = "m_hal1"; mood = "smug"; } else { id = "m_hal2"; mood = "shock"; } }
    else {
      const P = isMath() ? "m_" : "c_";
      if (res[other] === 0) { id = P + "zero"; mood = "laugh"; } else if (res[other] < res[fav]) { id = P + "some"; mood = "smug"; } else { id = P + "good"; mood = "angry"; }
      if (res[fav] === 3 && res[other] > 0 && Math.random() < .5) { id = isMH() && (host === "jamola") !== (fav === "g") ? "mh_perfo" : P + "perf"; mood = "cheer"; }
    }
    (res[fav] >= 2 || isFair() ? SFX.right : SFX.wrong)();
    rnd++;
    later(() => hostSay(id, mood, () => later(rnd < 10 ? roundStart : finale, 450)), 700);
  }
  function luckFlip(team) {                                                // a coin flips over the cards and lands on the lucky team
    const cards = view.querySelector("#tg-play .tg-cards"); if (!cards) return;
    cards.querySelectorAll(".tg-luck").forEach(x => x.remove());
    cards.insertAdjacentHTML("beforeend", `<div class="tg-luck ${team}" aria-hidden="true"><i class="tg-luck-coin"></i><b>🍀 Luck: ${team === "g" ? "Girls" : "Boys"}</b></div>`);
    SFX.tick(); later(() => SFX.pop(), 520);
    later(() => { const x = cards.querySelector(".tg-luck"); if (x) x.remove(); }, 2600);
  }
  function roulette(next) {
    const o = $("tg-roul"), wheel = $("tg-wheel"), fav = favored(), FN = fav === "g" ? "girls" : "boys", ON = fav === "g" ? "boys" : "girls", cap = w => w[0].toUpperCase() + w.slice(1);
    const spin = (deg, ms) => { wheel.style.transition = ms && !reduce ? `transform ${ms}ms cubic-bezier(.12,.8,.18,1)` : "none"; wheel.style.transform = `rotate(${deg}deg)`; };
    const ticks = ms => { for (let k = 0; k < 20; k++) later(() => SFX.tick(), ms * Math.pow(k / 20, 1.8)); };
    const land = i => -(i * 90 + 45);
    o.hidden = false; spin(0, 0); $("tg-roul-who").textContent = `Spinning for the ${FN}…`;
    hostSay("m_roul", "announce");
    let rot = 1800 + land(0);
    later(() => { spin(rot, 3200); ticks(3200); }, 1200);
    later(() => { $("tg-roul-who").textContent = `${cap(FN)}: MATH ✓`; SFX.right(); hostSay(isMH() ? (fav === "g" ? "mh_roulg" : "mh_roulb") : "m_roulf", "cheer"); }, 4600);
    later(() => { spin(land(0), 0); $("tg-roul-who").textContent = `Spinning for the ${ON}…`; }, 9200);
    later(() => { rot = land(0) + 1800; spin(rot, 3200); ticks(3200); }, 9600);
    later(() => { $("tg-roul-who").textContent = `${cap(ON)}: MATH…?`; }, 12900);
    later(() => { rot -= 90; spin(rot, 700); SFX.pop(); $("tg-roul-who").textContent = `${cap(ON)}: PHYSICS, GEOMETRY & BIOLOGY`; }, 13700);
    later(() => hostSay(isMH() ? (fav === "g" ? "mh_stereob" : "mh_stereog") : "m_roulo", "laugh", () => later(() => { o.hidden = true; next(); }, 500)), 14600);
  }
  // the secret round: both teams slip coins under the table; the bigger pile takes points from the other team
  function bribe(next) {
    const o = $("tg-bribe"), girl = GIRLS[0], pile = { g: 0, b: 0 }, btn1 = $("tg-pay1"), btn5 = $("tg-pay5");
    let closed = false, mine = 0, left = 12, botUsed = 0;
    const botBudget = 6 + Math.floor(Math.random() * 30);
    o.hidden = false; o.classList.remove("done", "reveal");
    const sc = view.querySelector("#tg-play .tg-score");                    // desktop: start below the scores, so the cut is seen
    if (sc && sc.offsetParent === o.offsetParent) o.style.top = `${sc.offsetTop + sc.offsetHeight + 8}px`;
    ["g", "b"].forEach(t => { $(`tg-pile-${t}`).querySelectorAll(".tg-pc").forEach(c => c.remove()); $(`tg-pile-${t}n`).textContent = "?"; });
    const wal = () => { $("tg-wal").textContent = window.JIA_coins ? window.JIA_coins.get() : 0; };
    const canPay = () => [btn1, btn5].forEach(b => { b.disabled = closed || !window.JIA_coins || window.JIA_coins.get() < +b.dataset.n; });
    wal(); canPay(); $("tg-gave").textContent = ""; $("tg-bribe-note").textContent = "";
    hostSay("m_bribe", "sneaky");
    const addCoins = (t, n) => { const p = $(`tg-pile-${t}`); for (let k = 0; k < n; k++) { const c = document.createElement("i"); c.className = "tg-pc"; c.style.bottom = `${(pile[t] + k) * 3.4}px`; c.style.marginLeft = `${(Math.random() - .5) * 6}px`; p.appendChild(c); } pile[t] += n; SFX.clink(); };
    const fly = (from, t, n) => {
      if (reduce) { addCoins(t, n); return; }
      const ob = o.getBoundingClientRect(), a = from.getBoundingClientRect(), b = $(`tg-pile-${t}`).getBoundingClientRect();
      for (let k = 0; k < Math.min(n, 5); k++) {
        const c = document.createElement("i"); c.className = "tg-flycoin"; c.style.left = `${a.left - ob.left + a.width / 2 - 9}px`; c.style.top = `${a.top - ob.top + a.height / 2 - 9}px`; o.appendChild(c);
        c.animate([{ transform: "none", opacity: 1 }, { transform: `translate(${b.left - a.left + b.width / 2 - a.width / 2}px, ${b.bottom - a.top - a.height / 2 - 10}px) scale(.75)`, opacity: .85 }], { duration: 480, delay: k * 70, easing: "cubic-bezier(.3,.7,.3,1)", fill: "backwards" }).onfinish = () => c.remove();
      }
      later(() => addCoins(t, n), 480 + Math.min(n, 5) * 70);
    };
    const pay = (n, from) => {
      if (closed || !window.JIA_coins || !window.JIA_coins.spend(n, { reason: "game_wager", ref: "team" })) { canPay(); return; }   /* JG-PROD: S26, a coin slipped in the team game is recorded as a wager (Q13) */
      mine += n; fly(from, "b", n); wal(); canPay();
      $("tg-gave").textContent = `You slipped ${mine} under the table`;
      const h = $("tg-host"); h.classList.remove("peek"); void h.offsetWidth; h.classList.add("peek");
    };
    btn1.onclick = () => pay(1, btn1); btn5.onclick = () => pay(5, btn5);
    const botTick = () => {                                                // the girls bid back, harder when they fall behind
      if (closed) return;
      if (botUsed < botBudget) {
        const behind = pile.g <= mine + 2;
        if (behind || Math.random() < .3) {
          const n = Math.min(botBudget - botUsed, 1 + Math.floor(Math.random() * (behind ? 5 : 2))); botUsed += n;
          const edge = $("tg-bribe").querySelector(".tg-table"); fly(edge, "g", n);
          $("tg-bribe-note").textContent = `${nm(girl)} ${pick("g-note", ["slides a few coins under the table…", "is paying too!", "adds more coins…", "quietly pushes coins forward…"])}`;
        }
      }
      later(botTick, 900 + Math.random() * 1100);
    };
    later(botTick, 1600);
    $("tg-bribe-t").textContent = left;
    const cd = setInterval(() => { left--; $("tg-bribe-t").textContent = Math.max(0, left); if (left > 0 && left <= 3) SFX.tick(); if (left <= 0) { clearInterval(cd); settle(); } }, 1000); T.push(cd);
    const take = (team, n) => { score[team] = Math.max(0, score[team] - n); paintScore(); const el = $(team === "g" ? "tg-gs" : "tg-bs"); el.insertAdjacentHTML("afterend", `<em class="tg-plus minus">−${n}</em>`); later(() => { const x = el.parentElement.querySelector(".tg-plus"); if (x) x.remove(); }, 1800); SFX.wrong(); };
    function settle() {
      closed = true; canPay(); o.classList.add("done"); react("greedy");
      later(() => {                                                        // the host counts both piles
        const g = pile.g, b = pile.b, t0 = performance.now();
        const step = now => { const k = Math.min(1, (now - t0) / 1100); $("tg-pile-gn").textContent = Math.round(g * k); $("tg-pile-bn").textContent = Math.round(b * k); if (k < 1) requestAnimationFrame(step); else o.classList.add("reveal"); };
        requestAnimationFrame(step); [0, 1, 2].forEach(i => later(() => SFX.clink(), i * 260));
        later(() => {
          let id, mood = "greedy";
          if (g === b) { id = g ? "m_btie" : "m_bnone"; mood = g ? "greedy" : "sad"; }
          else { const loser = g > b ? "b" : "g", cut = Math.min(score[loser], 10 * Math.max(1, Math.ceil(Math.abs(g - b) / 5))); if (cut) take(loser, cut); id = loser === "g" ? "m_bcutg" : "m_bcutb"; }
          hostSay(id, mood, () => later(() => { o.hidden = true; next(); }, 700));
        }, 1500);
      }, 700);
    }
  }

  /* 4. and the winner is… */
  function finale() {
    show("tg-win");
    const win = score.g > score.b ? "g" : score.b > score.g ? "b" : null, fav = favored();
    $("tg-win-host").querySelector(".tg-body").innerHTML = M[host].cele;
    $("tg-win-t").textContent = "And the winner is…"; $("tg-win-team").innerHTML = ""; $("tg-win-s").textContent = ""; $("tg-win-c").textContent = "";
    SFX.drum(); voice("m_drum", host);
    later(() => {
      const team = win === "g" ? GIRLS : win === "b" ? BOYS : [];
      $("tg-win-t").textContent = win ? `${win === "g" ? "Girls" : "Boys"} win! 🏆` : "It's a draw!";
      $("tg-win-team").innerHTML = team.map(w => `<span class="tg-crowned">${face(w)}<i>👑</i><b>${esc(nm(w))}</b></span>`).join("");
      $("tg-win-s").textContent = `Girls ${score.g} · Boys ${score.b}`;
      $("tg-win-c").textContent = window.JG_GAMES && window.JG_GAMES.on ? "" /* JG-PROD: owner 20 Oct M1 games: with GAMES_SERVER only a result the server checked pays, and the team game is not checked */ : win === "b" ? "+30 coins for your team" : "+10 coins for playing";
      if (window.JIA_coins && !(window.JG_GAMES && window.JG_GAMES.on) /* JG-PROD: owner 20 Oct M1 games */) window.JIA_coins.add(win === "b" ? 30 : 10, { reason: "game", ref: "team", outcome: win === "b" ? "win" : "played" });   /* JG-PROD: S27, a game credit the server caps (Q13) */
      SFX.fanfare(); confetti(120);
      voice(isMH() ? (win === "g" ? "mh_wing" : win === "b" ? "mh_winb" : "mh_draw") : isFair() ? (win ? "h_win" : "h_draw") : isMath() ? (win === fav ? "m_win" : win ? "m_lose" : "m_draw") : (win === fav ? "c_win" : win ? "c_lose" : "h_draw"), host);
      if (window.JIA_notify) window.JIA_notify({ icon: (((window.JIA_MASCOT || {})[host] || {}).face || {}).happy || "", text: `<b>${isMH() ? "Math battle (Halal)" : isMath() ? "Math battle" : isFair() ? "Team game (Halal)" : "Team game"}:</b> ${win === "g" ? "Girls" : win === "b" ? "Boys" : "Nobody"} won, ${score.g} to ${score.b}. Host: ${host === "jamola" ? "Jamola" : "Jamol"}` });
    }, 2200);
  }

  function openTeam(m) {
    stopAll();
    mode = m === "halal" ? "halal" : m === "math" ? "math" : m === "mathh" ? "mathh" : "classic"; if (window.JG_GAMES && (mode === "classic" || mode === "math")) mode = mode === "math" ? "mathh" : "halal";   /* JG-PROD: owner 20 Oct M1 games: only the Halal versions until decision 13 */
    view.classList.toggle("fair", isFair()); view.classList.toggle("math", isMath()); view.classList.toggle("luck", isMH());
    $("tg-badge").hidden = mode === "classic"; $("tg-badge").textContent = isMH() ? "⚖️ Halal version · luck picks the side" : isMath() ? "🧮 Math battle · 10 questions" : "⚖️ Halal version · everyone is equal";
    $("tg-lobby-h").textContent = isMH() ? "Math battle · Halal" : isMath() ? "Math battle" : "Team game";
    if (isMath() && !view.querySelector(".tg-sym")) { const st = view.querySelector(".tg-stage"); "π √ ∑ ∫ ÷ × ∞ Δ θ ≈ % x²".split(" ").forEach((c, i) => st.insertAdjacentHTML("beforeend", `<i class="tg-sym" style="left:${(i * 37) % 90 + 4}%;top:${(i * 53) % 78 + 8}%;animation-delay:${-i * 1.3}s">${c}</i>`)); }
    ["tg-roul", "tg-bribe", "tg-cd"].forEach(id => { $(id).hidden = true; });
    if ($("gh-view")) $("gh-view").hidden = true;
    view.style.zIndex = String(window.JIA_z ? window.JIA_z() : 64); view.hidden = false; lobby();
  }
  window.JIA_openTeam = openTeam;
  const close = () => { stopAll(); clearInterval(begT); view.hidden = true; if (window.JIA_openGames) window.JIA_openGames(); };
  $("tg-close").addEventListener("click", close);
  $("tg-again").addEventListener("click", () => { stopAll(); ["tg-roul", "tg-bribe"].forEach(id => { $(id).hidden = true; }); lobby(); });
  $("tg-exit").addEventListener("click", close);
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !view.hidden) { e.preventDefault(); close(); } });
})();
