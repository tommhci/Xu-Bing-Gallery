export function init() {
  const dot   = document.getElementById('cursor');
  const entry = document.getElementById('entry-btn');

  document.addEventListener('mousemove', (e) => {
    dot.style.left = e.clientX + 'px';
    dot.style.top  = e.clientY + 'px';
  });

  if (entry) {
    entry.addEventListener('mouseenter', () => dot.classList.add('on-entry'));
    entry.addEventListener('mouseleave', () => dot.classList.remove('on-entry'));
  }
}
