import { DATA } from '../data.js';

export function init() {
  const dots   = Array.from(document.querySelectorAll('.mm-dot'));
  const ids    = DATA.sectionIds;
  const halfVP = () => window.innerHeight / 2;

  function getActiveIdx() {
    let active = 0;
    ids.forEach((id, i) => {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top < halfVP()) active = i;
    });
    return active;
  }

  function update() {
    const active = getActiveIdx();
    dots.forEach((d, i) => d.classList.toggle('active', i === active));
  }

  dots.forEach((dot, i) => {
    const activate = () => {
      const target = document.getElementById(ids[i]);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    };
    dot.addEventListener('click', activate);
    dot.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
    });
  });

  window.addEventListener('scroll', update, { passive: true });
  update();
}
