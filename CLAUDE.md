# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a CSS and JavaScript framework for Webflow projects using the Harvey Component Library. It's a static framework hosted on GitHub Pages as a CDN with no build process.

## Session Start Protocol

Before making any changes:

1. **Investigate First** - Check if existing code is actually working as intended
2. **Understand Current State** - Read relevant files to understand implementation
3. **Verify Requirements** - Confirm what needs to be done before starting
4. **Preserve Functionality** - Don't break or remove existing features unless explicitly requested

## Key Architecture Patterns

**CSS Structure:**

- Modular imports via main.css in specific order (core → mapping → components → icons → library)
- Heavy use of CSS custom properties for theming
- Each feature in its own CSS file
- No build process - files served directly
  **JavaScript Structure:**
- main.js dynamically loads all modules
- Each module uses IIFE pattern
- Custom event system (webflowFrameworkReady)
- No dependencies or build tools

## Development Workflow

1. **Before Making Changes:**
   - Understand why the current implementation exists
   - Check if it's actually broken before "fixing"
   - Consider impact on existing Webflow projects using this CDN
   - Make minimal changes - only what's necessary
2. **Making Changes:**
   - Edit CSS/JS files directly (no build required)
   - Follow kebab-case naming convention
   - Keep files focused on single components
   - Test thoroughly before committing
3. **Git Workflow:**
   ```bash
   git add .
   git commit -m "Brief description"
   git push origin main
   ```
   Changes go live on GitHub Pages within 1-10 minutes.
4. **Adding JavaScript Modules:**
   - Create new .js file in /js/ directory
   - Add filename to JS_MODULES array in /js/main.js:14
   - Follow existing IIFE pattern and error handling
   - Module will be automatically loaded

## Testing Approach

No testing framework exists. Manual testing is critical:

1. Test locally by creating test HTML files
2. Verify existing functionality still works
3. Push to GitHub and wait for deployment
4. Test in actual Webflow project using CDN links
5. Check browser console for errors
6. Verify across different browsers if making significant changes

## Common Tasks

**Check deployment status:**

```bash
git status
git log --oneline -5
```

**View live framework:**

- CSS: https://webflow.teamharvey.co/css/main.css
- JS: https://webflow.teamharvey.co/js/main.js
  **Debug in browser:**

```javascript
// Check loaded modules
console.log(window.WebflowFramework.modules);
// Check for framework ready event
document.addEventListener("webflowFrameworkReady", (e) => console.log(e.detail));
```

## Important Conventions

- **Import Order**: CSS imports must maintain specific order in main.css - don't reorganise without understanding dependencies
- **Module Loading**: JS modules load asynchronously in parallel
- **Error Handling**: All JS modules must handle errors gracefully - check existing modules for patterns
- **Webflow Integration**: Uses Webflow's data-wf- attributes - preserve compatibility
- **No Build Tools**: Direct file serving - don't add any build dependencies
- **Backward Compatibility**: This is a live CDN - changes affect all projects using it immediately

## Critical Reminders

- **Don't assume things are broken** - Investigate and understand first
- **Quality over speed** - This CDN serves multiple live projects
- **Minimal changes only** - Don't refactor working code without explicit permission
- **Test everything** - No automated tests means manual testing is crucial
- **Consider existing users** - Breaking changes affect live Webflow projects immediately
