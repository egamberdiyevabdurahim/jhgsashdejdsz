/* M1 core (4, 6): the buttons of /staff/core (src/server/core/staff-page.ts). A decision is sent once to
 * POST /api/v1/staff/core/<kind>/<id> from this very account (x-jg-uid); a rejected certificate asks for its reason first. */
(function () {
  var uid = document.body.getAttribute('data-uid'), DONE = document.body.getAttribute('data-done'), FAILED = document.body.getAttribute('data-failed');
  document.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-d]'); if (!b) return;
    var card = b.closest('.ck'), kind = card.getAttribute('data-kind'), id = card.getAttribute('data-id'), d = b.getAttribute('data-d');
    var why = card.querySelector('.why');
    if (d === 'rejected' && why && !b.hasAttribute('data-send')) { why.hidden = false; why.querySelector('textarea').focus(); return; }
    var cf = card.querySelector('input.confirm'), confirmName = cf ? cf.value.trim() : '';
    if (d === 'delete' && !confirmName) { cf.focus(); return; }
    var note = why && why.querySelector('textarea') ? why.querySelector('textarea').value.trim() : '';
    if (d === 'rejected' && !note) { why.querySelector('textarea').focus(); return; }
    card.querySelectorAll('button').forEach(function (x) { x.disabled = true; });
    fetch('/api/v1/staff/core/' + kind + '/' + encodeURIComponent(id), { method: 'POST', headers: { 'content-type': 'application/json', 'x-jg-uid': uid }, body: JSON.stringify(d === 'delete' ? { decision: d, confirm: confirmName } : note ? { decision: d, note: note } : { decision: d }) })
      .then(function (r) { return r.ok; }, function () { return false; }).then(function (ok) {
        var said = card.querySelector('.said'); said.textContent = ok ? DONE : FAILED; said.classList.toggle('bad', !ok);
        if (ok) { card.querySelectorAll('.acts, .why').forEach(function (x) { x.hidden = true; }); } else card.querySelectorAll('button').forEach(function (x) { x.disabled = false; });
      });
  });
})();
