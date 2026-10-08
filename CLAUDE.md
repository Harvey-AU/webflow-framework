# CLAUDE.md

Shared CSS and JS framework for Harvey's Webflow client sites, served at `webflow.teamharvey.co`.
Every client site loads `main.css` and `main.js` from `main`, so a merge to `main` is live on all of them.

## Scope

This repo holds only code shared across client sites.
Site-specific scripts live in their own repo (e.g. [`Harvey-AU/harvey-website-2026`](https://github.com/Harvey-AU/harvey-website-2026)), loaded from that site's Webflow custom code.

## Layout and deploy

- `src/css/imports.css` lists the CSS partials in cascade order (core, mapping, components, icons, library); keep that order.
- `dist/js/*.js` are hand-written, served as-is; each module is an IIFE that fails gracefully.
- Netlify builds `main` with `node build.js` (see `netlify.toml`):
  - concatenates and minifies the CSS into `dist/css/` (generated, gitignored);
  - copies every `dist/js/*.js` to a date-versioned file and 302-redirects `/js/<name>.js` to it.
- `dist/js/main.js` loads only the modules in its `JS_MODULES` array; a new file in `dist/js/` is served but runs only where a page loads it directly.
- Run `npm run check` (ESLint) before pushing; CI runs it plus `node build.js` on every PR.

## Debugging a live site

```javascript
console.log(window.WebflowFramework.modules);
document.addEventListener("webflowFrameworkReady", (e) => console.log(e.detail));
```

Add `?debug` to the page URL for module logs.

## Conventions

- Backward compatibility first: keep existing class names, data attributes and `data-wf-` hooks working, since live sites depend on them.
- Keep changes minimal and scoped to the request; refactor working code only when asked.
- Kebab-case file names, one component per file.
