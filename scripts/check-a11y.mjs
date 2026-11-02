// Accessibility check: serves dist/ locally (no network), loads each page in
// headless Chromium via Playwright, scrolls so scroll-revealed content is
// visible, then runs axe-core (WCAG 2.x A/AA + best-practice rules such as
// heading-order). Also checks that in-page #links point at existing ids.
// Any violation fails the run.
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';

const require = createRequire(import.meta.url);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const viteConfig = readFileSync(join(ROOT, 'vite.config.js'), 'utf8');
const BASE = (viteConfig.match(/base:\s*['"]([^'"]+)['"]/) || [, '/'])[1];
const AXE_SOURCE = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

// Pages to audit (paths relative to the base). Single-page site for now.
const PAGES = ['index.html'];
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

if (!existsSync(join(DIST, 'index.html'))) {
  console.error('dist/index.html not found - run `npm run build` first.');
  process.exit(1);
}

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.woff2': 'font/woff2', '.json': 'application/json', '.ico': 'image/x-icon' };

const server = createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (!path.startsWith(BASE)) { res.writeHead(404).end(); return; }
  let file = normalize(join(DIST, path.slice(BASE.length)));
  if (!file.startsWith(DIST)) { res.writeHead(403).end(); return; }
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file)) { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' });
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const origin = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch();
let failures = 0;

try {
  for (const page of PAGES) {
    for (const vp of VIEWPORTS) {
      const label = `${page} [${vp.name} ${vp.width}x${vp.height}]`;
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const tab = await context.newPage();
      const pageErrors = [];
      tab.on('pageerror', (e) => pageErrors.push(e.message));
      // Stay offline: block everything that is not our local server (e.g. Google Fonts).
      await tab.route('**/*', (route) =>
        route.request().url().startsWith(origin) ? route.continue() : route.abort());

      await tab.goto(`${origin}${BASE}${page}`, { waitUntil: 'load' });
      // Wait for the intro loader overlay (if any) to finish.
      await tab.waitForFunction(() => {
        const l = document.getElementById('loader');
        return !l || l.classList.contains('hidden');
      }, null, { timeout: 15000 }).catch(() => {});
      // Scroll through the page so IntersectionObserver reveals fire.
      await tab.evaluate(async () => {
        const step = Math.max(200, window.innerHeight / 2);
        for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 60));
        }
        window.scrollTo(0, 0);
      });
      // Let reveal/loader transitions finish so contrast is measured on the
      // final state (otherwise results depend on timing). Infinite animations are ignored.
      // Wait until no finite CSS animation/transition is running (polling, since
      // scroll handlers can start new transitions late), max 10 s.
      await tab.evaluate(async () => {
        const deadline = Date.now() + 10000;
        const running = () => document.getAnimations().filter((a) => a.playState === 'running'
          && a.effect && a.effect.getComputedTiming().endTime !== Infinity);
        let quiet = 0;
        while (Date.now() < deadline && quiet < 3) {
          await new Promise((r) => setTimeout(r, 150));
          quiet = running().length ? 0 : quiet + 1;
        }
      });

      await tab.addScriptTag({ content: AXE_SOURCE });
      const results = await tab.evaluate(() => window.axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] },
        resultTypes: ['violations', 'incomplete'],
      }));

      // In-page anchors in the live DOM (includes script-generated links).
      const brokenHash = await tab.evaluate(() =>
        [...document.querySelectorAll('a[href^="#"]')]
          .map((a) => a.getAttribute('href'))
          .filter((h) => h.length > 1 && !document.getElementById(decodeURIComponent(h.slice(1)))));

      const v = results.violations;
      console.log(`\n${label}: ${v.length} axe violation type(s), ${results.incomplete.length} needing manual review`);
      for (const r of v) {
        console.log(`  ✗ [${r.impact}] ${r.id}: ${r.help} (${r.nodes.length} node(s))`);
        for (const n of r.nodes.slice(0, 8)) {
          console.log(`      ${n.target.join(' ')}`);
          const msg = (n.any[0] || n.all[0] || n.none[0] || {}).message;
          if (msg) console.log(`        ${msg}`);
        }
        if (r.nodes.length > 8) console.log(`      ... and ${r.nodes.length - 8} more`);
      }
      for (const r of results.incomplete) {
        const why = {};
        for (const n of r.nodes) {
          const c = n.any[0] || n.all[0] || n.none[0] || {};
          const k = (c.data && c.data.messageKey) || c.id || 'unknown';
          why[k] = (why[k] || 0) + 1;
        }
        const reasons = Object.entries(why).map(([k, c]) => `${k}: ${c}`).join(', ');
        console.log(`  ? ${r.id}: ${r.help} - ${r.nodes.length} node(s) axe could not decide automatically (${reasons}); not counted as failure`);
      }
      for (const h of [...new Set(brokenHash)]) console.log(`  ✗ broken in-page link: ${h}`);
      for (const e of pageErrors) console.log(`  ✗ uncaught page error: ${e}`);
      failures += v.length + new Set(brokenHash).size + pageErrors.length;
      await context.close();
    }
  }
} finally {
  await browser.close();
  server.close();
}

if (failures) {
  console.error(`\nAccessibility check failed: ${failures} problem(s).`);
  process.exit(1);
}
console.log('\n✓ No axe violations, broken in-page links or page errors.');
