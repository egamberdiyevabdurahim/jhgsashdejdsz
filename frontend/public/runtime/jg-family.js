/* Jamals Global runtime: tells a student when a parent has joined their family (I7 closure, docs/ai/DECISIONS.md D13).
 * Not design code: it only calls the design's own notification centre (window.JIA_notify, the bell list: student-mobile
 * js/010.js:1419, student-desktop js/014.js:1371), once per parent and device. The sentence is new copy for the owner's review. */
(function () {
  'use strict';
  var B = window.JG_BOOT, joins = (B && B.familyJoins) || [];
  if (!joins.length) return;
  var KEY = 'jg.family.seen';
  /* Owner 6 Oct 2026 P4h H2: a parent's own photo is the notice's icon once he has one (src/server/family.ts recentJoins). The design draws an
   * icon as a sticker inside its white circle (.nt-ic img: 34 px on the phone, 32 on the desktop, contained); a photo fills the circle, round. */
  var st = document.createElement('style');
  st.textContent = '.nt-ic img[src^="/api/v1/photo/"] { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }';
  (document.head || document.documentElement).appendChild(st);
  function seen() {
    try { var s = JSON.parse(localStorage.getItem(KEY) || 'null'); return s && s.uid === B.uid && Array.isArray(s.ids) ? s.ids : []; } catch (e) { return []; }
  }
  window.addEventListener('load', function () {
    if (typeof window.JIA_notify !== 'function') return;
    var ids = seen(), fresh = joins.filter(function (j) { return ids.indexOf(j.id) === -1; });
    fresh.forEach(function (j) { window.JIA_notify({ icon: j.icon, text: '<b>' + j.name + '</b> joined your family on Jamals Global and can now see your progress.' }); });
    if (fresh.length) { try { localStorage.setItem(KEY, JSON.stringify({ uid: B.uid, ids: ids.concat(fresh.map(function (j) { return j.id; })) })); } catch (e) {} }
  });
})();
