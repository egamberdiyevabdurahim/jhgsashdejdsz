/* Jamals Global: the staff page for JIA's recordings (/staff/video; P15, SPEC-lessons §9.5; src/server/video/staff-page.ts draws it).
 * Not design code, not loaded by any student or parent page. Every action goes to the staff routes with this account's id (x-jg-uid) and
 * reloads the page when it is done; a refusal is said in the page's own language (the body's data-words). Uploads stream the file as the
 * request's body (PUT /api/v1/staff/video/upload), with a progress bar; captions likewise (PUT …/captions). Times are typed as
 * minutes:seconds (or h:mm:ss, or seconds). */
(function () {
  'use strict';
  var D = document, uid = D.body.getAttribute('data-uid') || '', Wd = {};
  try { Wd = JSON.parse(D.body.getAttribute('data-words') || '{}'); } catch (e) { Wd = {}; }

  function secs(t) {
    t = String(t || '').trim().replace(',', '.'); if (!t) return NaN;
    var p = t.split(':').map(Number); if (p.some(isNaN)) return NaN;
    return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p.length === 2 ? p[0] * 60 + p[1] : p[0];
  }
  function errBox(el) { var c = el.closest('.ck'); return c ? c.querySelector('.err') : null; }
  function say(el, code) { var e = errBox(el); if (!e) return; e.textContent = Wd[code] || Wd.other || code; e.hidden = false; }
  function busy(b, on) { if (!b) return; b.disabled = on; if (on) b.setAttribute('aria-busy', 'true'); else b.removeAttribute('aria-busy'); }
  function done() { location.reload(); }
  function post(body, b) {
    busy(b, true);
    return fetch('/api/v1/staff/video', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json', 'x-jg-uid': uid }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j || {} }; }, function () { return { ok: r.ok, j: {} }; }); }, function () { return { ok: false, j: {} }; })
      .then(function (r) { busy(b, false); if (r.ok) return done(); say(b, r.j.error || 'other'); });
  }
  function put(url, file, b, bar) {
    busy(b, true);
    var x = new XMLHttpRequest(); x.open('PUT', url); x.setRequestHeader('x-jg-uid', uid); x.setRequestHeader('content-type', file.type || 'application/octet-stream');
    if (bar) { bar.hidden = false; x.upload.onprogress = function (e) { if (e.lengthComputable) bar.firstChild.style.width = Math.round(e.loaded / e.total * 100) + '%'; }; }
    x.onload = function () { busy(b, false); var j = {}; try { j = JSON.parse(x.responseText); } catch (e) {} if (x.status === 200) return done(); say(b, j.error || 'other'); };
    x.onerror = function () { busy(b, false); say(b, 'other'); };
    x.send(file);
  }

  D.addEventListener('change', function (e) {
    var t = e.target;
    if (t.matches('input[type=file]')) { var fn = t.closest('.pick') && t.closest('.pick').querySelector('.fname'); if (fn && t.files && t.files[0]) fn.textContent = t.files[0].name; }
    if (t.matches('input[type=file][data-act=captions]') && t.files && t.files[0]) {
      var src = t.closest('[data-source]');
      put('/api/v1/staff/video/captions?target=source&id=' + encodeURIComponent(src.getAttribute('data-source')) + '&lang=' + t.getAttribute('data-lang'), t.files[0], t, null);
    }
    if (t.matches('input[type=radio]') && t.closest('.map')) {
      var m = t.closest('.map'), whole = t.value === 'whole', go = m.querySelector('[data-act=map]');
      m.classList.toggle('whole', whole); go.textContent = go.getAttribute(whole ? 'data-whole' : 'data-cut');
    }
    if (t.matches('select[data-f=lesson]')) {                              // the part numbers the chosen lesson has
      var n = +(t.selectedOptions[0] && t.selectedOptions[0].getAttribute('data-pieces')) || 3;
      [].forEach.call(t.closest('.map').querySelectorAll('select[data-f=piece]'), function (s) { var v = s.value; s.innerHTML = ''; for (var i = 1; i <= n; i++) { var o = D.createElement('option'); o.value = o.textContent = String(i); s.appendChild(o); } if (+v <= n) s.value = v; });
    }
  });

  D.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-act]') : null; if (!b || b.tagName === 'INPUT') return;
    var a = b.getAttribute('data-act'), card = b.closest('[data-source]'), source = card && card.getAttribute('data-source');
    if (a === 'upload') {
      var f = D.querySelector('input[data-f=file]'), file = f && f.files && f.files[0]; if (!file) return;
      return put('/api/v1/staff/video/upload?name=' + encodeURIComponent(file.name), file, b, b.parentNode.querySelector('.bar'));
    }
    if (a === 'register') return post({ op: 'register', name: D.querySelector('select[data-f=inbox]').value }, b);
    if (a === 'grant') return post({ op: 'grant', who: D.querySelector('input[data-f=who]').value }, b);
    if (a === 'revoke') return post({ op: 'revoke', student: b.closest('[data-student]').getAttribute('data-student') }, b);
    if (a === 'teacher') return post({ op: 'teacher', source: source, name: card.querySelector('[data-f=teacher]').value, consent: card.querySelector('[data-f=consent]').checked }, b);
    if (a === 'add-row') { var rows = card.querySelector('[data-f=rows]'), r = rows.lastElementChild.cloneNode(true); [].forEach.call(r.querySelectorAll('input'), function (i) { i.value = ''; }); var ps = r.querySelector('select'); if (ps && ps.selectedIndex < ps.options.length - 1) ps.selectedIndex++; rows.appendChild(r); return; }
    if (a === 'map') {
      var m = b.closest('.map'), lesson = m.querySelector('[data-f=lesson]').value;
      if (!lesson) return say(b, 'lesson');
      if (m.classList.contains('whole')) return post({ op: 'whole', source: source, lesson: lesson }, b);
      var clips = [].map.call(m.querySelectorAll('.row'), function (r) { return { piece: +r.querySelector('[data-f=piece]').value, start: secs(r.querySelector('[data-f=start]').value), end: secs(r.querySelector('[data-f=end]').value) }; })
        .filter(function (c) { return !isNaN(c.start) || !isNaN(c.end); });
      if (!clips.length || clips.some(function (c) { return isNaN(c.start) || isNaN(c.end); })) return say(b, clips.length ? 'times' : 'clips');
      return post({ op: 'cut', source: source, lesson: lesson, clips: clips }, b);
    }
    if (a === 'remove') { if (!confirm(Wd.sure || '?')) return; return post({ op: 'remove', clip: b.closest('[data-clip]').getAttribute('data-clip') }, b); }
    if (a === 'drop') { if (!confirm(Wd.sure || '?')) return; return post({ op: 'drop_original', source: source }, b); }
  });
})();
