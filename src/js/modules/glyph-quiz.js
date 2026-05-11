import { DATA } from '../data.js';

export function init() {
  const glyphEl     = document.getElementById('glyph-main');
  const statusEl    = document.getElementById('glyph-status');
  const resultEl    = document.getElementById('glyph-result');
  const optionsEl   = document.getElementById('glyph-options');
  const nextWrap    = document.getElementById('glyph-next-wrap');
  const nextBtn     = document.getElementById('glyph-next-btn');
  const scoreEl     = document.getElementById('glyph-score');
  const modeLabelEl = document.getElementById('glyph-mode-label');
  if (!glyphEl || !optionsEl) return;

  const cats     = DATA.glyphCategories;
  let attempts   = 0;
  let correct    = 0;
  let answered   = false;
  let currentCat = null;

  /* ── D5 H8 fix: track actual interaction state ── */
  let glyphAttempted = false;

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pickRandom() {
    const cat  = cats[Math.floor(Math.random() * cats.length)];
    const bank = DATA[cat.bank];
    return { cat, char: bank[Math.floor(Math.random() * bank.length)] };
  }

  function updateScore() {
    scoreEl.textContent = `Attempts: ${attempts} · Correct: ${correct}`;
  }

  function updateMetaChecks() {
    const glyphCheck = document.querySelector('.theory-check[href="#glyph-tool"]');
    if (glyphCheck && glyphAttempted) {
      glyphCheck.classList.remove('pending');
      glyphCheck.classList.add('done');
    }
  }

  function loadGlyph() {
    answered = false;
    const pick  = pickRandom();
    currentCat  = pick.cat;

    glyphEl.style.opacity   = '0';
    glyphEl.style.transform = 'scale(0.7)';
    glyphEl.className       = 'glyph-display';

    setTimeout(() => {
      glyphEl.textContent     = pick.char;
      glyphEl.style.opacity   = '1';
      glyphEl.style.transform = 'scale(1)';
      glyphEl.style.color     = 'var(--paper)';
      glyphEl.setAttribute('aria-label', `Character to classify: ${pick.char}`);
    }, 200);

    statusEl.textContent    = '[ reading: awaiting attempt ]';
    statusEl.className      = 'glyph-status neutral';
    modeLabelEl.textContent = '— / —';
    resultEl.textContent    = '';
    resultEl.classList.remove('visible');
    nextWrap.style.display  = 'none';

    /* H5 race-condition fix: disable pointer events until options rendered */
    optionsEl.style.pointerEvents = 'none';
    optionsEl.innerHTML = '';
    const shuffled = shuffle(cats);
    const frag     = document.createDocumentFragment();

    shuffled.forEach((cat) => {
      const btn = document.createElement('button');
      btn.className      = 'glyph-option-btn';
      btn.dataset.catKey = cat.key;
      btn.textContent    = '— — — —';
      btn.setAttribute('aria-label', 'Option: unknown. Make your guess.');
      frag.appendChild(btn);
    });
    optionsEl.appendChild(frag);
    optionsEl.style.pointerEvents = '';
  }

  function onGuess(chosenKey, clickedBtn) {
    if (answered) return;
    answered = true;
    attempts++;

    /* Mark glyph engine as actually used */
    if (!glyphAttempted) {
      glyphAttempted = true;
      updateMetaChecks();
    }

    const isCorrect = (chosenKey === currentCat.key);
    if (isCorrect) correct++;
    updateScore();

    optionsEl.querySelectorAll('.glyph-option-btn').forEach((btn) => {
      const key  = btn.dataset.catKey;
      const meta = cats.find((c) => c.key === key);
      btn.textContent = meta ? meta.label : key;
      btn.setAttribute('aria-label', meta ? meta.label : key);
      btn.disabled    = true;
      btn.classList.add('reveal');
    });

    if (isCorrect) {
      clickedBtn.classList.remove('reveal');
      clickedBtn.classList.add('correct');
      glyphEl.classList.add('correct');
      statusEl.textContent    = '[ reading: attempt → resolution ]';
      statusEl.className      = 'glyph-status success';
      modeLabelEl.textContent = currentCat.label.toUpperCase();
    } else {
      clickedBtn.classList.remove('reveal');
      clickedBtn.classList.add('wrong');
      optionsEl.querySelectorAll('.glyph-option-btn').forEach((btn) => {
        if (btn.dataset.catKey === currentCat.key) btn.classList.add('correct');
      });
      glyphEl.classList.add('shake');
      setTimeout(() => glyphEl.classList.remove('shake'), 600);
      statusEl.textContent    = '[ reading: attempt → failure ]';
      statusEl.className      = 'glyph-status failure';
      modeLabelEl.textContent = currentCat.label.toUpperCase();
    }

    resultEl.innerHTML = `<strong>${currentCat.label}:</strong> ${currentCat.desc}`;
    setTimeout(() => resultEl.classList.add('visible'), 100);
    setTimeout(() => { nextWrap.style.display = 'block'; }, 400);
  }

  optionsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.glyph-option-btn');
    if (btn && !btn.disabled) onGuess(btn.dataset.catKey, btn);
  });
  optionsEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const btn = e.target.closest('.glyph-option-btn');
      if (btn && !btn.disabled) { e.preventDefault(); onGuess(btn.dataset.catKey, btn); }
    }
  });

  nextBtn?.addEventListener('click', loadGlyph);
  loadGlyph();
}
