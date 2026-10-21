/* Jamals Global runtime, M1 core (2): the family's own data in the parent app's Account (CORE_M1 on; loaded by src/server/pages.ts for a
 * live parent with a linked child, deferred). A section in the design's own markup (.sec, .sec-h, .card.rows, .row, .row-t) under
 * "Family check", on the phone and the laptop:
 *   Download our data              GET /api/v1/core/family?export=1, one JSON file
 *   Delete the answers I gave      a second tap confirms; POST { action: 'delete_answers' }; the child's roadmap is worked out again without them
 *   Delete {child}'s written answers  a second tap confirms; POST { action: 'delete_child_text' }; her stories and samples, the roadmap stays
 *   Ask to delete {child}'s account  a second tap confirms; POST { action: 'request_deletion' }; staff carry it out, the row then says when it was asked
 * The words are the parent app's three languages (the page's <html lang>). The demo family never loads it.
 */
(function () {
  var BOOT = window.JG_BOOT || {}; if (!BOOT.core || !BOOT.core.m1 || BOOT.demo || BOOT.role !== 'parent') return;
  var KID = (BOOT.children && BOOT.children[0] && BOOT.children[0].firstName) || '';
  function lang() { var l = String(document.documentElement.getAttribute('lang') || '').slice(0, 2); return l === 'uz' || l === 'ru' ? l : 'en'; }
  var W = {
    h: { en: 'Your family’s data', uz: 'Oilangiz maʼlumotlari', ru: 'Данные вашей семьи' },
    dl: { en: 'Download our data', uz: 'Maʼlumotlarimizni yuklab olish', ru: 'Скачать наши данные' },
    dlS: { en: 'Everything the app keeps about {kid}, in one file', uz: 'Ilova {kid} haqida saqlaydigan hamma narsa, bitta faylda', ru: 'Всё, что приложение хранит о {kid}, одним файлом' },
    del: { en: 'Delete the answers I gave', uz: 'Bergan javoblarimni oʻchirish', ru: 'Удалить мои ответы' },
    delS: { en: 'Money and family questions. {n} saved.', uz: 'Pul va oila savollari. {n} ta saqlangan.', ru: 'Вопросы о деньгах и семье. Сохранено: {n}.' },
    delNone: { en: 'You have no saved answers.', uz: 'Saqlangan javoblaringiz yoʻq.', ru: 'Сохранённых ответов нет.' },
    delSure: { en: 'Tap again to delete them. This cannot be undone.', uz: 'Oʻchirish uchun yana bosing. Buni qaytarib boʻlmaydi.', ru: 'Нажмите ещё раз, чтобы удалить. Это нельзя отменить.' },
    delDone: { en: 'Deleted. {kid}’s roadmap no longer uses them.', uz: 'Oʻchirildi. {kid}ning yoʻl xaritasi ularni endi ishlatmaydi.', ru: 'Удалено. План {kid} их больше не использует.' },
    txt: { en: 'Delete {kid}’s written answers', uz: '{kid}ning yozma javoblarini oʻchirish', ru: 'Удалить письменные ответы ({kid})' },
    txtS: { en: 'What {kid} wrote in her own words: {n} saved. Her roadmap stays.', uz: '{kid} oʻz soʻzlari bilan yozganlari: {n} ta saqlangan. Yoʻl xaritasi qoladi.', ru: 'То, что {kid} написал(а) своими словами: сохранено {n}. План останется.' },
    txtNone: { en: 'Nothing {kid} wrote is kept.', uz: '{kid} yozgan hech narsa saqlanmagan.', ru: 'Ничего из написанного {kid} не хранится.' },
    acc: { en: 'Ask to delete {kid}’s account', uz: '{kid}ning hisobini oʻchirishni soʻrash', ru: 'Попросить удалить аккаунт {kid}' },
    accS: { en: 'Our team checks it is you, then deletes everything.', uz: 'Jamoamiz bu siz ekaningizni tekshiradi, soʻng hammasini oʻchiradi.', ru: 'Команда проверит, что это вы, и удалит всё.' },
    accSure: { en: 'Tap again to send the request.', uz: 'Soʻrovni yuborish uchun yana bosing.', ru: 'Нажмите ещё раз, чтобы отправить запрос.' },
    accDone: { en: 'Asked on {d}. Our team checks it is you, then deletes {kid}’s account.', uz: '{d} kuni soʻralgan. Jamoamiz bu siz ekaningizni tekshiradi, soʻng {kid}ning hisobini oʻchiradi.', ru: 'Запрос от {d}. Команда проверит, что это вы, и удалит аккаунт {kid}.' },
    fail: { en: 'Could not do it. Try again.', uz: 'Bajarilmadi. Qayta urinib koʻring.', ru: 'Не получилось. Попробуйте ещё раз.' },
  };
  function w(k, v) { var s = W[k][lang()] || W[k].en; return s.replace(/\{(\w+)\}/g, function (_, x) { return v && v[x] != null ? String(v[x]) : x === 'kid' ? KID : ''; }); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; }); }
  function api(method, url, body) { var init = { method: method, headers: { 'x-jg-uid': BOOT.uid } }; if (body) { init.headers['content-type'] = 'application/json'; init.body = JSON.stringify(body); } return fetch(url, init); }
  var CHEV = '<svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>';
  var state = null, sure = {};
  function row(k, title, sub, extra) { return '<button class="row" type="button" data-jg-fd="' + k + '"' + (extra || '') + '><span class="row-t"><b>' + esc(title) + '</b><small data-notr>' + esc(sub) + '</small></span>' + CHEV + '</button>'; }
  function paint() {
    document.querySelectorAll('[data-sheet="family"]').forEach(function (fam) {
      var sec = fam.closest('section'); if (!sec) return;
      var mine = sec.parentNode.querySelector('.jg-fd'); if (!mine) { mine = document.createElement('section'); mine.className = 'sec jg-fd'; sec.parentNode.insertBefore(mine, sec.nextSibling); }
      var n = state ? state.parent_answers : 0, req = state && state.request;
      mine.innerHTML = '<div class="sec-h"><h2>' + esc(w('h')) + '</h2></div><div class="card rows">'
        + row('dl', w('dl'), w('dlS'))
        + row('del', w('del'), sure.del ? w('delSure') : n ? w('delS', { n: n }) : w('delNone'), n ? '' : ' disabled')
        + row('txt', w('txt'), sure.txt ? w('delSure') : state && state.child_texts ? w('txtS', { n: state.child_texts }) : w('txtNone'), state && state.child_texts ? '' : ' disabled')
        + (req || BOOT.core.admins ? row('acc', w('acc'), req ? w('accDone', { d: new Date(req.at).toLocaleDateString(lang() === 'uz' ? 'uz-Latn-UZ' : lang() === 'ru' ? 'ru-RU' : 'en-GB') }) : sure.acc ? w('accSure') : w('accS'), req ? ' disabled' : '') : '') + '</div>';   /* asking needs an admin to carry it out (src/server/core/reviewers.ts); a request already made is always shown */
    });
  }
  function load() { return api('GET', '/api/v1/core/family').then(function (r) { return r.ok ? r.json() : null; }).then(function (s) { if (s) state = s; paint(); }, function () { paint(); }); }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-jg-fd]'); if (!b || b.disabled) return;
    var k = b.getAttribute('data-jg-fd');
    if (k === 'dl') {   // the routes ask for the page's account (x-jg-uid), so the file is fetched and handed over as a download
      api('GET', '/api/v1/core/family?export=1').then(function (r) { return r.ok ? r.blob() : null; }).then(function (bl) {
        if (!bl) return; var a = document.createElement('a'), u = URL.createObjectURL(bl); a.href = u; a.download = 'jamals-global-family-data-' + new Date().toISOString().slice(0, 10) + '.json'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 4000);
      });
      return;
    }
    if (!sure[k]) { sure = {}; sure[k] = true; paint(); return; }
    sure = {}; b.disabled = true;
    api('POST', '/api/v1/core/family', { action: k === 'del' ? 'delete_answers' : k === 'txt' ? 'delete_child_text' : 'request_deletion' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
      if (!j) { var sm = b.querySelector('small'); if (sm) sm.textContent = w('fail'); b.disabled = false; return; }
      load().then(function () { if (k === 'del') { var x = document.querySelector('.jg-fd [data-jg-fd="del"] small'); if (x) x.textContent = w('delDone'); setTimeout(function () { location.reload(); }, 2200); } });   /* the reload: the design's Family check card then reads the answers gone too */
    });
  });
  if (typeof MutationObserver === 'function') new MutationObserver(function () { if (document.querySelector('[data-sheet="family"]') && !document.querySelector('.jg-fd')) paint(); }).observe(document.body, { childList: true, subtree: true });
  if (typeof MutationObserver === 'function') new MutationObserver(paint).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });   // the parent switched the app's language
  load();
})();
