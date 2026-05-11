export function init() {
  const cells        = Array.from(document.querySelectorAll('.concept-cell'));
  const continueBtn  = document.getElementById('theory-continue-btn');
  const metaPanel    = document.getElementById('theory-meta-panel');
  if (!cells.length || !continueBtn) return;

  let revealed = 0;

  function revealNext() {
    if (revealed < cells.length) {
      cells[revealed].classList.add('revealed');
      revealed++;
    }
    if (revealed >= cells.length) {
      /* D5 H1 Severity-1 fix: unambiguous completion label */
      continueBtn.textContent = 'All concepts revealed';
      continueBtn.disabled    = true;
      continueBtn.setAttribute('aria-disabled', 'true');
      setTimeout(() => { metaPanel.classList.add('visible'); }, 500);
    } else {
      /* D5 H1 fix: "Revealed: N of 4" is unambiguous vs old "(N/4)" */
      continueBtn.textContent = `Revealed: ${revealed} of ${cells.length} — continue →`;
    }
  }

  continueBtn.addEventListener('click', revealNext);
  continueBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); revealNext(); }
  });

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting && revealed === 0) { revealNext(); obs.disconnect(); }
    });
  }, { threshold: 0.3 });

  const grid = document.getElementById('concept-grid');
  if (grid) obs.observe(grid);

  /* Initial button label */
  continueBtn.textContent = `Revealed: 1 of ${cells.length} — continue →`;
}
