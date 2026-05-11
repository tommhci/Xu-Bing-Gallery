import { DATA } from '../data.js';

export function init() {
  const initialId = location.hash.slice(1) || 'hero';
  history.replaceState({ xbSection: initialId }, '', '#' + initialId);

  const notice = document.createElement('div');
  notice.id = 'nav-guard-notice';
  notice.setAttribute('role', 'status');
  notice.setAttribute('aria-live', 'polite');
  notice.textContent = '[ press back again to leave the exhibition ]';
  document.body.appendChild(notice);

  let exitWarningActive = false;
  let exitWarningTimer  = null;

  function showNotice() {
    notice.classList.add('visible');
    clearTimeout(exitWarningTimer);
    exitWarningTimer = setTimeout(() => {
      notice.classList.remove('visible');
      exitWarningActive = false;
    }, 2600);
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const targetId = a.getAttribute('href').slice(1);
    if (!targetId) return;
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return;
    e.preventDefault();
    exitWarningActive = false;
    history.pushState({ xbSection: targetId }, '', '#' + targetId);
    targetEl.scrollIntoView({ behavior: 'smooth' });
  });

  window.addEventListener('popstate', (e) => {
    const section = e.state?.xbSection;

    if (section && document.getElementById(section)) {
      exitWarningActive = false;
      document.getElementById(section).scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (exitWarningActive) {
      exitWarningActive = false;
      return;
    }

    exitWarningActive = true;
    showNotice();

    const currentSection = DATA.sectionIds.find((id) => {
      const el = document.getElementById(id);
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight * 0.55 && r.bottom > 0;
    }) || 'hero';

    history.pushState({ xbSection: currentSection }, '', '#' + currentSection);
  });
}
