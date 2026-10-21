/* Jamals Global runtime: the "Universities in Uzbekistan" page (owner 4 Oct 2026 R5, P4d). Not design code: a screen the design does not
 * have, drawn with the Applications page's own markup and classes (student-mobile shell.html:644-647, student-desktop :690-693; .ly-view,
 * .ly-top, .cm-back, .ly-scroll, .ap-card, .ap-fit, .ap-hero, .ap-prog, .ap-h, .ap-list, .ap-ck, .ap-es, .es-st, .jr-src, .ap-note), so it
 * follows both apps' sizes and the dark theme. Its data is GET /api/v1/engine/unis (src/engine/unis-uz.ts: each record from the
 * university's official site, this student's verdict, every word in his roadmap language); the snapshot's unis_uz has the link's words. Opened from the Applications list's note and
 * the Home chart's Uzbek stops ([data-uz]); window.JG_UNIS.open(key) opens one university. Live students only (pages.ts). */
(function () {
  'use strict';
  if (!window.JG_ENGINE) return;
  var APP = /\/d\/student-desktop\//.test(Array.prototype.map.call(document.scripts, function (s) { return s.src; }).join(' ')) ? 'student-desktop' : 'student-mobile';
  var view = null, body = null, cur = null, full = null, fullAt = null, loading = null, opener = null;
  function slim() { var c = window.JG_ENGINE && window.JG_ENGINE.cache; return (c && c.unis_uz) || null; }
  function data() { return full; }
  /** The whole list (GET /api/v1/engine/unis; the snapshot carries only the chart's stops), fetched again after the profile, the day or
   *  the roadmap language changes (a language switch need not bump profile_version; review c-unis). */
  function load() {
    var c = window.JG_ENGINE.cache || {}, at = String(c.profile_version) + ':' + String(c.local_date) + ':' + String((c.unis_uz && c.unis_uz.lang) || '');
    if (full && fullAt === at) return Promise.resolve(full);
    if (loading) return loading;
    loading = fetch('/api/v1/engine/unis', { headers: { 'x-jg-uid': (window.JG_BOOT || {}).uid || '' }, credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.json() : null; }).then(function (b) { loading = null; if (b) { full = b.unis; fullAt = at; } return full; }, function () { loading = null; return full; });
    return loading;
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function photo(u) { return u.photo ? '/d/' + APP + '/media/' + u.photo : window.JG_RUNTIME && window.JG_RUNTIME.initialsSvg ? window.JG_RUNTIME.initialsSvg(u.short) : ''; }
  function chip(u) { return '<em class="' + (u.verdict === 'ready' ? 'ap-fit fit' : u.verdict === 'not_yet' ? 'ap-fit reach' : 'es-st sent') + '">' + esc(u.chip) + '</em>'; }
  function host(url) { return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''); }
  function ui(k) { var d = data(), m = slim(); return (d && d.ui[k]) || (m && m.ui[k]) || ''; }

  function build() {
    if (view) return true;
    var ap = document.getElementById('ap-view');
    if (!ap) return false;
    var st = document.createElement('style');
    st.textContent = '#uz-view .uz-ck { cursor: default; } #uz-view .uz-ck span { flex: 1; min-width: 0; } #uz-view .uz-ck small { display: block; margin-top: 2px; font-size: 12px; font-weight: 600; color: var(--ink-3); }'
      + ' #uz-view .uz-ck[aria-checked="false"] i { border-color: #c98a1b; } #uz-view .uz-ck[aria-checked="mixed"] i { border-style: dashed; } #uz-view .ap-prog p { margin-top: 4px; font-size: 12.5px; line-height: 1.45; color: var(--ink-2); }'
      + ' #uz-view .ap-card small { display: block; white-space: normal; } #uz-view .jr-src a { color: var(--accent); word-break: break-all; } #uz-view .ap-note:first-child { margin-top: 2px; }'
      + ' #uz-view .uz-prog { cursor: default; } #uz-view .uz-prog label { display: block; font-size: 13px; font-weight: 600; line-height: 1.45; color: var(--ink-2); } #uz-view .uz-prog select { margin-top: 8px; font-size: 15px; } #uz-view .uz-prog select:disabled { opacity: .6; }';   // P5d review R1: the programme picker
    document.head.appendChild(st);
    view = document.createElement('div');
    view.className = 'ly-view'; view.id = 'uz-view'; view.hidden = true;
    view.setAttribute('role', 'dialog'); view.setAttribute('aria-modal', 'true'); view.setAttribute('aria-labelledby', 'uz-title');
    view.innerHTML = '<div class="ly-top"><button class="cm-back" id="uz-back" type="button" aria-label="Back"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button><h2 id="uz-title"></h2></div><div class="ly-scroll" id="uz-body"></div>';
    ap.parentNode.insertBefore(view, ap.nextSibling);
    body = view.querySelector('#uz-body');
    view.querySelector('#uz-back').addEventListener('click', back);
    body.addEventListener('click', function (e) { var c = e.target.closest('.ap-card'); if (c) paintDetail(c.getAttribute('data-k')); });
    body.addEventListener('change', function (e) { var s = e.target.closest && e.target.closest('#uz-prog-sel'); if (s) pick(s); });   // P5d review R1
    return true;
  }
  function paintList() {
    var d = data(); cur = null;
    view.querySelector('#uz-title').textContent = ui('ui.title');
    if (!d) { body.innerHTML = '<p class="ap-note">' + esc(ui('ui.noResult') || 'Finish the diagnostic to see where you stand.') + '</p>'; return; }
    body.innerHTML = '<p class="ap-note">' + esc(ui('ui.lead')) + '</p>'
      + d.list.map(function (u) {
        return '<button class="ap-card" type="button" data-k="' + esc(u.key) + '"><img src="' + esc(photo(u)) + '" alt=""><span class="ap-ct"><b>' + esc(u.name) + '</b><small>'
          + (u.chosen ? esc(ui('chip.yours')) + ' · ' : '') + (u.route_label ? esc(u.route_label) + ' · ' : '') + esc(u.line) + (u.chance_tag ? ' · ' + esc(u.chance_tag) : '') + '</small></span>' + chip(u) + '</button>';   // P5d: his chance's fewest words
      }).join('')
      + '<p class="ap-note">' + esc(ui('ui.honest')) + '</p>';
    body.scrollTop = 0;
  }
  function row(ok, text, have, status) {
    return '<div class="ap-ck uz-ck" role="checkbox" aria-readonly="true" aria-checked="' + (ok === true ? 'true' : ok === false ? 'false' : 'mixed') + '"><i aria-hidden="true"></i><span>' + esc(text)
      + (have ? '<small>' + esc(have) + '</small>' : '') + '</span>' + (status || '') + '</div>';
  }
  function paintDetail(key) {
    var d = data(), u = d && d.list.filter(function (x) { return x.key === key; })[0];
    if (!u) return paintList();
    cur = u; view.querySelector('#uz-title').textContent = u.short;
    var items = u.items.map(function (i) {
      var s = !i.verified ? '<em class="es-st sent">' + esc(ui('ui.confirming')) + '</em>' : i.ask ? '<em class="es-st sent">' + esc(ui('ui.ask')) + '</em>' : i.info ? '' : i.ok === false ? '<em class="es-st draft">' + esc(ui('chip.not_yet')) + '</em>' : i.apply ? '<em class="es-st">' + esc(ui('ui.whenApply')) + '</em>' : '';
      return row(i.info ? null : i.ok, i.need, i.have, s);
    }).join('');
    var docs = u.documents ? u.documents.map(function (x) { return '<div class="ap-es uz-ck"><span><b>' + esc(x) + '</b></span></div>'; }).join('')
      : '<div class="ap-es uz-ck"><span><b>' + esc(ui('ui.confirming')) + '</b></span></div>';
    var wins = u.windows.length ? u.windows.map(function (w) { return '<div class="ap-es uz-ck"><span><b>' + esc(w.label) + '</b>' + (w.when ? '<small>' + esc(w.when) + '</small>' : '') + '</span>' + (w.past ? '<em class="es-st">' + esc(ui('ui.past')) + '</em>' : '') + '</div>'; }).join('')   // P4e G6: a window that has passed says so
      : '<div class="ap-es uz-ck"><span><b>' + esc(ui('ui.confirming')) + '</b></span></div>';
    var src = u.sources.length ? u.sources.map(function (s) { return '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(host(s.url)) + '</a>'; }).join('<br>') : '';
    body.innerHTML = '<div class="ap-hero"><img src="' + esc(photo(u)) + '" alt=""><div><h3>' + esc(u.name) + '</h3><p>' + esc([u.city, u.taught, u.route_label].filter(Boolean).join(' · ')) + '</p>' + chip(u) + '</div></div>'
      + '<div class="ap-prog"><b>' + esc(u.line) + '</b>' + (u.later ? '<p>' + esc(u.later) + '</p>' : '') + (u.chance ? '<p class="uz-chance">' + esc(u.chance) + '</p>' : '') + (u.chance_grant ? '<p class="uz-chance">' + esc(u.chance_grant) + '</p>' : '') + '</div>'   // P5d (owner decision 1): his chance here, or what opens it; the grant on its own line, this page only (review R6)
      + (u.programmes ? programmeBlock(u) : '')   // P5d review R1: his programme here, where the checklist sends him
      + (u.route_note ? '<p class="ap-note">' + esc(u.route_note) + '</p>' : '')
      + '<p class="ap-h">' + esc(ui('ui.what')) + '</p><div class="ap-list">' + items + '</div>'
      + '<p class="ap-h">' + esc(ui('ui.docs')) + '</p><div class="ap-list">' + docs + '</div>'
      + '<p class="ap-h">' + esc(ui('ui.dates')) + '</p><div class="ap-list">' + wins + '</div><p class="ap-note">' + esc(ui('ui.datesNote')) + '</p>'
      + '<div class="jr-src' + (u.needs_verification ? ' ver' : '') + '"><b>' + esc(ui('ui.sources')) + '</b><p>' + (u.needs_verification ? esc(ui('ui.confirming')) + '. ' : '') + esc(ui('ui.checked')) + '</p>' + (src ? '<p>' + src + '</p>' : '') + '</div>'
      + '<p class="ap-note">' + esc(ui('ui.honest')) + '</p>';
    body.scrollTop = 0;
  }
  /** Back (and Escape, as the Applications page's own does): a university returns to the list, the list closes and gives focus back. */
  function back() {
    if (cur) return paintList();
    view.hidden = true;
    if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
    opener = null;
  }
  function open(key) {
    if (!build()) return;
    if (view.hidden) { opener = document.activeElement; view.style.zIndex = String(window.JIA_z ? window.JIA_z() : 70); view.hidden = false; }
    view.querySelector('#uz-title').textContent = ui('ui.title');
    if (!full) body.innerHTML = '<p class="ap-note">…</p>';
    load().then(function () { if (view.hidden) return; if (key) paintDetail(key); else paintList(); });
    setTimeout(function () { var b = view.querySelector('#uz-back'); if (b) b.focus({ preventScroll: true }); }, 60);
  }
  /* ---------- P5d review R1 (spec §3.3, §3.7): the programme × language, picked from the Agency's 2026 list, never typed ----------
   * On a state university's page (NUU, TUIT, TSUE) the checklist's "choose your programme on the university's page" has its control here: one
   * select of the Agency's rows (its own programme names, in Uzbek as it publishes them, and the language of teaching); a pick is the commit
   * uz_programme, and the page, Home and the parent re-read the chance. The Deep M2 question m2_uz_programmes renders the same list (programmes()). */
  function options(list, cur) {
    return '<option value="">' + esc(ui('ui.programmePick')) + '</option>' + list.map(function (p) {
      return '<option value="' + esc(p.v) + '"' + (p.v === cur ? ' selected' : '') + '>' + esc(p.name + ' · ' + ui('ui.plang.' + p.lang)) + '</option>';
    }).join('');
  }
  /** The commit's payload for a select's value ("code|lang"), or a cleared pick. */
  function payload(key, v) { var x = String(v || '').split('|'); return v ? { university_id: key, code: Number(x[0]), lang: x[1] } : { university_id: key, code: null }; }
  function programmeBlock(u) {
    return '<p class="ap-h">' + esc(ui('ui.programme')) + '</p><div class="ap-list"><div class="ap-es uz-prog"><span><label for="uz-prog-sel">' + esc(ui('ui.programmeLead')) + '</label>'
      + '<select class="dg-field" id="uz-prog-sel" data-k="' + esc(u.key) + '">' + options(u.programmes, u.programme) + '</select></span></div></div>'
      + '<p class="ap-note">' + esc(ui('ui.programmeSource')) + '</p>';
  }
  function pick(s) {
    var key = s.getAttribute('data-k'), was = cur && cur.programme || '';
    if (!window.JG_ENGINE.commit) return;
    s.disabled = true;
    window.JG_ENGINE.commit('uz_programme', payload(key, s.value)).then(function (r) {
      if (r && r.snapshot) { full = null; return load().then(function () { if (view && !view.hidden && cur && cur.key === key) paintDetail(key); }); }
      s.disabled = false; s.value = was;                                        // refused or offline: the runtime's toast said so; the old pick stays
    });
  }
  /** The Deep question m2_uz_programmes (the design's input(), M:023:397): one select per state university, rows { university_id, code, lang }. */
  function programmes(el, draft, set) {
    var rows = Array.isArray(draft) ? draft.filter(function (r) { return r && r.university_id; }) : [];
    set(rows.slice());
    el.innerHTML = '<p class="dg-hint">…</p>';
    load().then(function (d) {
      var unis = d ? d.list.filter(function (u) { return u.programmes; }) : [];
      el.innerHTML = unis.map(function (u) {
        var mine = rows.filter(function (r) { return r.university_id === u.key; })[0];
        return '<div class="dg-per"><p>' + esc(u.name) + '</p><select class="dg-field" data-k="' + esc(u.key) + '" aria-label="' + esc(u.name) + '">' + options(u.programmes, mine ? mine.code + '|' + mine.lang : '') + '</select></div>';
      }).join('') + '<p class="dg-hint">' + esc(ui('ui.programmeSource')) + '</p>';
    });
    el.addEventListener('change', function (e) {
      var s = e.target.closest && e.target.closest('select[data-k]'); if (!s) return;
      var p = payload(s.getAttribute('data-k'), s.value);
      rows = rows.filter(function (r) { return r.university_id !== p.university_id; }).concat(p.code == null ? [] : [p]);
      set(rows.slice());
    });
  }
  window.JG_UNIS = { open: open, load: load, label: function () { return ui('ui.link'); }, programmes: programmes, options: options, payload: payload };
  document.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-uz]'); if (b) { e.preventDefault(); e.stopPropagation(); open(b.getAttribute('data-uz')); } }, true);
  // Escape on the open page (aria-modal) acts as Back; it is caught on window first, so the Applications page under it does not close too
  window.addEventListener('keydown', function (e) { if (e.key !== 'Escape' || !view || view.hidden) return; e.preventDefault(); e.stopImmediatePropagation(); back(); }, true);
})();
