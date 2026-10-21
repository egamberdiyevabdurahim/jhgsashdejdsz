/* Jamals Global runtime: the profile photo (P4g S4, owner 4 Oct 2026: "there is no place to upload a photo"). Not design code: a sheet the
 * design does not have, drawn with its own sheet markup and classes (.cm-sheet, .cm-sheet-bg, .cm-sheet-card, h3, .cm-note, .pf-btn,
 * .pf-btn.ghost), so it is a bottom sheet on the phone and a centred card on the desktop, as the design's own sheets are.
 * Opened by a tap on any .jg-photo-edit (the student's own avatar on his profile and in Settings, which the design pages mark for a
 * real student) or window.JG_PHOTO.open(). The photo is chosen from the device (JPEG, PNG or WebP), placed in a circle (drag, zoom), cut
 * to a 256 px square and sent as WebP (JPEG where the browser cannot write WebP) of at most 100 KiB to POST /api/v1/me/photo, which checks
 * it again (src/server/photo.ts). Remove sends DELETE. Either way every place that shows the student's photo follows at once: the
 * runtime's JG_ME, the design's photo sources (.avatar's --photo, the top bar, the Home chart, Settings, the profile, the composer and the
 * League), and the "jg:photo" event the design pages listen for where they keep a copy. Live students only (pages.ts).
 * Owner 6 Oct 2026 P4h H2 ("ikkalasi ham": parents can upload their own photo, like students): a real family's parent too (the parent read
 * model's child is in the boot; never the demo, /preview or ENGINE_LIVE off). The same crop, encoder and route; the sheet is the parent design's
 * own (#sheet and #scrim: a bottom sheet on the phone, a centred card on the desktop; .grab, h3, .lead, .btn-block, .sheet-close) with this
 * sheet's crop stage, in the parent app's language (Oʻzbekcha, Русский, English: the design's own switch) and kept from the design's translator
 * (data-notr). His way in is his Account initials (a button with the camera badge); every slot that shows his initials (the Account card, the
 * desktop top bar's button) shows his photo through one CSS rule, the one src/server/me-photo.ts writes for the first paint. */
