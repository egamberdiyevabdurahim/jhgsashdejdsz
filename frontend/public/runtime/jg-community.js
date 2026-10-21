/*
 * jg-community.js: the Instagram-like half of Community made real (M1 lane soccli; the owner's 19-20 Oct 2026 "Instagram features ... do
 * them fast"; CONTRACT "social", src/server/community/contract.ts). Named by src/server/community/page.ts for a live, non-demo student only
 * while COMMUNITY is on; off, the page names no such file and the design's composers say "Community opens soon" (M:010:691, D:014:693).
 *
 * HOW: the design (public/d/student-mobile/js/010.js, student-desktop/js/014.js) keeps drawing every screen exactly as drawn, from its own
 * arrays (handed over at M:010:1487 / D:014:1432 as window.JIA_cm). This file only changes where the data comes from and where it goes:
 *  - in: GET /api/v1/community/me, /feed?kind=post|reel, /stories, /notifications, /u/<handle> (a profile when it opens), /search (people);
 *    the people in them are registered in the design's PEOPLE and AV as "c_<handle>" (kind "peer": "Student"), never under a full name;
 *  - out: the composers call window.JG_CM.post / reel / story (the design lines M:010:625, 698, 966): photos and videos go through
 *    POST /media first, then the item is created 'pending' and drawn in the design's "Checking" state, re-labelled "Waiting for review";
 *    a rejected one reads "Not approved" with the moderator's reason, for her alone. After every tap and key a sync pass compares the
 *    design's objects with what the server last said (a like, a save, a vote, a new comment or reply, a follow, a block, a deleted post, a
 *    story seen) and sends the difference.
 * A username comes first (PUT /me): the first time she opens a composer a sheet in the design's own style asks for one.
 * Share links are the server's app.jamals.uz/c/... and their text names nobody ("A post on JIA", "@handle on JIA").
 */
