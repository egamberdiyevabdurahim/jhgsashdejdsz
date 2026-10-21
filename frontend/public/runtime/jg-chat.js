/*
 * jg-chat.js: the Telegram-like messenger made real (M1 lane chatcli; the owner's 19-20 Oct 2026 "Telegram features ... what we differ is
 * another world"; contract "chat", .superpowers/m1/contracts/chat.md, src/server/chat/types.ts). Loaded by src/server/chat/page.ts for a
 * live, non-demo student only while MESSENGER is on (or COMMUNITY, for the privacy rows alone); off, the page names no such file and the
 * design keeps its own (R13-hidden) behaviour.
 *
 * HOW: the design's messenger (public/d/student-mobile/js/010.js, student-desktop/js/014.js) keeps drawing every screen exactly as drawn: its CHATS, its message
 * objects, its composer, menu, sheets and rerender. This file only changes where the data comes from and where it goes:
 *  - in: GET /api/v1/chats (404 = the switch is off: nothing here runs), each chat's messages, the people in them (registered in the
 *    design's PEOPLE and AV as "u_<id>", kind "peer" = "Student"), and the Server-Sent Events stream (new, edited, deleted messages,
 *    reactions, votes, pins, reads, presence), reconnecting by itself;
 *  - out: whatever the student did through the design's own controls, read back from the design's objects. A server chat's msgs array
 *    gets an own push (a message she sends goes at once, and the design's client-side @Jamol and coach never run on it); after every tap
 *    and key a sync pass compares each chat with what the server last said (text, deleted, her reaction, her vote, the pin, unread, admins,
 *    members, the chats she left, her blocks) and sends the difference. A message waiting shows "…", one that failed "Not sent · tap to
 *    retry", one the screen held "Waiting for a check".
 * Never sent: voice notes (C-21: none, by the contract) and photos (text only for now): both say "coming soon" instead of sending nothing.
 */
