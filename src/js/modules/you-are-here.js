import { DATA } from '../data.js';

export function init() {
  const indicator = document.getElementById('nav-room-indicator');
  const roomIds   = Object.keys(DATA.roomMeta);
  let   current   = null;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const id   = entry.target.id;
      const meta = DATA.roomMeta[id];
      if (!meta) return;

      if (entry.isIntersecting) {
        if (current !== id) {
          current = id;
          indicator.textContent = meta.label;
          indicator.style.setProperty('border-color', meta.color);
          indicator.style.setProperty('color', meta.color);
          indicator.classList.add('visible');
        }
      } else {
        if (current === id) {
          const anyVisible = roomIds.some((rid) => {
            const el = document.getElementById(rid);
            if (!el) return false;
            const r = el.getBoundingClientRect();
            return r.top < window.innerHeight * 0.6 && r.bottom > 0;
          });
          if (!anyVisible) {
            current = null;
            indicator.classList.remove('visible');
          }
        }
      }
    });
  }, { threshold: 0.15 });

  roomIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
}
