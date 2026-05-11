import { DATA } from '../data.js';

export function init() {
  const container = document.getElementById('pseudo-bg');
  const chars     = DATA.pseudoChars;
  const frag      = document.createDocumentFragment();

  for (let i = 0; i < 140; i++) {
    const span = document.createElement('span');
    span.className   = 'pseudo-char';
    span.textContent = chars[Math.floor(Math.random() * chars.length)];
    span.style.setProperty('--dur',   (3 + Math.random() * 5) + 's');
    span.style.setProperty('--delay', (Math.random() * 6)     + 's');
    frag.appendChild(span);
  }
  container.appendChild(frag);
}
