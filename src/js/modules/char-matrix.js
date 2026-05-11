import { DATA } from '../data.js';

export function init() {
  const container = document.getElementById('sky-matrix');
  if (!container) return;

  const chars = DATA.pseudoChars;
  const frag  = document.createDocumentFragment();

  for (let i = 0; i < 64; i++) {
    const span = document.createElement('span');
    span.textContent = chars[Math.floor(Math.random() * chars.length)];
    if (Math.random() < 0.50) span.classList.add('dim');
    if (Math.random() < 0.05) span.classList.add('highlight');
    frag.appendChild(span);
  }
  container.appendChild(frag);

  setInterval(() => {
    container.querySelectorAll('span').forEach((s) => {
      if (Math.random() < 0.05) {
        s.textContent = chars[Math.floor(Math.random() * chars.length)];
        s.className   = Math.random() < 0.05 ? 'highlight' : (Math.random() < 0.5 ? 'dim' : '');
      }
    });
  }, 800);
}
