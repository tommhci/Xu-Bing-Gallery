// Contrast check for text the axe rules report as "incomplete".
//
// axe cannot decide contrast for text over gradients, over composited tints, or
// for short/pseudo content — it lists those as "incomplete" rather than as
// violations, so a green axe run says nothing about them. Three real defects on
// this site lived in exactly that blind spot (a vermillion text token reused on
// its own 18% tint, and a nav label that had a fill colour written into its text
// colour at runtime).
//
// This check resolves the computed colours itself: it walks every text node,
// composites the ancestor background chain from the root down, and compares
// against WCAG 2.1 AA. Decorative text is skipped only on an explicit
// declaration — role="img", or data-contrast-exempt="true" written by hand —
// because WCAG 1.4.3 exempts text that is pure decoration and aria-hidden is
// not that test. The art layer here is deliberately illegible, so it carries
// the marker; everything else is measured.
//
// Gradients cannot be composited exactly. When one is met the nearest opaque
// ancestor is used as the base and the result is marked approximate; it is still
// compared, so a regression behind the nav gradient is not silently skipped.
import { createServer } from 'node:http';
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const viteConfig = readFileSync(join(ROOT, 'vite.config.js'), 'utf8');
const BASE = (viteConfig.match(/base:\s*['"]([^'"]+)['"]/) || [, '/'])[1];

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.woff2': 'font/woff2', '.json': 'application/json', '.ico': 'image/x-icon',
};

if (!existsSync(join(DIST, 'index.html'))) {
  console.error('dist/index.html not found - run `npm run build` first.');
  process.exit(1);
}

// --- freshness phase: refuse to grade a stale build --------------------------
// This check reads dist/, not src/. Run standalone against an out-of-date dist
// and it grades the previous build and prints a confident "passed" — verified:
// planting failing text in src/index.html and running `npm run check:contrast`
// alone still reported "0 below threshold", because the probe was never built.
// A gate that silently certifies the wrong artifact is worse than no gate, so
// compare the newest build output against the newest input and stop if the
// inputs are newer.
const newestMtime = (dir) => {
  let newest = 0;
  const walk = (d) => {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, entry.name);
      if (entry.isDirectory()) walk(p);
      else newest = Math.max(newest, statSync(p).mtimeMs);
    }
  };
  walk(dir);
  return newest;
};
{
  const builtAt = newestMtime(DIST);
  const inputs = [newestMtime(join(ROOT, 'src')), statSync(join(ROOT, 'index.html')).mtimeMs,
                  statSync(join(ROOT, 'vite.config.js')).mtimeMs];
  const changedAt = Math.max(...inputs);
  if (changedAt > builtAt) {
    const behind = Math.round((changedAt - builtAt) / 1000);
    console.error(`dist/ is stale (source is ${behind}s newer than the build).`);
    console.error('This check reads dist/. Run `npm run build` first, or use `npm run check`,');
    console.error('which builds before it checks. Refusing to certify an artifact that is not the source.');
    process.exit(1);
  }
}

// --- static phase: every var(--token) without a fallback must be defined -----
// A misspelled token does not fail loudly: `color: var(--typo)` becomes invalid
// at computed-value time and the element simply inherits its parent's colour,
// which on this page is a light text colour and therefore still passes the
// contrast test. Verified: renaming --vermillion-text to a typo left the gate
// green. So resolve the names statically as well.
const DEFINED = new Set();
const VAR_SOURCES = [];
{
  const cssDir = join(ROOT, 'src', 'css');
  for (const f of readdirSync(cssDir)) {
    if (!f.endsWith('.css')) continue;
    const text = readFileSync(join(cssDir, f), 'utf8');
    for (const m of text.matchAll(/(--[A-Za-z0-9_-]+)\s*:/g)) DEFINED.add(m[1]);
    VAR_SOURCES.push({ file: `src/css/${f}`, text });
  }
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.name.endsWith('.js')) {
        VAR_SOURCES.push({
          file: full.replace(ROOT + '\\', '').replace(ROOT + '/', '').replace(/\\/g, '/'),
          text: readFileSync(full, 'utf8'),
        });
      }
    }
  };
  walk(join(ROOT, 'src', 'js'));
}
const unresolved = [];
for (const { file, text } of VAR_SOURCES) {
  // no-fallback form only: var(--x) — var(--x, fallback) is safe by construction
  for (const m of text.matchAll(/var\(\s*(--[A-Za-z0-9_-]+)\s*\)/g)) {
    if (!DEFINED.has(m[1])) unresolved.push(`${file}: ${m[1]}`);
  }
}
if (unresolved.length) {
  console.log('Undefined CSS custom properties referenced without a fallback:');
  for (const u of [...new Set(unresolved)]) console.log(`  FAIL ${u}`);
  console.log(`\n${new Set(unresolved).size} unresolved token reference(s).`);
  process.exit(1);
}
console.log(`token references resolved: ${DEFINED.size} defined, no dangling var() found`);

