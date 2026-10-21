/*
 * jg-moderation.js (M1 lane mod, 20 Oct 2026): the Report sheet's server side, for a live student (src/server/moderation/page.ts names this
 * file; the demo family and /preview never load it and keep the design's sheet word for word).
 *
 * window.JG_MOD = { on, report(item, reason), said }
 *   report   POST /api/v1/reports with what the sheet was opened on (the design's item: { what, who, label }; a consumer may add `userId` and
 *            `ref`) and the reason the student tapped (the design's English; the server maps it to its code). The design's own handler calls
 *            it (M:010:1231, D:014:1234). If the report cannot be stored, the sheet says so and shows the reasons again, so she can try again.
 *   said     while MODERATION is off (data-on="0"): the sheet's words after a report, in place of the design's "A JIA moderator will review it
 *            within 24 hours" and "A JIA moderator will look at this first" (M:010:1233-1234), which no moderator keeps yet: the report is
 *            saved for the JIA team, with no time promised. On (data-on="1"): null, and the design's words stand.
 * The English here is translated on the page like the design's own (public/runtime/i18n/{uz,ru}.json).
 */
(function () {
  'use strict';
  var W = window, D = document, S = D.currentScript, B = W.JG_BOOT || {};
  if (!B.uid || W.JG_MOD) return;
  var on = !!S && S.getAttribute('data-on') === '1', app = (S && S.getAttribute('data-app')) || null;
  var TARGETS = { message: 1, profile: 1, post: 1, story: 1, reel: 1, comment: 1, club: 1, member: 1 };
  var SAID = {
    danger: 'Thank you. Your report is saved for the JIA team. If someone is in danger right now, tell a teacher or a parent, or call 112.',
    other: "Thanks for telling us. Your report is saved for the JIA team. The person won't know who reported them."
  };
  var FAILED = 'Your report could not be sent. Check your connection and try again.';
  function failed() {
    var t = D.getElementById('rp-done-t'), r = D.getElementById('rp-reasons');
    if (t) t.textContent = FAILED;
    if (r) r.hidden = false;
  }
  function str(v, n) { return v == null || v === '' ? null : String(v).slice(0, n); }
  function report(item, reason) {
    item = item || {};
    var who = item.userId || (item.who && item.who !== 'me' ? item.who : null);
    var body = { target: TARGETS[item.what] ? item.what : 'other', reason: String(reason || ''), targetUserId: str(who, 80), targetRef: str(item.ref || item.who, 200), label: str(item.label, 200), surface: app };
    return W.fetch('/api/v1/reports', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json', 'x-jg-uid': B.uid }, body: JSON.stringify(body) })
      .then(function (r) { if (!r.ok) throw new Error('report ' + r.status); return r.json(); })
      .catch(function () { failed(); return null; });
  }
  /* The caption pre-check (the design's JG_API.precheck, M:023:2185-2192): the server's (POST /api/v1/ai/precheck), never an AI call from the
     page. It hands the design the JSON it reads; a refusal (MODERATION off: 404) or a failure is null, so the design's own filter decides. */
  var KINDS = { post: 1, story: 1, reel: 1, comment: 1, club: 1 };
  function precheck(item) {
    item = item || {};
    return W.fetch('/api/v1/ai/precheck', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json', 'x-jg-uid': B.uid }, body: JSON.stringify({ kind: KINDS[item.type] ? item.type : 'caption', text: String(item.text || '').slice(0, 2000) }) })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { return j && (j.status === 'clean' || j.status === 'flagged') ? JSON.stringify({ status: j.status, reason: String(j.reason || '') }) : null; })
      .catch(function () { return null; });
  }
  /* A block of a real account, kept on the server (POST/DELETE /api/v1/blocks; MODERATION on, else 404 and false): for the messenger and the
     community, whose people are real accounts. The design's own block of its invented people stays the page's (M:010:1243). */
  function blocks(method, userId) {
    if (!on || !userId) return Promise.resolve(false);
    return W.fetch('/api/v1/blocks', { method: method, credentials: 'same-origin', headers: { 'content-type': 'application/json', 'x-jg-uid': B.uid }, body: JSON.stringify({ userId: String(userId) }) })
      .then(function (r) { return r.ok; }).catch(function () { return false; });
  }
  W.JG_MOD = { on: on, report: report, precheck: precheck, said: on ? null : SAID,
    block: function (userId) { return blocks('POST', userId); }, unblock: function (userId) { return blocks('DELETE', userId); } };
})();
