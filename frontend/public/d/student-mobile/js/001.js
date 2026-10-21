
(() => {
  /* ==========================================================
     STUDY CLOCK — program length and today's study day live on
     <div class="screen" data-program-days data-day>. It fills the
     countdown in Roadmap to MIT and the day counter in Today.
     ========================================================== */
  const scr = document.querySelector(".screen");
  const total = parseInt(scr.dataset.programDays, 10) || 390;
  const day = Math.min(total, Math.max(1, parseInt(scr.dataset.day, 10) || 1));
  const set = (key, v) => document.querySelectorAll(`[data-clock="${key}"]`).forEach(el => { el.textContent = v; });
  set("left", total - day + 1); set("day", day); set("total", total);
})();