(function () {
  'use strict';
  var W = window, D = document, B = W.JG_BOOT || {};
  if (W.JG_CM || !B.uid || B.demo) return;
  var API = '/api/v1/community';
  var LANG = (D.documentElement.lang || 'en').slice(0, 2); if (LANG !== 'uz' && LANG !== 'ru') LANG = 'en';
  var S = {
    en: { wait: 'Waiting for review', no: 'Not approved', noNote: 'Not approved: {r}. Only you can see it.', noWhy: 'it doesn’t follow the community rules',
      sent: 'Sent for review. Only you can see it until an admin approves it.', storySent: 'Sent for review. Your story goes live once an admin approves it.',
      handleT: 'Choose your username', handleN: 'Others see your username and your first name with an initial, never your full name. 3–20 letters, numbers, _ or .',
      handleP: 'username', handleGo: 'Save', taken: 'That username is taken. Try another.', badHandle: 'Use 3–20 small letters, numbers, _ or .',
      later: 'Couldn’t do that. Try again in a moment.', moment: 'One moment…', unsafe: 'For your safety, phone numbers, usernames and outside links can’t be shared. Keep it on JIA.',
      abuse: 'Please remove the swear words before sending.', consent: 'Photos and videos need your parent’s OK first (under 14). Text posts are fine.',
      cap: 'That’s today’s limit. Try again tomorrow.', suspended: 'Posting is paused on your account. A JIA moderator will explain.', big: 'That file is too big.',
      processing: 'Getting your video ready…', videoFail: 'That video couldn’t be used. Try one under 60 seconds.', full: 'Uploads are paused for now. Try later.',
      postT: 'A post on JIA', reelT: 'A reel on JIA', profT: '@{h} on JIA', liked: '<b>{n}</b> liked your {k}', commented: '<b>{n}</b> commented: “{t}”',
      replied: '<b>{n}</b> replied: “{t}”', followed: '<b>{n}</b> started following you', requested: '<b>{n}</b> wants to follow you', accepted: '<b>{n}</b> accepted your follow request',
      approved: '<b>Your {k} was approved</b> and others can see it now', rejected: '<b>Your {k} was not approved</b>: {t}', post: 'post', reel: 'reel', story: 'story', comment: 'comment',
      checking: 'Checking…', requestedBtn: 'Requested', student: 'Student', inReview: 'In review', yourStory: 'Your story' },
    uz: { wait: 'Tekshiruv kutilmoqda', no: 'Tasdiqlanmadi', noNote: 'Tasdiqlanmadi: {r}. Buni faqat siz koʻrasiz.', noWhy: 'hamjamiyat qoidalariga mos emas',
      sent: 'Tekshiruvga yuborildi. Admin tasdiqlamaguncha uni faqat siz koʻrasiz.', storySent: 'Tekshiruvga yuborildi. Admin tasdiqlagach hikoyangiz chiqadi.',
      handleT: 'Foydalanuvchi nomingizni tanlang', handleN: 'Boshqalar foydalanuvchi nomingizni va ismingizni familiyangizning bosh harfi bilan koʻradi, toʻliq ismingizni hech qachon. 3–20 ta harf, raqam, _ yoki .',
      handleP: 'foydalanuvchi_nomi', handleGo: 'Saqlash', taken: 'Bu nom band. Boshqasini tanlang.', badHandle: '3–20 ta kichik harf, raqam, _ yoki . ishlating',
      later: 'Boʻlmadi. Birozdan keyin qayta urinib koʻring.', moment: 'Bir daqiqa…', unsafe: 'Xavfsizligingiz uchun telefon raqamlari, foydalanuvchi nomlari va tashqi havolalarni ulashib boʻlmaydi. JIA ichida qoling.',
      abuse: 'Yuborishdan oldin soʻkinish soʻzlarini olib tashlang.', consent: '14 yoshgacha rasm va videolar uchun avval ota-onangizning roziligi kerak. Matnli postlar mumkin.',
      cap: 'Bugungi chegara shu. Ertaga qayta urinib koʻring.', suspended: 'Hisobingizda post joylash toʻxtatilgan. JIA moderatori tushuntiradi.', big: 'Fayl juda katta.',
      processing: 'Videongiz tayyorlanmoqda…', videoFail: 'Bu videodan foydalanib boʻlmadi. 60 soniyadan qisqasini tanlang.', full: 'Yuklash hozircha toʻxtatilgan. Keyinroq urinib koʻring.',
      postT: 'JIA dagi post', reelT: 'JIA dagi rolik', profT: '@{h} JIA da', liked: '<b>{n}</b> {k}ni yoqtirdi', commented: '<b>{n}</b> izoh qoldirdi: “{t}”',
      replied: '<b>{n}</b> javob berdi: “{t}”', followed: '<b>{n}</b> sizga obuna boʻldi', requested: '<b>{n}</b> sizga obuna boʻlmoqchi', accepted: '<b>{n}</b> obuna soʻrovingizni qabul qildi',
      approved: '<b>{k} tasdiqlandi</b>, endi uni boshqalar koʻradi', rejected: '<b>{k} tasdiqlanmadi</b>: {t}', post: 'postingiz', reel: 'rolikingiz', story: 'hikoyangiz', comment: 'izohingiz',
      checking: 'Tekshirilmoqda…', requestedBtn: 'Soʻrov yuborildi', student: 'Oʻquvchi', inReview: 'Tekshiruvda', yourStory: 'Hikoyangiz' },
    ru: { wait: 'Ждёт проверки', no: 'Не одобрено', noNote: 'Не одобрено: {r}. Это видите только вы.', noWhy: 'не соответствует правилам сообщества',
      sent: 'Отправлено на проверку. Пока админ не одобрит, это видите только вы.', storySent: 'Отправлено на проверку. История появится, когда админ её одобрит.',
      handleT: 'Выберите имя пользователя', handleN: 'Другие видят ваше имя пользователя и имя с первой буквой фамилии, но никогда полное имя. 3–20 букв, цифр, _ или .',
      handleP: 'имя_пользователя', handleGo: 'Сохранить', taken: 'Это имя занято. Попробуйте другое.', badHandle: 'Используйте 3–20 строчных латинских букв, цифр, _ или .',
      later: 'Не получилось. Попробуйте чуть позже.', moment: 'Секунду…', unsafe: 'Ради вашей безопасности номера телефонов, имена пользователей и внешние ссылки отправлять нельзя. Оставайтесь в JIA.',
      abuse: 'Уберите ругательства перед отправкой.', consent: 'До 14 лет для фото и видео сначала нужно согласие родителя. Текстовые посты можно.',
      cap: 'На сегодня это предел. Попробуйте завтра.', suspended: 'Публикации в вашем аккаунте приостановлены. Модератор JIA объяснит.', big: 'Файл слишком большой.',
      processing: 'Готовим ваше видео…', videoFail: 'Это видео не подошло. Выберите короче 60 секунд.', full: 'Загрузка пока приостановлена. Попробуйте позже.',
      postT: 'Пост в JIA', reelT: 'Рилс в JIA', profT: '@{h} в JIA', liked: '<b>{n}</b> оценил(а): {k}', commented: '<b>{n}</b> прокомментировал(а): «{t}»',
      replied: '<b>{n}</b> ответил(а): «{t}»', followed: '<b>{n}</b> подписался(-ась) на вас', requested: '<b>{n}</b> хочет подписаться на вас', accepted: '<b>{n}</b> принял(а) вашу заявку',
      approved: '<b>Одобрено: {k}</b>. Теперь это видят другие', rejected: '<b>Не одобрено: {k}</b>. {t}', post: 'пост', reel: 'рилс', story: 'история', comment: 'комментарий',
      checking: 'Проверяется…', requestedBtn: 'Заявка отправлена', student: 'Ученик', inReview: 'На проверке', yourStory: 'История' },
  };
  function t(k, v) { var s = (S[LANG] && S[LANG][k]) || S.en[k] || k; if (v) Object.keys(v).forEach(function (n) { s = s.split('{' + n + '}').join(v[n]); }); return s; }
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  var st = { me: null, ready: false, off: false, sv: {}, following: {}, seenSent: {}, blocked: {}, storiesOf: {}, people: {}, notes: {}, loadedProfile: {}, cmLoaded: {} };
  var X = null, PP = null;                                     // the design's objects (JIA_cm, JIA_people), once it has run

  function api(method, path, body, type) {
    var h = { 'x-jg-uid': B.uid };
    if (body !== undefined) h['content-type'] = type || 'application/json';
    return fetch(API + path, { method: method, credentials: 'same-origin', headers: h, body: body === undefined ? undefined : (type ? body : JSON.stringify(body)) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, status: r.status, j: j || {} }; }); })
      .catch(function () { return { ok: false, status: 0, j: {} }; });
  }
  function say(msg) { if (!X) return; (X.rlView && !X.rlView.hidden ? X.rlToast : X.toast)(msg); }
  function refused(r) {                                        // the server's refusals, in her words
    var e = r.j && r.j.error;
    if (e === 'unsafe') return say((r.j.reasons || []).indexOf('abuse') >= 0 && (r.j.reasons || []).length === 1 ? t('abuse') : t('unsafe'));
    if (e === 'parent_consent_required') return say(t('consent'));
    if (e === 'daily_cap' || r.status === 429) return say(t('cap'));
    if (e === 'suspended') return say(t('suspended'));
    if (e === 'storage_full') return say(t('full'));
    if (r.status === 413) return say(t('big'));
    say(t('later'));
  }

  /* ---------- people: "c_<handle>" in the design's PEOPLE and AV ---------- */
  function key(p) {
    if (!p) return null;
    if (p.mine) return 'me';
    var k = 'c_' + p.handle;
    st.people[k] = p;
    if (PP) {
      PP.PEOPLE[k] = { name: p.name, kind: 'peer', tag: '@' + p.handle };
      PP.AV[k] = p.avatar || X.initialsAV(p.name, '#2b9067');
      if (X.KIND && !X.KIND.peer) X.KIND.peer = t('student');
      if (p.following === 'following') X.FOLLOWING.add(k); else X.FOLLOWING.delete(k);
      st.following[k] = p.following;
    }
    return k;
  }
  var handleOf = function (k) { return k && k.indexOf('c_') === 0 ? k.slice(2) : null; };

  function ago(iso) {
    var s = Math.max(0, (Date.now() - Date.parse(iso)) / 1000);
    if (s < 60) return 'now'; if (s < 3600) return Math.floor(s / 60) + 'm'; if (s < 86400) return Math.floor(s / 3600) + 'h';
    if (s < 7 * 86400) return Math.floor(s / 86400) + 'd';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  /* ---------- items: the server's Item as the design's POSTS / REELS entry ---------- */
  function cmtOf(c) {
    var o = { _id: c.id, who: key(c.author), text: c.text, ago: c.status === 'pending' ? t('checking') : ago(c.created_at), replies: (c.replies || []).map(cmtOf) };
    return o;
  }
  function pollOf(p) {
    var counts = p.counts || p.options.map(function (_, k) { return k === 0 ? p.total : 0; });   // hidden until she votes: the header's total stays true
    return { q: '', anon: true, opts: p.options.map(function (o, k) { return { t: o, v: counts[k] || 0 }; }), mine: p.my_vote != null ? p.my_vote : undefined };
  }
  function toPost(it) {
    var p = { _id: it.id, _kind: 'post', who: key(it.author), ago: ago(it.approved_at || it.created_at), likes: it.likes - (it.liked ? 1 : 0), liked: it.liked, text: it.text, cmts: [], _n: it.comments, share: it.share_url };
    if (it.mine) { p.status = it.status === 'approved' ? 'ok' : 'wait'; p.gone = true; p._st = it.status; p._why = it.reject_reason; (st.mine = st.mine || {})[it.id] = 1; }
    if (it.media && it.media.kind === 'photo' && it.media.url) p.photo = it.media.url;
    if (it.style && it.style.sticker) { p.stk = it.style.sticker; p.g = it.style.bg || ['#e0ecfa', '#c3daf4']; }
    if (it.poll) p.poll = pollOf(it.poll);
    st.sv[it.id] = { liked: it.liked, saved: it.saved, vote: it.poll ? it.poll.my_vote : null, cm: {} };
    return p;
  }
  function toReel(it) {
    var who = key(it.author);
    var r = { _id: it.id, _kind: 'reel', who: who, video: it.media && it.media.url, poster: it.media && it.media.poster, cap: it.text || '', likes: it.likes - (it.liked ? 1 : 0), liked: it.liked,
      cmts: it.comments, comments: [], saved: it.saved, follow: it.author.following === 'following', views: it.views || 0, b: ['#1a2a22', '#0e1612'], ink: '#fff', lines: [''], share: it.share_url };
    if (it.mine) { r._st = it.status; r._why = it.reject_reason; (st.mine = st.mine || {})[it.id] = 1; }
    st.sv[it.id] = { liked: it.liked, saved: it.saved, cm: {} };
    return r;
  }
  function comments(p) {
    return api('GET', '/posts/' + encodeURIComponent(p._id) + '/comments').then(function (r) {
      st.cmLoaded[p._id] = 1;
      if (!r.ok) return;
      var list = p._kind === 'reel' ? p.comments : p.cmts; list.length = 0; (r.j.items || []).forEach(function (c) { list.push(cmtOf(c)); });
      if (p._kind !== 'reel') { var i = X.POSTS.indexOf(p); D.querySelectorAll('[data-pcm="' + i + '"] span').forEach(function (x) { x.textContent = String(countAll(list)); }); }
    });
  }
  function countAll(l) { return l.reduce(function (a, c) { return a + 1 + (c.replies || []).length; }, 0); }
  function fill(arr, list, map) { arr.length = 0; list.forEach(function (it) { arr.push(map(it)); }); }

  /* ---------- loading ---------- */
  function loadFeed() {
    return Promise.all([api('GET', '/feed?kind=post'), api('GET', '/feed?kind=reel')]).then(function (rs) {
      if (rs[0].ok) { fill(X.POSTS, rs[0].j.items || [], toPost); X.renderPosts(); X.POSTS.forEach(function (p) { if (p._n) comments(p); }); }
      if (rs[1].ok) { fill(X.REELS, rs[1].j.items || [], toReel); X.renderReelGrid(); }
      decorate();
    });
  }
  function loadStories() {
    return api('GET', '/stories').then(function (r) {
      if (!r.ok) return;
      var a = r.j, keys = [];
      Object.keys(X.STORIES).forEach(function (k) { if (k.indexOf('c_') === 0) delete X.STORIES[k]; });
      (a.people || []).forEach(function (g) {
        var k = key(g.person); if (!k || k === 'me') return;
        X.STORIES[k] = g.stories.map(storyOf); st.storiesOf[k] = g.stories.map(function (s) { return s.id; });
        if (g.seen) X.SEEN.add(k);
        keys.push(k); if (PP.ORDER.indexOf(k) < 0) PP.ORDER.push(k);
      });
      X.MY.length = 0;
      var mine = a.mine || [], live = mine.filter(function (s) { return s.status === 'approved'; });
      live.forEach(function (s) { X.MY.push(storyOf(s)); });
      var pending = mine.some(function (s) { return s.status === 'pending'; });
      X.meBtn.classList.toggle('pending', pending && !live.length);
      var nm = X.meBtn.querySelector('.cm-nm'); if (nm) nm.textContent = pending && !live.length ? t('inReview') : t('yourStory');
      drawStrip(keys); X.paintRings();
    });
  }
  function storyOf(s) {
    var o = { _id: s.id, ago: ago(s.created_at) };
    if (s.media && s.media.url) o.photo = s.media.url;
    else { var g = (s.style && s.style.bg) || ['#dbe9fb', '#a9c8f0']; o.bg = [g[0], g[1]]; o.ink = (s.style && s.style.ink) || '#214269'; o.text = s.text; }
    if (s.style && s.style.sticker) o.sticker = s.style.sticker;
    return o;
  }
  function drawStrip(keys) {                                   // the design's strip (M:010:63), its own cards, people with a story
    if (!X.spot) return;
    var drift = keys.length >= 6;                              // a few people stand still, clear of the strip's faded edges (the design's copies would show one person twice)
    X.spot.innerHTML = '<div class="cm-track" id="cm-track"' + (drift ? '' : ' style="animation:none;padding:0 9%"') + '>' + keys.map(function (k) { return X.card(k, false); }).join('') + (drift ? keys.map(function (k) { return X.card(k, true); }).join('') : '') + '</div>';
    X.spot.style.setProperty('--drift', (keys.length * 3.4) + 's');
  }
  function loadNotes() {
    return api('GET', '/notifications').then(function (r) {
      if (!r.ok || !W.JIA_notify) return;
      (r.j.items || []).slice().reverse().forEach(function (n) {
        if (st.notes[n.id] || n.read) return; st.notes[n.id] = 1;
        var who = n.actor ? key(n.actor) : null, nm = n.actor ? esc(n.actor.name) : '', k = n.target ? t(n.target.kind === 'reel' ? 'reel' : n.target.kind === 'story' ? 'story' : n.target.kind === 'comment' ? 'comment' : 'post') : t('post');
        var cap = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };
        var text = { like: t('liked', { n: nm, k: k }), comment: t('commented', { n: nm, t: esc(n.text || '') }), reply: t('replied', { n: nm, t: esc(n.text || '') }), follow: t('followed', { n: nm }),
          follow_request: t('requested', { n: nm }), follow_accepted: t('accepted', { n: nm }), approved: t('approved', { k: LANG === 'en' ? k : cap(k) }), rejected: t('rejected', { k: LANG === 'en' ? k : cap(k), t: esc(n.text || t('noWhy')) }) }[n.kind];
        if (!text) return;
        var go = who && who !== 'me' ? function () { X.openProfile(who); } : function () { X.goCommunity(function () { X.select(n.target && n.target.kind === 'reel' ? 'rl' : 'po'); }); };
        W.JIA_notify(who && who !== 'me' ? { who: who, text: text, time: ago(n.created_at), go: go } : { icon: (W.JIA_IMG || {}).books, text: text, time: ago(n.created_at), go: go });
      });
    });
  }
  function online() {
    if (W.JG_CHAT && W.JG_CHAT.on) return Promise.resolve();
    return api('GET', '/online').then(function (r) { var el = D.getElementById('cm-online'); if (r.ok && el && typeof r.j.online === 'number') el.textContent = r.j.online + ' online'; });
  }
  function load() { return Promise.all([loadFeed(), loadStories(), loadNotes(), online()]).then(openShared); }
  function openShared() {                                       // /c/p/<id> and /c/u/<handle> signed in: /app?c=p:<id> | u:<handle>
    var c = new URLSearchParams(location.search).get('c'); if (!c) return;
    var m = /^(p|u):(.+)$/.exec(c); if (!m) return;
    if (m[1] === 'u') { profileOf('c_' + m[2]).then(function () { X.openProfile(st.people['c_' + m[2]] ? 'c_' + m[2] : null); }); return; }
    var p = X.POSTS.filter(function (x) { return x._id === m[2]; })[0], r = X.REELS.filter(function (x) { return x._id === m[2]; })[0];
    if (r) X.openReels(X.REELS.indexOf(r)); else X.goCommunity(function () { X.select('po'); });
  }

  /* ---------- a profile when it opens: the server's numbers, bio and items ---------- */
  function profileOf(k) {
    var h = handleOf(k); if (!h) return Promise.resolve();
    return api('GET', '/u/' + encodeURIComponent(h) + '?kind=post').then(function (r) {
      if (!r.ok) return;
      var p = r.j.profile; key(p);
      X.FOLLOWERS[k] = p.counts.followers - (p.following === 'following' ? 1 : 0);   // the design adds one while she follows
      X.BIO[k] = p.bio || '';
      st.loadedProfile[k] = p;
      (r.j.items || []).forEach(function (it) { if (!X.POSTS.some(function (x) { return x._id === it.id; })) X.POSTS.push(toPost(it)); });
      return api('GET', '/u/' + encodeURIComponent(h) + '?kind=reel').then(function (r2) {
        if (r2.ok) (r2.j.items || []).forEach(function (it) { if (!X.REELS.some(function (x) { return x._id === it.id; })) X.REELS.push(toReel(it)); });
        if (X.pf() === k) { X.paintProfile(); decorate(); }
      });
    });
  }
  function myProfile() {
    var p = st.me && st.me.profile; if (!p) return Promise.resolve();
    X.FOLLOWERS.me = p.followers;
    return api('GET', '/u/' + encodeURIComponent(p.handle) + '/following').then(function (r) {
      if (!r.ok) return;
      (r.j.items || []).forEach(function (q) { key(q); });
      if (X.pf() === 'me') { X.paintProfile(); decorate(); }
    });
  }

  /* ---------- what the design cannot draw: the review states, real "following", the true view counts ---------- */
  function decorate() {
    if (!X) return;
    D.querySelectorAll('#po-feed article.po[data-i], #pf-body article.po[data-i]').forEach(function (a) {
      var p = X.POSTS[+a.dataset.i]; if (!p || p.who !== 'me' || !p._st || p._st === 'approved') return;
      var tag = a.querySelector('.po-st'), note = a.querySelector('.po-note');
      if (tag) { tag.textContent = p._st === 'rejected' ? t('no') : t('wait'); tag.classList.toggle('jgc-no', p._st === 'rejected'); tag.classList.remove('gone'); tag.setAttribute('data-no-i18n', ''); }
      if (note && p._st === 'rejected') { note.textContent = t('noNote', { r: p._why || t('noWhy') }); note.classList.add('jgc-no'); note.setAttribute('data-no-i18n', ''); }
    });
    D.querySelectorAll('#cm-rl-grid .rg[data-i], #pf-body .pf-reel[data-reel]').forEach(function (b) {
      var r = X.REELS[+(b.dataset.i != null ? b.dataset.i : b.dataset.reel)]; if (!r) return;
      var vid = b.querySelector('video'); if (vid && r.poster && !vid.getAttribute('poster')) vid.setAttribute('poster', r.poster);   // the server's first frame
      if (r.who !== 'me' || !r._st || r._st === 'approved') return;
      var v = b.querySelector('.rg-v, .pf-views'); if (v) { v.textContent = r._st === 'rejected' ? t('no') : t('wait'); v.setAttribute('data-no-i18n', ''); }
    });
    var k = X.pf();
    if (k && k !== 'me' && st.people[k] && st.loadedProfile[k]) {           // the design's "120 + followers % 90" following is invented
      var b = D.querySelectorAll('#pf-stats span b'); if (b[3]) b[3].textContent = String(st.loadedProfile[k].counts.following);
    }
    if (k && k !== 'me' && st.following[k] === 'requested') { var f = D.querySelector('#pf-actions [data-pf="follow"]'); if (f) { f.textContent = t('requestedBtn'); f.setAttribute('data-no-i18n', ''); } }
  }

  /* ---------- out: the sync pass ---------- */
  var syncT = 0;
  function soon() { clearTimeout(syncT); syncT = setTimeout(sync, 60); }
  function sync() {
    if (!X || !st.ready) return;
    var seen = {};
    X.POSTS.concat(X.REELS).forEach(function (p) {
      if (!p._id) return; seen[p._id] = 1;
      var sv = st.sv[p._id]; if (!sv) return;
      var id = encodeURIComponent(p._id);
      if (!!p.liked !== !!sv.liked) { sv.liked = !!p.liked; api(p.liked ? 'POST' : 'DELETE', '/posts/' + id + '/like'); }
      if (p._kind === 'reel' && !!p.saved !== !!sv.saved) { sv.saved = !!p.saved; api(p.saved ? 'POST' : 'DELETE', '/posts/' + id + '/save'); }
      if (p.poll && p.poll.mine != null && sv.vote == null) {
        sv.vote = p.poll.mine;
        api('POST', '/posts/' + id + '/vote', { option: p.poll.mine }).then(function (r) { if (r.ok && r.j.poll && r.j.poll.counts) { var q = pollOf(r.j.poll); p.poll.opts = q.opts; p.poll.mine = q.mine; X.renderPosts(); if (X.pf()) X.paintProfile(); decorate(); } });
      }
      var list = p._kind === 'reel' ? p.comments : p.cmts;
      (list || []).forEach(function (c) {
        if (!c._id && c.who === 'me' && !c._out) sendCmt(p, c, null);
        (c.replies || []).forEach(function (r) { if (!r._id && r.who === 'me' && !r._out && c._id) sendCmt(p, r, c._id); });
      });
    });
    Object.keys(st.mine || {}).forEach(function (id) { if (!seen[id]) { delete st.mine[id]; api('DELETE', '/posts/' + encodeURIComponent(id)); } });
    X.REELS.forEach(function (r) { if (r.who in st.following && !!r.follow !== X.FOLLOWING.has(r.who)) { if (r.follow) X.FOLLOWING.add(r.who); else X.FOLLOWING.delete(r.who); } });   // a reel's Follow
    Object.keys(st.following).forEach(function (k) {
      var on = X.FOLLOWING.has(k), was = st.following[k] === 'following' || st.following[k] === 'requested';
      if (on !== was) {
        st.following[k] = on ? 'requested' : 'none';
        api(on ? 'POST' : 'DELETE', '/u/' + encodeURIComponent(handleOf(k)) + '/follow').then(function (r) {
          if (!r.ok) return; st.following[k] = r.j.state; if (r.j.state === 'requested') decorate();
          X.REELS.forEach(function (x) { if (x.who === k) x.follow = r.j.state === 'following'; });
        });
      }
    });
    X.SEEN.forEach(function (k) { (st.storiesOf[k] || []).forEach(function (sid) { if (!st.seenSent[sid]) { st.seenSent[sid] = 1; api('POST', '/stories/' + encodeURIComponent(sid) + '/view'); } }); });
    X.BLOCKED.forEach(function (k) { var h = handleOf(k); if (h && !st.blocked[k]) { st.blocked[k] = 1; api('POST', '/u/' + encodeURIComponent(h) + '/block'); } });
    Object.keys(st.blocked).forEach(function (k) { if (!X.BLOCKED.has(k)) { delete st.blocked[k]; api('DELETE', '/u/' + encodeURIComponent(handleOf(k)) + '/block'); } });
  }
  function sendCmt(p, c, parent) {
    c._out = 1; c.ago = t('checking');
    api('POST', '/posts/' + encodeURIComponent(p._id) + '/comments', parent ? { text: c.text, parent_id: parent } : { text: c.text }).then(function (r) {
      if (r.ok && r.j.comment) { c._id = r.j.comment.id; return; }
      var list = p._kind === 'reel' ? p.comments : p.cmts;             // refused: it is not kept
      var drop = function (arr) { var i = arr.indexOf(c); if (i >= 0) arr.splice(i, 1); };
      drop(list); list.forEach(function (x) { drop(x.replies || []); });
      refused(r);
    });
  }

  /* ---------- the composers (the design lines hand over here) ---------- */
  function blobOf(url) { return fetch(url).then(function (r) { return r.blob(); }); }
  function upload(url) {
    return blobOf(url).then(function (b) { return api('POST', '/media', b, b.type || 'application/octet-stream'); });
  }
  function ready(id, n) {                                      // a video is 'processing' until ffmpeg is done
    return api('GET', '/media/' + encodeURIComponent(id)).then(function (r) {
      if (!r.ok) return r;
      if (r.j.media.status === 'processing' && n < 60) return new Promise(function (ok) { setTimeout(ok, 2000); }).then(function () { return ready(id, n + 1); });
      return r;
    });
  }
  var busy = false;
  function guard(what) { if (busy || !st.ready) { say(t('moment')); return false; } if (!st.me.profile) { askHandle(what); return false; } if (st.me.suspended) { say(t('suspended')); return false; } return true; }
  function create(body, after) {
    return api('POST', '/posts', body).then(function (r) {
      busy = false;
      if (!r.ok) return refused(r);
      after(r.j.item);
    });
  }
  var JG_CM = {
    open: function (what) {
      if (!st.ready) { say(t('moment')); return false; }
      if (!st.me.profile) { askHandle(what); return false; }
      if (st.me.suspended) { say(t('suspended')); return false; }
      return true;
    },
    post: function (o) {
      if (!guard('post')) return; busy = true;
      var text = o.text, poll = null;
      if (o.poll) { poll = o.poll.opts.map(function (x) { return x.t; }); if (o.poll.q && text.indexOf(o.poll.q) < 0) text = text + '\n' + o.poll.q; }
      var go = function (mediaId) {
        create({ kind: 'post', text: text, media_id: mediaId || null, poll: poll }, function (it) {
          var p = toPost(it); (st.mine = st.mine || {})[it.id] = 1;
          X.POSTS.unshift(p); X.renderPosts(0); o.done(); say(t('sent')); decorate();
        });
      };
      if (o.photo) {
        if (!st.me.media_allowed) { busy = false; return say(t('consent')); }
        upload(o.photo).then(function (r) { if (!r.ok) { busy = false; return refused(r); } go(r.j.media.id); });
      } else go(null);
    },
    reel: function (o) {
      if (!guard('reel')) return;
      if (!st.me.media_allowed) return say(t('consent'));
      busy = true; say(t('processing'));
      upload(o.video).then(function (r) {
        if (!r.ok) { busy = false; return refused(r); }
        return ready(r.j.media.id, 0).then(function (m) {
          if (!m.ok || m.j.media.status !== 'ready') { busy = false; return say(t('videoFail')); }
          create({ kind: 'reel', text: o.cap, media_id: m.j.media.id }, function (it) {
            var rr = toReel(it); (st.mine = st.mine || {})[it.id] = 1;
            X.REELS.unshift(rr); X.renderReelGrid(); o.done(); say(t('sent')); decorate();
          });
        });
      });
    },
    story: function (o) {
      if (!guard('story')) return;
      if (o.photo && !st.me.media_allowed) return say(t('consent'));
      busy = true;
      var go = function (mediaId) {
        api('POST', '/stories', { text: mediaId ? '' : o.text, media_id: mediaId || null, style: mediaId ? null : { bg: [o.bg[0], o.bg[1]], ink: o.bg[2] } }).then(function (r) {
          busy = false;
          if (!r.ok) return refused(r);
          o.done(); X.meBtn.classList.add('pending'); var nm = X.meBtn.querySelector('.cm-nm'); if (nm) nm.textContent = t('inReview');
          X.toast(t('storySent'));
        });
      };
      if (o.photo) upload(o.photo).then(function (r) { if (!r.ok) { busy = false; return refused(r); } go(r.j.media.id); }); else go(null);
    },
    share: function (what, x) {
      var h = st.me && st.me.profile && st.me.profile.handle;
      if (what === 'profile') {
        if (x === 'me') return h ? { what: 'profile', title: t('profT', { h: h }), url: st.me.profile.share_url } : { what: 'profile', title: 'JIA', url: 'https://app.jamals.uz' };
        var p = st.people[x];
        return p ? { what: 'profile', title: t('profT', { h: p.handle }), url: (st.loadedProfile[x] && st.loadedProfile[x].share_url) || ('https://app.jamals.uz/c/u/' + encodeURIComponent(p.handle)) } : { what: 'profile', title: 'JIA', url: 'https://app.jamals.uz' };
      }
      return { what: what, title: t(what === 'reel' ? 'reelT' : 'postT'), url: (x && x.share) || 'https://app.jamals.uz' };
    },
  };
  W.JG_CM = JG_CM;

  /* ---------- the username sheet (a screen the design does not draw: its own sheet, note, field and button) ---------- */
  var hSheet = null, hThen = null;
  function askHandle(then) {
    hThen = then;
    if (!hSheet) {
      var ref = D.getElementById('po-sheet');
      hSheet = D.createElement('div'); hSheet.className = 'cm-sheet'; hSheet.id = 'jgc-handle'; hSheet.hidden = true;
      hSheet.setAttribute('role', 'dialog'); hSheet.setAttribute('aria-modal', 'true'); hSheet.setAttribute('aria-labelledby', 'jgc-handle-t'); hSheet.setAttribute('data-no-i18n', '');
      hSheet.innerHTML = '<div class="cm-sheet-bg" data-jgc-close></div><div class="cm-sheet-card po-compose"><h3 id="jgc-handle-t">' + esc(t('handleT')) + '</h3><p class="cm-note">' + esc(t('handleN')) +
        '</p><div class="jgc-at"><span aria-hidden="true">@</span><input id="jgc-handle-in" type="text" maxlength="20" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="' + esc(t('handleP')) + '" aria-label="' + esc(t('handleP')) +
        '"></div><p class="jgc-err" id="jgc-handle-err" role="status"></p><button class="cm-primary" id="jgc-handle-go" type="button" disabled>' + esc(t('handleGo')) + '</button></div>';
      (ref && ref.parentNode ? ref.parentNode : D.body).insertBefore(hSheet, ref ? ref.nextSibling : null);
      var inp = hSheet.querySelector('#jgc-handle-in'), go = hSheet.querySelector('#jgc-handle-go'), err = hSheet.querySelector('#jgc-handle-err');
      inp.addEventListener('input', function () { inp.value = inp.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''); go.disabled = inp.value.length < 3; err.textContent = ''; });
      hSheet.addEventListener('click', function (e) { if (e.target.closest('[data-jgc-close]')) closeHandle(); });
      hSheet.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeHandle(); if (e.key === 'Enter' && !go.disabled) go.click(); });
      go.addEventListener('click', function () {
        go.disabled = true;
        api('PUT', '/me', { handle: inp.value }).then(function (r) {
          go.disabled = false;
          if (!r.ok) { err.textContent = r.j.error === 'handle_taken' ? t('taken') : r.j.error === 'handle' ? t('badHandle') : r.j.error === 'unsafe' ? t('unsafe') : t('later'); return; }
          st.me = r.j; closeHandle();
          var b = D.getElementById(hThen === 'reel' ? 'rl-new' : hThen === 'story' ? 'cm-me' : 'po-new'); if (b) b.click();
        });
      });
    }
    var first = ((W.JG_ME && W.JG_ME.firstName) || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    var input = hSheet.querySelector('#jgc-handle-in'); input.value = first.length >= 3 ? first + '_' + String(Math.floor(10 + Math.random() * 90)) : '';
    hSheet.querySelector('#jgc-handle-go').disabled = input.value.length < 3; hSheet.querySelector('#jgc-handle-err').textContent = '';
    hSheet.hidden = false; setTimeout(function () { input.focus({ preventScroll: true }); }, 350);
  }
  function closeHandle() { if (hSheet) hSheet.hidden = true; }

  /* ---------- wiring, once the design has run ---------- */
  var CSS = '.po-st.jgc-no{background:#fde8e4;color:var(--danger,#b0402f)}.po-note.jgc-no{color:var(--danger,#b0402f)}.po .poll-q:empty{display:none}' +
    '.jgc-at{display:flex;align-items:center;gap:6px;margin-top:12px;padding:0 14px;height:48px;border:1px solid #e4ebe6;border-radius:16px;background:#f8fbf9}' +
    '.jgc-at:focus-within{border-color:#9fdcbd;background:#fff}.jgc-at span{font:700 15px var(--font);color:var(--muted)}' +
    '.jgc-at input{flex:1;min-width:0;height:100%;border:0;outline:0;background:transparent;font:600 15px var(--font);color:var(--ink)}' +
    '.jgc-err{min-height:18px;margin-top:6px;font-size:12.5px;color:var(--danger,#b0402f)}' +
    'html.dark .jgc-at{background:#141c18;border-color:#26332c}html.dark .jgc-at input{color:#e8f1ec}';
  function wire() {
    X = W.JIA_cm; PP = W.JIA_people;
    if (!X || !PP) { delete W.JG_CM; return; }
    D.documentElement.classList.remove('cut-cmStories');          // R13's cut lifted: real people's stories exist now
    if (W.JG_CUTS) W.JG_CUTS.cmStories = false;
    var s = D.createElement('style'); s.id = 'jgc-css'; s.textContent = CSS; D.head.appendChild(s);
    api('GET', '/me').then(function (r) {
      if (!r.ok) { st.off = true; delete W.JG_CM; D.documentElement.classList.add('cut-cmStories'); return; }   // 404 off, 403 demo: the design's own behaviour
      st.me = r.j; st.ready = true;
      load().then(myProfile);
    });
    D.addEventListener('click', soon); D.addEventListener('keydown', soon);
    D.addEventListener('click', function (e) {                  // before the design opens comments: the item's comments from the server
      var b = e.target.closest('[data-pcm], .rl-act.cmt'); if (!b || b._jgcGo) return;
      var item = b.closest('.rl-item'), p = item ? X.REELS[+item.dataset.i] : X.POSTS[+b.getAttribute('data-pcm')];
      if (!p || !p._id || st.cmLoaded[p._id]) return;
      e.stopImmediatePropagation(); e.preventDefault();
      comments(p).then(function () { b._jgcGo = true; b.click(); b._jgcGo = false; });
    }, true);
    D.addEventListener('click', function (e) {                  // a person's profile: the server's numbers and items
      var w = e.target.closest('[data-who^="c_"]'); if (w) profileOf(w.getAttribute('data-who'));
      if (e.target.closest('#bell-btn')) api('POST', '/notifications/read', {});
    }, true);
    var mo = new MutationObserver(function () { decorate(); });
    ['po-feed', 'pf-body', 'cm-rl-grid', 'pf-stats', 'pf-actions'].forEach(function (id) { var el = D.getElementById(id); if (el) mo.observe(el, { childList: true }); });
    if (X.rlFeed) new MutationObserver(function (ms) {           // a reel played: one view per student
      ms.forEach(function (m) { var el = m.target; if (el.classList && el.classList.contains('rl-item') && el.classList.contains('playing')) { var r = X.REELS[+el.dataset.i]; if (r && r._id && !r._viewed) { r._viewed = 1; api('POST', '/posts/' + encodeURIComponent(r._id) + '/view'); } } });
    }).observe(X.rlFeed, { attributes: true, attributeFilter: ['class'], subtree: true });
    var sr = D.getElementById('sr-in'), srT = 0, srQ = '';
    if (sr) sr.addEventListener('input', function () {           // search: people from the server, then the design's own search over them
      var q = sr.value.trim(); clearTimeout(srT); if (q.length < 2 || q === srQ || !st.ready) return;
      srT = setTimeout(function () {
        srQ = q;
        api('GET', '/search?type=people&q=' + encodeURIComponent(q)).then(function (r) {
          if (!r.ok) return; var n = 0;
          (r.j.items || []).forEach(function (p) { var k = key(p); if (k && k !== 'me' && PP.ORDER.indexOf(k) < 0) { PP.ORDER.push(k); n++; } });
          if (n && sr.value.trim() === q) sr.dispatchEvent(new Event('input'));
        });
      }, 250);
    });
    setInterval(function () { if (st.ready && !D.hidden) { loadNotes(); loadStories(); online(); } }, 60000);
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', wire); else wire();
})();
