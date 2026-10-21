
/* ==========================================================
   MINI GAMES, desktop — what the game room needs from the rest of
   the app: the opponents (names and photos), the Mafia art, the
   notifications, and a confirm dialog of its own (the browser's
   own confirm can be blocked when the page is embedded).
   ========================================================== */
(() => {
  "use strict";
  const { $ } = window.JIA;
  const DATA = {"people": {"asadbek": {"name": "Asadbek Y.", "av": "/d/student-desktop/media/c6096967d1b102e3.webp"}, "dilnoza": {"name": "Dilnoza R.", "av": "/d/student-desktop/media/4fa18afb46ee90b5.webp"}, "timur": {"name": "Timur K.", "av": "/d/student-desktop/media/29223a39c02b8da5.webp"}, "sardor": {"name": "Sardor M.", "av": "/d/student-desktop/media/4c4422500ceb31dc.webp"}, "jasur": {"name": "Jasur N.", "av": "/d/student-desktop/media/3977b6c975f9a58a.webp"}, "nilufar": {"name": "Nilufar X.", "av": "/d/student-desktop/media/3ec79444bf67f2d5.webp"}, "madina": {"name": "Madina A.", "av": "/d/student-desktop/media/705bee79908c8d37.webp"}, "laylo": {"name": "Laylo B.", "av": "/d/student-desktop/media/db76f2fb8cd13682.webp"}}, "mafia": "/d/student-desktop/media/d6b92aed4d226aa3.webp"};
  const people = Object.entries(DATA.people);
  window.JIA_PEOPLE = Object.assign(window.JIA_PEOPLE || {}, Object.fromEntries(people.map(([k, v]) => [k, { name: v.name, kind: "student", tag: "Student" }])));
  window.JIA_AV = Object.assign(window.JIA_AV || {}, Object.fromEntries(people.map(([k, v]) => [k, v.av])));
  window.JIA_PARTY_ART = Object.assign(window.JIA_PARTY_ART || {}, { mafia: DATA.mafia });
  window.JIA_notify = x => { if (window.JIA.notify) window.JIA.notify(x); };

  const ask = $("gp-ask");
  let onYes = null, back = null;
  window.JIA.ask = (text, yes, fn) => {
    $("gp-ask-t").textContent = text; $("gp-ask-yes").textContent = yes;
    onYes = fn; back = document.activeElement;
    ask.hidden = false; $("gp-ask-no").focus({ preventScroll: true });
  };
  window.JIA.closeAsk = ok => {
    if (ask.hidden) return;
    ask.hidden = true;
    const fn = onYes; onYes = null;
    if (back && back.isConnected && back.focus) back.focus({ preventScroll: true });
    if (ok && fn) fn();
  };
  $("gp-ask-no").addEventListener("click", () => window.JIA.closeAsk(false));
  $("gp-ask-yes").addEventListener("click", () => window.JIA.closeAsk(true));
  ask.addEventListener("click", e => { if (e.target === ask) window.JIA.closeAsk(false); });
})();

