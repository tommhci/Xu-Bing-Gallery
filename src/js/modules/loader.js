export function init() {
  window.addEventListener('load', () => {
    setTimeout(() => {
      document.getElementById('loader').classList.add('hidden');
    }, 3500);
  });
}
