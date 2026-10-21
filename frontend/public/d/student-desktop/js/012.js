
/* ==========================================================
   REMINDERS AND "ADD TO CALENDAR" — for live lessons. A reminder
   lands under the bell (and again 30 minutes before it starts);
   "Add to calendar" offers Google Calendar and Outlook links.
   ========================================================== */
(() => {
  "use strict";
  const { $ } = window.JIA;
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  function parseWhen(t) {                                           // "Today, 19:00", "Tomorrow, 18:00", "Fri, 11:00"
    const m = String(t).toLowerCase().match(/(today|tomorrow|sun|mon|tue|wed|thu|fri|sat)[a-z]*,?\s*(\d{1,2}):(\d{2})/);
    const d = new Date(); if (!m) { d.setHours(19, 0, 0, 0); return d; }
    if (m[1] === "tomorrow") d.setDate(d.getDate() + 1);
    else if (m[1] !== "today") { const want = DAYS.indexOf(m[1]); d.setDate(d.getDate() + ((want - d.getDay() + 7) % 7 || 7)); }
    d.setHours(+m[2], +m[3], 0, 0); return d;
  }
  const utc = d => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const local = d => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 19);
  const sheet = $("cal-sheet");
  let back = null;
  window.JIA_parseWhen = parseWhen;
  window.JIA_calendar = ev => {
    const end = new Date(ev.start.getTime() + (ev.mins || 60) * 6e4);
    const t = encodeURIComponent(ev.title), loc = encodeURIComponent(ev.place || ""), det = encodeURIComponent(ev.details || "From the JIA app");
    $("cal-google").href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${t}&dates=${utc(ev.start)}/${utc(end)}&details=${det}&location=${loc}`;
    $("cal-outlook").href = `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${t}&startdt=${local(ev.start)}&enddt=${local(end)}&location=${loc}&body=${det}`;
    $("cal-sub").textContent = `${ev.title}, ${ev.start.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} at ${ev.start.toTimeString().slice(0, 5)}`;
    back = document.activeElement;
    sheet.hidden = false; $("cal-google").focus({ preventScroll: true });
  };
  const close = () => { if (sheet.hidden) return; sheet.hidden = true; if (back && back.isConnected) back.focus({ preventScroll: true }); };
  sheet.addEventListener("click", e => {
    if (e.target.closest("[data-cal-close]")) close();
    else if (e.target.closest("a")) setTimeout(close, 60);              // the link opens in a new tab; the sheet steps aside
  });
  window.JIA_remind = ev => {
    const n = window.JIA.notify;
    if (n) n({ icon: ev.icon, text: `<b>Reminder set:</b> ${esc(ev.title)}, ${ev.start.toLocaleDateString("en-US", { weekday: "short" })} at ${ev.start.toTimeString().slice(0, 5)}` });
    const ms = ev.start - Date.now() - 30 * 6e4;
    if (n && ms > 0 && ms < 2 ** 31 - 1) setTimeout(() => n({ icon: ev.icon, text: `<b>${esc(ev.title)}</b> starts in 30 minutes` }), ms);
  };
  // Escape closes the top drawer first: the calendar, then Ask Jamol, then the lesson underneath
  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    if (!sheet.hidden) { e.preventDefault(); e.stopImmediatePropagation(); close(); }
    else if (!$("jm-view").hidden) { e.preventDefault(); e.stopImmediatePropagation(); $("jm-back").click(); }
  }, true);
  $("jm-scrim").addEventListener("click", () => $("jm-back").click());
})();