const server = createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (!path.startsWith(BASE)) { res.writeHead(404).end(); return; }
  let file = normalize(join(DIST, path.slice(BASE.length)));
  if (!file.startsWith(DIST)) { res.writeHead(403).end(); return; }
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file)) { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' });
  res.end(readFileSync(file));
});

await new Promise((r) => server.listen(0, '127.0.0.1', r));
const ORIGIN = `http://127.0.0.1:${server.address().port}${BASE}`;

const browser = await chromium.launch();
const findings = [];
let examined = 0;
let skippedDecorative = 0;
let approximate = 0;

for (const vp of VIEWPORTS) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  // 'networkidle' is the wrong invariant: contrast depends on fonts and the intro
  // loader having settled, not on network quiescence. It also made the gate flaky --
  // under machine load (a sibling chromium still running) the 30s networkidle wait
  // expired and the whole check crashed rather than reporting a contrast verdict.
  // Wait on the actual preconditions instead.
  await page.goto(ORIGIN, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => !document.getElementById('loader'), null, { timeout: 15000 }).catch(() => {});
  await page.evaluate(() => (document.fonts ? document.fonts.ready : Promise.resolve()));
  // scroll-reveal animations leave text at opacity 0 until it enters the viewport
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(600);

  const rows = await page.evaluate(() => {
    const parse = (s) => {
      const m = s.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const p = m[1].split(/[,/\s]+/).filter(Boolean).map(Number);
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    };
    const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    const lum = (c) => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
    const ratio = (a, b) => {
      const la = lum(a), lb = lum(b);
      return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
    };
    // WCAG 1.4.3 exempts text that is "pure decoration" or "part of a picture".
    // aria-hidden is NOT that test: it means "hidden from assistive technology",
    // and an author can put readable content inside it (this page does — see
    // .portrait-year). Exempting on aria-hidden alone made the gate blind to
    // real text on the strength of an unrelated attribute. So the two accepted
    // declarations are: role="img" (the subtree is a picture) and an explicit
    // data-contrast-exempt="true" the author has to write on purpose.
    const decorative = (el) => {
      let cur = el;
      while (cur && cur !== document.documentElement) {
        if (cur.getAttribute && (cur.getAttribute('data-contrast-exempt') === 'true' || cur.getAttribute('role') === 'img')) return true;
        cur = cur.parentElement;
      }
      return false;
    };

    const out = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const seen = new Set();
    let node;
    while ((node = walker.nextNode())) {
      const text = node.nodeValue.trim();
      if (!text) continue;
      const el = node.parentElement;
      if (!el || seen.has(el)) continue;
      seen.add(el);
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      if (decorative(el)) { out.push({ decorative: true }); continue; }

      const fgRaw = parse(cs.color);
      if (!fgRaw) continue;

      const layers = [];
      let gradient = false;
      let cur = el;
      while (cur) {
        const bcs = getComputedStyle(cur);
        const bc = parse(bcs.backgroundColor);
        if (bc && bc.a > 0) layers.push(bc);
        if (bcs.backgroundImage && bcs.backgroundImage !== 'none') gradient = true;
        if (layers.length && layers[layers.length - 1].a >= 1) break;
        cur = cur.parentElement;
      }

      let bg = { r: 255, g: 255, b: 255, a: 1 };
      for (let i = layers.length - 1; i >= 0; i--) {
        const L = layers[i];
        bg = {
          r: L.r * L.a + bg.r * (1 - L.a),
          g: L.g * L.a + bg.g * (1 - L.a),
          b: L.b * L.a + bg.b * (1 - L.a),
          a: 1,
        };
      }
      const fg = fgRaw.a < 1
        ? { r: fgRaw.r * fgRaw.a + bg.r * (1 - fgRaw.a),
            g: fgRaw.g * fgRaw.a + bg.g * (1 - fgRaw.a),
            b: fgRaw.b * fgRaw.a + bg.b * (1 - fgRaw.a) }
        : fgRaw;

      const size = parseFloat(cs.fontSize);
      const weight = parseInt(cs.fontWeight, 10) || 400;
      const large = size >= 24 || (size >= 18.66 && weight >= 700);
      out.push({
        decorative: false,
        tag: el.tagName.toLowerCase(),
        cls: (el.className || '').toString().slice(0, 50),
        text: text.slice(0, 40),
        fg: cs.color,
        bg: `rgb(${Math.round(bg.r)}, ${Math.round(bg.g)}, ${Math.round(bg.b)})`,
        ratio: +ratio(fg, bg).toFixed(2),
        need: large ? 3.0 : 4.5,
        gradient,
      });
    }
    return out;
  });

  for (const r of rows) {
    if (r.decorative) { skippedDecorative++; continue; }
    examined++;
    if (r.gradient) approximate++;
    if (r.ratio < r.need) findings.push({ vp: vp.name, ...r });
  }

  // The nav indicator is written by script on scroll, so a single static walk
  // sees whichever label happened to be active. Sweep every section instead:
  // this element is where a fill colour was once painted as text.
  if (vp.name === 'desktop') {
    const ids = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[id]'))
        .filter((e) => e.dataset && (e.id.startsWith('room-') || ['hero', 'glyph-tool', 'timeline', 'theory', 'ar-panel', 'provenance', 'artist'].includes(e.id)))
        .map((e) => e.id)
    );
    for (const id of ids) {
      const moved = await page.evaluate((target) => {
        const el = document.getElementById(target);
        if (!el) return false;
        el.scrollIntoView({ block: 'center' });
        return true;
      }, id);
      if (!moved) continue;
      await page.waitForTimeout(650);
      const snap = await page.evaluate(() => {
        const ind = document.getElementById('nav-room-indicator');
        if (!ind) return null;
        const cs = getComputedStyle(ind);
        if (!ind.textContent.trim() || cs.opacity === '0') return null;
        const parse = (s) => {
          const m = s.match(/rgba?\(([^)]+)\)/);
          if (!m) return null;
          const p = m[1].split(/[,/\s]+/).filter(Boolean).map(Number);
          return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
        };
        const layers = [];
        let cur = ind;
        while (cur) {
          const bcs = getComputedStyle(cur);
          const bc = parse(bcs.backgroundColor);
          if (bc && bc.a > 0) layers.push(bc);
          if (layers.length && layers[layers.length - 1].a >= 1) break;
          cur = cur.parentElement;
        }
        let bg = { r: 255, g: 255, b: 255, a: 1 };
        for (let i = layers.length - 1; i >= 0; i--) {
          const L = layers[i];
          bg = { r: L.r * L.a + bg.r * (1 - L.a), g: L.g * L.a + bg.g * (1 - L.a),
                 b: L.b * L.a + bg.b * (1 - L.a), a: 1 };
        }
        return { label: ind.textContent.trim(), fg: cs.color,
                 bg: `rgb(${Math.round(bg.r)}, ${Math.round(bg.g)}, ${Math.round(bg.b)})` };
      });
      if (!snap) continue;
      const parse = (s) => {
        const m = s.match(/rgba?\(([^)]+)\)/);
        const p = m[1].split(/[,/\s]+/).filter(Boolean).map(Number);
        return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
      };
      const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
      const lum = (c) => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
      const fg = parse(snap.fg), bgg = parse(snap.bg);
      const la = lum(fg), lb = lum(bgg);
      const cr = +((Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)).toFixed(2);
      examined++;
      if (cr < 4.5) {
        findings.push({ vp: 'desktop', tag: 'div', cls: 'nav-room-indicator', text: snap.label,
                        fg: snap.fg, bg: snap.bg, ratio: cr, need: 4.5, gradient: false });
      }
    }
  }

  await page.close();
}

await browser.close();
server.close();

console.log(`text nodes examined      : ${examined}`);
console.log(`decorative (declared)    : ${skippedDecorative} (exempt, WCAG 1.4.3)`);
console.log(`approximate (gradient)   : ${approximate}`);
console.log(`below threshold          : ${findings.length}`);

if (findings.length) {
  console.log('');
  for (const f of findings) {
    console.log(
      `FAIL ${f.ratio} < ${f.need}  ${f.vp}  ${f.tag}.${f.cls}  "${f.text}"  ` +
        `fg=${f.fg} bg=${f.bg}${f.gradient ? ' (approximate: gradient)' : ''}`
    );
  }
  console.log('\nContrast check failed.');
  process.exit(1);
}

console.log('\nContrast check passed.');