(function () {
  'use strict';
  var BOOT = window.JG_BOOT, ME = window.JG_ME;
  if (!BOOT || !ME) return;
  var PARENT = BOOT.role === 'parent' && !!BOOT.child && !BOOT.demo;                 // owner 6 Oct P4h H2
  if (!PARENT && !window.JG_ENGINE) return;
  var MAX_BYTES = 100 * 1024, OUT = 256, VIEW = 240, MAX_FILE = 20 * 1024 * 1024, MAX_ZOOM = 4;
  var T = {
    title: 'Profile photo', lead: 'Only you and the parents linked to your account see it.', choose: 'Choose a photo', another: 'Choose another photo',
    save: 'Save photo', saving: 'Saving…', remove: 'Remove photo', removing: 'Removing…', cancel: 'Cancel', zoom: 'Zoom',
    place: 'Drag to place your face in the circle.', stage: 'Your photo. Drag or use the arrow keys to move it, plus and minus to zoom.',
    errRead: 'That file is not a photo we can open. Choose a JPG, PNG or WebP photo.', errBig: 'That file is too large. Choose a photo under 20 MB.',
    errNet: 'Could not save. Check your connection and try again.', errLimit: 'Too many changes for now. Try again in an hour.', errSave: 'Could not save this photo. Try another one.',
    edit: 'Change your photo',
  };
  /* The parent apps' words (P4h H2): new copy, drafts with no native review, in the parent app's own terms (Profil / Профиль; a child is
   * "connected": ulangan / подключённый). Uzbek oʻ and gʻ are U+02BB, as everywhere since the controller's 7 Oct ruling (P5 content-integrity
   * pass; the parent dictionary and src/server/parent/patterns.ts were U+2018 before it). */
  var TP = {
    en: {
      title: 'Profile photo', lead: 'Only you and your connected children see it.', choose: 'Choose a photo', another: 'Choose another photo',
      save: 'Save photo', saving: 'Saving…', remove: 'Remove photo', removing: 'Removing…', cancel: 'Close', zoom: 'Zoom',
      place: 'Drag to place your face in the circle.', stage: 'Your photo. Drag or use the arrow keys to move it, plus and minus to zoom.',
      errRead: 'That file is not a photo we can open. Choose a JPG, PNG or WebP photo.', errBig: 'That file is too large. Choose a photo under 20 MB.',
      errNet: 'Could not save. Check your connection and try again.', errLimit: 'Too many changes for now. Try again in an hour.', errSave: 'Could not save this photo. Try another one.',
      edit: 'Change your photo',
    },
    uz: {
      title: 'Profil rasmi', lead: 'Rasmni faqat siz va sizga ulangan farzandlaringiz koʻradi.', choose: 'Rasm tanlash', another: 'Boshqa rasm tanlash',
      save: 'Rasmni saqlash', saving: 'Saqlanmoqda…', remove: 'Rasmni oʻchirish', removing: 'Oʻchirilmoqda…', cancel: 'Yopish', zoom: 'Kattalashtirish',
      place: 'Yuzingiz doira ichida turishi uchun rasmni suring.', stage: 'Rasmingiz. Uni sichqoncha yoki strelka tugmalari bilan suring, plyus va minus bilan kattalashtiring.',
      errRead: 'Bu faylni ochib boʻlmadi. JPG, PNG yoki WebP rasm tanlang.', errBig: 'Fayl juda katta. 20 MB dan kichik rasm tanlang.',
      errNet: 'Saqlab boʻlmadi. Internetni tekshirib, qaytadan urinib koʻring.', errLimit: 'Hozircha oʻzgarishlar juda koʻp. Bir soatdan keyin urinib koʻring.', errSave: 'Bu rasmni saqlab boʻlmadi. Boshqa rasm tanlang.',
      edit: 'Rasmingizni oʻzgartirish',
    },
    ru: {
      title: 'Фото профиля', lead: 'Его видите только вы и подключённые к вам дети.', choose: 'Выбрать фото', another: 'Выбрать другое фото',
      save: 'Сохранить фото', saving: 'Сохраняем…', remove: 'Удалить фото', removing: 'Удаляем…', cancel: 'Закрыть', zoom: 'Масштаб',
      place: 'Передвиньте фото, чтобы лицо было в круге.', stage: 'Ваше фото. Перетаскивайте его мышью или стрелками, меняйте масштаб клавишами плюс и минус.',
      errRead: 'Не удалось открыть этот файл. Выберите фото в формате JPG, PNG или WebP.', errBig: 'Файл слишком большой. Выберите фото меньше 20 МБ.',
      errNet: 'Не удалось сохранить. Проверьте подключение и попробуйте ещё раз.', errLimit: 'Слишком много изменений. Попробуйте через час.', errSave: 'Не удалось сохранить это фото. Попробуйте другое.',
      edit: 'Изменить фото',
    },
  };
  /** The words of this page: the student's (English, as the student apps' chrome), or the parent app's language (<html lang>, which its switch sets). */
  function W() {
    if (!PARENT) return T;
    var l = String(document.documentElement.getAttribute('lang') || '').slice(0, 2);
    return TP[l] || TP.en;
  }

  /* ---------- the crop: pure, so the tests can check it ---------- */
  /** The scale that makes an image of w x h just cover the view (zoom 1), and the offset that centres it. */
  function fit(w, h, view) { var s = view / Math.min(w, h); return { s: s, x: (view - w * s) / 2, y: (view - h * s) / 2 }; }
  /** An offset kept inside the image: the view is always covered. */
  function clamp(c, w, h, view) {
    return { s: c.s, x: Math.min(0, Math.max(view - w * c.s, c.x)), y: Math.min(0, Math.max(view - h * c.s, c.y)) };
  }
  /** Zoom z (1 = cover) about the view's centre. */
  function zoomTo(c, z, w, h, view) {
    var base = view / Math.min(w, h), s = base * Math.min(MAX_ZOOM, Math.max(1, z)), cx = (view / 2 - c.x) / c.s, cy = (view / 2 - c.y) / c.s;
    return clamp({ s: s, x: view / 2 - cx * s, y: view / 2 - cy * s }, w, h, view);
  }
  /** The square of the image the circle shows, in the image's own pixels. */
  function rectOf(c, view) { return { sx: -c.x / c.s + 0, sy: -c.y / c.s + 0, size: view / c.s }; }
  /** Encodes until it fits: WebP first (JPEG when the browser writes something else), lower quality until it is within the cap. */
  function encode(canvas, max) {
    function blob(type, q) { return new Promise(function (res) { canvas.toBlob(function (b) { res(b); }, type, q); }); }
    function tryType(type, q) {
      return blob(type, q).then(function (b) {
        if (!b) return null;
        if (b.type !== type) return type === 'image/webp' ? tryType('image/jpeg', 0.86) : null;
        if (b.size <= max) return b;
        return q > 0.45 ? tryType(type, Math.round((q - 0.12) * 100) / 100) : null;
      });
    }
    return tryType('image/webp', 0.86);
  }

  /* ---------- every place that shows the photo ---------- */
  function each(sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }
  /* A parent's slots (P4h H2): his photo over every .initials, by the rule src/server/me-photo.ts writes for the first paint (keep the two the
   * same); only an address the server writes goes into it. */
  var PHOTO_URL = /^\/api\/v1\/photo\/[A-Za-z0-9._~%-]+\?v=[0-9a-f]{16}$/;
  function meCss(url) { return url && PHOTO_URL.test(url) ? ':root .initials{background:var(--forest) url("' + url + '") center/cover no-repeat;color:transparent}' : null; }
  function paintParent(url) {
    var css = meCss(url), st = document.getElementById('jg-me-photo');
    if (css) {
      if (!st) { st = document.createElement('style'); st.id = 'jg-me-photo'; (document.head || document.documentElement).appendChild(st); }
      st.textContent = css;
    } else if (st && st.parentNode) st.parentNode.removeChild(st);
  }
  function emit(u, url) {
    var ev; try { ev = new CustomEvent('jg:photo', { detail: { photo: u, photoUrl: url } }); } catch (e) { ev = document.createEvent('CustomEvent'); ev.initCustomEvent('jg:photo', false, false, { photo: u, photoUrl: url }); }
    document.dispatchEvent(ev);
  }
  function apply(url) {
    ME.photoUrl = url; if (BOOT.me) BOOT.me.photoUrl = url;
    ME.photo = url != null ? url : (window.JG_RUNTIME && window.JG_RUNTIME.initialsSvg ? window.JG_RUNTIME.initialsSvg(ME.fullName) : '');
    if (PARENT) { paintParent(url); emit(ME.photo, url); return; }
    var u = ME.photo, css = 'url("' + u + '")', css1 = "url('" + u + "')";
    document.documentElement.setAttribute('data-jg-photo', 'account');                  // shown whole and centred (Ruling R13), as any account photo
    each('.avatar', function (el) { el.style.setProperty('--photo', css); });            // Home (phone), the sidebar (desktop); most design code reads it
    each('#tb-av, .set-me i, #cm-me-coin, span.cm-av, .st-meav, .gi-me, #pf-av span.pf-img, #vs-me, #pf-av-me', function (el) { el.style.backgroundImage = css1; });
    each('#youPhoto, image[clip-path="url(#youClip)"]', function (el) { el.setAttribute('href', u); });   // the Home chart's "you"
    each('.lg-row.me img', function (el) { el.src = u; });                                // the League's "You" row, if open
    if (window.JIA && typeof window.JIA === 'object' && 'PHOTO' in window.JIA) window.JIA.PHOTO = u;
    if ('JIA_MYIMG' in window) window.JIA_MYIMG = u;
    emit(u, url);
  }

  /* ---------- the sheet ---------- */
  var CAM = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 8h3l2-3h6l2 3h3v11H4z'/%3E%3Ccircle cx='12' cy='13' r='3.5'/%3E%3C/svg%3E\")";
  var CSS = '.jg-photo-edit { position: relative; cursor: pointer; } .pf-av.jg-photo-edit { overflow: visible; }'
    + ' .jg-photo-edit::after { content: ""; position: absolute; right: 0; bottom: 0; width: 26px; height: 26px; box-sizing: border-box; border: 2px solid #fff; border-radius: 50%; background: var(--accent-fill, #207251) ' + CAM + ' center / 14px no-repeat; box-shadow: 0 2px 6px rgba(16, 39, 30, .25); }'
    + ' .set-me i.jg-photo-edit::after { right: -3px; bottom: -3px; width: 22px; height: 22px; background-size: 12px; }'
    + ' .jg-photo-edit:focus-visible { outline: 2px solid var(--focus, #2b9067); outline-offset: 3px; }'
    + ' #jg-ph .cm-sheet-card { text-align: center; }'
    + ' #jg-ph .jg-ph-stage { position: relative; width: ' + VIEW + 'px; height: ' + VIEW + 'px; margin: 14px auto 0; border-radius: 22px; overflow: hidden; background: #e8efeb; touch-action: none; }'
    + ' #jg-ph .jg-ph-now { display: block; width: 168px; height: 168px; margin: 36px; border-radius: 50%; object-fit: cover; background: #dfe7e3; }'
    + ' #jg-ph canvas { display: block; width: ' + VIEW + 'px; height: ' + VIEW + 'px; cursor: grab; }'
    + ' #jg-ph canvas:active { cursor: grabbing; } #jg-ph canvas:focus-visible { outline: 2px solid var(--focus, #2b9067); outline-offset: -2px; }'
    + ' #jg-ph .jg-ph-zoom { display: flex; align-items: center; gap: 10px; width: ' + VIEW + 'px; margin: 12px auto 0; font: 700 13px var(--font, inherit); color: var(--ink-3, #587066); }'
    + ' #jg-ph .jg-ph-zoom input { flex: 1; min-width: 0; accent-color: var(--accent-fill, #207251); }'
    + ' #jg-ph .jg-ph-msg { min-height: 18px; margin: 10px 0 0; font-size: 13px; font-weight: 600; line-height: 1.4; color: var(--ink-3, #587066); }'
    + ' #jg-ph .jg-ph-msg.err { color: var(--danger, #b0402f); }'
    + ' #jg-ph .jg-ph-acts { display: grid; gap: 8px; margin-top: 12px; } #jg-ph .jg-ph-acts .pf-btn { flex: none; width: 100%; height: 44px; }'
    + ' #jg-ph .pf-btn:disabled { opacity: .6; cursor: default; } #jg-ph [hidden] { display: none !important; }'
    // the parent apps (P4h H2): the badge on his 48 px initials as on the student's Settings photo; the design's own buttons, spaced by the grid
    + ' .initials.jg-photo-edit::after { right: -3px; bottom: -3px; width: 22px; height: 22px; background-color: var(--jade-500, #2b9067); background-size: 12px; }'
    + ' #jg-ph.jg-ph-p { text-align: center; } #jg-ph.jg-ph-p .jg-ph-acts { margin-top: 14px; } #jg-ph.jg-ph-p .jg-ph-acts .btn-block { margin: 0; }'
    + ' #jg-ph .btn:disabled { opacity: .6; cursor: default; }'
    + ' #jg-ph .jg-ph-now.jg-ph-init { display: grid; place-items: center; background: var(--forest, #123a29) center / cover no-repeat; color: #fff; font-family: var(--serif, Georgia, serif); font-size: 60px; line-height: 1; }';
  var st = document.createElement('style'); st.textContent = CSS; (document.head || document.documentElement).appendChild(st);

  var sheet = null, el = {}, opener = null, img = null, url0 = null, crop = null, busy = false, drag = null, shown = false, slid = false;
  var STAGE = '<div class="jg-ph-stage"><img class="jg-ph-now" id="jg-ph-now" alt=""><canvas id="jg-ph-cv" tabindex="0" role="img" hidden></canvas></div>'
    + '<label class="jg-ph-zoom" id="jg-ph-zoomrow" hidden><span id="jg-ph-zl"></span><input type="range" id="jg-ph-zoom" min="1" max="' + MAX_ZOOM + '" step="0.01" value="1"></label>'
    + '<p class="jg-ph-msg" id="jg-ph-msg" role="status" aria-live="polite"></p>';
  var FILE = '<input type="file" id="jg-ph-file" accept="image/jpeg,image/png,image/webp" hidden>';
  function build() {
    if (sheet) return;
    sheet = document.createElement('div');
    sheet.className = 'cm-sheet'; sheet.id = 'jg-ph'; sheet.hidden = true;
    sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true'); sheet.setAttribute('aria-labelledby', 'jg-ph-t');
    sheet.innerHTML = '<div class="cm-sheet-bg" data-jg-ph="close"></div><div class="cm-sheet-card">'
      + '<h3 id="jg-ph-t"></h3><p class="cm-note" id="jg-ph-lead"></p>' + STAGE
      + '<div class="jg-ph-acts"><button class="pf-btn" type="button" data-jg-ph="pick"></button><button class="pf-btn" type="button" data-jg-ph="save" hidden></button>'
      + '<button class="pf-btn ghost" type="button" data-jg-ph="pick" id="jg-ph-again" hidden></button><button class="pf-btn ghost" type="button" data-jg-ph="remove" hidden></button>'
      + '<button class="pf-btn ghost" type="button" data-jg-ph="close"></button></div>' + FILE + '</div>';
    var host = document.getElementById('sh-sheet');
    (host && host.parentNode ? host.parentNode : document.body).appendChild(sheet);
    wire(sheet.querySelector('.jg-ph-acts [data-jg-ph="close"]'), sheet.querySelector('#jg-ph-t'));
  }
  /* P4h H2: a parent's sheet is written into the design's own #sheet each time it opens (the design writes each of its sheets there too); its
   * X is the design's .sheet-close, and the design's #sheetTitle names the dialog. */
  var X = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  function buildParent() {
    var sh = document.getElementById('sheet');
    if (!sh) return false;
    sh.className = 'sheet';
    sh.innerHTML = '<div id="jg-ph" class="jg-ph-p" data-notr><button class="sheet-close" type="button" data-jg-ph="close">' + X + '</button><div class="grab"></div>'
      + '<h3 id="sheetTitle"></h3><p class="lead" id="jg-ph-lead"></p>' + STAGE.replace('<img class="jg-ph-now" id="jg-ph-now" alt="">', '<span class="jg-ph-now jg-ph-init" id="jg-ph-now" aria-hidden="true"></span>')
      + '<div class="jg-ph-acts"><button class="btn btn-primary btn-block" type="button" data-jg-ph="pick"></button><button class="btn btn-primary btn-block" type="button" data-jg-ph="save" hidden></button>'
      + '<button class="btn btn-ghost btn-block" type="button" data-jg-ph="pick" id="jg-ph-again" hidden></button><button class="btn btn-ghost btn-block" type="button" data-jg-ph="remove" hidden></button></div>'
      + FILE + '</div>';
    sheet = sh.querySelector('#jg-ph');
    var x = sheet.querySelector('.sheet-close');
    wire(x, sheet.querySelector('#sheetTitle'));
    x.setAttribute('aria-label', W().cancel);
    return true;
  }
  /** The sheet's words and handlers, the same for both (the parent's is new DOM at every open, so it is wired again). */
  function wire(cancel, title) {
    var w = W();
    el = {};
    ['now', 'cv', 'zoomrow', 'zoom', 'zl', 'msg', 'file', 'again', 'lead'].forEach(function (k) { el[k] = sheet.querySelector('#jg-ph-' + k); });
    el.pick = sheet.querySelector('[data-jg-ph="pick"]'); el.save = sheet.querySelector('[data-jg-ph="save"]'); el.remove = sheet.querySelector('[data-jg-ph="remove"]');
    el.cancel = cancel;
    title.textContent = w.title; el.lead.textContent = w.lead; el.zl.textContent = w.zoom; el.zoom.setAttribute('aria-label', w.zoom);
    el.pick.textContent = w.choose; el.again.textContent = w.another; el.save.textContent = w.save; el.remove.textContent = w.remove;
    if (!PARENT) el.cancel.textContent = w.cancel;                                         // the parent's is the design's X (its aria-label)
    el.cv.setAttribute('aria-label', w.stage);
    sheet.addEventListener('click', function (e) {
      var b = e.target.closest('[data-jg-ph]'); if (!b || busy) return;
      var a = b.getAttribute('data-jg-ph');
      if (a === 'close') close(); else if (a === 'pick') el.file.click(); else if (a === 'save') save(); else if (a === 'remove') removePhoto();
    });
    el.file.addEventListener('change', function () { var f = el.file.files && el.file.files[0]; el.file.value = ''; if (f) load(f); });
    el.zoom.addEventListener('input', function () { if (!crop) return; crop = zoomTo(crop, +el.zoom.value, img.naturalWidth, img.naturalHeight, VIEW); draw(); });
    el.cv.addEventListener('pointerdown', function (e) { if (!crop) return; drag = { x: e.clientX, y: e.clientY, c: crop }; try { el.cv.setPointerCapture(e.pointerId); } catch (x) {} e.preventDefault(); });
    el.cv.addEventListener('pointermove', function (e) {
      if (!drag) return;
      crop = clamp({ s: drag.c.s, x: drag.c.x + e.clientX - drag.x, y: drag.c.y + e.clientY - drag.y }, img.naturalWidth, img.naturalHeight, VIEW); draw();
    });
    ['pointerup', 'pointercancel'].forEach(function (t) { el.cv.addEventListener(t, function () { drag = null; }); });
    el.cv.addEventListener('wheel', function (e) { if (!crop) return; e.preventDefault(); setZoom(+el.zoom.value * (e.deltaY < 0 ? 1.08 : 1 / 1.08)); }, { passive: false });
    el.cv.addEventListener('keydown', function (e) {
      if (!crop) return;
      var k = e.key, d = { ArrowLeft: [8, 0], ArrowRight: [-8, 0], ArrowUp: [0, 8], ArrowDown: [0, -8] }[k];
      if (d) { crop = clamp({ s: crop.s, x: crop.x + d[0], y: crop.y + d[1] }, img.naturalWidth, img.naturalHeight, VIEW); draw(); e.preventDefault(); }
      else if (k === '+' || k === '=') { setZoom(+el.zoom.value * 1.1); e.preventDefault(); } else if (k === '-') { setZoom(+el.zoom.value / 1.1); e.preventDefault(); }
    });
    sheet.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); if (!busy) close(); return; }
      if (e.key !== 'Tab') return;
      var f = Array.prototype.filter.call(sheet.querySelectorAll('button, input[type="range"], canvas'), function (x) { return !x.hidden && !x.closest('[hidden]') && !x.disabled; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { f[f.length - 1].focus(); e.preventDefault(); } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { f[0].focus(); e.preventDefault(); }
    });
  }
  function setZoom(z) { z = Math.min(MAX_ZOOM, Math.max(1, z)); el.zoom.value = String(z); crop = zoomTo(crop, z, img.naturalWidth, img.naturalHeight, VIEW); draw(); }
  function say(text, err) { el.msg.textContent = text || ''; el.msg.classList.toggle('err', !!err); }
  function mode(cropping) {
    el.now.hidden = cropping; el.cv.hidden = !cropping; el.zoomrow.hidden = !cropping;
    el.pick.hidden = cropping; el.save.hidden = !cropping; el.again.hidden = !cropping;
    el.remove.hidden = cropping || ME.photoUrl == null;
  }
  function topZ() {
    var z = 0;
    each('.set-view, .pf-view, .cm-sheet, .ly-view, .zq-view', function (x) { if (x !== sheet && !x.hidden) z = Math.max(z, +getComputedStyle(x).zIndex || 0); });
    return z;
  }
  function open(from) {
    if (PARENT) { if (busy || !buildParent()) return; } else build();
    opener = from || document.activeElement; reset(); say('');
    if (PARENT) {                                                                          // his photo, or his initials as the parent apps draw them (P4h H2)
      var has = ME.photoUrl != null && PHOTO_URL.test(ME.photoUrl);
      el.now.textContent = has ? '' : (ME.initials || ''); el.now.style.backgroundImage = has ? 'url("' + ME.photoUrl + '")' : '';
    } else el.now.src = ME.photo || '';
    mode(false);
    if (PARENT) {
      var sh = document.getElementById('sheet'), sc = document.getElementById('scrim');
      sh.scrollTop = 0; if (sc) sc.classList.add('on');
      requestAnimationFrame(function () {                                                  // as the design's own openSheet slides it in
        if (!shown) return;
        sh.classList.add('on'); slid = true;
        // the focus once the sheet can take it: its buttons inherit the sheet's visibility: hidden for as long as the design's transition runs
        // (with reduced motion every element of the design transitions in 1 ms, visibility included), and focus() is a no-op until then
        var b = el.pick, tries = 0;
        (function focusPick() { if (!shown || b !== el.pick) return; b.focus({ preventScroll: true }); if (document.activeElement !== b && ++tries < 20) setTimeout(focusPick, 40); })();
      });
    } else {
      sheet.style.zIndex = String(Math.max(window.JIA_z ? window.JIA_z() : 0, topZ() + 1, 90));
      sheet.hidden = false;
    }
    shown = true; slid = !PARENT;
    if (!PARENT) setTimeout(function () { el.pick.focus({ preventScroll: true }); }, 50);
  }
  function close() {
    if (!sheet || !shown) return;
    shown = false; slid = false;
    if (PARENT) {
      var sh = document.getElementById('sheet'), sc = document.getElementById('scrim');
      if (sh) sh.classList.remove('on');
      if (sc) sc.classList.remove('on');
    } else sheet.hidden = true;
    reset();
    if (opener && opener.focus) try { opener.focus({ preventScroll: true }); } catch (e) {}
  }
  /* P4h H2: the design also closes its sheet itself (its scrim, Escape on the page, its own sheet written over this one); this one then resets and
   * gives the focus back to his photo, as close() does. */
  if (PARENT && document.getElementById('sheet') && typeof MutationObserver === 'function') {
    new MutationObserver(function () {
      var sh = document.getElementById('sheet');
      if (shown && slid && (!sh.classList.contains('on') || !sh.contains(sheet))) close();
    }).observe(document.getElementById('sheet'), { attributes: true, attributeFilter: ['class'], childList: true });
  }
  function reset() { if (url0) { URL.revokeObjectURL(url0); url0 = null; } img = null; crop = null; drag = null; busy = false; if (el.zoom) el.zoom.value = '1'; enable(true); }
  function enable(on) { [el.pick, el.save, el.again, el.remove, el.cancel].forEach(function (b) { if (b) b.disabled = !on; }); }
  function load(file) {
    if (!/^image\/(jpe?g|pjpeg|png|webp)$/.test(file.type || '')) { say(W().errRead, true); return; }   // what the picker offers (accept=), as some phones name it
    if (file.size > MAX_FILE) { say(W().errBig, true); return; }
    reset(); say('');
    url0 = URL.createObjectURL(file);
    var im = new Image();
    im.onload = function () {
      if (!im.naturalWidth || !im.naturalHeight) { say(W().errRead, true); return; }
      img = im; crop = fit(im.naturalWidth, im.naturalHeight, VIEW);
      var r = window.devicePixelRatio || 1; el.cv.width = Math.round(VIEW * r); el.cv.height = Math.round(VIEW * r);
      mode(true); draw(); say(W().place);
      setTimeout(function () { el.cv.focus({ preventScroll: true }); }, 30);
    };
    im.onerror = function () { say(W().errRead, true); };
    im.src = url0;
  }
  function draw() {
    var g = el.cv.getContext('2d'), r = el.cv.width / VIEW;
    g.setTransform(r, 0, 0, r, 0, 0); g.clearRect(0, 0, VIEW, VIEW);
    g.imageSmoothingQuality = 'high';
    g.drawImage(img, crop.x, crop.y, img.naturalWidth * crop.s, img.naturalHeight * crop.s);
    g.save(); g.beginPath(); g.rect(0, 0, VIEW, VIEW); g.arc(VIEW / 2, VIEW / 2, VIEW / 2 - 6, 0, Math.PI * 2, true);
    g.fillStyle = 'rgba(11, 24, 16, .45)'; g.fill('evenodd'); g.restore();
    g.beginPath(); g.arc(VIEW / 2, VIEW / 2, VIEW / 2 - 6, 0, Math.PI * 2); g.lineWidth = 2; g.strokeStyle = 'rgba(255, 255, 255, .9)'; g.stroke();
  }
  /** The chosen square at 256 px: halved step by step from a large photo, so it stays sharp. */
  function output() {
    var q = rectOf(crop, VIEW), src = img, sx = q.sx, sy = q.sy, size = q.size;
    while (size > OUT * 2) {
      var half = Math.round(size / 2), c = document.createElement('canvas'); c.width = c.height = half;
      var h = c.getContext('2d'); h.imageSmoothingQuality = 'high'; h.drawImage(src, sx, sy, size, size, 0, 0, half, half);
      src = c; sx = 0; sy = 0; size = half;
    }
    var out = document.createElement('canvas'); out.width = out.height = OUT;
    var o = out.getContext('2d'); o.fillStyle = '#ffffff'; o.fillRect(0, 0, OUT, OUT); o.imageSmoothingQuality = 'high';
    o.drawImage(src, sx, sy, size, size, 0, 0, OUT, OUT);
    return out;
  }
  function send(method, body, type) {
    var headers = { 'x-jg-uid': BOOT.uid || '' }; if (type) headers['content-type'] = type;
    return fetch('/api/v1/me/photo', { method: method, headers: headers, body: body, credentials: 'same-origin' });
  }
  function answer(r) {
    if (r.status === 409) { location.reload(); return null; }                     // another account is signed in now (P0 I2)
    if (r.status === 429) { say(W().errLimit, true); return null; }
    if (!r.ok) { say(W().errSave, true); return null; }
    return r.json();
  }
  function done(b) { busy = false; enable(true); if (!b) return; apply(b.photoUrl); close(); }
  function fail() { busy = false; enable(true); say(W().errNet, true); }
  function save() {
    if (!crop) return;
    busy = true; enable(false); say(W().saving);
    encode(output(), MAX_BYTES).then(function (blob) {
      if (!blob) { busy = false; enable(true); say(W().errSave, true); return; }
      return send('POST', blob, blob.type).then(answer).then(done, fail);
    }, fail);
  }
  function removePhoto() {
    busy = true; enable(false); say(W().removing);
    send('DELETE').then(answer).then(done, fail);
  }

  /* ---------- the way in: the avatars the design pages mark for a real student ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest ? e.target.closest('.jg-photo-edit') : null;
    if (!t) return;
    e.preventDefault(); e.stopPropagation(); open(t);
  }, true);
  document.addEventListener('keydown', function (e) {
    var t = e.target && e.target.closest ? e.target.closest('.jg-photo-edit') : null;
    if (!t || t.tagName === 'BUTTON' || (e.key !== 'Enter' && e.key !== ' ')) return;
    e.preventDefault(); open(t);
  });
  /* P4h H2: a parent's way in is his own initials on Account (both apps), a button with the camera badge, named in the app's language; the
   * design's translator leaves it alone (data-notr), so a switch of language renames it here. The desktop top bar's button stays the design's
   * way to Account. */
  function markParent() {
    each('#p-account .profile-row .initials', function (x) {
      x.classList.add('jg-photo-edit'); x.setAttribute('role', 'button'); x.setAttribute('tabindex', '0'); x.setAttribute('aria-label', W().edit); x.setAttribute('data-notr', '');
    });
  }
  if (PARENT) {
    markParent();
    if (typeof MutationObserver === 'function') new MutationObserver(markParent).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }

  window.JG_PHOTO = { open: open, apply: apply, label: W().edit, _crop: { fit: fit, clamp: clamp, zoomTo: zoomTo, rectOf: rectOf, encode: encode } };
})();
