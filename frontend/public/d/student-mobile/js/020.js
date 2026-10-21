
(() => {
  // show the soft fade under the coin chip only once a page has scrolled a little
  const main = t => t === document.scrollingElement || t === document || (t.classList && (t.classList.contains("screen") || t.classList.contains("tabview")));
  const top = t => t === document ? (document.scrollingElement || document.documentElement).scrollTop : t.scrollTop;
  document.addEventListener("scroll", e => { if (main(e.target)) document.body.classList.toggle("scrolled", top(e.target) > 120); }, true);
  document.addEventListener("click", e => { if (e.target.closest("#tb-track button")) setTimeout(() => {           // a new tab starts unscrolled
    const v = document.querySelector(".tabview.show"); document.body.classList.toggle("scrolled", (v ? v.scrollTop : top(document)) > 120); }, 60); }, true);
})();
