export function init() {
  const nav         = document.getElementById('nav');
  const progressBar = document.getElementById('progress-bar');

  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 60);
    const doc = document.documentElement;
    const pct = (window.scrollY / (doc.scrollHeight - doc.clientHeight)) * 100;
    progressBar.style.width = pct + '%';
  }

  window.addEventListener('scroll', onScroll, { passive: true });
}
