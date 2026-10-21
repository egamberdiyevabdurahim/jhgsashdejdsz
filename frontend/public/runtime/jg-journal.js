/* Jamals Global runtime: the one-line journal stays on her device (m1 lane "jamol", 20 Oct 2026). Not design code.
 * The design promises "Only you can read your journal" and "not even the Jamals Global team can read it" (M:023:2522, D:022:2524); its own
 * comment says "prototype: this device only" (M:023:2507). The server no longer keeps jg.journal.v1 (src/server/boot.ts STUDENT_KEYS,
 * src/server/jamol/privacy.ts): the design's own localStorage copy is the journal. Loaded on every student page before jg-runtime.js:
 *   1. A shared browser: the journal's owner is recorded (jg.journal.owner; /signin forgets jg.uid at every sign-out, so that cannot say
 *      it). Another account's journal is put away under its own name (jg.journal.v1@<its id>) and never shown to this one; this account's
 *      own, put away earlier, comes back; one nobody can name is put away too.
 *   2. The copy the server still held from before (JG_BOOT.journalLegacy, plain text): merged into the device's own (line by line, by id),
 *      the design's invented sample lines (ids j0..j28, R13) dropped for a live student, then deleted on the server. If the delete fails it is
 *      tried again on the next page.
 * Nothing else changes: the design reads and writes "jg.journal.v1" as it always did. */
(function (W) {
  'use strict';
  var B = W.JG_BOOT;
  if (!B || B.role !== 'student' || !B.uid) return;
  var ls; try { ls = W.localStorage; } catch (e) { return; }
  if (!ls) return;
  var KEY = 'jg.journal.v1', PARK = 'jg.journal.v1@';
  var live = !!B.engine && !B.demo;
  function parse(v) { try { var o = JSON.parse(v); return o && typeof o === 'object' && Array.isArray(o.entries) ? o : null; } catch (e) { return null; } }
  function invented(e) { return live && /^j\d+$/.test(String(e && e.id)); }
  try {
    /* Whose journal is on this browser: its own record (jg.journal.owner), since /signin forgets jg.uid on every sign-out; a journal written
     * before the record existed belongs to the account last here (jg.uid), and one nobody can name is put away, never shown */
    var OWNER = 'jg.journal.owner', prev = ls.getItem('jg.uid'), owner = ls.getItem(OWNER), here = ls.getItem(KEY);
    if (here !== null) {
      var who = owner || prev || ('unknown.' + Date.now());
      if (who !== B.uid) { ls.setItem(PARK + who, here); ls.removeItem(KEY); }
    }
    if (ls.getItem(KEY) === null) {
      var mine = ls.getItem(PARK + B.uid);
      if (mine !== null) { ls.setItem(KEY, mine); ls.removeItem(PARK + B.uid); }
    }
    ls.setItem(OWNER, B.uid);
    if (typeof B.journalLegacy === 'string') {
      var old = parse(B.journalLegacy), here = parse(ls.getItem(KEY));
      if (old) {
        var out = here || { intro_seen: false, entries: [] }, seen = {};
        out.entries.forEach(function (e) { seen[e.id] = 1; });
        old.entries.forEach(function (e) { if (e && e.id && !seen[e.id]) { out.entries.push(e); seen[e.id] = 1; } });
        out.entries = out.entries.filter(function (e) { return !invented(e); });
        out.intro_seen = !!(out.intro_seen || old.intro_seen);
        ls.setItem(KEY, JSON.stringify(out));
      }
      if (typeof W.fetch === 'function') W.fetch('/api/v1/state/' + encodeURIComponent(KEY), { method: 'DELETE', headers: { 'x-jg-uid': B.uid }, credentials: 'same-origin' }).catch(function () {});
    }
  } catch (e) { /* storage full or blocked: the design runs on its own defaults */ }
})(window);
