const CROSS_LINK_SELECTOR = '.timeline-theory-link, .concept-timeline-link';

let crossLinkOrigin = null;

function getCurrentSectionId(el) {
  const section = el.closest('section');
  return section ? section.id : null;
}

function prettySectionName(id) {
  const map = {
    hero: 'Hero',
    artist: 'Artist',
    foyer: 'Foyer',
    'room-sky': 'Room 01',
    'room-english': 'Room 02',
    'room-square': 'Room 03',
    'glyph-tool': 'Glyph Engine',
    timeline: 'Timeline',
    theory: 'Theory',
    'ar-panel': 'AR',
    provenance: 'Provenance'
  };
  return map[id] || 'Origin Section';
}

function removeContextBackLinks() {
  document.querySelectorAll('.context-back-link-wrap').forEach((el) => el.remove());
}

function injectContextBackLink(targetSection, originId) {
  if (!targetSection || !originId) return;

  removeContextBackLinks();

  const wrap = document.createElement('div');
  wrap.className = 'context-back-link-wrap';

  const link = document.createElement('a');
  link.href = `#${originId}`;
  link.className = 'back-btn';
  link.textContent = `← Back to ${prettySectionName(originId)}`;
  link.setAttribute('aria-label', `Back to ${prettySectionName(originId)}`);

  link.addEventListener('click', (e) => {
    e.preventDefault();

    const originEl = document.getElementById(originId);
    if (!originEl) return;

    removeContextBackLinks();

    originEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (window.history && window.history.pushState) {
      window.history.pushState({ section: originId }, '', `#${originId}`);
    }
  });

  wrap.appendChild(link);

  const anchorPoint =
    targetSection.querySelector('.breadcrumb') ||
    targetSection.querySelector('.section-label') ||
    targetSection.firstElementChild;

  if (anchorPoint && anchorPoint.parentNode) {
    anchorPoint.parentNode.insertBefore(wrap, anchorPoint);
  } else {
    targetSection.prepend(wrap);
  }
}

function handleCrossLinkClick(e) {
  const trigger = e.target.closest(CROSS_LINK_SELECTOR);
  if (!trigger) return;

  const href = trigger.getAttribute('href');
  if (!href || !href.startsWith('#')) return;

  const targetId = href.slice(1);
  const targetSection = document.getElementById(targetId);
  const originId = getCurrentSectionId(trigger);

  if (!targetSection || !originId || originId === targetId) return;

  crossLinkOrigin = originId;

  window.setTimeout(() => {
    injectContextBackLink(targetSection, crossLinkOrigin);
  }, 450);
}

export function initContextReturn() {
  document.addEventListener('click', handleCrossLinkClick);
}