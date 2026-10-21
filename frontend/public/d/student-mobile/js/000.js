
  /* The mascots, Jamol and Jamola (JIA kit, Sep 2026). Jamol's three main poses live in the Today coach. */
  (() => {
    const src = sel => { const e = document.querySelector(sel); return e ? e.getAttribute("src") : ""; };
    window.JIA_MASCOT = {
      jamol: { wave: src(".mc .jm-wave"), cele: src(".mc .jm-cele"), point: src(".mc .jm-point"),
        think: "/d/student-mobile/media/b4dec26363e5638d.webp",
        welcome: "/d/student-mobile/media/97ae8c728256a0fc.webp",
        delighted: "/d/student-mobile/media/0574d908b925783d.webp",
        curious: "/d/student-mobile/media/5783df86512a66d0.webp",
        concern: "/d/student-mobile/media/7b25a4e8d83f44a5.webp",
        sleepy: "/d/student-mobile/media/edeaf72fbdb0ec19.webp",
        shocked: "/d/student-mobile/media/1c417b7c4e3d56ec.webp",
        angry: "/d/student-mobile/media/91a9324febe45388.webp",
        pleading: "/d/student-mobile/media/fc60b4ddc74fa71c.webp" },
      jamola: {
        wave: "/d/student-mobile/media/00e16fffb6eaa0a4.webp",
        cele: "/d/student-mobile/media/df451cee67fc45d2.webp",
        point: "/d/student-mobile/media/ce5e9513ac823b74.webp",
        think: "/d/student-mobile/media/b06eb39fc4e7fc8d.webp",
        welcome: "/d/student-mobile/media/5421a8f4c8d084e4.webp",
        delighted: "/d/student-mobile/media/2c1a07ced7931415.webp",
        curious: "/d/student-mobile/media/f9f6fc0e6a406b9c.webp",
        concern: "/d/student-mobile/media/a6f8793918131ccc.webp",
        sleepy: "/d/student-mobile/media/78db41f534f3b8dc.webp",
        shocked: "/d/student-mobile/media/ea9b059e365cb8cb.webp",
        angry: "/d/student-mobile/media/7791c7ce7bf97892.webp",
        pleading: "/d/student-mobile/media/c2a5596c2b868096.webp" },
    };
    window.JIA_MIMG = (who, k, cls) => { const m = (window.JIA_MASCOT[who] || {})[k]; return m ? `<img${cls ? ` class="${cls}"` : ""} src="${m}" alt="" draggable="false">` : ""; };
  })();
