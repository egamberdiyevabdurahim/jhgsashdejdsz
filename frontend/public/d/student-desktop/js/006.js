
/* the game room on desktop: Escape steps back, the page behind stays still, focus comes back to Today */
(() => {
  "use strict";
  const { $ } = window.JIA;
  const hub = $("gh-view"), view = $("gp-view"), ask = $("gp-ask"), promo = $("gp-promo"), card = $("mg-card");
  const rooms = [hub, view, $("tg-view"), $("pa-view"), $("lg-layer"), $("ex-detail"), $("ls-detail"), $("jm-view"), $("cal-sheet"), $("st-view"), $("rl-view"), $("pf-view"), $("ev-view"), $("sr-view"), $("set-view"), $("pr-view"), $("ap-view"), $("es-view"), $("cs-view")];         // anything full screen keeps the page behind still
  const sync = () => document.documentElement.classList.toggle("gm-open", rooms.some(el => !el.hidden));
  const mo = new MutationObserver(sync);
  rooms.forEach(el => mo.observe(el, { attributes: true, attributeFilter: ["hidden"] }));
  $("gh-back").addEventListener("click", () => { if (card && card.offsetParent) card.focus({ preventScroll: true }); });
  document.addEventListener("keydown", e => {
    if (e.key !== "Escape" || !$("tg-view").hidden || !$("pa-view").hidden) return;   // the party games handle their own
    if (!ask.hidden) { e.preventDefault(); window.JIA.closeAsk(false); }
    else if (!view.hidden) {
      e.preventDefault();
      if (!promo.hidden) promo.hidden = true;
      else if ($("gp-find").hidden) $("gp-back").click();
    }
    else if (!hub.hidden) { e.preventDefault(); $("gh-back").click(); }
  });
})();

