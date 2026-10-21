/* Jamals Global runtime: tells a student "your full roadmap is ready" (P5g; P5 spec §4.1, Phase R).
 * Not design code: it only calls the design's own notification centre (window.JIA_notify, the bell list: student-mobile
 * js/010.js:1419, student-desktop js/014.js:1371), as jg-family.js does for a parent who joined.
 * The sentence comes from the server in the roadmap's language (JG_BOOT.roadmapReady.text; the plan step's own copy, en/uz/ru).
 * The page loads this file only when the boot carries that key, which it does only in Phase D (PHASE_D=1), for 14 days after the plan.
 *
 * P5 wave 3 fix (the first walk with the switches on): the notice was marked as said the moment it was added to the bell list, and that
 * list lives in the page, so a reload removed it before the student had opened it. It is now kept until he opens the roadmap or
 * dismisses it: every load adds it again (unread) until one of these happens on this device, for this plan:
 *   - he taps the notice (the design runs the note's `go`): the roadmap opens (the design's own window.JG_openRoadmap);
 *   - he opens the roadmap any other way (the roadmap view #jr-view stops being hidden);
 *   - he dismisses it with the design's own "Mark all read" (#nt-all).
 * The mark is in this device's localStorage, as before: on another device he is told again until he opens the roadmap there. */
(function () {
  'use strict';
  var B = window.JG_BOOT, R = B && B.roadmapReady;
  if (!R || !R.id || !R.text) return;
  var KEY = 'jg.roadmap.ready';
  function seen() {
    try { var s = JSON.parse(localStorage.getItem(KEY) || 'null'); return s && s.uid === B.uid && Array.isArray(s.ids) ? s.ids : []; } catch (e) { return []; }
  }
  function ack() {
    var ids = seen();
    if (ids.indexOf(R.id) !== -1) return;
    try { localStorage.setItem(KEY, JSON.stringify({ uid: B.uid, ids: ids.concat([R.id]) })); } catch (e) {}
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  window.addEventListener('load', function () {
    if (typeof window.JIA_notify !== 'function') return;
    if (seen().indexOf(R.id) !== -1) return;
    var note = { text: '<b>' + esc(R.text) + '</b>', go: function () { ack(); if (typeof window.JG_openRoadmap === 'function') window.JG_openRoadmap(); } };
    /* P5 wave 3 fix (the second walk): the note's picture. The desktop design's bell row draws the student's own league shield for a note
     * with no person, league or icon (js/002.js:756, shield(30)); the phone design's row has no such fallback and drew
     * <img src="undefined"> (js/010.js:1414): a broken image, and a GET /undefined on every phone page load. The note now names the
     * league the design itself exposes (window.JIA_league.ME.league, both designs), so both rows draw the same shield. */
    var L = window.JIA_league && window.JIA_league.ME, lg = L ? L.league : null;
    if (typeof lg === 'number' && isFinite(lg)) note.league = lg;
    window.JIA_notify(note);
    var view = document.getElementById('jr-view'), all = document.getElementById('nt-all');
    if (view && typeof MutationObserver === 'function') {
      var mo = new MutationObserver(function () { if (!view.hidden) { ack(); mo.disconnect(); } });
      mo.observe(view, { attributes: true, attributeFilter: ['hidden'] });
    }
    if (all) all.addEventListener('click', ack);
  });
})();
