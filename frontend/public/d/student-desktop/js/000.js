
/* ==========================================================
   MASCOT KIT — Jamol and Jamola from the character kit: five
   full-body poses each (wave, cele, point, read, think), six
   expressions (warm, proud, delighted, curious, concern, calm)
   and seven mood faces (happy, angry, sad, crying, shocked,
   sleepy, pleading). Every mascot on the page comes from here.
   ========================================================== */
window.JIA_MASCOT = {"jamol": {"face": {"warm": "/d/student-desktop/media/577f8bc34b39e148.webp", "proud": "/d/student-desktop/media/f41877cf71559461.webp", "delighted": "/d/student-desktop/media/9f675dccade0fd7f.webp", "curious": "/d/student-desktop/media/f1a909cb468fc5bc.webp", "concern": "/d/student-desktop/media/025ec399b8a61e57.webp", "calm": "/d/student-desktop/media/13abec88a1467194.webp", "happy": "/d/student-desktop/media/f60d4b5714688224.webp", "angry": "/d/student-desktop/media/7432cda80f0e518f.webp", "sad": "/d/student-desktop/media/c0e22fdbb450c1da.webp", "crying": "/d/student-desktop/media/4fcd25eed9b10dde.webp", "shocked": "/d/student-desktop/media/1cb2f39b5b7ae5d3.webp", "sleepy": "/d/student-desktop/media/1d9b0cc88367df20.webp", "pleading": "/d/student-desktop/media/cd43ddaf094debb8.webp"}, "wave": "/d/student-desktop/media/09eb65392e57f468.webp", "cele": "/d/student-desktop/media/dd61749c4f8c651d.webp", "point": "/d/student-desktop/media/7cec6f42644a3b1e.webp", "read": "/d/student-desktop/media/c4890b7654d9692c.webp", "think": "/d/student-desktop/media/036cb2b79f8fb5cc.webp"}, "jamola": {"face": {"warm": "/d/student-desktop/media/45f41232766dc05b.webp", "proud": "/d/student-desktop/media/b6fe52a2fe92bbb7.webp", "delighted": "/d/student-desktop/media/c4499f43fdb66009.webp", "curious": "/d/student-desktop/media/d90034e9b26d4940.webp", "concern": "/d/student-desktop/media/1eb2c45620bb5838.webp", "calm": "/d/student-desktop/media/4736d65da2946b5f.webp", "happy": "/d/student-desktop/media/d848cf0435bd4da0.webp", "angry": "/d/student-desktop/media/6b8db2d260b4a52b.webp", "sad": "/d/student-desktop/media/fda5b3562ba0d7dc.webp", "crying": "/d/student-desktop/media/4a5b7486323a2643.webp", "shocked": "/d/student-desktop/media/5c036324b635f722.webp", "sleepy": "/d/student-desktop/media/6df76b376e2050b8.webp", "pleading": "/d/student-desktop/media/83e5bccc0b0eaa88.webp"}, "wave": "/d/student-desktop/media/02382b7f3422232c.webp", "cele": "/d/student-desktop/media/db9008c8cd9f1538.webp", "point": "/d/student-desktop/media/0ca82ea731aada49.webp", "read": "/d/student-desktop/media/2041d1d9e629220c.webp", "think": "/d/student-desktop/media/ee6ad800800ad917.webp"}};
document.querySelectorAll("img[data-mk]").forEach(img => {
  const [who, key] = img.dataset.mk.split("."), k = window.JIA_MASCOT[who] || {};
  img.src = k[key] || (k.face || {})[key] || "";
});
// the team games ask for poses and faces by name; welcome is the warm face
window.JIA_MIMG = (who, k, cls) => {
  const m = window.JIA_MASCOT[who] || {}, f = m.face || {}, src = m[k] || f[k] || f[{ welcome: "warm" }[k]] || "";
  return src ? `<img${cls ? ` class="${cls}"` : ""} src="${src}" alt="" draggable="false">` : "";
};

