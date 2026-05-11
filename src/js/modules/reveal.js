export function init() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal, .timeline-item').forEach((el) => obs.observe(el));
}
