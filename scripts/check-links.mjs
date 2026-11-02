// Offline check: every internal link / asset reference in the build output
// (dist/) and every relative link in the repo's Markdown docs must resolve.
// External URLs (http:, https:, mailto:, ...) are listed but never fetched.
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { join, dirname, resolve, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');

// Must match `base` in vite.config.js.
const viteConfig = readFileSync(join(ROOT, 'vite.config.js'), 'utf8');
const BASE = (viteConfig.match(/base:\s*['"]([^'"]+)['"]/) || [, '/'])[1];

const errors = [];
const external = new Set();
let checked = 0;

if (!existsSync(join(DIST, 'index.html'))) {
  console.error('dist/index.html not found - run `npm run build` first.');
  process.exit(1);
}

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? walk(join(dir, d.name)) : [join(dir, d.name)]);

const isExternal = (u) => /^[a-z][a-z0-9+.-]*:/i.test(u) || u.startsWith('//');

// Collect id/name anchors per HTML file, for #fragment checks.
const anchorsOf = new Map();
function anchors(file) {
  if (!anchorsOf.has(file)) {
    const html = readFileSync(file, 'utf8');
    const ids = new Set();
    for (const m of html.matchAll(/\s(?:id|name)\s*=\s*["']([^"']+)["']/gi)) ids.add(m[1]);
    anchorsOf.set(file, ids);
  }
  return anchorsOf.get(file);
}

// Resolve a URL found in `fromFile` (inside dist/) to a file on disk.
function resolveDist(url, fromFile) {
  const [pathPart] = url.split(/[?#]/);
  let target;
  if (pathPart === '') target = fromFile;
  else if (pathPart.startsWith('/')) {
    if (!pathPart.startsWith(BASE)) return { error: `absolute path outside base "${BASE}"` };
    target = join(DIST, pathPart.slice(BASE.length));
  } else target = resolve(dirname(fromFile), pathPart);
  if (existsSync(target) && statSync(target).isDirectory()) target = join(target, 'index.html');
  return { target };
}

function check(url, fromFile, where, resolver) {
  url = url.trim();
  if (!url || url.startsWith('data:') || url.startsWith('javascript:')) return;
  if (isExternal(url)) { external.add(url); return; }
  checked++;
  const { target, error } = resolver(url, fromFile);
  const label = `${relative(ROOT, fromFile)} (${where}): "${url}"`;
  if (error) return errors.push(`${label} - ${error}`);
  if (!existsSync(target)) return errors.push(`${label} - missing file ${relative(ROOT, target)}`);
  const hash = url.includes('#') ? decodeURIComponent(url.split('#')[1]) : '';
  if (hash && extname(target) === '.html' && !anchors(target).has(hash)) {
    errors.push(`${label} - no element with id="${hash}" in ${relative(ROOT, target)}`);
  }
}

// 1. Build output: HTML attributes and CSS url().
for (const file of walk(DIST)) {
  const text = readFileSync(file, 'utf8');
  if (file.endsWith('.html')) {
    for (const m of text.matchAll(/\s(href|src|poster|data)\s*=\s*["']([^"']*)["']/gi)) {
      check(m[2], file, m[1], resolveDist);
    }
    for (const m of text.matchAll(/\ssrcset\s*=\s*["']([^"']*)["']/gi)) {
      for (const part of m[1].split(',')) check(part.trim().split(/\s+/)[0], file, 'srcset', resolveDist);
    }
  }
  if (file.endsWith('.css') || file.endsWith('.html')) {
    for (const m of text.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) {
      check(m[1], file, 'css url()', resolveDist);
    }
  }
}

// 2. Markdown docs in the repo root: relative links and images.
const resolveRepo = (url, fromFile) => {
  const [pathPart] = url.split(/[?#]/);
  return { target: pathPart ? resolve(dirname(fromFile), pathPart) : fromFile };
};
for (const name of readdirSync(ROOT).filter((n) => n.endsWith('.md'))) {
  const file = join(ROOT, name);
  const md = readFileSync(file, 'utf8');
  for (const m of md.matchAll(/!?\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g)) {
    const url = m[1];
    if (url.startsWith('#')) continue; // GitHub heading slugs are not checked
    check(url, file, 'markdown', resolveRepo);
  }
}

console.log(`Link check: ${checked} internal references checked, ${external.size} external URLs skipped (not fetched).`);
if (errors.length) {
  console.error(`\n${errors.length} broken reference(s):`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}
console.log('✓ No broken internal links or asset references.');
