import { DATA } from '../data.js';

export function init() {
  const grid = document.getElementById('ar-grid');
  if (!grid) return;

  const chars = DATA.pseudoChars;
  const frag  = document.createDocumentFragment();

  for (let i = 0; i < 24; i++) {
    const cell = document.createElement('div');
    cell.className   = 'ar-cell';
    cell.textContent = chars[Math.floor(Math.random() * chars.length)];
    frag.appendChild(cell);
  }
  grid.appendChild(frag);

  setInterval(() => {
    grid.querySelectorAll('.ar-cell').forEach((c) => {
      const lit = Math.random() < 0.15;
      c.classList.toggle('lit', lit);
      if (lit) c.textContent = chars[Math.floor(Math.random() * chars.length)];
    });
  }, 1200);
}
