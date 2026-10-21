/* Jamals Global: the proud-parent card's three buttons, made real (m1-parent, 20 Oct 2026; FEATURES people "S BLOCKER": on a real
 * family's page "Telegram", "Instagram" and "Save image" only showed "Opening Telegram", "Opening Instagram" and "Image saved").
 *
 * Loaded on a real family's parent page (never the demo, /preview or ENGINE_LIVE off; src/server/pages.ts). Not design code: the design's
 * sheet (#sheet .proud-card, the child's real medal from the parent read model) is drawn into a 1080 x 1350 picture (the card's own 4:5,
 * its gradient, medal, words and fonts, as the page shows them in the parent's language), the way the student's medal story is made
 * (M:021 share): with a share sheet (a phone) Telegram and Instagram hand the picture to it, where both apps are; without one each button
 * saves the picture and says how to post it. Nothing is uploaded, and no link to the child or the app is sent: only the picture and its
 * one line ("Only this achievement is shared", as the card says). The design's own handler never runs for these three buttons here. */
(function () {
  'use strict';
  var BOOT = window.JG_BOOT || null;
  if (!BOOT || BOOT.demo || BOOT.role !== 'parent' || !BOOT.child) return;
  var KIND = { 'Opening Telegram': 'telegram', 'Opening Instagram': 'instagram', 'Image saved': 'save' };
  var W = {
    en: { save: 'Image saved.', telegram: 'Image saved. In Telegram, open a chat and attach this picture.', instagram: 'Image saved. In Instagram, tap + and choose this picture.', shared: 'Shared.', fail: 'Saving is not available here. Take a screenshot of the card.' },
    uz: { save: 'Rasm saqlandi.', telegram: 'Rasm saqlandi. Telegramda chatni oching va shu rasmni biriktiring.', instagram: 'Rasm saqlandi. Instagramda + tugmasini bosing va shu rasmni tanlang.', shared: 'Ulashildi.', fail: 'Bu yerda saqlab boʻlmaydi. Kartaning skrinshotini oling.' },
    ru: { save: 'Картинка сохранена.', telegram: 'Картинка сохранена. В Telegram откройте чат и прикрепите её.', instagram: 'Картинка сохранена. В Instagram нажмите + и выберите её.', shared: 'Отправлено.', fail: 'Здесь сохранить нельзя. Сделайте снимок экрана карточки.' }
  };
  function lang() { var l = String(document.documentElement.getAttribute('lang') || '').slice(0, 2); return l === 'uz' || l === 'ru' ? l : 'en'; }
  var toastT = 0;
  function say(k) {                                                   // the design's own toast (#toast, .on, 2.4 s), already in the page's language
    var t = document.getElementById('toast'); if (!t) return;
    t.textContent = W[lang()][k]; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('on'); }, 3200);
  }
  var OUT_W = 1080, OUT_H = 1350;
  function medalImage(card) {
    return new Promise(function (done) {
      var svg = card.querySelector('.pc-medal svg'); if (!svg) return done(null);
      var r = svg.getBoundingClientRect(), c = svg.cloneNode(true);
      c.setAttribute('width', String(r.width)); c.setAttribute('height', String(r.height)); c.setAttribute('style', 'color:' + getComputedStyle(svg).color);
      var img = new Image(); img.onload = function () { done({ img: img, r: r }); }; img.onerror = function () { done(null); };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(c));
    });
  }
  function lines(g, text, max) {                                      // the words wrapped as the card wraps them, within its own width
    var out = [], cur = '';
    String(text).split(/\s+/).forEach(function (w) { var t = cur ? cur + ' ' + w : w; if (cur && g.measureText(t).width > max) { out.push(cur); cur = w; } else cur = t; });
    if (cur) out.push(cur);
    return out;
  }
  function draw(card) {
    var cr = card.getBoundingClientRect(), s = OUT_W / (cr.width || 320);
    var c = document.createElement('canvas'); c.width = OUT_W; c.height = OUT_H;
    var g = c.getContext('2d');
    var bg = g.createLinearGradient(OUT_W * 0.41, 0, OUT_W * 0.59, OUT_H); bg.addColorStop(0, '#19553C'); bg.addColorStop(1, '#0C2A1D');   // the card's own 170deg gradient
    g.fillStyle = bg; g.fillRect(0, 0, OUT_W, OUT_H);
    var glow = g.createRadialGradient(OUT_W / 2, 0, 0, OUT_W / 2, 0, OUT_W * 0.72); glow.addColorStop(0, 'rgba(235,217,166,.28)'); glow.addColorStop(1, 'rgba(235,217,166,0)');
    g.fillStyle = glow; g.fillRect(0, 0, OUT_W, OUT_H);
    return Promise.resolve(document.fonts && document.fonts.ready).then(function () { return medalImage(card); }).then(function (m) {
      if (m) g.drawImage(m.img, (m.r.left - cr.left) * s, (m.r.top - cr.top) * s, m.r.width * s, m.r.height * s);
      ['.pc-k', '.pc-t', '.pc-s', '.pc-w'].forEach(function (q) {
        var el = card.querySelector(q); if (!el || !el.textContent.trim()) return;
        var cs = getComputedStyle(el), r = el.getBoundingClientRect(), size = parseFloat(cs.fontSize) * s, lh = (parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2) * s;
        g.font = cs.fontWeight + ' ' + size + 'px ' + cs.fontFamily; g.fillStyle = cs.color; g.textAlign = 'center'; g.textBaseline = 'top';
        if ('letterSpacing' in g) g.letterSpacing = (parseFloat(cs.letterSpacing) || 0) * s + 'px';
        var text = cs.textTransform === 'uppercase' ? el.textContent.toLocaleUpperCase(lang()) : el.textContent;
        lines(g, text.trim(), (cr.width - 40) * s).forEach(function (l, i) { g.fillText(l, OUT_W / 2, (r.top - cr.top) * s + i * lh + (lh - size) / 2); });
      });
      var bin = atob(c.toDataURL('image/png').split(',')[1]), a = new Uint8Array(bin.length);   // encoded at once, as the student's medal is (toBlob can wait)
      for (var k = 0; k < bin.length; k++) a[k] = bin.charCodeAt(k);
      return new Blob([a], { type: 'image/png' });
    });
  }
  function save(blob, name) {
    try { var a = document.createElement('a'), u = URL.createObjectURL(blob); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 5000); return true; }
    catch (e) { return false; }
  }
  function act(kind, card) {
    var name = 'jamals-global-proud.png';
    var text = ['.pc-k', '.pc-t'].map(function (q) { var el = card.querySelector(q); return el ? el.textContent.trim() : ''; }).filter(Boolean).concat('Jamals Global').join(' · ');
    return draw(card).then(function (blob) {
      var file = null;
      if (kind !== 'save') { try { file = new File([blob], name, { type: 'image/png' }); } catch (e) { file = null; } }
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        return navigator.share({ files: [file], text: text, title: 'Jamals Global' }).then(function () { say('shared'); }, function (e) { if (!(e && e.name === 'AbortError')) say(save(blob, name) ? kind : 'fail'); });
      }
      say(save(blob, name) ? kind : 'fail');
    }, function () { say('fail'); });
  }
  document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest ? e.target.closest('#sheet .share-row button[data-toast]') : null;
    var card = b && document.querySelector('#sheet .proud-card'), kind = b && KIND[b.getAttribute('data-toast')];
    if (!card || !kind) return;
    e.stopPropagation(); e.preventDefault();                          // the design's toast is not said: what happens is
    act(kind, card);
  }, true);
})();
