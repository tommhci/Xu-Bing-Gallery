# Xu Bing: Epistemic Gallery — v2.7.1


## Project structure

```
xu-bing-gallery/
├── index.html              ← HTML only; no inline style or script
├── package.json
├── vite.config.js
└── src/
    ├── css/
    │   ├── tokens.css      ← :root design tokens only
    │   ├── base.css        ← reset, body, keyframes, reveal, utilities
    │   ├── components.css  ← all reusable UI components
    │   └── sections.css    ← section-scoped layout + responsive rules
    └── js/
        ├── data.js         ← single source of truth for all content/config
        ├── main.js         ← entry point; imports and calls all modules
        └── modules/
            ├── loader.js
            ├── cursor.js
            ├── pseudo-bg.js
            ├── entry-rupture.js
            ├── navigation.js
            ├── you-are-here.js
            ├── navigation-guard.js
            ├── minimap.js
            ├── reveal.js
            ├── char-matrix.js
            ├── square-word.js
            ├── glyph-quiz.js
            ├── theory-reveal.js
            └── ar-grid.js
```

## Setup

```bash
npm install
npm run dev      # local dev server at http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview production build locally
```

## Deployment

After `npm run build`, deploy the `dist/` folder to any static host:
- **GitHub Pages**: push `dist/` to the `gh-pages` branch, or configure
  Pages to serve from `dist/` on `main`.
- **Netlify / Vercel**: point root to this repo; build command `npm run build`,
  publish directory `dist`.

## Maintenance

### Changing text content
All content lives in `index.html`. Edit directly — no build step needed
for content-only changes during development (`npm run dev` hot-reloads).

### Changing character data or room config
Edit `src/js/data.js`. The `DATA` object is the single source of truth
imported by all modules that need it.

### Adding a new room
1. Add the room's HTML section to `index.html` following the `.gallery-room`
   pattern.
2. Add its `id` to `DATA.sectionIds` in `src/js/data.js`.
3. Add its metadata to `DATA.roomMeta` for YOU ARE HERE tracking.
4. Add a minimap dot to the `#minimap` element in `index.html`.
5. Add room color variables to `tokens.css` if needed.

### Adding new Square Words
Add key–value pairs to `DATA.squareWords` in `src/js/data.js`.
The `square-word.js` module reads this dynamically.

### Modifying a module
Each module in `src/js/modules/` exports a single `init()` function.
Import order in `main.js` is the initialization order — change if needed.

## Design constraints (do not change)

The following are load-bearing friction — intentional heuristic violations
that are the conceptual content of the project:

- **Entry button (囗)**: unlabeled pseudo-character. The 3-second tooltip
  delay is required. Do not label the button on load.
- **Glyph Engine options**: four buttons display `— — — —` until the user
  commits a guess. Labels must not appear before the attempt.

The following are access-layer fixes that must be preserved:

- Breadcrumb font-size: `0.72rem` minimum (was `0.55rem` in v2.5).
- YOU ARE HERE: all 11 sections tracked in `DATA.roomMeta`.
- Navigation guard: popstate intercept in `navigation-guard.js`.
- Authorship tags: `.authorship-tag` elements in Theory and Artist sections.