(function () {
  'use strict';
  var W = window, D = document, B = W.JG_BOOT || {};
  if (W.JG_CHAT || !B.uid) return;
  var X = W.JIA_chat, PP = W.JIA_people;
  var ME = B.uid, API = '/api/v1/chats';
  var LANG = (W.JG_I18N && W.JG_I18N.lang && W.JG_I18N.lang()) || (D.documentElement.lang || 'en').slice(0, 2);
  var S = {
    en: { student: 'Student', sending: '…', failed: 'Not sent · tap to retry', refused: 'Not sent', held: 'Waiting for a check', connecting: 'Connecting…', offline: 'Waiting for network…',
      online: '{n} online', yesterday: 'Yesterday', today: 'Today', voice: 'Voice messages are coming soon', photo: 'Photos in chats are coming soon', together: 'Study together in chats is coming soon. Your Study Room is on Today.',
      request: 'Sent as a message request. They see it when they accept.', league: 'Your league chat opens when your league starts.', club: 'This club opens on the server soon.',
      contact: 'For your safety, phone numbers, usernames and outside links can\'t be shared. Keep it on JIA.', link: 'For your safety, outside links can\'t be shared. Keep it on JIA.',
      abuse: 'Please keep it kind. That message wasn\'t sent.', blocked: 'You can\'t message this person.', not_member: 'You\'re not in this chat any more.', read_only: 'Only admins post here.',
      request_limit: 'Wait until they accept your request.', declined: 'You can\'t message this person.', too_long: 'That message is too long.', empty: 'Write something first.',
      slow: 'Too fast. Wait a moment and try again.', later: 'Couldn\'t do that. Try again in a moment.', chats: 'Chats', none: 'No message requests.', accept: 'Accept', del: 'Delete',
      blockrep: 'Block and report', wants: 'wants to message you', jamolOff: 'Jamol can\'t answer in chats right now.', reported: 'Thanks for telling us. A JIA moderator will look at it.' },
    uz: { student: 'Oʻquvchi', sending: '…', failed: 'Yuborilmadi · qayta urinish uchun bosing', refused: 'Yuborilmadi', held: 'Tekshiruvni kutmoqda', connecting: 'Ulanmoqda…', offline: 'Internet kutilmoqda…',
      online: '{n} onlayn', yesterday: 'Kecha', today: 'Bugun', voice: 'Ovozli xabarlar tez orada', photo: 'Chatlarda rasmlar tez orada', together: 'Chatda birga oʻqish tez orada. Oʻqish xonangiz Bugun boʻlimida.',
      request: 'Xabar soʻrovi sifatida yuborildi. U qabul qilganda koʻradi.', league: 'Ligangiz chati ligangiz boshlanganda ochiladi.', club: 'Bu klub serverda tez orada ochiladi.',
      contact: 'Xavfsizligingiz uchun telefon raqamlari, foydalanuvchi nomlari va tashqi havolalarni yuborib boʻlmaydi. JIA ichida qoling.', link: 'Xavfsizligingiz uchun tashqi havolalarni yuborib boʻlmaydi. JIA ichida qoling.',
      abuse: 'Iltimos, odobli boʻling. Bu xabar yuborilmadi.', blocked: 'Bu odamga yozib boʻlmaydi.', not_member: 'Siz endi bu chatda emassiz.', read_only: 'Bu yerda faqat adminlar yozadi.',
      request_limit: 'U soʻrovingizni qabul qilguncha kuting.', declined: 'Bu odamga yozib boʻlmaydi.', too_long: 'Xabar juda uzun.', empty: 'Avval biror narsa yozing.',
      slow: 'Juda tez. Biroz kutib, qayta urining.', later: 'Bajarib boʻlmadi. Birozdan keyin qayta urining.', chats: 'Chatlar', none: 'Xabar soʻrovlari yoʻq.', accept: 'Qabul qilish', del: 'Oʻchirish',
      blockrep: 'Bloklash va shikoyat qilish', wants: 'sizga yozmoqchi', jamolOff: 'Jamol hozir chatlarda javob bera olmaydi.', reported: 'Xabar berganingiz uchun rahmat. JIA moderatori koʻrib chiqadi.' },
    ru: { student: 'Ученик', sending: '…', failed: 'Не отправлено · нажмите, чтобы повторить', refused: 'Не отправлено', held: 'Ждёт проверки', connecting: 'Подключение…', offline: 'Ожидание сети…',
      online: '{n} онлайн', yesterday: 'Вчера', today: 'Сегодня', voice: 'Голосовые сообщения скоро появятся', photo: 'Фото в чатах скоро появятся', together: 'Учиться вместе в чатах можно будет скоро. Ваша учебная комната — в разделе «Сегодня».',
      request: 'Отправлено как запрос на переписку. Сообщение увидят, когда примут запрос.', league: 'Чат лиги откроется, когда начнётся ваша лига.', club: 'Этот клуб скоро откроется на сервере.',
      contact: 'Ради вашей безопасности номера телефонов, имена пользователей и внешние ссылки отправлять нельзя. Оставайтесь в JIA.', link: 'Ради вашей безопасности внешние ссылки отправлять нельзя. Оставайтесь в JIA.',
      abuse: 'Пожалуйста, будьте вежливы. Это сообщение не отправлено.', blocked: 'Этому человеку нельзя написать.', not_member: 'Вы больше не в этом чате.', read_only: 'Здесь пишут только админы.',
      request_limit: 'Подождите, пока примут ваш запрос.', declined: 'Этому человеку нельзя написать.', too_long: 'Сообщение слишком длинное.', empty: 'Сначала напишите что-нибудь.',
      slow: 'Слишком быстро. Подождите немного и попробуйте снова.', later: 'Не получилось. Попробуйте чуть позже.', chats: 'Чаты', none: 'Запросов на переписку нет.', accept: 'Принять', del: 'Удалить',
      blockrep: 'Заблокировать и пожаловаться', wants: 'хочет написать вам', jamolOff: 'Джамол сейчас не может отвечать в чатах.', reported: 'Спасибо, что сообщили. Модератор JIA посмотрит.' },
  };
  var T = S[LANG] || S.en;
  var t = function (k, n) { return String(T[k] != null ? T[k] : S.en[k]).replace('{n}', n); };
  var $ = function (id) { return D.getElementById(id); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  /* ---------- the server ---------- */
  function api(method, path, body) {
    var o = { method: method, credentials: 'same-origin', headers: { 'x-jg-uid': ME } };
    if (body !== undefined) { o.headers['content-type'] = 'application/json'; o.body = JSON.stringify(body); }
    return fetch(path, o).then(function (r) {
      return r.text().then(function (txt) { var j = null; try { j = txt ? JSON.parse(txt) : null; } catch (e) { j = null; } return { status: r.status, ok: r.ok, body: j || {} }; });
    });
  }
  var cid = function (sid) { return API + '/' + encodeURIComponent(sid); };

  /* ---------- the student's privacy rows (Settings), on the server when MESSENGER or COMMUNITY is on ----------
     Contract "moderation": privacyOf(u) reads the design's own Settings blob (jia.settings, M:011:13), which jg-runtime.js already
     mirrors to the account (user_state); canMessage and canSeeProfile enforce it. So a tap on one of the three rows is sent at once
     (JG_RUNTIME.flush, not after the mirror's usual pause), and GET /api/v1/privacy (on with MODERATION) shows the server's view of them. */
  var PRIV = { privateProfile: 1, dmFrom: 1, hideScores: 1 };
  function privacy() {
    var set = W.JIA_SETTINGS, box = $('set-scroll'); if (!set || !box) return;
    box.addEventListener('click', function (e) {
      var b = e.target.closest('.set-sw[data-k], .set-seg button[data-k]'); if (!b || !PRIV[b.dataset.k]) return;
      setTimeout(function () { var R = W.JG_RUNTIME; if (R && R.flush) R.flush(); }, 0);   // after the design saved it (M:011:69, :73)
    });
    api('GET', '/api/v1/privacy').then(function (r) {
      if (!r.ok) return;                                                    // MODERATION off: the rows are the account's own blob, as above
      var p = r.body, diff = false;
      Object.keys(PRIV).forEach(function (k) { if (p[k] !== undefined && p[k] !== null && String(set[k]) !== String(p[k])) { set[k] = p[k]; diff = true; } });
      if (diff) { try { localStorage.setItem('jia.settings', JSON.stringify(set)); } catch (e) { /* the page's own copy is enough */ } paintPriv(); }
    }, function () { /* offline: the rows stay as they are */ });
  }
  function paintPriv() {
    var set = W.JIA_SETTINGS;
    D.querySelectorAll('#set-scroll .set-sw[data-k]').forEach(function (b) { if (PRIV[b.dataset.k]) b.setAttribute('aria-checked', String(!!set[b.dataset.k])); });
    D.querySelectorAll('#set-scroll .set-seg button[data-k]').forEach(function (b) { if (PRIV[b.dataset.k]) b.setAttribute('aria-pressed', String(String(set[b.dataset.k]) === String(b.dataset.v))); });
  }

  /* ---------- a note at the top of Community (the design's own toast) ---------- */
  var sayT = 0;
  function say(msg) {
    var el = $('cm-toast') || $('toast'); if (!el) return;
    el.textContent = msg; el.classList.add('on'); clearTimeout(sayT); sayT = setTimeout(function () { el.classList.remove('on'); }, 2800);
  }

  W.JG_CHAT = { on: false };
  privacy();
  if (!X || !PP) return;
  var CHATS = X.CHATS, PEOPLE = PP.PEOPLE, AV = PP.AV, ORDER = PP.ORDER, KIND = PP.KIND, BLOCKED = W.JIA_BLOCKED || new Set();

  /* ---------- people ---------- */
  if (KIND) KIND.peer = t('student');
  var st = D.createElement('style'); st.textContent = '.k-peer{--r1:#9cc2f5;--r2:#4f7fcf;--r3:#3a64ad}'; D.head.appendChild(st);   // the design's own student tokens (.k-student)
  var COLORS = ['#6fb0a5', '#9c90cc', '#d59199', '#7b9fcf', '#d8a261', '#78b692', '#8a9a92'];
  function initialsAV(name, id) {
    var bg = COLORS[(String(id).split('').reduce(function (a, c) { return a + c.charCodeAt(0); }, 0)) % COLORS.length];
    var ini = String(name || '?').split(/\s+/).map(function (w) { return w[0] || ''; }).join('').slice(0, 2).toUpperCase();
    return 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="32" fill="' + bg + '"/><text x="32" y="40" text-anchor="middle" font-family="Arial" font-size="24" font-weight="700" fill="#fff">' + esc(ini) + '</text></svg>');
  }
  var keyOf = function (uid) { return uid === ME ? 'me' : 'u_' + String(uid).replace(/[^A-Za-z0-9_-]/g, ''); };
  var UID = {};                                                             // person key -> user id
  function person(p) {
    if (!p || p.id == null) return null;
    if (p.id === ME) return 'me';
    if (p.id === 'jamol' || p.role === 'jamol') return 'jamol';
    var k = keyOf(p.id), staff = p.role === 'staff', old = PEOPLE[k] || {}, ini = !AV[k] || !!old.ini;
    PEOPLE[k] = { name: p.name || old.name || '…', kind: staff ? 'teacher' : 'peer', tag: staff ? (W.JG_I18N ? W.JG_I18N.text('Teacher') : 'Teacher') : t('student'), uid: p.id, ini: !p.photo && ini };
    if (p.photo) AV[k] = p.photo; else if (ini) AV[k] = initialsAV(PEOPLE[k].name, p.id);   // initials follow the name once it is known (a reaction names only an id)
    UID[k] = p.id;
    return k;
  }
  var who = function (id, name) { return id == null ? null : id === ME ? 'me' : id === 'jamol' ? 'jamol' : (PEOPLE[keyOf(id)] && UID[keyOf(id)] ? keyOf(id) : person({ id: id, name: name, photo: null, role: 'student' })); };
  function contact(k) { if (k && k !== 'me' && k !== 'jamol' && UID[k] && ORDER.indexOf(k) < 0) ORDER.push(k); }   // the people she chats with: search's People

  /* ---------- time ---------- */
  var hhmm = function (iso) { var d = new Date(iso); return isNaN(d) ? '' : d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); };
  var ymd = function (d) { return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
  function dayWord(iso) {
    var d = new Date(iso), n = new Date(), y = new Date(); y.setDate(n.getDate() - 1);
    if (ymd(d) === ymd(n)) return t('today');
    if (ymd(d) === ymd(y)) return t('yesterday');
    try { return d.toLocaleDateString(LANG === 'uz' ? 'uz-Latn' : LANG, { day: 'numeric', month: 'long' }); } catch (e) { return d.toDateString(); }
  }
  function listTime(iso) {
    var d = new Date(iso), n = new Date(); if (isNaN(d)) return '';
    if (ymd(d) === ymd(n)) return hhmm(iso);
    var days = Math.round((n - d) / 864e5);
    if (days <= 1) return t('yesterday');
    try { return days < 7 ? d.toLocaleDateString(LANG === 'uz' ? 'uz-Latn' : LANG, { weekday: 'short' }) : d.toLocaleDateString(LANG === 'uz' ? 'uz-Latn' : LANG, { day: 'numeric', month: 'short' }); } catch (e) { return hhmm(iso); }
  }

  /* ---------- messages: the server's shape to the design's ---------- */
  var STK = /^\[sticker:((?:jm|jl|3d):[a-z0-9_]+)\]$/;
  var rxOf = function (rx) { var o = {}; Object.keys(rx || {}).forEach(function (e) { var w = (rx[e] || []).map(function (u) { return who(u); }).filter(Boolean); if (w.length) o[e] = w; }); return o; };
  var myRx = function (m) { var r = m.rx || {}, k = Object.keys(r).filter(function (e) { return (r[e] || []).indexOf('me') >= 0; }); return k[0] || null; };
  var pollOf = function (p) { return { q: p.question, anon: !!p.anonymous, opts: p.options.map(function (o) { return { t: o.text, v: o.votes }; }), mine: p.mine == null ? undefined : p.mine }; };
  function fill(m, sm, c) {
    m.sid = sm.id; m.jgAt = sm.time; m.clientId = sm.clientId || m.clientId;
    var stk = sm.kind === 'text' && STK.exec(sm.text || '');
    m.text = stk ? '' : (sm.text || ''); if (stk) m.sticker = stk[1];
    m.jgText = m.text; m.deleted = !!sm.deleted; m.jgDel = m.deleted; m.edited = !!sm.editedAt;
    m.rx = rxOf(sm.rx); m.jgRx = myRx(m);
    if (sm.poll) { m.poll = pollOf(sm.poll); m.jgVote = m.poll.mine; }
    if (sm.replyTo) m.reply = byId(c, sm.replyTo.id) || { id: -1, who: who(sm.replyTo.who, sm.replyTo.name) || 'jamol', text: sm.replyTo.text || '', deleted: !!sm.replyTo.deleted };
    m.jgSt = sm.status === 'held' ? 'held' : null;
    m.time = m.jgSt === 'held' ? t('held') : hhmm(sm.time);
    m.jxDone = true;                                                        // the design's client-side @Jamol and coach never run on a server message
    return m;
  }
  function toM(sm, c) {
    if (sm.kind === 'system' || sm.who === null && sm.kind !== 'jamol') return X.M(null, sm.text, '', { system: true, sid: sm.id, jgAt: sm.time });
    var w = sm.kind === 'jamol' ? 'jamol' : who(sm.who, sm.name);
    return fill(X.M(w, '', '', null), sm, c);
  }
  var byId = function (c, sid) { return c && c.msgs.find(function (m) { return m.sid === sid; }); };
  var push = function (c, m) { Array.prototype.push.call(c.msgs, m); };
  function dayLine(c, iso) {                                               // Telegram's day line between two days, in the design's own style
    var last = null; for (var i = c.msgs.length - 1; i >= 0; i--) { if (c.msgs[i].jgAt) { last = c.msgs[i]; break; } }
    if (!last || ymd(new Date(last.jgAt)) !== ymd(new Date(iso))) push(c, X.M(null, dayWord(iso), '', { system: true, jgDay: 1 }));
  }

  /* ---------- the design's chats, bound to the server's ---------- */
  var KEY = {};                                                             // server chat id -> the design's key
  function keyFor(s) {
    if (s.kind === 'global') return 'global';
    if (s.kind === 'dm') return s.with ? 'dm:' + person(s.with) : 'g:' + s.id;
    if (s.kind === 'league') return 'lg:' + leagueIdx();                   // the design's own key (leagueChat(ME.league) finds it)
    if (s.kind === 'club_channel') return 'g:club_' + clubKey(s.id) + '_ann';
    if (s.kind === 'club_topic') return 'g:club_' + clubKey(s.parentId) + '_' + topicKey(s.id);
    return 'g:' + s.id;
  }
  function leagueIdx() { var L = W.JIA_league && W.JIA_league.ME; if (L && L.league != null) return L.league; return W.JIA && W.JIA.league && W.JIA.league.i != null ? W.JIA.league.i : 0; }
  var clubKey = function (id) { return String(id || '').replace(/^club:/, '').split(':')[0]; };
  var topicKey = function (id) { var p = String(id || '').replace(/^club:/, '').split(':'); return p[p.length - 1]; };
  function hook(c) {
    var a = c.msgs;
    if (a.__jg) return;
    Object.defineProperty(a, 'push', { configurable: true, writable: true, value: function () {
      for (var i = 0; i < arguments.length; i++) { var m = arguments[i]; if (m && m.who === 'me' && !m.sid && !m.system) { m.jxDone = true; } }
      var n = Array.prototype.push.apply(a, arguments); soon(); return n;
    } });
    Object.defineProperty(a, '__jg', { value: true });
  }
  function bind(s) {
    var k = keyFor(s), c = CHATS[k], old = c;
    if (!c || !c.jg || c.jg.sid !== s.id) {
      if (s.kind === 'global') c = CHATS.global;
      else if (s.kind === 'dm') c = c && c.kind === 'dm' ? c : { id: k, kind: 'dm', with: k.slice(3), time: '', unread: 0, msgs: [] };
      else c = c && c.kind === 'group' ? c : { id: k, kind: 'group', name: s.name, members: [], time: '', unread: 0, msgs: [] };
      if (old && old.jg && old.jg.localOnly) { c.msgs = []; }                 // the design's local league chat gives way to the server's
      if (s.kind === 'league') { c.league = leagueIdx(); c.name = s.name || c.name; }
      if (s.kind === 'club_channel') { c.club = clubKey(s.id); c.channel = true; c.name = c.name || 'Announcements'; }
      if (s.kind === 'club_topic') { c.club = clubKey(s.parentId); c.topic = topicKey(s.id); }
      c.jg = { sid: s.id, kind: s.kind, loaded: false, q: Promise.resolve(), unread: 0, admins: [], members: [], pinned: null };
      CHATS[k] = c; KEY[s.id] = k;
    }
    if (s.kind === 'club_channel') c.adminMe = !!s.canPost;
    c.jg.status = s.status; c.jg.canPost = s.canPost; c.jg.role = s.role;
    if (s.kind !== 'global' && s.kind !== 'dm') c.name = s.kind === 'club_channel' ? c.name : s.name || c.name;
    if (s.role === 'admin' || s.role === 'owner') { c.admins = c.admins || []; if (c.admins.indexOf('me') < 0) c.admins.push('me'); }
    c.unread = s.unread || 0; c.jg.unread = c.unread;
    c.time = listTime(s.time);
    if (s.kind === 'dm' && s.with) contact(c.with);
    hook(c);
    if (s.lastMessage && !c.jg.loaded && !c.msgs.some(function (m) { return m.sid === s.lastMessage.id; })) {   // the list's last line before the chat is opened
      c.msgs.length = 0; var lm = s.lastMessage;
      push(c, toM({ id: lm.id, chatId: s.id, who: lm.who, name: lm.name, kind: lm.kind, text: lm.text, replyTo: null, time: lm.time, editedAt: null, deleted: lm.deleted, status: 'sent', rx: {}, poll: null, clientId: null }, c));
      c.jg.preview = true;
    }
    return c;
  }
  function detail(c) {                                                      // members, admins and the pin (ChatDetail)
    if (!c.jg || !c.jg.sid || c.jg.kind === 'global') return Promise.resolve();
    return api('GET', cid(c.jg.sid)).then(function (r) {
      if (!r.ok || !r.body.chat) return;
      var d = r.body.chat, keys = (d.people || []).map(person).filter(function (k) { return k && k !== 'me' && k !== 'jamol'; });
      if (c.kind === 'group') { c.members = keys; c.jg.members = keys.slice(); keys.forEach(contact); }
      c.admins = (d.admins || []).map(function (u) { return who(u); }).filter(Boolean); c.jg.admins = c.admins.slice();
      if (d.about != null) c.about = d.about;
      pinFrom(c, d.pinned);
      X.renderConvs(); if (X.openId() === c.id) { headFix(c); paintPin(c); }
    }, function () { /* the list still works */ });
  }
  function pinFrom(c, pm) {
    if (!pm) { c.pinned = null; c.jg.pinned = null; return; }
    var m = byId(c, pm.id); if (!m) { m = toM(pm, c); m.jgOff = true; }
    c.pinned = m; c.jg.pinned = m;
  }
  function headFix(c) {                                                     // the open thread's header after its members arrive (openThread drew it)
    if (c.kind !== 'group') return;
    var tag = $('cm-th-tag'); if (!tag || c.club) return;
    tag.textContent = (W.JG_I18N ? W.JG_I18N.text('You') : 'You') + (c.members.length ? ', ' + c.members.map(function (w) { return (PEOPLE[w] || { name: '' }).name.split(' ')[0]; }).join(', ') : '');
    var avs = $('cm-th-avs'); if (avs && c.members.length) avs.innerHTML = '<span class="cm-gav"><img src="' + AV[c.members[0]] + '" alt=""><img src="' + AV[c.members[1] || c.members[0]] + '" alt=""></span>';
  }
  function paintPin(c) {                                                    // the design's paintPin, for a pin that came from the server
    var bar = $('cm-pinbar'), m = c && c.pinned; if (!bar || X.openId() !== (c && c.id)) return;
    bar.hidden = !m || m.deleted;
    if (!bar.hidden) { var tt = $('cm-pin-t'); if (tt) tt.textContent = m.sticker ? 'Sticker' : m.poll ? 'Poll: ' + m.poll.q : m.text; var x = $('cm-pin-x'); if (x) x.hidden = !(c.kind === 'dm' || (c.admins || []).indexOf('me') >= 0); }
  }
  function load(c, force) {                                                 // a chat's last page of messages
    if (!c.jg || !c.jg.sid || (c.jg.loaded && !force) || c.jg.loading) return c.jg && c.jg.loading || Promise.resolve();
    c.jg.loading = api('GET', cid(c.jg.sid) + '/messages?limit=50').then(function (r) {
      c.jg.loading = null; if (!r.ok) return;
      var keep = c.msgs.filter(function (m) { return m.who === 'me' && !m.sid && !m.system; });   // what she is still sending
      c.msgs.length = 0;
      (r.body.messages || []).forEach(function (sm) { if (sm.kind !== 'system') dayLine(c, sm.time); push(c, toM(sm, c)); });
      keep.forEach(function (m) { push(c, m); });
      c.jg.loaded = true; c.jg.preview = false; c.jg.more = !!r.body.more;
      if (c.pinned && c.pinned.jgOff) { var m = byId(c, c.pinned.sid); if (m) { c.pinned = m; c.jg.pinned = m; } }
      redraw(c, true);
      if (visible(c)) readNow(c);                                           // what she sees is read
    }, function () { c.jg.loading = null; });
    return c.jg.loading;
  }
  var feedOf = function (c) { return c === CHATS.global ? $('cm-feed') : X.openId() === c.id ? $('cm-th-feed') : null; };
  function redraw(c, bottom) {
    var f = feedOf(c);
    if (f) {
      var w = f.parentElement, near = bottom || w.scrollHeight - w.scrollTop - w.clientHeight < 90;
      X.rerenderChat(c === CHATS.global ? 'global' : c.id);
      if (near) w.scrollTop = w.scrollHeight;
      if (c !== CHATS.global) paintPin(c);
    }
    if (c !== CHATS.global) X.renderConvs();
  }
  var lastSid = function (c) { for (var i = c.msgs.length - 1; i >= 0; i--) if (c.msgs[i].sid && !c.msgs[i].jgOff) return c.msgs[i].sid; return 0; };
  function readNow(c) {
    var up = lastSid(c); if (!c.jg || !c.jg.sid || !up || c.jg.readUpTo >= up) return;
    c.jg.readUpTo = up; c.unread = 0; c.jg.unread = 0;
    api('POST', cid(c.jg.sid) + '/read', { upTo: up }).catch(function () { c.jg.readUpTo = 0; });
  }
  var visible = function (c) { if (D.hidden) return false; if (c === CHATS.global) { var p = $('cm-p-msg'), page = $('tv-community'); return !!p && !p.hidden && !!page && !page.hidden && (page.classList.contains('show') || !$('tb-track')); } return X.openId() === c.id; };   // the phone shows a tab by .show, the desktop by [hidden]

  /* ---------- out: what she did, sent ---------- */
  var syncT = 0;
  function soon() { if (!syncT) syncT = setTimeout(sync, 0); }
  function enqueue(c, fn) { c.jg.q = c.jg.q.then(fn, fn); return c.jg.q; }
  function ensure(c) {                                                      // the server chat behind a chat the design made (a first DM, a new group)
    if (c.jg.sid) return Promise.resolve(c.jg.sid);
    if (c.jg.creating) return c.jg.creating;
    var body = c.kind === 'dm' ? { kind: 'dm', with: UID[c.with] } : { kind: 'group', name: c.name, members: (c.members || []).map(function (k) { return UID[k]; }).filter(Boolean) };
    c.jg.creating = api('POST', API, body).then(function (r) {
      c.jg.creating = null;
      if (!r.ok || !r.body.chat) { var e = new Error('create'); e.r = r; throw e; }
      var s = r.body.chat; c.jg.sid = s.id; c.jg.kind = s.kind; c.jg.status = s.status; KEY[s.id] = c.id;
      if (c.kind === 'group') { c.admins = c.admins || []; if (c.admins.indexOf('me') < 0) c.admins.push('me'); c.jg.admins = c.admins.slice(); c.jg.members = (c.members || []).slice(); }
      c.jg.loaded = true;
      if (r.body.request) say(t('request'));
      return s.id;
    });
    return c.jg.creating;
  }
  function refuse(m, reason) { m.jgSt = 'refused'; m.time = t('refused'); say(t(reason && T[reason] ? reason : 'later')); }
  function fail(m) { m.jgSt = 'failed'; m.time = t('failed'); }
  function send(c, m) {
    m.jgSt = 'sending'; m.time = t('sending'); m.jxDone = true;
    m.clientId = m.clientId || 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    if (m.voice || m.image) { refuse(m, null); say(t(m.voice ? 'voice' : 'photo')); return; }
    enqueue(c, function () {
      return ensure(c).then(function (sid) {
        var body = { text: m.sticker ? '[sticker:' + m.sticker + ']' : m.text || '', clientId: m.clientId };
        if (m.reply && m.reply.sid) body.replyTo = m.reply.sid;
        if (m.poll) { body.text = ''; body.poll = { question: m.poll.q, options: m.poll.opts.map(function (o) { return o.t; }), anonymous: !!m.poll.anon }; }
        return api('POST', cid(sid) + '/messages', body);
      }).then(function (r) {
        if (r.ok && r.body.message) {
          var sm = r.body.message, dup = byId(c, sm.id);
          if (dup && dup !== m) { var i = c.msgs.indexOf(dup); if (i >= 0) c.msgs.splice(i, 1); }   // the stream was quicker
          var at = m.jgAt; fill(m, sm, c); if (!at) m.jgAt = sm.time;
          if (/@jamol\b/i.test(m.text) && m.jgSt !== 'held') jamol(c, m);
          readNow(c);
        } else if (r.status === 422 && r.body.reason === 'slow') { fail(m); say(t('slow')); }   // the global room's slow mode: she may send it again in a moment
        else if (r.status === 422) refuse(m, r.body.reason);
        else if (r.status === 429) { fail(m); say(t('slow')); }
        else if (r.status === 404 || r.status === 403) refuse(m, 'not_member');
        else fail(m);
        redraw(c);
      }, function (e) { if (e && e.r) { e.r.status === 422 ? refuse(m, e.r.body.reason) : fail(m); } else fail(m); redraw(c); });
    });
  }
  function jamol(c, m) {                                                    // @Jamol answers through the server: stored in the chat, seen by everyone in it
    api('POST', cid(c.jg.sid) + '/jamol', { question: m.text.replace(/@jamol\b/ig, '').trim(), lang: LANG }).then(function (r) {
      if (r.ok && r.body.message) { if (!byId(c, r.body.message.id)) { push(c, toM(r.body.message, c)); redraw(c); } }
      else say(t(r.status === 429 ? 'slow' : 'jamolOff'));
    }, function () { say(t('jamolOff')); });
  }
  function edit(c, m) {
    var text = m.text; m.jgText = text;
    enqueue(c, function () {
      return api('PATCH', cid(c.jg.sid) + '/messages/' + m.sid, { text: text }).then(function (r) {
        if (r.ok && r.body.message) fill(m, r.body.message, c);
        else { say(t(r.status === 422 && r.body.reason ? r.body.reason : 'later')); if (m.jgOld != null) { m.text = m.jgOld; m.jgText = m.jgOld; } }   // back to what the server holds
        redraw(c);
      }, function () { say(t('later')); });
    });
  }
  function sync() {
    syncT = 0;
    Object.keys(CHATS).forEach(function (k) {
      var c = CHATS[k]; if (!c) return;
      if (!c.jg) adopt(c);
      if (!c.jg) return;
      hook(c);
      if (c.jg.localOnly) {                                                 // a chat with no server chat behind it yet: nothing goes, and she is told
        c.msgs.forEach(function (m) { if (m.who === 'me' && !m.system && !m.jgSt) { m.jgSt = 'refused'; m.time = t('refused'); say(t(c.jg.localOnly)); redraw(c); } });
        return;
      }
      c.msgs.forEach(function (m) {
        if (m.system) return;
        if (m.who === 'me' && !m.sid) { if (!m.jgSt) send(c, m); else if (m.jgSt === 'retry') send(c, m); return; }
        if (!m.sid || !c.jg.sid) return;
        var base = cid(c.jg.sid) + '/messages/' + m.sid;
        if (m.deleted && !m.jgDel) {
          m.jgDel = true;
          enqueue(c, function () { return api('DELETE', base).then(function (r) { if (!r.ok) { m.deleted = false; m.jgDel = false; say(t('later')); redraw(c); } }, function () { m.deleted = false; m.jgDel = false; say(t('later')); redraw(c); }); });
        } else if (m.who === 'me' && !m.deleted && m.text !== m.jgText && !m.sticker && !m.poll) { m.jgOld = m.jgText; edit(c, m); }
        var r = myRx(m);
        if (r !== m.jgRx) {
          m.jgRx = r;
          api('PUT', base + '/reaction', { emoji: r }).then(function (x) { if (x.ok && x.body.rx) { m.rx = rxOf(x.body.rx); m.jgRx = myRx(m); redraw(c); } else if (!x.ok) say(t(x.status === 429 ? 'slow' : 'later')); }, function () { say(t('later')); });
        }
        if (m.poll && m.poll.mine != null && m.poll.mine !== m.jgVote) {
          m.jgVote = m.poll.mine;
          api('POST', base + '/vote', { option: m.poll.mine }).then(function (x) { if (x.ok && x.body.poll) { m.poll = pollOf(x.body.poll); m.jgVote = m.poll.mine; redraw(c); } }, function () { say(t('later')); });
        }
      });
      if (!c.jg.sid) return;
      if ((c.pinned || null) !== (c.jg.pinned || null) && (c.pinned ? c.pinned.sid : true)) {   // undefined (never pinned) is null
        var was = c.jg.pinned; c.jg.pinned = c.pinned;
        api('POST', cid(c.jg.sid) + '/pin', { messageId: c.pinned ? c.pinned.sid : null }).then(function (x) { if (!x.ok) { c.pinned = was; c.jg.pinned = was; paintPin(c); say(t('later')); } }, function () { c.pinned = was; c.jg.pinned = was; paintPin(c); });
      }
      if (c.unread === 0 && c.jg.unread > 0) { c.jg.unread = 0; readNow(c); }
      if (c.kind === 'group' && c.jg.kind === 'group') {
        var adm = (c.admins || []).filter(function (w) { return w !== 'me'; }), adm0 = (c.jg.admins || []).filter(function (w) { return w !== 'me'; });
        adm.filter(function (w) { return adm0.indexOf(w) < 0; }).forEach(function (w) { role(c, w, 'admin'); });
        adm0.filter(function (w) { return adm.indexOf(w) < 0 && (c.members || []).indexOf(w) >= 0; }).forEach(function (w) { role(c, w, 'member'); });
        c.jg.admins = (c.admins || []).slice();
        (c.jg.members || []).filter(function (w) { return (c.members || []).indexOf(w) < 0; }).forEach(function (w) {
          api('DELETE', cid(c.jg.sid) + '/members/' + encodeURIComponent(UID[w])).then(function (x) { if (!x.ok) say(t('later')); });
        });
        c.jg.members = (c.members || []).slice();
      }
    });
    Object.keys(KEY).forEach(function (sid) {                               // a chat she left through the design's "Leave group"
      var k = KEY[sid], c = CHATS[k];
      if (c && c.jg && c.jg.sid === sid) return;
      delete KEY[sid];
      if (!c && /^g:|^dm:/.test(k)) api('POST', cid(sid) + '/leave').catch(function () {});
    });
    blocks();
  }
  function role(c, w, r) { if (UID[w]) api('PATCH', cid(c.jg.sid) + '/members/' + encodeURIComponent(UID[w]), { role: r }).then(function (x) { if (!x.ok) say(t('later')); }); }
  function adopt(c) {                                                       // a chat the design made on its own
    if (c.kind === 'global') return;
    if (c.kind === 'dm' && UID[c.with]) { c.jg = { sid: null, kind: 'dm', q: Promise.resolve(), unread: 0, loaded: true }; contact(c.with); return; }
    if (c.kind === 'dm') { c.jg = { localOnly: 'declined' }; return; }      // a person of the design's (no account): nothing is sent, and she is told
    if (c.league != null) { c.jg = { localOnly: 'league' }; return; }
    if (c.club) { c.jg = { localOnly: 'club' }; return; }
    if (c.kind === 'group' && /^g:n\d+$/.test(c.id)) {                     // the design's "Create group": made on the server now
      c.jg = { sid: null, kind: 'group', q: Promise.resolve(), unread: 0, loaded: true, admins: ['me'], members: (c.members || []).slice() };
      ensure(c).then(function () { redraw(c); }, function () { say(t('later')); });
    }
  }

  /* ---------- blocks and reports (contract "moderation") ---------- */
  // GET/POST/DELETE /api/v1/blocks {userId} (on with MODERATION; 404 off: the design's block then hides them on this page only, as it did)
  var blocked0 = new Set(BLOCKED), blockSrv = [];
  function blockSend(method, uid) {                                         // the moderation lane's own seam when it is on the page (JG_MOD.block / unblock)
    var M0 = W.JG_MOD; if (M0 && typeof M0.block === 'function') { M0[method === 'POST' ? 'block' : 'unblock'](uid); return; }
    api(method, '/api/v1/blocks', { userId: uid }).then(function (r) { if (!r.ok && r.status !== 404) say(t('later')); }, function () {});
  }
  function blocks() {
    BLOCKED.forEach(function (w) { if (!blocked0.has(w)) { blocked0.add(w); if (UID[w]) blockSend('POST', UID[w]); } });
    blocked0.forEach(function (w) { if (!BLOCKED.has(w)) { blocked0.delete(w); if (UID[w]) blockSend('DELETE', UID[w]); } });
  }
  function blockedFromServer() {                                            // her blocks from any device, for the people this page knows
    blockSrv.forEach(function (id) { var k = UID[keyOf(id)] ? keyOf(id) : null; if (k && !BLOCKED.has(k)) { BLOCKED.add(k); blocked0.add(k); } });
  }
  // a report names the message as the server reads it, 'chat_message:<server id>' (src/server/chat/reports.ts REPORT_REF; M1 integration: it
  // sent '<chat>:<id>', which the moderator's context and take-down never matched)
  // a report: the moderation lane's page seam (window.JG_MOD.report, called by the design's report sheet) gets the chat's own references;
  // without that seam, POST /api/v1/reports here (live in every switch state once that lane is in)
  function sendReport(what, reason) {
    var M0 = W.JG_MOD;
    if (M0 && typeof M0.report === 'function') { if (!M0.__jgChat) wrapMod(M0); return; }
    api('POST', '/api/v1/reports', { target: what.kind === 'message' ? 'message' : 'profile', reason: reason, targetUserId: what.user || undefined, targetRef: what.kind === 'message' ? 'chat_message:' + what.message : undefined, surface: 'chat' }).catch(function () {});
  }
  function wrapMod(M0) {
    var orig = M0.report; M0.__jgChat = true;
    M0.report = function (item, reason) {
      var r = reportOf; reportOf = null;
      if (r && item && (item.what === 'message' || item.what === 'profile')) item = Object.assign({}, item, { userId: r.user || item.userId, ref: r.kind === 'message' ? 'chat_message:' + r.message : item.ref });
      return orig.call(M0, item, reason);
    };
  }
  var reportOf = null, nextReport = null;                                   // what the report sheet is about: a message, or a person
  function profileKey() { var n = $('pf-name'), name = n ? n.textContent : ''; return Object.keys(UID).find(function (k) { return PEOPLE[k] && PEOPLE[k].name === name; }) || null; }
  var peerBusy = false, peerHid = false;
  function peerPage() {                                                     // only what is true about a classmate: her name, "Student", Message and report
    if (peerBusy) return;
    if (!profileKey()) { if (peerHid) { peerHid = false; ['pf-stats', 'pf-achs'].forEach(function (id) { var el = $(id); if (el) el.style.display = ''; }); } return; }
    peerBusy = true; peerHid = true;
    [['pf-stats', 'none'], ['pf-achs', 'none']].forEach(function (x) { var el = $(x[0]); if (el && el.style.display !== x[1]) el.style.display = x[1]; });
    var acts = $('pf-actions'); if (acts) acts.querySelectorAll('[data-pf="follow"], [data-pf="share"]').forEach(function (b) { if (b.style.display !== 'none') b.style.display = 'none'; });
    var tabs = D.querySelector('.pf-tabs'); if (tabs && tabs.style.display !== 'none') tabs.style.display = 'none';
    var body = $('pf-body'); if (body && body.style.display !== 'none') body.style.display = 'none';
    peerBusy = false;
  }
  function heldMsg() {
    var el = D.querySelector('.cm-msg.held[data-mid]'); if (!el) return null;
    var c = el.closest('#cm-th-feed') ? CHATS[X.openId()] : CHATS.global, m = c && c.msgs.find(function (x) { return String(x.id) === el.dataset.mid; });
    return m && c && c.jg && c.jg.sid && m.sid ? { kind: 'message', chat: c.jg.sid, message: m.sid, user: UID[m.who] || null } : null;
  }

  /* ---------- in: the stream ---------- */
  var es = null, live = false, backoff = 1000, online0 = null, lastId = '';
  function paintOnline() {
    var el = $('cm-online'); if (!el) return;
    el.textContent = !navigator.onLine ? t('offline') : !live ? t('connecting') : t('online', online0 == null ? 1 : online0);
  }
  function connect() {
    if (es) { try { es.close(); } catch (e) { /* gone */ } }
    try { es = new EventSource(API + '/stream?uid=' + encodeURIComponent(ME) + (lastId ? '&lastEventId=' + encodeURIComponent(lastId) : '')); } catch (e) { es = null; retry(); return; }   // a new stream asks the server to replay from the last event she had
    var first = true;
    es.onopen = function () { var again = first && backoff > 1000 && !lastId; live = true; backoff = 1000; paintOnline(); if (again) refresh(); first = false; };   // a new stream after a failed one reads the list again; the same stream reconnecting is replayed by the server (Last-Event-ID) or told to resync
    es.addEventListener('chat', function (e) { var ev = null; if (e.lastEventId) lastId = e.lastEventId; try { ev = JSON.parse(e.data); } catch (x) { return; } handle(ev); });
    es.onerror = function () { live = false; paintOnline(); if (es && es.readyState === 2) retry(); };
  }
  function retry() { live = false; paintOnline(); setTimeout(function () { if (navigator.onLine) connect(); }, backoff); backoff = Math.min(backoff * 2, 30000); }
  W.addEventListener('offline', function () { live = false; paintOnline(); });
  W.addEventListener('online', function () { paintOnline(); connect(); Object.keys(CHATS).forEach(function (k) { var c = CHATS[k]; if (c && c.jg && !c.jg.localOnly) c.msgs.forEach(function (m) { if (m.jgSt === 'failed') { m.jgSt = 'retry'; } }); }); soon(); });
  function chatOf(sid) { var k = KEY[sid]; return k && CHATS[k] && CHATS[k].jg && CHATS[k].jg.sid === sid ? CHATS[k] : null; }
  function handle(ev) {
    if (!ev || !ev.type) return;
    if (ev.type === 'hello' || ev.type === 'presence') { online0 = ev.online; live = true; paintOnline(); return; }   // only a live stream says these
    if (ev.type === 'resync') { refresh(); return; }
    if (ev.type === 'request') { requests(); return; }
    var c = ev.chatId ? chatOf(ev.chatId) : null;
    if (ev.type === 'chat') { refresh(); return; }
    if (ev.type === 'typing') { if (c && ev.who !== ME) typingShow(c, who(ev.who, ev.name)); return; }
    if (!c) { if (ev.type === 'message') refresh(); return; }
    if (ev.type === 'message') {
      var sm = ev.message, m = byId(c, sm.id) || (sm.clientId ? c.msgs.find(function (x) { return x.clientId === sm.clientId && !x.sid; }) : null);
      if (m) { fill(m, sm, c); redraw(c); return; }
      if (c.jg.preview) { c.msgs.length = 0; c.jg.preview = false; }
      if (sm.kind !== 'system') dayLine(c, sm.time);
      if (typingEl && typingEl.dataset.jgWho === who(sm.who, sm.name)) typingHide();
      push(c, toM(sm, c)); c.time = listTime(sm.time);
      var mine = sm.who === ME;
      if (visible(c)) readNow(c); else if (!mine && sm.kind !== 'system') { c.unread = (c.unread || 0) + 1; c.jg.unread = c.unread; note(c, sm); }
      redraw(c, mine);
    } else if (ev.type === 'edit') { var e1 = byId(c, ev.message.id); if (e1) { fill(e1, ev.message, c); redraw(c); } }
    else if (ev.type === 'delete') { var d1 = byId(c, ev.id); if (d1) { d1.deleted = true; d1.jgDel = true; d1.text = ''; d1.jgText = ''; redraw(c); } }
    else if (ev.type === 'react') { var r1 = byId(c, ev.id); if (r1) { r1.rx = rxOf(ev.rx); r1.jgRx = myRx(r1); redraw(c); } }
    else if (ev.type === 'poll') { var p1 = byId(c, ev.id); if (p1) { p1.poll = pollOf(ev.poll); p1.jgVote = p1.poll.mine; redraw(c); } }
    else if (ev.type === 'pin') { pinFrom(c, ev.pinned); paintPin(c); }
    else if (ev.type === 'read') { if (lastSid(c) <= ev.upTo) { c.unread = 0; c.jg.unread = 0; X.renderConvs(); } }
  }

  /* ---------- typing: the design's own "… is typing" bubble (M:010:109-115), for a real person, in the open chat ---------- */
  var typingEl = null, typingT = 0, typedAt = 0;
  function typingShow(c, w) {
    var f = $('cm-th-feed'); if (!f || X.openId() !== c.id || !w || !PEOPLE[w] || BLOCKED.has(w)) return;
    if (typingEl) typingEl.remove();
    typingEl = D.createElement('div'); typingEl.className = 'cm-msg cm-typing k-' + PEOPLE[w].kind; typingEl.dataset.jgWho = w;
    typingEl.innerHTML = '<img class="cm-av" src="' + esc(AV[w]) + '" alt=""><div class="cm-bub" aria-label="' + esc(PEOPLE[w].name.split(' ')[0]) + ' is typing"><i></i><i></i><i></i></div>';
    f.appendChild(typingEl); var w0 = f.parentElement; if (w0 && w0.scrollHeight - w0.scrollTop - w0.clientHeight < 120) w0.scrollTop = w0.scrollHeight;
    clearTimeout(typingT); typingT = setTimeout(typingHide, 5000);
  }
  function typingHide() { clearTimeout(typingT); if (typingEl) { typingEl.remove(); typingEl = null; } }
  function typed() {                                                        // she types in a chat (not the global room): the others see it, once per 3 s
    var c = CHATS[X.openId()]; if (!c || !c.jg || !c.jg.sid || c.jg.localOnly || Date.now() - typedAt < 3000) return;
    typedAt = Date.now(); api('POST', cid(c.jg.sid) + '/typing', {}).catch(function () {});
  }

  /* ---------- a note in the design's bell for a message in one of her chats while she is elsewhere (Settings · Messages; in-app only) ---------- */
  var noted = {};
  function note(c, sm) {
    if (c === CHATS.global || !W.JIA_notify || (W.JIA_SETTINGS && W.JIA_SETTINGS.nMessages === false)) return;
    if (noted[c.id] && Date.now() - noted[c.id] < 60000) return;             // one note a minute per chat, like a quiet Telegram
    noted[c.id] = Date.now();
    var w = sm.kind === 'jamol' ? 'jamol' : who(sm.who, sm.name), name = w && PEOPLE[w] ? PEOPLE[w].name : '';
    var what = sm.poll ? '📊 ' + sm.poll.question : STK.test(sm.text || '') ? '🙂' : String(sm.text || '').slice(0, 80);
    var head = c.kind === 'dm' ? name : (c.name || '') + (name ? ' · ' + name : '');
    W.JIA_notify({ who: w && AV[w] ? w : undefined, text: '<b>' + esc(head) + '</b> ' + esc(what), go: function () { goChat(c.id); } });
  }

  /* ---------- the list, again ---------- */
  var reqN = 0;
  function refresh() {
    return api('GET', API).then(function (r) {
      if (!r.ok) return;
      var seen = {};
      (r.body.chats || []).forEach(function (s) { if (s.status !== 'declined') { bind(s); seen[s.id] = 1; } });
      Object.keys(KEY).forEach(function (sid) {                             // a DM, group or league chat the server no longer lists for her (removed, left elsewhere) leaves Direct
        var k = KEY[sid], c = CHATS[k]; if (!c || !c.jg || c.jg.sid !== sid || seen[sid] || ['dm', 'group', 'league'].indexOf(c.jg.kind) < 0) return;
        delete KEY[sid]; delete CHATS[k]; if (X.openId() === k) { var back = $('cm-back'); if (back) back.click(); }
      });
      if (typeof r.body.online === 'number' && !live) { online0 = r.body.online; paintOnline(); }   // a live stream's count is newer
      reqN = r.body.requests || 0; paintReq(); if (reqN !== REQ.length) requests();   // the sheet's list ready before she opens it
      Object.keys(CHATS).forEach(function (k) { var c = CHATS[k]; if (c && c.jg && c.jg.sid && (c === CHATS.global || visible(c))) load(c, true); });
      X.renderConvs();
    }, function () { /* offline: the stream says when it is back */ });
  }
  function paintReq() { var row = $('cm-reqs'); if (!row) return; row.hidden = !reqN; var em = row.querySelector('em'); if (em) em.textContent = reqN; }
  var REQ = [];
  function requests() {
    return api('GET', API + '/requests').then(function (r) { if (!r.ok) return; REQ = r.body.requests || []; reqN = REQ.length; paintReq(); paintReqs(); });
  }
  function paintReqs() {
    var list = $('rq-list'), sheet = $('rq-sheet'); if (!list || !sheet || sheet.hidden) return;
    list.innerHTML = REQ.map(function (q, i) {
      var k = person(q.from) || 'me';
      return '<li class="rq"><div class="rq-top"><img src="' + esc(AV[k]) + '" alt=""><div><b>' + esc(PEOPLE[k] ? PEOPLE[k].name : q.from.name) + '</b><small>' + esc(PEOPLE[k] ? PEOPLE[k].tag : '') + ' · ' + esc(t('wants')) + '</small></div><span>' + esc(listTime(q.time)) + '</span></div>'
        + '<p class="rq-text">' + esc(q.preview) + '</p>'
        + '<div class="rq-btns"><button type="button" data-jgrq="accept" data-i="' + i + '">' + esc(t('accept')) + '</button><button type="button" data-jgrq="delete" data-i="' + i + '">' + esc(t('del')) + '</button><button type="button" class="danger" data-jgrq="block" data-i="' + i + '">' + esc(t('blockrep')) + '</button></div></li>';
    }).join('') || '<li class="pf-empty">' + esc(t('none')) + '</li>';
  }
  function closeSheet(id) { var s = $(id), bg = s && s.querySelector('[data-layer-close]'); if (bg && !s.hidden) bg.click(); }

  /* ---------- search over the server ("search everything, like Telegram") ---------- */
  var srT = 0, srQ = '';
  function searchServer() {
    var inp = $('sr-in'), out = $('sr-out'); if (!inp || !out) return;
    var q = inp.value.trim(); srQ = q; clearTimeout(srT); if (q.length < 2) return;
    srT = setTimeout(function () {
      api('GET', API + '/search?q=' + encodeURIComponent(q)).then(function (r) {
        if (!r.ok || srQ !== q || inp.value.trim() !== q) return;
        var kind = (D.querySelector('.sr-chips [aria-pressed="true"]') || { dataset: { k: 'all' } }).dataset.k;
        if (kind !== 'all' && kind !== 'chats') return;
        var res = (r.body.results || []).filter(function (x) { return x.chat && x.message; });
        out.querySelectorAll('[data-jgsr], .jg-sr-h').forEach(function (el) { el.remove(); });
        var tx = function (s) { return W.JG_I18N ? W.JG_I18N.text(s) : s; }, head = function (h) { return h.firstChild && h.firstChild.nodeType === 3 ? h.firstChild.nodeValue.trim() : ''; };
        var heads = [].slice.call(out.querySelectorAll('.sr-h')), mine = heads.find(function (h) { var x = head(h); return x === 'Chats' || x === tx('Chats'); });
        if (mine) { var n = mine.nextElementSibling; while (n && !n.classList.contains('sr-h')) { var nx = n.nextElementSibling; n.remove(); n = nx; } mine.remove(); }
        if (!res.length) return;
        var list = kind === 'all' ? res.slice(0, 3) : res, hl = function (s) { var i = s.toLowerCase().indexOf(q.toLowerCase()); return i < 0 ? esc(s) : esc(s.slice(0, i)) + '<mark>' + esc(s.slice(i, i + q.length)) + '</mark>' + esc(s.slice(i + q.length)); };
        var html = '<p class="sr-h jg-sr-h">' + esc(tx('Chats')) + '</p>' + list.map(function (x, i) {
          var c = bind(x.chat), img = c.kind === 'dm' ? AV[c.with] : c.members && c.members[0] ? AV[c.members[0]] : '';
          var title = c.kind === 'dm' ? (PEOPLE[c.with] || { name: x.chat.name }).name : x.chat.name || c.name || '';
          return '<button class="sr-row" type="button" data-jgsr="' + i + '">' + (img ? '<img src="' + esc(img) + '" alt="">' : '<i></i>') + '<span><b>' + esc(title) + '</b><small>' + hl(String(x.message.text || '').slice(0, 90)) + '</small></span></button>';
        }).join('');
        var later = ['Lessons', 'Opportunities', 'Posts', 'Reels'].reduce(function (a, s) { a.push(s, tx(s)); return a; }, []);
        var after = heads.find(function (h) { return later.indexOf(head(h)) >= 0; });
        var p = out.querySelector('.pf-empty'); if (p) p.remove();
        if (after && after.parentElement === out) after.insertAdjacentHTML('beforebegin', html); else out.insertAdjacentHTML('beforeend', html);
        out.querySelectorAll('[data-jgsr]').forEach(function (b) { b.addEventListener('click', function () { var x = list[+b.dataset.jgsr], k = KEY[x.chat.id]; closeSheet('sr-view'); var cancel = $('sr-cancel'); if (cancel && !$('sr-view').hidden) cancel.click(); goChat(k); }); });
      }, function () { /* offline: what the page holds is still searched */ });
    }, 250);
  }
  function goChat(k) {
    var lv = $('lg-view'); if (lv && !lv.hidden) { var lb = $('lg-back'); if (lb) lb.click(); }
    var tab = D.querySelector('#tb-track button[data-i="4"]') || D.querySelector('#dk-track button[data-i="4"]');
    var on = tab && tab.getAttribute('aria-current') === 'page';
    if (tab && !on) tab.click(); else if (!tab && W.JIA && W.JIA.go) W.JIA.go('community');
    setTimeout(function () { if (k && CHATS[k]) X.open(k); }, on ? 0 : 420);
  }

  /* ---------- a chat named by another part of the page (the League's "Open league chat", lane m1-league's JG_LEAGUE.openChat) ---------- */
  function openServer(id, go) {
    if (KEY[id]) { if (go) goChat(KEY[id]); return Promise.resolve(); }
    return api('GET', cid(id)).then(function (r) {
      if (r.ok && r.body.chat) return r.body.chat;
      return api('POST', API + '/league/' + encodeURIComponent(id)).then(function (r2) { return r2.ok && r2.body.chat ? r2.body.chat : null; });   // a league chat is made on demand by league id
    }).then(function (s) { if (!s) return; var c = bind(s); detail(c); X.renderConvs(); if (go) goChat(c.id); }, function () { say(t('later')); });
  }

  /* ---------- older messages, when she scrolls to the top ---------- */
  function older(c) {
    if (!c || !c.jg || !c.jg.sid || !c.jg.more || c.jg.older) return;
    var first = c.msgs.find(function (m) { return m.sid && !m.system; }); if (!first) return;
    c.jg.older = api('GET', cid(c.jg.sid) + '/messages?before=' + first.sid + '&limit=50').then(function (r) {
      c.jg.older = null; if (!r.ok) return;
      var tmp = { msgs: [] };
      (r.body.messages || []).forEach(function (sm) { if (sm.kind !== 'system') dayLine(tmp, sm.time); push(tmp, toM(sm, c)); });
      var rest = c.msgs.slice(), lastOld = tmp.msgs.filter(function (m) { return m.jgAt; }).pop();
      if (rest[0] && rest[0].jgDay && lastOld && ymd(new Date(lastOld.jgAt)) === ymd(new Date(first.jgAt))) rest.shift();   // the same day goes on
      c.jg.more = !!r.body.more;
      var f = feedOf(c), w = f && f.parentElement, h = w ? w.scrollHeight : 0, top = w ? w.scrollTop : 0;
      c.msgs.length = 0; tmp.msgs.concat(rest).forEach(function (m) { push(c, m); });
      if (f) { X.rerenderChat(c === CHATS.global ? 'global' : c.id); w.scrollTop = w.scrollHeight - h + top; }
    }, function () { c.jg.older = null; });
  }

  /* ---------- clubs (023.js's JG_API seam): her joined clubs and their channel and topics from the server ----------
     A design club the server holds (id club:<the design's id>, topics club:<id>:<topic>) is joined, left and read there; a club she
     founds goes to the server too, where a moderator reviews it (it waits, as its row says). A club the server does not hold yet keeps
     the design's pages, and a message in it says it opens soon instead of going nowhere. */
  var CLUBSRV = {};
  function bindClub(s) {
    bind(s);
    api('GET', API + '/clubs/' + encodeURIComponent(s.id) + '/topics').then(function (r) { if (r.ok) (r.body.topics || []).forEach(function (x) { bind(x); }); X.renderConvs(); }, function () {});
  }
  function clubs() {
    var A = W.JG_API; if (!A || typeof A.clubs !== 'function') return;
    api('GET', API + '/clubs').then(function (r) {
      if (!r.ok) return;
      (r.body.clubs || []).forEach(function (s) { CLUBSRV[clubKey(s.id)] = s; });
      A.clubs().forEach(function (dc) {
        var s = CLUBSRV[dc.id]; if (!s) return;
        if (s.role) bindClub(s);
        else if (dc.joined) api('POST', API + '/clubs/' + encodeURIComponent(s.id) + '/join').then(function (x) { if (x.ok) bindClub(x.body.club || s); });   // joined before the server held it
      });
    }, function () {});
    var join0 = A.joinClub, leave0 = A.leaveClub, found0 = A.foundClub;
    A.joinClub = function (id) { var out = join0.apply(this, arguments), s = CLUBSRV[id]; if (s) api('POST', API + '/clubs/' + encodeURIComponent(s.id) + '/join').then(function (x) { if (x.ok) bindClub(x.body.club || s); else say(t('later')); }, function () { say(t('later')); }); return out; };
    A.leaveClub = function (id) { var out = leave0.apply(this, arguments), s = CLUBSRV[id]; if (s) api('POST', API + '/clubs/' + encodeURIComponent(s.id) + '/leave').catch(function () {}); return out; };
    A.foundClub = function (x) { var out = found0.apply(this, arguments); api('POST', API + '/clubs', { name: x.name, about: x.about || '' }).then(function (y) { if (!y.ok) say(t(y.status === 422 ? 'contact' : 'later')); }, function () { say(t('later')); }); return out; };
  }

  /* ---------- the people pickers: a new group, the share sheet (the people she already chats with) ---------- */
  function contacts() { return ORDER.filter(function (k) { return UID[k] && !BLOCKED.has(k); }); }
  function fillGroupPicker() {
    var list = $('grp-list'); if (!list) return;
    list.innerHTML = contacts().map(function (k) { return '<li><button class="grp-p" type="button" data-id="' + esc(k) + '" aria-pressed="false"><img src="' + esc(AV[k]) + '" alt=""><span><b>' + esc(PEOPLE[k].name) + '</b><small>' + esc(PEOPLE[k].tag) + '</small></span><i aria-hidden="true"></i></button></li>'; }).join('');
  }
  function fillSharePeople() {
    var box = $('sh-people'); if (!box) return;
    box.innerHTML = contacts().map(function (k) { return '<button class="sh-p" type="button" data-id="' + esc(k) + '" aria-pressed="false"><span class="sh-av"><img src="' + esc(AV[k]) + '" alt=""><i aria-hidden="true">✓</i></span><small>' + esc(PEOPLE[k].name.split(' ')[0]) + '</small></button>'; }).join('');
  }

  /* ---------- start ---------- */
  function start(first) {
    W.JG_CHAT.on = true;
    var g = CHATS.global; g.msgs.length = 0; hook(g);
    g.jg = { sid: 'global', kind: 'global', loaded: false, q: Promise.resolve(), unread: 0 }; KEY.global = 'global';
    var lg = Object.keys(CHATS).find(function (k) { return /^lg:/.test(k); });
    (first.chats || []).forEach(function (s) { if (s.status !== 'declined') bind(s); });
    if (lg && CHATS[lg] && !CHATS[lg].jg) delete CHATS[lg];                 // no league chat on the server for her: the design's group of invented classmates leaves Direct
    var lid = W.JG_LEAGUE && typeof W.JG_LEAGUE.chat === 'function' && W.JG_LEAGUE.chat();   // lane m1-league names her real league's chat (LEAGUE on)
    if (lid && !KEY[lid]) openServer(lid, false);
    online0 = typeof first.online === 'number' ? first.online : null;
    reqN = first.requests || 0; paintReq();
    load(g, true);
    Object.keys(CHATS).forEach(function (k) { var c = CHATS[k]; if (c && c.jg && c.jg.sid && c.kind === 'group') detail(c); });
    X.renderConvs();
    connect(); paintOnline();
    clubs();
    api('GET', '/api/v1/blocks').then(function (r) { if (r.ok && Array.isArray(r.body.blocked)) { blockSrv = r.body.blocked; blockedFromServer(); X.renderConvs(); } }, function () {});
    [['cm-feed-wrap', function () { return CHATS.global; }], ['cm-th-wrap', function () { return CHATS[X.openId()]; }]].forEach(function (x) {
      var w = $(x[0]); if (w) w.addEventListener('scroll', function () { if (w.scrollTop < 40) older(x[1]()); }, { passive: true });
    });

    D.addEventListener('click', soon, true); D.addEventListener('keydown', soon, true); D.addEventListener('change', soon, true);
    D.addEventListener('jia:thread', function (e) {                         // a chat opened: hook it, fetch its messages and its people, mark it read
      var c = e.detail && e.detail.chat; if (!c) return;
      if (!c.jg) adopt(c);
      if (!c.jg) return;
      hook(c);
      if (c.jg.sid && !c.jg.loaded) load(c, true).then(function () { readNow(c); });
      else if (c.jg.sid) readNow(c);
      if (c.jg.sid && c.kind === 'group') { headFix(c); detail(c); }
    });
    D.addEventListener('click', function (e) {
      if (e.target.closest('#jc-together')) {                               // Study together holds nobody's messages on the server yet: said, not pretended
        var ct = CHATS[X.openId()]; if (ct && ct.jg && !ct.jg.localOnly) { e.preventDefault(); e.stopImmediatePropagation(); say(t('together')); }
        return;
      }
      var mic = e.target.closest('[data-mic]'), cam = e.target.closest('#jx-cam');
      if (mic || cam) {                                                     // no voice notes (C-21) and no photos yet: said, never sent into nothing
        var c = mic && mic.dataset.mic === 'global' ? CHATS.global : CHATS[X.openId()];
        if (c && c.jg && !c.jg.localOnly) { e.preventDefault(); e.stopImmediatePropagation(); say(t(mic ? 'voice' : 'photo')); }
        return;
      }
      var tm = e.target.closest('.cm-msg.me .cm-time');
      if (tm) {                                                             // "Not sent · tap to retry"
        var el = tm.closest('.cm-msg'), c2 = el.closest('#cm-th-feed') ? CHATS[X.openId()] : CHATS.global, m = c2 && c2.msgs.find(function (x) { return String(x.id) === el.dataset.mid; });
        if (m && m.jgSt === 'failed') { e.stopImmediatePropagation(); m.jgSt = 'retry'; m.time = t('sending'); redraw(c2); soon(); }
        return;
      }
      if (e.target.closest('#cm-newgrp')) { fillGroupPicker(); return; }
      if (e.target.closest('#cm-menu [data-act="report"]')) { nextReport = heldMsg(); return; }
      if (e.target.closest('#pf-more')) { var pk = profileKey(); nextReport = pk ? { kind: 'user', user: UID[pk] } : null; return; }
      var rq = e.target.closest('[data-jgrq]');
      if (rq) {
        var q = REQ[+rq.dataset.i], act = rq.dataset.jgrq; if (!q) return;
        REQ.splice(+rq.dataset.i, 1); reqN = REQ.length; paintReq(); paintReqs();
        api('POST', API + '/requests/' + encodeURIComponent(q.chat.id), { accept: act === 'accept' }).then(function (r) {
          if (!r.ok) { say(t('later')); requests(); return; }
          if (act === 'accept') { var c3 = bind(r.body.chat || q.chat); closeSheet('rq-sheet'); load(c3, true).then(function () { X.open(c3.id); }); }
          if (act === 'block') { var k = person(q.from); if (k) { BLOCKED.add(k); blocks(); } api('POST', '/api/v1/reports', { target: 'message', reason: 'spam', targetUserId: q.from.id, targetRef: q.chat.id, label: q.preview, surface: 'chat_request' }).catch(function () {}); say(t('reported')); }
        }, function () { say(t('later')); requests(); });
        return;
      }
    }, true);
    D.addEventListener('click', function (e) {                              // after the design's own handlers
      if (e.target.closest('#cm-reqs')) { paintReqs(); requests(); }
      var r = e.target.closest('#rp-reasons [data-r]');
      if (r && reportOf && !W.JG_MOD) { var what = reportOf; reportOf = null; sendReport(what, r.dataset.r); }
    });
    var rp = $('rp-sheet');                                                 // the report sheet is about what opened it: a chat message or a person here, else not ours
    if (rp) new MutationObserver(function () { if (!rp.hidden) { reportOf = nextReport; nextReport = null; if (W.JG_MOD && typeof W.JG_MOD.report === 'function' && !W.JG_MOD.__jgChat) wrapMod(W.JG_MOD); } }).observe(rp, { attributes: true, attributeFilter: ['hidden'] });
    var pfv = $('pf-view');                                                 // a classmate's page: no invented numbers (FOLLOWERS has none for her: "NaN followers")
    if (pfv) new MutationObserver(function () { if (!pfv.hidden && !W.JG_COMMUNITY) peerPage(); }).observe(pfv, { attributes: true, attributeFilter: ['hidden'], subtree: true, childList: true });
    var sh = $('sh-sheet'); if (sh) new MutationObserver(function () { if (!sh.hidden) fillSharePeople(); }).observe(sh, { attributes: true, attributeFilter: ['hidden'] });
    var inp = $('sr-in'); if (inp) inp.addEventListener('input', searchServer);
    var thIn = $('cm-th-in'); if (thIn) thIn.addEventListener('input', typed);
    // a quote of her own message names her "You" (M:010:92 nameOf), inside what people wrote, which the dictionary leaves alone: in her language here
    var YOU = { uz: 'Siz', ru: 'Вы' }[LANG];
    if (YOU) ['cm-feed', 'cm-th-feed'].forEach(function (id) {
      var f = $(id); if (!f) return;
      var fix = function () { f.querySelectorAll('.cm-quote > b').forEach(function (b) { if (b.textContent === 'You') b.textContent = YOU; }); };
      new MutationObserver(fix).observe(f, { childList: true, subtree: true }); fix();
    });
    D.addEventListener('jia:thread', typingHide);
    var chips = D.querySelector('.sr-chips'); if (chips) chips.addEventListener('click', function () { setTimeout(searchServer, 0); });
    D.addEventListener('visibilitychange', function () { if (!D.hidden) { var c = CHATS[X.openId()] || CHATS.global; if (c && c.jg && visible(c)) readNow(c); } });
  }

  api('GET', API).then(function (r) {
    if (r.status !== 200 || !r.body || !Array.isArray(r.body.chats)) return;   // 404: MESSENGER is off; the design keeps its own
    start(r.body);
  }, function () { /* offline at load: the design's own until the next load */ });
  W.JG_CHAT.open = function (id) { if (W.JG_CHAT.on) openServer(id, true); };   // lane m1-league's JG_LEAGUE.openChat calls this
  W.JG_CHAT.online = function () { return online0; };                       // the last count the server said
  W.JG_CHAT.handle = function (ev) { handle(ev); };                         // for tests: an event as the stream would bring it
  W.JG_CHAT.sync = function () { sync(); };
})();
