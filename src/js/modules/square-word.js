import { DATA } from '../data.js';

export function init() {
  const display  = document.getElementById('square-word-display');
  const controls = document.getElementById('sw-controls');
  if (!display || !controls) return;

  const words = DATA.squareWords;

  function select(word) {
    display.textContent = words[word];
    display.setAttribute('aria-label', `Square Word rendering of ${word}: ${words[word]}`);
    display.style.color = 'var(--gold)';
    setTimeout(() => { display.style.color = 'var(--paper)'; }, 600);
    controls.querySelectorAll('.glyph-btn').forEach((b) => b.classList.remove('active'));
    controls.querySelector(`[data-word="${word}"]`)?.classList.add('active');
  }

  const frag = document.createDocumentFragment();
  Object.keys(words).forEach((word) => {
    const btn = document.createElement('button');
    btn.className    = 'glyph-btn';
    btn.dataset.word = word;
    btn.textContent  = word;
    btn.setAttribute('aria-label', `Show Square Word rendering of ${word}`);
    frag.appendChild(btn);
  });
  controls.appendChild(frag);

  controls.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-word]');
    if (btn) select(btn.dataset.word);
  });
  controls.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const btn = e.target.closest('[data-word]');
      if (btn) { e.preventDefault(); select(btn.dataset.word); }
    }
  });

  const first = Object.keys(words)[0];
  display.textContent = words[first];
  display.setAttribute('aria-label', `Square Word rendering of ${first}: ${words[first]}`);
  controls.querySelector(`[data-word="${first}"]`)?.classList.add('active');
}
