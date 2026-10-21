
(() => {
  "use strict";
  /* ==========================================================
     MEDALS — every streak milestone (1, 2, 3, 7, 10, 15, 30, 60,
     100 … days) and every achievement becomes a medal ceremony:
     a real 3D medal spinning in gold confetti, words from
     Jamals Global, and a story picture that is one tap away
     from Instagram, Telegram and every other app.
     Medal digits: Poppins ExtraBold outlines (OFL).
     ========================================================== */
  const $ = id => document.getElementById(id);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const z = () => String(window.JIA_z ? window.JIA_z() : 90);
  const G = {"upm":1000,"g":{"0":{"w":657,"d":"M 329 746 Q 479 746 550 647 Q 620 548 620 376 Q 620 202 550 103 Q 480 4 329 4 Q 178 4 108 103 Q 39 202 39 376 Q 39 548 109 647 Q 179 746 329 746 Z M 329 561 Q 270 561 251 514 Q 232 466 232 376 Q 232 284 250 236 Q 269 189 329 189 Q 389 189 408 236 Q 426 284 426 376 Q 426 466 407 514 Q 388 561 329 561 Z"},"1":{"w":387,"d":"M 18 547 L 18 731 L 326 731 L 326 0 L 121 0 L 121 547 Z"},"2":{"w":569,"d":"M 338 513 Q 338 545 324 563 Q 309 581 281 581 Q 252 581 236 556 Q 220 532 221 485 L 31 485 Q 34 574 70 632 Q 106 691 164 718 Q 222 746 293 746 Q 416 746 476 685 Q 536 624 536 527 Q 536 423 466 332 Q 397 241 293 169 L 543 169 L 543 10 L 33 10 L 33 157 Q 130 233 192 288 Q 254 343 296 402 Q 338 460 338 513 Z"},"3":{"w":610,"d":"M 302 747 Q 379 747 434 720 Q 488 694 516 648 Q 544 603 544 546 Q 544 478 511 438 Q 478 397 436 383 L 436 379 Q 557 334 557 207 Q 557 144 528 96 Q 499 48 444 21 Q 389 -6 313 -6 Q 188 -6 116 54 Q 43 115 40 240 L 231 240 Q 229 200 248 178 Q 267 156 305 156 Q 334 156 350 174 Q 367 192 367 222 Q 367 260 342 278 Q 318 296 263 296 L 228 296 L 228 455 L 262 455 Q 300 454 326 468 Q 353 481 353 522 Q 353 553 338 568 Q 323 584 297 584 Q 268 584 254 564 Q 241 543 239 513 L 48 513 Q 52 626 118 686 Q 184 747 302 747 Z"},"4":{"w":691,"d":"M 51 120 L 51 282 L 358 720 L 573 720 L 573 290 L 650 290 L 650 120 L 573 120 L 573 0 L 375 0 L 375 120 Z M 390 499 L 252 290 L 390 290 Z"},"5":{"w":655,"d":"M 571 558 L 271 558 L 271 447 Q 290 467 323 479 Q 356 491 396 491 Q 468 491 516 458 Q 565 425 588 371 Q 611 317 611 253 Q 611 135 544 68 Q 477 0 358 0 Q 275 0 214 28 Q 154 57 122 108 Q 90 159 89 225 L 280 225 Q 283 202 300 185 Q 317 168 350 168 Q 385 168 403 192 Q 421 216 421 256 Q 421 295 402 316 Q 383 336 347 336 Q 320 336 304 322 Q 287 309 284 289 L 93 289 L 93 731 L 571 731 Z"},"6":{"w":635,"d":"M 316 587 Q 269 587 250 543 Q 232 499 231 405 Q 251 436 289 454 Q 327 472 373 472 Q 470 472 528 412 Q 587 352 587 240 Q 587 166 556 110 Q 526 55 468 25 Q 411 -5 333 -5 Q 178 -5 118 92 Q 57 188 57 365 Q 57 561 121 653 Q 185 745 327 745 Q 442 745 502 680 Q 561 616 568 521 L 386 521 Q 379 555 363 571 Q 347 587 316 587 Z M 245 243 Q 245 204 266 183 Q 287 162 326 162 Q 362 162 382 182 Q 403 203 403 241 Q 403 278 382 299 Q 362 320 325 320 Q 290 320 268 300 Q 245 280 245 243 Z"},"7":{"w":523,"d":"M 507 585 L 267 0 L 66 0 L 308 562 L 23 562 L 23 730 L 507 730 Z"},"8":{"w":653,"d":"M 68 550 Q 68 604 96 648 Q 125 693 183 720 Q 241 746 326 746 Q 411 746 469 720 Q 527 693 556 648 Q 584 604 584 550 Q 584 497 560 458 Q 537 420 495 397 Q 547 370 574 325 Q 601 280 601 219 Q 601 146 564 94 Q 527 41 464 14 Q 402 -13 326 -13 Q 250 -13 188 14 Q 125 41 88 94 Q 51 146 51 219 Q 51 280 78 325 Q 105 370 157 397 Q 68 446 68 550 Z M 326 593 Q 297 593 278 573 Q 260 553 260 519 Q 260 485 278 466 Q 297 447 326 447 Q 355 447 374 466 Q 392 485 392 519 Q 392 554 374 574 Q 356 593 326 593 Z M 241 230 Q 241 194 264 171 Q 287 148 326 148 Q 365 148 388 171 Q 410 194 410 230 Q 410 268 387 290 Q 364 313 326 313 Q 288 313 264 290 Q 241 268 241 230 Z"},"9":{"w":606,"d":"M 316 153 Q 361 153 378 196 Q 394 238 394 332 Q 374 303 338 286 Q 302 269 257 269 Q 161 269 101 329 Q 41 389 41 502 Q 41 576 72 632 Q 103 687 160 717 Q 218 747 295 747 Q 448 747 508 654 Q 569 562 569 386 Q 569 189 510 92 Q 452 -5 310 -5 Q 233 -5 178 26 Q 122 58 92 110 Q 63 161 59 221 L 242 221 Q 254 153 316 153 Z M 379 497 Q 379 537 358 557 Q 338 577 302 577 Q 266 577 246 556 Q 225 536 225 498 Q 225 463 246 442 Q 266 421 304 421 Q 339 421 359 442 Q 379 462 379 497 Z"},"A":{"w":755,"d":"M 502 115 L 252 115 L 214 0 L 8 0 L 265 705 L 491 705 L 747 0 L 540 0 Z M 453 265 L 377 493 L 302 265 Z"},"B":{"w":671,"d":"M 641 192 Q 641 102 579 51 Q 517 0 405 0 L 56 0 L 56 705 L 394 705 Q 502 705 564 657 Q 625 609 625 522 Q 625 460 592 418 Q 560 377 506 362 Q 568 348 604 300 Q 641 253 641 192 Z M 252 425 L 351 425 Q 425 425 425 486 Q 425 549 351 549 L 252 549 Z M 440 220 Q 440 252 420 269 Q 401 286 365 286 L 252 286 L 252 158 L 366 158 Q 440 158 440 220 Z"},"C":{"w":758,"d":"M 383 712 Q 515 712 605 642 Q 695 571 721 450 L 510 450 Q 491 490 458 511 Q 424 532 380 532 Q 312 532 272 484 Q 231 435 231 354 Q 231 272 272 224 Q 312 175 380 175 Q 424 175 458 196 Q 491 217 510 257 L 721 257 Q 695 136 605 66 Q 515 -5 383 -5 Q 279 -5 199 40 Q 119 86 76 168 Q 32 249 32 354 Q 32 458 76 540 Q 119 621 199 666 Q 279 712 383 712 Z"},"D":{"w":735,"d":"M 703 353 Q 703 251 658 171 Q 612 91 528 46 Q 445 0 335 0 L 56 0 L 56 705 L 335 705 Q 446 705 530 660 Q 613 616 658 536 Q 703 456 703 353 Z M 504 353 Q 504 440 455 488 Q 406 535 320 535 L 252 535 L 252 173 L 320 173 Q 406 173 455 220 Q 504 267 504 353 Z"},"E":{"w":548,"d":"M 252 548 L 252 433 L 477 433 L 477 284 L 252 284 L 252 157 L 507 157 L 507 0 L 56 0 L 56 705 L 507 705 L 507 548 Z"},"F":{"w":561,"d":"M 534 705 L 534 549 L 252 549 L 252 425 L 460 425 L 460 276 L 252 276 L 252 0 L 56 0 L 56 705 Z"},"G":{"w":757,"d":"M 506 473 Q 489 501 460 516 Q 430 531 390 531 Q 316 531 274 483 Q 231 435 231 354 Q 231 263 276 216 Q 322 168 409 168 Q 512 168 556 261 L 359 261 L 359 402 L 725 402 L 725 212 Q 702 156 658 107 Q 613 58 545 26 Q 477 -5 390 -5 Q 284 -5 202 40 Q 121 86 76 168 Q 32 249 32 354 Q 32 458 76 540 Q 121 621 202 666 Q 283 712 389 712 Q 522 712 609 648 Q 696 584 717 473 Z"},"H":{"w":743,"d":"M 687 705 L 687 0 L 491 0 L 491 283 L 252 283 L 252 0 L 56 0 L 56 705 L 252 705 L 252 440 L 491 440 L 491 705 Z"},"I":{"w":308,"d":"M 252 705 L 252 0 L 56 0 L 56 705 Z"},"J":{"w":584,"d":"M 523 705 L 523 238 Q 523 119 458 56 Q 394 -7 281 -7 Q 161 -7 90 60 Q 18 127 18 253 L 212 253 Q 213 170 273 170 Q 327 170 327 238 L 327 705 Z"},"K":{"w":726,"d":"M 473 0 L 252 309 L 252 0 L 56 0 L 56 705 L 252 705 L 252 401 L 471 705 L 697 705 L 438 363 L 710 0 Z"},"L":{"w":491,"d":"M 252 150 L 471 150 L 471 0 L 56 0 L 56 705 L 252 705 Z"},"M":{"w":935,"d":"M 879 705 L 879 0 L 683 0 L 683 389 L 550 0 L 386 0 L 252 392 L 252 0 L 56 0 L 56 705 L 293 705 L 470 247 L 643 705 Z"},"N":{"w":765,"d":"M 709 0 L 513 0 L 252 394 L 252 0 L 56 0 L 56 705 L 252 705 L 513 306 L 513 705 L 709 705 Z"},"O":{"w":787,"d":"M 32 355 Q 32 459 80 542 Q 129 624 212 670 Q 295 716 394 716 Q 494 716 576 670 Q 659 624 707 542 Q 755 459 755 355 Q 755 251 707 168 Q 659 86 576 40 Q 493 -7 394 -7 Q 295 -7 212 40 Q 129 86 80 168 Q 32 251 32 355 Z M 556 355 Q 556 439 512 488 Q 469 536 394 536 Q 318 536 275 488 Q 232 439 232 355 Q 232 272 275 224 Q 318 175 394 175 Q 469 175 512 224 Q 556 273 556 355 Z"},"P":{"w":636,"d":"M 349 238 L 252 238 L 252 0 L 56 0 L 56 705 L 349 705 Q 434 705 494 675 Q 553 645 583 592 Q 613 539 613 470 Q 613 406 584 354 Q 554 301 494 270 Q 435 238 349 238 Z M 413 470 Q 413 547 330 547 L 252 547 L 252 394 L 330 394 Q 413 394 413 470 Z"},"Q":{"w":788,"d":"M 539 -118 L 461 -1 Q 428 -7 394 -7 Q 295 -7 212 40 Q 129 86 80 168 Q 32 251 32 355 Q 32 459 80 542 Q 129 624 212 670 Q 295 716 394 716 Q 494 716 576 670 Q 659 624 707 542 Q 755 459 755 355 Q 755 268 720 194 Q 685 121 624 72 L 773 -118 Z M 394 175 Q 469 175 512 224 Q 556 273 556 355 Q 556 439 512 488 Q 469 536 394 536 Q 318 536 275 488 Q 232 439 232 355 Q 232 272 275 224 Q 318 175 394 175 Z"},"R":{"w":661,"d":"M 413 0 L 273 260 L 252 260 L 252 0 L 56 0 L 56 705 L 365 705 Q 450 705 509 676 Q 568 646 598 594 Q 628 543 628 479 Q 628 407 588 352 Q 549 298 473 275 L 632 0 Z M 252 394 L 349 394 Q 389 394 409 413 Q 429 432 429 468 Q 429 502 408 522 Q 388 541 349 541 L 252 541 Z"},"S":{"w":620,"d":"M 35 219 L 244 219 Q 247 182 266 165 Q 285 148 315 148 Q 342 148 360 162 Q 377 175 377 199 Q 377 230 348 247 Q 319 264 254 285 Q 185 308 142 330 Q 100 351 68 392 Q 37 434 37 501 Q 37 569 71 618 Q 105 666 165 691 Q 225 716 301 716 Q 424 716 498 658 Q 571 601 576 497 L 363 497 Q 362 529 344 545 Q 325 561 296 561 Q 274 561 260 548 Q 246 535 246 511 Q 246 491 262 476 Q 277 462 300 452 Q 323 441 368 425 Q 435 402 478 380 Q 522 357 554 316 Q 585 276 585 214 Q 585 151 554 101 Q 522 51 462 22 Q 403 -7 322 -7 Q 199 -7 120 52 Q 41 110 35 219 Z"},"T":{"w":604,"d":"M 587 705 L 587 549 L 399 549 L 399 0 L 203 0 L 203 549 L 17 549 L 17 705 Z"},"U":{"w":712,"d":"M 248 705 L 248 296 Q 248 239 274 208 Q 301 177 355 177 Q 409 177 436 208 Q 464 240 464 296 L 464 705 L 660 705 L 660 296 Q 660 199 619 130 Q 578 62 508 28 Q 437 -7 351 -7 Q 265 -7 198 28 Q 130 62 92 130 Q 53 198 53 296 L 53 705 Z"},"V":{"w":747,"d":"M 742 705 L 499 0 L 248 0 L 4 705 L 214 705 L 374 196 L 533 705 Z"},"W":{"w":1076,"d":"M 1049 705 L 876 0 L 635 0 L 538 432 L 439 0 L 198 0 L 27 705 L 239 705 L 321 223 L 432 705 L 647 705 L 755 227 L 837 705 Z"},"X":{"w":739,"d":"M 497 0 L 360 199 L 243 0 L 20 0 L 249 361 L 12 705 L 243 705 L 376 511 L 490 705 L 713 705 L 487 350 L 728 0 Z"},"Y":{"w":701,"d":"M 697 705 L 449 224 L 449 0 L 252 0 L 252 224 L 4 705 L 228 705 L 352 433 L 476 705 Z"},"Z":{"w":613,"d":"M 270 159 L 563 159 L 563 0 L 50 0 L 50 149 L 340 547 L 50 547 L 50 705 L 563 705 L 563 556 Z"},"'":{"w":243,"d":"M 200 802 L 188 574 L 56 574 L 42 802 Z"},"-":{"w":578,"d":""},",":{"w":314,"d":"M 267 168 L 160 -124 L 36 -124 L 88 168 Z"},".":{"w":301,"d":"M 36 93 Q 36 137 68 166 Q 99 195 151 195 Q 202 195 234 166 Q 265 137 265 93 Q 265 50 234 21 Q 202 -8 151 -8 Q 99 -8 68 20 Q 36 49 36 93 Z"}}};

  /* ---------- milestones and the words that go with them ---------- */
  const MILESTONES = [1, 2, 3, 7, 10, 15, 30, 60, 100, 150, 200, 250, 300, 365, 500, 730, 1000];
  const isMilestone = d => MILESTONES.includes(d) || (d > 1000 && d % 365 === 0);
  const nextMilestone = d => MILESTONES.find(m => m > d) || (Math.floor(d / 365) + 1) * 365;
  const tierOf = d => d >= 365 ? "legend" : d >= 100 ? "diamond" : d >= 30 ? "platinum" : d >= 7 ? "gold" : "jade";
  const TIERS = {
    jade:     { name: "Jade medal",     base: 0x0d553b, bm: .5,  br: .3,  relief: 0xf2c45c, glow: "#35c48a" },
    gold:     { name: "Gold medal",     base: 0x16181d, bm: .85, br: .34, relief: 0xf5c75e, glow: "#f5c542" },
    platinum: { name: "Platinum medal", base: 0x111c33, bm: .75, br: .3,  relief: 0xe9eef6, glow: "#9fc3ff" },
    diamond:  { name: "Diamond medal",  base: 0x071e29, bm: .7,  br: .22, relief: 0xaee8ff, glow: "#6fd6ff" },
    legend:   { name: "Legend medal",   base: 0x290d3a, bm: .65, br: .28, relief: 0xffd46e, glow: "#c77dff" },
  };
  const RARE_TIER = { Common: "jade", Rare: "gold", Epic: "platinum", Legendary: "legend" };
  const LINES = {
    1: "Starting is the hardest part, and you just did it. Welcome to Jamals Global. Day 1!",
    2: "Day 2. Coming back is how champions are made.",
    3: "Three days in a row. At Jamals Global, this is where habits begin.",
    7: "A full week! Admissions officers notice one thing above all: consistency.",
    10: "Double digits! Ten days closer to your dream university.",
    15: "Fifteen days of focus. Half a month of real progress.",
    30: "30 days! A whole month of discipline. Jamals Global is proud of you.",
    60: "60 days. This isn't motivation anymore. It's who you are.",
    100: "100 days! Welcome to the Jamals Global 100 Club.",
    150: "150 days. Your future self is already thanking you.",
    200: "200 days of showing up. That's what global students do.",
    250: "250 days. Few students ever get here. You did.",
    300: "300 days. The road to MIT is built one day at a time, and you've built 300.",
    365: "One full year with Jamals Global, every single day. Legendary.",
    500: "500 days. You're an inspiration to every student here.",
    730: "Two years without missing a day. Jamals Global salutes you.",
    1000: "1,000 days. There are no words. Only respect.",
  };
  const lineFor = d => LINES[d] || `${d.toLocaleString("en-US")} days in a row. The world is waiting for students like you.`;
  const ACH_LINE = { Common: "A great first step. Jamals Global is proud of you.", Rare: "Not everyone earns this one. Well done!",
    Epic: "Epic! This is the kind of story universities remember.", Legendary: "Legendary. The whole Jamals Global family celebrates you." };

  /* ---------- memory: a medal is celebrated once ---------- */
  const KEY = "jia.medals";
  let saved = {}; try { saved = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { saved = {}; }
  saved.seen = saved.seen || {};
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) {} };
  const league = () => window.JIA_league || null;
  const streakNow = () => league() ? league().ME.streak : 0;

  function norm(ev) {
    if (ev.days) {
      const d = ev.days;
      return { kind: "streak", days: d, key: `s${d}`, tier: tierOf(d), kicker: "Streak medal", title: `DAY ${d.toLocaleString("en-US")}`, line: lineFor(d), force: !!ev.force };
    }
    const A = window.JIA_ach, a = (A && A.list.find(x => x.id === ev.id)) || ev, rare = a.rare || "Rare";
    return { kind: "ach", id: a.id, key: `a:${a.id}`, tier: RARE_TIER[rare] || "gold", rare, kicker: "Achievement unlocked", title: a.name, name: a.name,
      img: ev.img || (A && A.img(a.obj)) || "", desc: a.desc || a.need || "", no: a.no, line: ACH_LINE[rare] || ACH_LINE.Rare, force: !!ev.force };
  }

  /* ---------- the queue: one ceremony at a time, never on top of the day's letter ---------- */
  const Q = []; let cur = null, holdUntil = 0, pumpT = 0;
  function celebrate(raw) {
    const ev = norm(raw || {});
    if (!ev.force && saved.seen[ev.key]) return;
    if (ev.kind === "ach" && /^streak\d+$/.test(ev.id)) {                  // "7 days" and "7-day streak": one ceremony
      const d = +ev.id.slice(6), s = (cur && cur.kind === "streak" && cur.days === d) ? cur : Q.find(x => x.kind === "streak" && x.days === d);
      if (s) { s.also = ev.name; if (s === cur) paintAlso(s); saved.seen[ev.key] = 1; persist(); return; }
    }
    if (Q.some(x => x.key === ev.key) || (cur && cur.key === ev.key)) return;
    Q.push(ev); pump();
  }
  window.JIA_celebrate = celebrate;
  let letterWait = null;                                                   // after a study day: the letter arrives and is read first
  const ltEl = $("lt-layer");
  const blocked = () => {
    if (ltEl && !ltEl.hidden) { if (letterWait) letterWait.seen = true; return true; }   // the letter is open
    if (letterWait) {
      if (letterWait.seen) { letterWait = null; holdUntil = Math.max(holdUntil, Date.now() + 700); }   // just closed: a breath, then the medal
      else if (Date.now() < letterWait.until) return true;                 // the envelope is still on its way
      else letterWait = null;                                              // no letter came: never wait forever
    }
    return Date.now() < holdUntil;
  };
  if (ltEl) new MutationObserver(() => { if (!ltEl.hidden && letterWait) letterWait.seen = true; if (ltEl.hidden && Q.length) pump(); })
    .observe(ltEl, { attributes: true, attributeFilter: ["hidden"] });
  function pump() {
    clearTimeout(pumpT);
    if (cur || !Q.length) return;
    if (blocked()) { pumpT = setTimeout(pump, 500); return; }
    open(Q.shift());
  }

  /* ---------- sounds (they follow Settings) ---------- */
  let actx = null;
  function tone(f, d, type, vol, when) {
    if (window.JIA_SETTINGS && window.JIA_SETTINGS.sounds === false) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const t = actx.currentTime + (when || 0), o = actx.createOscillator(), g = actx.createGain();
      o.type = type || "sine"; o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(vol || .06, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
      o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + d + .02);
    } catch (e) {}
  }
  const fanfare = () => { [523, 659, 784, 1046, 1318].forEach((f, k) => tone(f, .32, "triangle", .06, .05 + k * .1)); [2093, 2637, 3136].forEach((f, k) => tone(f, .5, "sine", .025, .65 + k * .09)); };

  /* ---------- the ceremony screen ---------- */
  const view = $("md-view"), stage = $("md-stage"), sheet = $("md-sheet");
  let lastFocus = null;
  function paintAlso(ev) { const el = $("md-also"); el.hidden = !ev.also; if (ev.also) el.textContent = `🏆 Achievement unlocked: ${ev.also}`; }
  function paintPath(ev) {
    const el = $("md-path");
    if (ev.kind !== "streak") {
      el.innerHTML = `<p class="md-desc">${esc(ev.desc)}${ev.no ? `<span>#${Number(ev.no).toLocaleString("en-US")}${window.JG_ENGINE ? "" : " of 5,000 students"}</span>` : ""}</p>`; /* JG-PROD: owner 4 Oct R12 + m1 league (20 Oct 2026), no invented serial or "of 5,000 students" for a real student: the server's serial when it issued the award (public/runtime/jg-league.js) */
      return;
    }
    const d = ev.days, list = MILESTONES.includes(d) ? MILESTONES : [...MILESTONES, d].sort((a, b) => a - b), i = list.indexOf(d);
    const from = Math.max(0, Math.min(i - 2, list.length - 5)), row = list.slice(from, from + 5), nx = nextMilestone(d);
    el.innerHTML = `<div class="md-steps" aria-hidden="true">${row.map(m => `<span class="${m < d ? "done" : m === d ? "now" : ""}">${m}</span>`).join("<i></i>")}</div>
      <p class="md-next">Next medal: day ${nx.toLocaleString("en-US")} · ${(nx - d).toLocaleString("en-US")} ${nx - d === 1 ? "day" : "days"} to go</p>`;
  }
  function open(ev) {
    cur = ev; stories = null;
    if (!ev.force) { saved.seen[ev.key] = 1; persist(); }
    lastFocus = document.activeElement;
    view.className = `md-view t-${ev.tier}`;
    $("md-kicker").textContent = ev.kicker;
    $("md-tier").textContent = ev.kind === "streak" ? TIERS[ev.tier].name : `${ev.rare} · ${TIERS[ev.tier].name}`;
    $("md-title").textContent = ev.title; $("md-title").classList.toggle("long", ev.title.length > 12);
    $("md-line").textContent = ev.line; paintAlso(ev); paintPath(ev);
    view.style.zIndex = z(); view.hidden = false; void view.offsetWidth; view.classList.add("in");
    fanfare(); try { if (navigator.vibrate) navigator.vibrate([16, 50, 24]); } catch (e) {}
    requestAnimationFrame(() => setTimeout(() => { if (cur === ev) start3D(ev); }, 140));   // the words start first; building the 3D medal can keep the page busy
    setTimeout(() => $("md-done").focus({ preventScroll: true }), 80);
  }
  function close() {
    if (view.hidden) return;
    stop3D(); closeSheet(true); view.hidden = true; view.classList.remove("in");
    cur = null; stories = null;
    if (lastFocus && document.contains(lastFocus) && !lastFocus.closest("[hidden]")) lastFocus.focus({ preventScroll: true });
    setTimeout(pump, 450);
  }
  $("md-done").addEventListener("click", close);
  $("md-share").addEventListener("click", () => openSheet());
  $("md-wear").addEventListener("click", () => { if (window.JIA_AR) window.JIA_AR.open(); });
  view.addEventListener("keydown", e => {
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); if (!sheet.hidden) closeSheet(); else close(); }
    else if (e.key === "Tab") {                                            // keep focus inside the ceremony
      const box = !sheet.hidden ? sheet : view, f = [...box.querySelectorAll("button:not([hidden]):not(:disabled)")].filter(b => !b.closest("[hidden]"));
      if (!f.length) return; const i = f.indexOf(document.activeElement);
      e.preventDefault(); f[(i + (e.shiftKey ? f.length - 1 : 1) + f.length) % f.length].focus();
    }
  });

  /* ---------- the medal, in real 3D ---------- */
  const THREE_URL = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
  let threeP = null, E = null, gen = 0;
  const loadThree = () => threeP || (threeP = new Promise((res, rej) => {
    if (window.THREE) { res(window.THREE); return; }
    const s = document.createElement("script"); s.src = THREE_URL; s.async = true;
    s.onload = () => window.THREE ? res(window.THREE) : rej(new Error("three")); s.onerror = () => { threeP = null; rej(new Error("three")); };
    document.head.appendChild(s); setTimeout(() => rej(new Error("timeout")), 12000);
  }));
  async function start3D(ev) {
    const my = ++gen; if (window.JG_MOTION && JG_MOTION.reduced()) { flat(ev); return; }   /* JG-PROD: owner 4 Oct R7, under Reduce motion the design's own flat medal: no three.js download, no WebGL */
    $("md-gl").hidden = false; $("md-flat").hidden = true; stage.classList.remove("flat");
    try {
      const THREE = await loadThree(); if (my !== gen || !cur) return;
      if (!E) E = makeEngine(THREE);
      E.show(ev);
    } catch (err) { if (my === gen && cur) flat(ev); }
  }
  function stop3D() { gen++; if (E) E.stop(); flatStop(); }

  function makeEngine(THREE) {
    const canvas = $("md-gl");
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.12;
    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(30, 1, .1, 60); camera.position.set(0, 0, 6.6);
    const lin = hex => new THREE.Color(hex).convertSRGBToLinear();
    // studio reflections, built on the fly (soft boxes around the medal)
    const pm = new THREE.PMREMGenerator(renderer), env = new THREE.Scene();
    env.add(new THREE.Mesh(new THREE.SphereGeometry(20, 32, 16), new THREE.MeshBasicMaterial({ color: 0x06080a, side: THREE.BackSide })));
    const panel = (w, h, col, k, x, y, zz) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(k), side: THREE.DoubleSide })); m.position.set(x, y, zz); m.lookAt(0, 0, 0); env.add(m); };
    panel(9, 3, 0xffffff, 4, 0, 7, 4); panel(2.2, 11, 0xffe6bf, 2.8, -7, .5, 3); panel(2.2, 11, 0xd2e4ff, 1.9, 7, 0, 1); panel(7, 2, 0xffffff, 1.2, 0, -7, 5); panel(4, 4, 0xfff3da, 1.5, 0, 1, 9);
    scene.environment = pm.fromScene(env, .04).texture; pm.dispose();
    const key = new THREE.DirectionalLight(0xffffff, 1.1); key.position.set(2, 3, 5); scene.add(key);
    const rim = new THREE.DirectionalLight(0xffe0a8, .9); rim.position.set(-3, 1.5, -4); scene.add(rim);
    // a soft glow behind the medal
    const gc = document.createElement("canvas"); gc.width = gc.height = 256;
    const gx = gc.getContext("2d"), rg = gx.createRadialGradient(128, 128, 0, 128, 128, 128);
    rg.addColorStop(0, "rgba(255,255,255,.95)"); rg.addColorStop(.3, "rgba(255,255,255,.3)"); rg.addColorStop(1, "rgba(255,255,255,0)"); gx.fillStyle = rg; gx.fillRect(0, 0, 256, 256);
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 5.4), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(gc), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .6 }));
    glow.position.z = -1.4; scene.add(glow);
    // gold confetti: real little metal flakes
    const N = reduce ? 1 : 170, flakes = new THREE.InstancedMesh(new THREE.PlaneGeometry(.055, .095), new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: .28, side: THREE.DoubleSide }), N);
    const pal = [0xf5c542, 0xffe08a, 0xd99a1b, 0xfff1c9].map(lin), P = [], dummy = new THREE.Object3D();
    for (let i = 0; i < N; i++) { P.push({}); flakes.setColorAt(i, pal[i % 4]); }
    if (flakes.instanceColor) flakes.instanceColor.needsUpdate = true;
    flakes.visible = !reduce; scene.add(flakes);
    const spawn = (p, first) => { p.x = (Math.random() - .5) * 5.4; p.y = first ? 2.3 + Math.random() * 4.2 : 3.3 + Math.random() * 1.2; p.z = Math.random() < .55 ? .6 + Math.random() * 1.6 : -.6 - Math.random() * 1.8;
      p.vy = -(.55 + Math.random() * .75); p.vx = (Math.random() - .5) * .3; p.r = [Math.random() * 6, Math.random() * 6, Math.random() * 6]; p.s = [(Math.random() - .5) * 9, (Math.random() - .5) * 9, (Math.random() - .5) * 5]; p.on = true; };
    // text: glyph outlines, extruded
    function textGeo(str, size, depth, track) {
      const shapes = [], s = size / G.upm; let x = 0;
      for (const ch of str) {
        if (ch === " ") { x += G.upm * .3 + (track || 0); continue; }
        const g = G.g[ch]; if (!g) continue;
        const sp = new THREE.ShapePath(), t = g.d.split(" "); let i = 0;
        const X = () => (+t[i++] + x) * s, Y = () => +t[i++] * s;
        while (i < t.length) {
          const c = t[i++];
          if (c === "M") sp.moveTo(X(), Y()); else if (c === "L") sp.lineTo(X(), Y());
          else if (c === "Q") { const a = X(), b = Y(); sp.quadraticCurveTo(a, b, X(), Y()); }
          else if (c === "C") { const a = X(), b = Y(), c2 = X(), d2 = Y(); sp.bezierCurveTo(a, b, c2, d2, X(), Y()); }
        }
        shapes.push(...sp.toShapes(false));
        x += g.w + (track || 0);
      }
      const geo = new THREE.ExtrudeGeometry(shapes, { depth, bevelEnabled: true, bevelThickness: depth * .45, bevelSize: size * .014, bevelSegments: 3, curveSegments: 10 });
      geo.computeBoundingBox(); const b = geo.boundingBox; geo.translate(-(b.max.x + b.min.x) / 2, -(b.max.y + b.min.y) / 2, 0);
      return geo;
    }
    const pill = (w, h, P2) => { const r = w / 2, s = P2 || new THREE.Shape(); s.moveTo(-r, -h / 2 + r); s.lineTo(-r, h / 2 - r); s.absarc(0, h / 2 - r, r, Math.PI, 0, true); s.lineTo(r, -h / 2 + r); s.absarc(0, -h / 2 + r, r, 0, Math.PI, true); return s; };
    let medal = null, trash = [], ready = false, running = false, raf = 0, t0 = 0, last = 0, ang = 0, vel = 0, drag = false, lx = 0, lt = 0, burstUntil = 0;
    const W = 1.36, H = 2.14, D = .2, BT = .07, FRONT = D / 2 + BT;
    function build(ev) {
      trash.forEach(o => o.dispose && o.dispose()); trash = [];
      if (medal) scene.remove(medal);
      const T = TIERS[ev.tier], keep = o => (trash.push(o), o);
      const baseMat = keep(new THREE.MeshPhysicalMaterial({ color: lin(T.base), metalness: T.bm, roughness: T.br, clearcoat: .6, clearcoatRoughness: .25 }));
      const gold = keep(new THREE.MeshStandardMaterial({ color: lin(T.relief), metalness: 1, roughness: .24 }));
      const g = new THREE.Group();
      g.add(new THREE.Mesh(keep(new THREE.ExtrudeGeometry(pill(W, H), { depth: D, bevelEnabled: true, bevelThickness: BT, bevelSize: .06, bevelSegments: 10, curveSegments: 72 })).translate(0, 0, -D / 2), baseMat));
      const ring = pill(W - .1, H - .1); ring.holes.push(pill(W - .24, H - .24, new THREE.Path()));
      const rimGeo = keep(new THREE.ExtrudeGeometry(ring, { depth: .02, bevelEnabled: true, bevelThickness: .016, bevelSize: .012, bevelSegments: 3, curveSegments: 72 }));
      const rimF = new THREE.Mesh(rimGeo, gold); rimF.position.z = FRONT - .012; g.add(rimF);
      const rimB = new THREE.Mesh(rimGeo, gold); rimB.rotation.y = Math.PI; rimB.position.z = -FRONT + .012; g.add(rimB);
      const put = (geo, y, back) => { const m = new THREE.Mesh(keep(geo), gold); m.position.set(0, y, back ? -FRONT + .01 : FRONT - .01); if (back) m.rotation.y = Math.PI; g.add(m); return m; };
      if (ev.kind === "streak") {
        const n = String(ev.days), size = [0, .98, .8, .6, .44][Math.min(4, n.length)];
        put(textGeo(ev.days === 1 ? "DAY" : "DAYS", .19, .035, 60), .6);
        const ng = textGeo(n, size, .06, 10); ng.computeBoundingBox();
        const nw = ng.boundingBox.max.x - ng.boundingBox.min.x; if (nw > .9) ng.scale(.9 / nw, .9 / nw, 1);    // wide numbers never touch the rim
        put(ng, -.13);
      } else {
        const disc = new THREE.Mesh(keep(new THREE.CircleGeometry(.5, 64)), keep(new THREE.MeshStandardMaterial({ color: lin(T.glow).multiplyScalar(.55), metalness: .3, roughness: .45 })));
        disc.position.set(0, .02, FRONT + .004); g.add(disc);
        const halo = new THREE.Mesh(keep(new THREE.TorusGeometry(.52, .028, 16, 96)), gold); halo.position.set(0, .02, FRONT + .01); g.add(halo);
        if (ev.img) {
          const tex = keep(new THREE.TextureLoader().load(ev.img)); tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 4;
          const st = new THREE.Mesh(keep(new THREE.PlaneGeometry(.9, .9)), keep(new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: .04, metalness: 0, roughness: .55 })));
          st.position.set(0, .03, FRONT + .03); g.add(st);
        }
        put(textGeo(ev.rare.toUpperCase(), .11, .03, 70), .74);
        put(textGeo("MEDAL", .1, .025, 90), -.74);
      }
      put(textGeo("JAMALS", .2, .03, 20), .3, true);
      put(textGeo("GLOBAL", .2, .03, 20), 0, true);
      put(textGeo(ev.kind === "streak" ? "STREAK" : "ACHIEVEMENT", .085, .02, 80), -.42, true);
      glow.material.color = new THREE.Color(T.glow);
      medal = g; scene.add(g); ready = true;
    }
    function size() {
      const r = canvas.parentElement.getBoundingClientRect(); if (!r.width || !r.height) return;
      renderer.setSize(r.width, r.height, false); camera.aspect = r.width / r.height;
      camera.position.z = Math.max(6.2, 2.3 / Math.min(1, camera.aspect) + 3.9); camera.updateProjectionMatrix();
    }
    function frame(now) {
      if (!running) return;
      raf = requestAnimationFrame(frame);
      const t = (now - t0) / 1000, dt = Math.min(.05, Math.max(0, (now - last) / 1000) || .016); last = now;
      const k = reduce ? 1 : Math.min(1, t / 1.1), e = 1 - Math.pow(1 - k, 3);
      medal.scale.setScalar(reduce ? 1 : (.3 + .7 * e) * (1 + Math.sin(k * Math.PI) * .1));
      const base = reduce ? .35 : 1.05;
      if (!drag) { vel += (base - vel) * Math.min(1, dt * 1.4); ang += vel * dt; }
      medal.rotation.y = ang - (1 - e) * Math.PI * 2.2;
      medal.rotation.x = Math.sin(t * .8) * .06; medal.position.y = Math.sin(t * 1.3) * .05 + .05;
      glow.material.opacity = .5 + Math.sin(t * 1.9) * .1; glow.scale.setScalar(.9 + e * .15);
      if (!reduce) {
        for (let i = 0; i < N; i++) {
          const p = P[i];
          if (p.on) { p.y += p.vy * dt; p.x += p.vx * dt + Math.sin(t * 2 + i) * .002; p.r[0] += p.s[0] * dt; p.r[1] += p.s[1] * dt; p.r[2] += p.s[2] * dt; if (p.y < -3.4) { if (now < burstUntil) spawn(p, false); else p.on = false; } }
          dummy.position.set(p.x, p.on ? p.y : -99, p.z); dummy.rotation.set(p.r[0], p.r[1], p.r[2]); dummy.updateMatrix(); flakes.setMatrixAt(i, dummy.matrix);
        }
        flakes.instanceMatrix.needsUpdate = true;
      }
      renderer.render(scene, camera);
    }
    stage.addEventListener("pointerdown", e => { if (!running) return; drag = true; lx = e.clientX; lt = performance.now(); stage.classList.add("grab"); try { stage.setPointerCapture(e.pointerId); } catch (err) {} });
    stage.addEventListener("pointermove", e => { if (!drag) return; const now = performance.now(), dx = e.clientX - lx; ang += dx * .013; vel = dx * .013 / Math.max(.016, (now - lt) / 1000); lx = e.clientX; lt = now; });
    const up = () => { drag = false; stage.classList.remove("grab"); vel = Math.max(-9, Math.min(9, vel)); };
    stage.addEventListener("pointerup", up); stage.addEventListener("pointercancel", up);
    window.addEventListener("resize", () => { if (running) size(); });
    return {
      get ready() { return ready; },
      show(ev) {
        build(ev); size(); P.forEach(p => spawn(p, true)); burstUntil = performance.now() + 6500;
        ang = -.35; vel = reduce ? .35 : 3.2; t0 = last = performance.now();
        if (!running) { running = true; raf = requestAnimationFrame(frame); }
      },
      stop() { running = false; cancelAnimationFrame(raf); },
      pause() { running = false; cancelAnimationFrame(raf); },
      resume() { if (running || !medal) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame); },
      arStart() { running = false; cancelAnimationFrame(raf); flakes.visible = false; glow.visible = false; },
      arEnd() { flakes.visible = !reduce; glow.visible = true; },
      arPose(rx, ry) { medal.rotation.set(rx, ry, 0); medal.position.y = 0; medal.scale.setScalar(1); renderer.render(scene, camera); return canvas; },
      arFrac() { return (H + 2 * BT) / (2 * camera.position.z * Math.tan(camera.fov * Math.PI / 360)); },
      snap() {                                                              // a still of the medal for the story
        const s = { rx: medal.rotation.x, ry: medal.rotation.y, py: medal.position.y, sc: medal.scale.x };
        medal.rotation.set(-.06, -.42, 0); medal.position.y = 0; medal.scale.setScalar(1); flakes.visible = false; glow.visible = false;
        const ex = renderer.toneMappingExposure; renderer.toneMappingExposure = 1.4;          // a touch brighter for the story
        renderer.render(scene, camera); const url = canvas.toDataURL("image/png"); renderer.toneMappingExposure = ex;
        medal.rotation.set(s.rx, s.ry, 0); medal.position.y = s.py; medal.scale.setScalar(s.sc); flakes.visible = !reduce; glow.visible = true;
        return url;
      },
    };
  }

  /* ---------- no WebGL? a flat medal that still turns ---------- */
  function drawFlat(c, ev, w, h) {
    const g = c.getContext("2d"), T = TIERS[ev.tier]; c.width = w; c.height = h; g.clearRect(0, 0, w, h);
    const mw = Math.min(w * .5, h * .42), mh = mw * H0, x = (w - mw) / 2, y = (h - mh) / 2, r = mw / 2;
    const path = (i) => { g.beginPath(); g.moveTo(x + i, y + r); g.arc(x + r, y + r, r - i, Math.PI, 0); g.lineTo(x + mw - i, y + mh - r); g.arc(x + r, y + mh - r, r - i, 0, Math.PI); g.closePath(); };
    const hex = n => "#" + n.toString(16).padStart(6, "0"), gold = hex(T.relief);
    const bg = g.createLinearGradient(x, y, x + mw, y + mh); bg.addColorStop(0, shade(hex(T.base), 40)); bg.addColorStop(.5, hex(T.base)); bg.addColorStop(1, shade(hex(T.base), -20));
    g.shadowColor = "rgba(0,0,0,.5)"; g.shadowBlur = 30; g.shadowOffsetY = 14; path(0); g.fillStyle = bg; g.fill(); g.shadowColor = "transparent";
    g.lineWidth = mw * .035; g.strokeStyle = gold; path(mw * .05); g.stroke();
    const gg = g.createLinearGradient(0, y, 0, y + mh); gg.addColorStop(0, "#fff4d0"); gg.addColorStop(.5, gold); gg.addColorStop(1, shade(gold, -30)); g.fillStyle = gg; g.textAlign = "center"; g.textBaseline = "middle";
    if (ev.kind === "streak") {
      const n = String(ev.days); g.font = `700 ${mw * .15}px Raleway, sans-serif`; g.fillText(ev.days === 1 ? "D A Y" : "D A Y S", w / 2, y + mh * .22);
      g.font = `700 ${mw * [0, .78, .62, .46, .36][Math.min(4, n.length)]}px Raleway, sans-serif`; g.fillText(n, w / 2, y + mh * .56);
    } else if (flatImg) { const s = mw * .72; g.drawImage(flatImg, w / 2 - s / 2, y + mh / 2 - s / 2, s, s); }
  }
  const H0 = 2.14 / 1.36;
  let flatImg = null;
  function shade(hex, p) { const n = parseInt(hex.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(v + p * 2.55))); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; }
  async function flat(ev) {
    const c = $("md-flat"); $("md-gl").hidden = true; c.hidden = false; stage.classList.add("flat");
    flatImg = ev.img ? await loadImg(ev.img).catch(() => null) : null;
    const r = stage.getBoundingClientRect(), k = Math.min(2, window.devicePixelRatio || 1);
    drawFlat(c, ev, Math.round(r.width * k), Math.round(r.height * k));
  }
  function flatStop() {}
  const flatURL = ev => { const c = document.createElement("canvas"); drawFlat(c, ev, 800, 800); return c.toDataURL("image/png"); };

  /* ---------- the story picture: 1080 × 1920, three looks ---------- */
  const STYLES = [["night", "Night gold"], ["jade", "Jade"], ["photo", "My photo"]];
  let stories = null, pick = 0, ext = null;                                 // ext: a story from outside a ceremony (Your Week)
  const loadImg = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  const photoURL = () => { const m = /url\(["']?([^"')]+)["']?\)/.exec(getComputedStyle(document.querySelector(".avatar") || document.body).getPropertyValue("--photo") || ""); return m ? m[1] : ""; };
  const hexA = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
  function spaced(g, text, x, y, gap) {                                  // letter-spaced line, centred on x
    const ws = [...text].map(ch => g.measureText(ch).width), total = ws.reduce((a, b) => a + b, 0) + gap * (ws.length - 1);
    let cx = x - total / 2; const al = g.textAlign; g.textAlign = "left";
    [...text].forEach((ch, i) => { g.fillText(ch, cx, y); cx += ws[i] + gap; }); g.textAlign = al;
  }
  function wrap(g, text, x, y, maxW, lh, maxLines) {
    const words = text.split(" "), lines = []; let line = "";
    words.forEach(w => { const t = line ? `${line} ${w}` : w; if (g.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; });
    if (line) lines.push(line);
    lines.slice(0, maxLines).forEach((l, i) => g.fillText(l, x, y + i * lh)); return Math.min(lines.length, maxLines);
  }
  function cover(g, img, W, H) { const k = Math.max(W / img.width, H / img.height), w = img.width * k, h = img.height * k; g.drawImage(img, (W - w) / 2, (H - h) / 2, w, h); }
  function drawStory(ev, style, medal, photo) {
    const c = document.createElement("canvas"), W = 1080, H = 1920; c.width = W; c.height = H;
    const g = c.getContext("2d"), T = TIERS[ev.tier], F = (w, px) => `${w} ${px}px Raleway, system-ui, sans-serif`, MY = 760;
    if (style === "photo" && photo) {
      cover(g, photo, W, H);
      const sh = g.createLinearGradient(0, 0, 0, H); sh.addColorStop(0, "rgba(3,9,7,.62)"); sh.addColorStop(.42, "rgba(3,9,7,.38)"); sh.addColorStop(.62, "rgba(3,9,7,.82)"); sh.addColorStop(1, "rgba(3,9,7,.96)");
      g.fillStyle = sh; g.fillRect(0, 0, W, H);
    } else {
      const bg = g.createRadialGradient(W / 2, MY, 40, W / 2, MY + 200, 1350);
      if (style === "jade") { bg.addColorStop(0, "#35b27d"); bg.addColorStop(.45, "#17744e"); bg.addColorStop(1, "#062e1f"); }
      else { bg.addColorStop(0, "#2a3a32"); bg.addColorStop(.42, "#0e1512"); bg.addColorStop(1, "#030404"); }
      g.fillStyle = bg; g.fillRect(0, 0, W, H);
    }
    g.save(); g.translate(W / 2, MY);                                        // light rays
    for (let i = 0; i < 20; i++) { g.rotate(Math.PI / 10); g.beginPath(); g.moveTo(0, 0); g.lineTo(-54, -1250); g.lineTo(54, -1250); g.closePath(); g.fillStyle = style === "jade" ? "rgba(255,255,255,.045)" : "rgba(245,197,66,.05)"; g.fill(); }
    g.restore();
    const gl = g.createRadialGradient(W / 2, MY, 0, W / 2, MY, 560); gl.addColorStop(0, hexA(T.glow, .5)); gl.addColorStop(1, hexA(T.glow, 0)); g.fillStyle = gl; g.fillRect(0, MY - 560, W, 1120);
    let seed = 11; const rnd = () => (seed = seed * 16807 % 2147483647) / 2147483647;
    for (let i = 0; i < 80; i++) { g.save(); g.translate(rnd() * W, 60 + rnd() * 1560); g.rotate(rnd() * 6.3); g.globalAlpha = .3 + rnd() * .6; g.fillStyle = ["#f5c542", "#ffe08a", "#d99a1b", "#fff3cf"][i % 4]; g.fillRect(-7, -12, 14, 24); g.restore(); }
    g.globalAlpha = 1; g.textAlign = "center"; g.textBaseline = "alphabetic";
    g.fillStyle = "#f5c542"; g.font = F(700, 42); spaced(g, "JAMALS GLOBAL", W / 2, 160, 12);
    g.fillStyle = "rgba(255,255,255,.72)"; g.font = F(600, 29); spaced(g, ev.kind === "streak" ? "STUDY STREAK" : "ACHIEVEMENT UNLOCKED", W / 2, 214, 7);
    const box = 900, mw = box, mh = box * medal.height / medal.width; g.drawImage(medal, (W - mw) / 2, MY - mh / 2, mw, mh);
    const tg = g.createLinearGradient(0, 1250, 0, 1420); tg.addColorStop(0, "#fff6d6"); tg.addColorStop(1, T.glow);
    g.fillStyle = tg; const big = ev.kind === "streak" ? 150 : ev.title.length > 16 ? 76 : 96; g.font = F(700, big);
    g.fillText(ev.kind === "streak" ? `DAY ${ev.days.toLocaleString("en-US")}` : ev.title, W / 2, 1330);
    g.fillStyle = "rgba(255,255,255,.86)"; g.font = F(500, 44);
    const n = wrap(g, ev.line, W / 2, 1418, 880, 58, 3);
    const py = Math.min(1418 + n * 58 + 26, 1590);                           // who earned it, clear of the footer
    g.fillStyle = "rgba(255,255,255,.1)"; roundRect(g, W / 2 - 330, py, 660, 132, 66); g.fill();
    if (photo) { g.save(); g.beginPath(); g.arc(W / 2 - 264, py + 66, 50, 0, Math.PI * 2); g.clip(); cover2(g, photo, W / 2 - 314, py + 16, 100, 100); g.restore(); }
    g.textAlign = "left"; g.fillStyle = "#fff"; g.font = F(700, 40); g.fillText(JG_ME.fullName, W / 2 - 196, py + 60); /* JG-PROD: identity */
    g.fillStyle = "rgba(255,255,255,.7)"; g.font = F(500, 30); g.fillText(ev.kind === "streak" ? `🔥 ${ev.days}-day streak · Road to ${(window.JG_ENGINE && window.JG_ENGINE.cache.goal && window.JG_ENGINE.cache.goal.short) || "MIT"}` : `${ev.rare} · Road to ${(window.JG_ENGINE && window.JG_ENGINE.cache.goal && window.JG_ENGINE.cache.goal.short) || "MIT"}`, W / 2 - 196, py + 104); /* JG-PROD: owner 11 Oct + m1 league (20 Oct 2026), her own goal (the snapshot's, MIT only where she has named none) */
    g.textAlign = "center"; g.fillStyle = "rgba(255,255,255,.8)"; g.font = F(600, 34); g.fillText("Learn with me on Jamals Global", W / 2, H - 104);
    g.fillStyle = "#f5c542"; g.font = F(700, 30); g.fillText("#JamalsGlobal", W / 2, H - 58);
    return c;
  }
  function roundRect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function cover2(g, img, x, y, w, h) { const k = Math.max(w / img.width, h / img.height), iw = img.width * k, ih = img.height * k; g.drawImage(img, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih); }
  async function ensureStories() {
    if (stories) return stories;
    const ev = cur; if (!ev) return null;
    try { await document.fonts.ready; } catch (e) {}
    const medalURL = E && E.ready && !$("md-gl").hidden ? E.snap() : flatURL(ev);
    const [medal, photo] = await Promise.all([loadImg(medalURL), loadImg(photoURL()).catch(() => null)]);
    if (ev !== cur) return null;
    stories = STYLES.map(([st, label]) => ({ st, label, c: drawStory(ev, st, medal, photo) }));
    return stories;
  }

  /* ---------- sharing: the phone's share sheet first, a saved picture always ---------- */
  const caption = ev => ev.kind === "streak"
    ? `🔥 Day ${ev.days} of my study streak on Jamals Global! Road to ${(window.JG_ENGINE && window.JG_ENGINE.cache.goal && window.JG_ENGINE.cache.goal.short) || "MIT"}, one day at a time. #JamalsGlobal` /* JG-PROD: owner 11 Oct + m1 league (20 Oct 2026), her own goal (the snapshot's, MIT only where she has named none) */
    : `🏅 Achievement unlocked on Jamals Global: ${ev.name}! #JamalsGlobal`;
  const fname = ev => ev.kind === "streak" ? `jamals-global-day-${ev.days}.png` : `jamals-global-${ev.id}.png`;
  const link = () => /^https?:/.test(location.href) ? location.href : "https://claude.ai";
  let dlP = null;
  const downloadsCap = () => dlP || (dlP = (window.claude && typeof window.claude.use === "function") ? Promise.resolve(window.claude.use("downloads")).catch(() => null) : Promise.resolve(null));
  const blobOf = i => {                                                   // encoded right away: toBlob can wait forever while the medal renders
    const st = stories[i];
    if (!st.blob) { const bin = atob(st.c.toDataURL("image/png").split(",")[1]), a = new Uint8Array(bin.length); for (let k = 0; k < bin.length; k++) a[k] = bin.charCodeAt(k); st.blob = new Blob([a], { type: "image/png" }); }
    return Promise.resolve(st.blob);
  };
  setTimeout(downloadsCap, 1500);                                          // ready before anyone taps Save
  async function saveBlob(blob, name, say) {
    const dl = await Promise.race([downloadsCap(), new Promise(r => setTimeout(() => r(null), 1500))]);
    if (dl) {
      try { await dl.save({ filename: name, data: blob }); return true; }
      catch (e) { if (e && e.code === "declined") { say("Not saved."); return false; } if (e && e.code === "rate_limited") { say("One moment, then try again."); return false; } }
    }
    try { const a = document.createElement("a"), u = URL.createObjectURL(blob); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 5000); return true; }
    catch (e) { say("Saving isn't available here. Take a screenshot of the picture above."); return false; }
  }
  const HOW = { instagram: "Saved! In Instagram, tap + → Story and pick this picture.", telegram: "Saved! In Telegram, tap your story (or open a chat) and attach this picture.",
    whatsapp: "Saved! In WhatsApp, open Updates → Status and pick this picture.", more: "Saved! Post it anywhere you like.", save: "Saved to your photos. 🎉" };
  async function share(target, noteEl) {
    const say = m => { (noteEl || $("md-note")).textContent = m; };
    if (!(await ensureStories())) return;
    const blob = await blobOf(pick), ev = cur, text = ext ? ext.caption : caption(ev), name = ext ? ext.name : fname(ev);
    if (target !== "save") {
      let file = null; try { file = new File([blob], name, { type: "image/png" }); } catch (e) {}
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        try { await navigator.share({ files: [file], text, title: "Jamals Global" }); say("Shared! Your friends will love it. 🎉"); return; }
        catch (e) { if (e && e.name === "AbortError") return; }
      }
      if (target === "telegram" || target === "whatsapp") {                 // no picture sharing here: send the words and the link, keep the picture
        const url = target === "telegram" ? `https://t.me/share/url?url=${encodeURIComponent(link())}&text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(`${text} ${link()}`)}`;
        try { window.open(url, "_blank", "noopener"); } catch (e) {}
      }
    }
    if (await saveBlob(blob, name, say)) say(HOW[target] || HOW.save);
  }

  /* ---------- the share sheet ---------- */
  function paintPick() {
    $("md-previews").querySelectorAll(".md-prev").forEach((b, i) => { b.classList.toggle("on", i === pick); b.setAttribute("aria-pressed", String(i === pick)); });
    $("md-dots").querySelectorAll("i").forEach((d, i) => d.classList.toggle("on", i === pick));
  }
  async function openSheet() {
    if (E) E.pause();                                                      // the medal rests while the sheet is open
    sheet.style.zIndex = String(ext ? (window.JIA_z ? window.JIA_z() : 95) : +view.style.zIndex + 1); sheet.hidden = false; void sheet.offsetWidth; sheet.classList.add("in");
    $("md-note").textContent = ""; pick = 0;
    $("md-previews").innerHTML = `<p class="md-making">Making your story…</p>`; $("md-dots").innerHTML = "";
    setTimeout(() => $("md-sheet-done").focus({ preventScroll: true }), 60);
    const s = await ensureStories(); if (!s || sheet.hidden) return;
    $("md-previews").innerHTML = s.map((x, i) => `<button type="button" class="md-prev" data-i="${i}" aria-label="${x.label} design" aria-pressed="${i === 0}"><img src="${x.c.toDataURL("image/jpeg", .82)}" alt=""><span>${x.label}</span></button>`).join("");
    $("md-dots").innerHTML = s.map(() => "<i></i>").join(""); paintPick();
  }
  function closeSheet(quiet) { if (ext && !sheet.hidden) setTimeout(() => { ext = null; stories = null; const tt = document.getElementById("md-sheet-h"); if (tt) tt.textContent = "Share your medal"; }, 0); if (sheet.hidden) return; sheet.hidden = true; sheet.classList.remove("in"); if (!view.hidden && E && cur) E.resume(); if (!quiet && !view.hidden) $("md-share").focus({ preventScroll: true }); }
  $("md-sheet-done").addEventListener("click", () => closeSheet());
  sheet.addEventListener("click", e => {
    if (e.target === sheet) { closeSheet(); return; }
    const p = e.target.closest(".md-prev"); if (p) { pick = +p.dataset.i; paintPick(); p.scrollIntoView({ inline: "center", block: "nearest", behavior: reduce ? "auto" : "smooth" }); return; }
    const t = e.target.closest("[data-t]"); if (t) share(t.dataset.t);
  });
  $("md-previews").addEventListener("scroll", () => {                        // the story in the middle is the one you share
    const box = $("md-previews"), mid = box.scrollLeft + box.clientWidth / 2; let best = 0, dist = 1e9;
    box.querySelectorAll(".md-prev").forEach((b, i) => { const d = Math.abs(b.offsetLeft + b.offsetWidth / 2 - mid); if (d < dist) { dist = d; best = i; } });
    if (best !== pick) { pick = best; paintPick(); }
  }, { passive: true });
  sheet.addEventListener("keydown", e => { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); closeSheet(); } });

  /* ---------- a new study day: the streak grows, medals arrive after the day's letter ---------- */
  document.addEventListener("jia:daydone", e => {
    const today = window.JG_ENGINE ? window.JG_ENGINE.ymd(new Date()) : new Date().toISOString().slice(0, 10);   /* JG-PROD: S23 (spec §4.5), the streak grows at most once per local day */
    if (saved.lastDay === today) return;
    saved.lastDay = today; persist();
    const L = league(); if (!L) return;
    const d = window.JG_ENGINE ? (L.ME.streak = window.JG_ENGINE.cache.streak.if_today) : ++L.ME.streak; try { L.paint(); } catch (e) {}   /* JG-PROD: S23, the server's streak once today counts, so the right medal fires and a rest day adds nothing */
    letterWait = e && e.detail && e.detail.source === "study" ? null : { seen: false, until: Date.now() + 15000 };   // no letter after a study session
    if (isMilestone(d)) celebrate({ days: d });
    const A = window.JIA_ach;
    if (A) { const s30 = A.list.find(a => a.id === "streak30"); if (s30 && s30.prog) s30.prog[0] = Math.min(d, 30); if (d >= 7) A.unlock("streak7"); if (d >= 30) A.unlock("streak30"); }
  });

  /* ---------- the medal shelf on your profile, and a share button on achievements ---------- */
  window.JIA_medalStrip = () => {
    const d = streakNow(), got = MILESTONES.filter(m => m <= d), nx = nextMilestone(d);
    const items = [...got.slice(-6).reverse(), nx].map(m => {
      const lock = m > d;
      return `<button type="button" class="md-mini t-${tierOf(m)}${lock ? " lock" : ""}" data-medal="${m}" aria-label="${m}-day medal${lock ? `, ${m - d} days to go` : ", open"}"><i><small>${m === 1 ? "DAY" : "DAYS"}</small><b>${m}</b></i><span>${lock ? `${m - d} to go` : TIERS[tierOf(m)].name.split(" ")[0]}</span></button>`;
    }).join("");
    return `<div class="pf-ach-h"><b>Streak medals</b><span>🔥 ${d}-day streak</span></div><div class="md-strip">${items}</div>`;
  };
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-medal]"); if (!b) return;
    const m = +b.dataset.medal; if (m <= streakNow()) celebrate({ days: m, force: true });
    else { b.classList.remove("nope"); void b.offsetWidth; b.classList.add("nope"); }
  });
  const achDesc = $("ach-desc");
  if (achDesc && !$("ach-share")) achDesc.insertAdjacentHTML("afterend", `<button type="button" class="md-achshare" id="ach-share" hidden>🏅 See my medal · Share</button>`);
  if ($("ach-share")) $("ach-share").addEventListener("click", () => { const o = window.__achOpen; if (o) celebrate({ id: o.id, force: true }); });

  /* ---------- design preview buttons (outside the phone) ---------- */
  const DEMO = [1, 2, 3, 7, 10, 15, 30, 60, 100, 365, 1000]; let di = 0, ai = 0;
  const pvM = document.querySelector('.pv [data-act="medal"]'), pvA = document.querySelector('.pv [data-act="achv"]');
  if (pvM) pvM.addEventListener("click", () => celebrate({ days: DEMO[di++ % DEMO.length], force: true }));
  if (pvA) pvA.addEventListener("click", () => { const A = window.JIA_ach; if (!A) return; const list = A.list; celebrate({ id: list[ai++ % list.length].id, force: true }); });
  let flatAr = null;
  function arMedal(rx, ry) {                                               // the medal for the AR camera: 3D, or flat without WebGL
    if (E && E.ready && !$("md-gl").hidden) return { canvas: E.arPose(rx, ry), frac: E.arFrac() };
    if (!cur) return null;
    if (!flatAr) { flatAr = document.createElement("canvas"); drawFlat(flatAr, cur, 600, 900); }
    return { canvas: flatAr, frac: Math.min(600 * .5, 900 * .42) * H0 / 900 };
  }
  function shareStoryExt(canvases, meta) { const tt = document.getElementById("md-sheet-h"); if (tt) tt.textContent = meta.title || "Share your story"; ext = meta; stories = canvases.map((c, i) => ({ st: `x${i}`, label: meta.labels[i], c })); pick = 0; openSheet(); }
  window.JIA_medals = { celebrate, shareStory: shareStoryExt, MILESTONES, isMilestone, nextMilestone, current: () => cur, arMedal,
    arStart() { if (E) E.arStart(); },
    arEnd() { flatAr = null; if (E) { E.arEnd(); if (cur && !view.hidden && sheet.hidden) E.resume(); } } };
})();

