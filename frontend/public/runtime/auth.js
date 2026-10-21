/* Jamals Global: the shared client logic of the sign-in, welcome, link and sign-out screens (web/auth/*.html).
   No framework. Sign-ins are real form posts to Auth.js (a full navigation), so Auth.js sets its own
   cookie and redirects the browser itself; only registration, the profile and the family code use fetch. */
(function (w) {
  'use strict';

  // ── where to go afterwards ──────────────────────────────────────────────────────────────────────

  /** The server's rule (src/lib/redirect.ts): one leading slash, not `//` or `/\`, no control characters. */
  function safeNext(v) {
    if (typeof v !== 'string' || v.length === 0 || v[0] !== '/') return '/';
    if (v[1] === '/' || v[1] === '\\') return '/';
    return /[\u0000-\u001F\u007F]/.test(v) ? '/' : v;
  }

  /*
   * A failed password (or Telegram) sign-in comes back as /signin?error=CredentialsSignin, without the
   * callbackUrl it was given. What the attempt was, where it was going and the address typed are kept for
   * this tab only, so the page can say the right thing and keep `next`. Never the password.
   */
  var LAST = 'jg.auth.last', context = {};
  /** What every remembered attempt also carries (the page's role), so a parent stays a parent after an error. */
  function setContext(v) { context = v || {}; }
  function remember(v) {
    var all = {}, k;
    for (k in context) all[k] = context[k];
    for (k in v) all[k] = v[k];
    try { w.sessionStorage.setItem(LAST, JSON.stringify(all)); } catch (e) {}
  }
  function recall() {
    try { var v = JSON.parse(w.sessionStorage.getItem(LAST) || 'null'); w.sessionStorage.removeItem(LAST); return v || {}; } catch (e) { return {}; }
  }

  // ── Auth.js ─────────────────────────────────────────────────────────────────────────────────────

  function csrf() {
    return fetch('/api/auth/csrf', { credentials: 'same-origin' }).then(function (r) { return r.json(); }).then(function (j) {
      if (!j || !j.csrfToken) throw new Error('no csrf token');
      return j.csrfToken;
    });
  }

  /** Builds a hidden <form method="post"> and submits it: a full navigation. */
  function postForm(action, fields) {
    var d = w.document, f = d.createElement('form');
    f.method = 'post'; f.action = action; f.hidden = true;
    Object.keys(fields).forEach(function (k) {
      var i = d.createElement('input'); i.type = 'hidden'; i.name = k; i.value = fields[k]; f.appendChild(i);
    });
    d.body.appendChild(f);
    f.submit();
  }

  function signInPassword(email, password, next) {
    remember({ method: 'password', next: next, email: email });
    return csrf().then(function (t) { postForm('/api/auth/callback/password', { csrfToken: t, email: email, password: password, callbackUrl: next }); });
  }
  function signInGoogle(next) {
    remember({ method: 'google', next: next });
    return csrf().then(function (t) { postForm('/api/auth/signin/google', { csrfToken: t, callbackUrl: next }); });
  }
  function signInTelegram(payload, next) {
    remember({ method: 'telegram', next: next });
    return csrf().then(function (t) { postForm('/api/auth/callback/telegram', { csrfToken: t, payload: JSON.stringify(payload), callbackUrl: next }); });
  }

  /**
   * Signing out is a POST to Auth.js with the CSRF token, which Auth.js checks; GET /signout only asks
   * (a link or an <img> from another site must not end a session). Lands on /signin, which forgets `jg.uid`.
   */
  function signOut() {
    return csrf().then(function (t) { postForm('/api/auth/signout', { csrfToken: t, callbackUrl: '/signin' }); });
  }

  /**
   * POST /api/v1/register, then sign in with the same email and password. Resolves to `{ ok: true }` while
   * the browser navigates, or `{ ok: false, error, reason, issues }`: error is 'exists' | 'weak' | 'invalid' | 'too many' | 'failed',
   * or 'created' when the account was made but the sign-in after it did not start (signing in again works).
   */
  function register(fields, next) {
    return postJson('/api/v1/register', fields).then(function (r) {
      if (r.status === 201) {
        return signInPassword(fields.email, fields.password, next)
          .then(function () { return { ok: true }; }, function () { return { ok: false, error: 'created' }; });
      }
      return { ok: false, error: (r.body && r.body.error) || 'failed', reason: r.body && r.body.reason, issues: (r.body && r.body.issues) || [] };
    });
  }

  /** Whether a 400's issues name the name fields (final review I5: a refused name gets its own message). */
  function nameRefused(issues) { return Array.isArray(issues) && issues.some(function (i) { return i === 'firstName' || i === 'lastName' || i === 'fullName'; }); }

  /** POST JSON to one of our own endpoints; resolves to { status, body }, status 0 when offline. */
  function postJson(url, body) {
    return fetch(url, { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().catch(function () { return null; }).then(function (j) { return { status: r.status, body: j }; }); })
      .catch(function () { return { status: 0, body: null }; });
  }

  // ── Telegram's return: #tgAuthResult=<base64url JSON> ───────────────────────────────────────────

  /** telegramFields() in src/lib/telegram-login.ts: bounded, flat, no line breaks, id/hash/auth_date present. */
  function telegramFields(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    var keys = Object.keys(raw);
    if (keys.length === 0 || keys.length > 16) return null;
    var out = {};
    for (var n = 0; n < keys.length; n++) {
      var k = keys[n], v = raw[k];
      if (!/^[a-z_]{1,32}$/.test(k)) return null;
      if (typeof v === 'number' && isFinite(v)) out[k] = v;
      else if (typeof v === 'string' && v.length <= 512 && !/[\r\n]/.test(v)) out[k] = v;
      else return null;
    }
    if (out.id === undefined || out.hash === undefined || out.auth_date === undefined) return null;
    return out;
  }

  /** decodeTgAuthResult() in src/lib/telegram-login.ts, for the browser: base64url → UTF-8 → JSON. */
  function decodeTgAuthResult(fragment) {
    var m = /(?:^|[#?&])tgAuthResult=([A-Za-z0-9\-_=]*)$/.exec(fragment) || /^([A-Za-z0-9\-_=]+)$/.exec(fragment);
    if (!m || !m[1]) return null;
    try {
      var b64 = m[1].replace(/=+$/, '').replace(/-/g, '+').replace(/_/g, '/');
      if (b64.length % 4 === 1) return null;
      while (b64.length % 4) b64 += '=';
      var bin = atob(b64), bytes = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return telegramFields(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)));
    } catch (e) {
      return null;
    }
  }

  // ── language ────────────────────────────────────────────────────────────────────────────────────

  var LANGS = ['uz', 'ru', 'en'];
  /** A stored choice first; Uzbek for parents and uz browsers; Russian for ru browsers; else English. */
  function pickLang(stored, role, navLang) {
    if (LANGS.indexOf(stored) >= 0) return stored;
    var nav = String(navLang || '').toLowerCase();
    if (role === 'parent' || nav.indexOf('uz') === 0) return 'uz';
    if (nav.indexOf('ru') === 0) return 'ru';
    return 'en';
  }

  /*
   * Fills every [data-t] (text) and [data-t-aria] (aria-label) from STR[lang],
   * wires the three-way switch ([data-lang] buttons), and remembers the choice in this browser. A parent's
   * choice is also the parent design's own language key, so the app opens in the language picked here.
   */
  function i18n(STR, role, onChange) {
    var d = w.document, stored = null;
    try { stored = w.localStorage.getItem('jg.auth.lang') || (role === 'parent' ? w.localStorage.getItem('jg.parent.lang') : null); } catch (e) {}
    var api = { lang: pickLang(stored, role, w.navigator.language), t: function (k) { return STR[api.lang][k] || STR.en[k] || ''; } };
    /*
     * The teen walk of 10 Oct 2026 (the owner's delegated call: "I picked UZ on the sign-in page and the first Home is all English"). carry():
     * the language this page hands to the account: the one picked here (now or before, in this browser), or the Uzbek or Russian the page
     * opened in by itself; null for an English nobody chose (a phone set to English says nothing about its owner, so the app's first screen
     * still asks). It goes with a registration (register() below) and stays in the cookie `jg_lang` (a year, this site only, no account data),
     * which GET /app reads for an account that has no language yet (src/server/users.ts adoptLang).
     */
    var picked = LANGS.indexOf(stored) >= 0;
    api.carry = function () { return picked || api.lang !== 'en' ? api.lang : null; };
    function keep() {
      var l = api.carry();
      try { if (l) d.cookie = 'jg_lang=' + l + '; Path=/; Max-Age=31536000; SameSite=Lax' + (w.location && w.location.protocol === 'https:' ? '; Secure' : ''); } catch (e) {}
    }
    function apply() {
      var s = STR[api.lang];
      d.documentElement.lang = api.lang === 'uz' ? 'uz-Latn' : api.lang;
      d.querySelectorAll('[data-t]').forEach(function (e) { e.textContent = s[e.getAttribute('data-t')]; });
      d.querySelectorAll('[data-t-aria]').forEach(function (e) { e.setAttribute('aria-label', s[e.getAttribute('data-t-aria')]); });
      d.querySelectorAll('[data-lang]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === api.lang)); });
      if (s.docTitle) d.title = s.docTitle;
      keep();
      if (onChange) onChange(api.lang);
    }
    d.querySelectorAll('[data-lang]').forEach(function (b) {
      b.addEventListener('click', function () {
        api.lang = b.getAttribute('data-lang'); picked = true;
        try { w.localStorage.setItem('jg.auth.lang', api.lang); if (role === 'parent') w.localStorage.setItem('jg.parent.lang', api.lang); } catch (e) {}
        apply();
      });
    });
    apply();
    return api;
  }

  /** Marks a submit button busy (and disabled) while a request or navigation is under way. */
  function busy(button, on) { button.disabled = on; button.setAttribute('aria-busy', String(on)); }
  // Back from the page a sign-in navigated to, restored from the back/forward cache: nothing is under way any more.
  if (w.addEventListener) {
    w.addEventListener('pageshow', function (e) {
      if (e.persisted) w.document.querySelectorAll('[aria-busy="true"]').forEach(function (b) { busy(b, false); });
    });
  }

  w.JGAuth = {
    safeNext: safeNext, setContext: setContext, remember: remember, recall: recall, csrf: csrf, postForm: postForm, postJson: postJson, nameRefused: nameRefused,
    signInPassword: signInPassword, signInGoogle: signInGoogle, signInTelegram: signInTelegram, register: register, signOut: signOut,
    decodeTgAuthResult: decodeTgAuthResult, pickLang: pickLang, i18n: i18n, busy: busy,
  };
})(window);
