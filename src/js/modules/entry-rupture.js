export function init() {
  const tooltip = document.getElementById('entry-tooltip');
  const btn     = document.getElementById('entry-btn');
  if (!tooltip || !btn) return;

  const timer = setTimeout(() => {
    tooltip.classList.add('revealed');
  }, 3000);

  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const target = document.getElementById('foyer');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }
  });

  btn.addEventListener('click', () => clearTimeout(timer), { once: true });
}
