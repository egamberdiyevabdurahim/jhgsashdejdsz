
(() => {
  "use strict";
  /* Pull Home down from the top: the green header stretches down the screen,
     and letting go past the line opens Settings. */
  const screen = document.querySelector(".screen"); if (!screen) return;
  const pull = document.createElement("div");
  pull.className = "pull-set"; pull.setAttribute("aria-hidden", "true");
  pull.innerHTML = '<span class="pull-ic"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 3v2.4M12 18.6V21M3 12h2.4M18.6 12H21M5.6 5.6l1.7 1.7M16.7 16.7l1.7 1.7M5.6 18.4l1.7-1.7M16.7 7.3l1.7-1.7"/></svg></span><b class="pull-t">Pull down for Settings</b>';
  screen.parentElement.insertBefore(pull, screen);
  const TH = 120;
  const onHome = () => { const t = document.querySelector('#tb-track button[data-i="2"]'); return !!t && t.getAttribute("aria-current") === "page"; };
  const atTop = () => getComputedStyle(screen).position === "static" ? (document.scrollingElement || document.documentElement).scrollTop <= 0 : screen.scrollTop <= 0;
  const busy = () => !!document.querySelector(".ly-view:not([hidden]), .pf-view:not([hidden]), .set-view:not([hidden]), .pr-view:not([hidden]), .cs-view:not([hidden]), .cm-sheet:not([hidden]), .gm-layer:not([hidden]), .st-view:not([hidden]), .rl-view:not([hidden]), .iq-layer:not([hidden]), .lt-stage.on");
  let y0 = null, d = 0, pulling = false;
  function set(v) {
    d = v; screen.style.transform = v ? `translateY(${v}px)` : ""; pull.style.height = v ? `${v + 4}px` : "0";
    pull.style.opacity = v > 3 ? 1 : 0; pull.classList.toggle("ready", v >= TH);
    pull.querySelector(".pull-t").textContent = v >= TH ? "Release to open Settings" : "Pull down for Settings";
    pull.querySelector(".pull-ic").style.transform = `rotate(${v * 1.6}deg)`;
  }
  const ease = on => { const t = on ? "transform .45s cubic-bezier(.2,.8,.2,1), height .45s cubic-bezier(.2,.8,.2,1)" : "none"; screen.style.transition = t; pull.style.transition = on ? "height .45s cubic-bezier(.2,.8,.2,1)" : "none"; };
  function start(y) { if (onHome() && atTop() && !busy()) { y0 = y; pulling = false; } }
  function move(y, e) {
    if (y0 == null) return;
    const dy = y - y0;
    if (!pulling && dy < -2) { y0 = null; return; }                  // scrolling up: not a pull
    if (!pulling && dy > 8) { pulling = true; ease(false); document.body.classList.add("pulling"); }
    if (pulling && window.getSelection) window.getSelection().removeAllRanges();
    if (!pulling) return;
    if (e && e.cancelable) e.preventDefault();
    set(Math.min(300, dy * .55));
  }
  function end() {
    if (y0 == null) return; y0 = null;
    if (!pulling) return; pulling = false; ease(true); document.body.classList.remove("pulling");
    if (d >= TH) {
      pull.classList.add("fill"); set(Math.max(d, window.innerHeight));     // the green fills the screen
      setTimeout(() => {
        if (window.JIA_openSettings) window.JIA_openSettings(true);
        setTimeout(() => { ease(false); pull.classList.remove("fill"); set(0); }, 450);
      }, 420);
    } else set(0);
  }
  document.addEventListener("touchstart", e => start(e.touches[0].clientY), { passive: true });
  document.addEventListener("touchmove", e => move(e.touches[0].clientY, e), { passive: false });
  document.addEventListener("touchend", end); document.addEventListener("touchcancel", end);
  screen.addEventListener("pointerdown", e => { if (e.pointerType === "mouse" && e.button === 0 && e.target.closest(".profile") && !e.target.closest(".arc .bubble, .avatar, button")) start(e.clientY); });
  document.addEventListener("pointermove", e => { if (e.pointerType === "mouse") move(e.clientY, null); });
  document.addEventListener("pointerup", e => { if (e.pointerType === "mouse") end(); });
})();
