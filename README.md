![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![GitHub last commit](https://img.shields.io/github/last-commit/Harvey-AU/webflow-framework)

# Harvey Webflow Framework

A CSS and JavaScript framework designed for Webflow projects using the Harvey Component Library. This framework provides reusable components, utilities, and styling systems.

## 🚀 Quick Start

[![Netlify Status](https://api.netlify.com/api/v1/badges/c4d00a68-902c-4007-bb57-0c88ce6ebceb/deploy-status)](https://app.netlify.com/projects/harvey-webflow-component-library/deploys)

Add this single line to your Webflow project's custom code (`<head>` section):

```html
<!-- Production (recommended): Minified with Lightning CSS, ~198KB -->
<link rel="stylesheet" href="https://webflow.teamharvey.co/css/main.css" />

<!-- Stable versioned snapshot (pin to specific build): -->
<link rel="stylesheet" href="https://webflow.teamharvey.co/v/2025-11-13/v1/css/main.css" />
```

**Optional: Add JavaScript functionality** before closing `</body>` tag:

```html
<script src="https://webflow.teamharvey.co/js/main.js"></script>
```

## 📁 Project Structure

```
webflow-framework/
├── src/                            # Source files (private)
│   └── css/
│       ├── imports.css             # Build input file (defines import order)
│       ├── core/                   # Core framework components
│       │   ├── base.css
│       │   ├── buttons.css
│       │   ├── corners.css
│       │   ├── fluid-sizing.css
│       │   ├── gap.css
│       │   ├── grid.css
│       │   ├── max-lines.css
│       │   └── richtext-extras.css
│       ├── framework-mapping/      # CSS variable mappings
│       │   ├── colour/
│       │   │   ├── primitive.css
│       │   │   ├── semantic.css
│       │   │   └── semantic-buttons.css
│       │   ├── fonts/
│       │   │   ├── base.css
│       │   │   └── rich-text.css
│       │   ├── sizing/
│       │   │   ├── border-corner.css
│       │   │   ├── button.css
│       │   │   ├── gap-spacing.css
│       │   │   └── general.css
│       │   └── framework.css
│       └── icons/                  # Icon system
│           ├── base.css
│           ├── content.css
│           ├── mapping.css
│           └── simple.css
├── dist/                           # Built files (public)
│   ├── css/
│   │   ├── main.css                # Production version (198KB, minified)
│   │   ├── main.2025-11-13-v1.css  # Version-tagged for long-term caching
│   │   └── main.unminified.css     # Debug version (226KB, unminified)
│   ├── js/                         # JavaScript functionality
│   │   ├── main.js                 # Main JS loader
│   │   ├── main.2025-11-13-v1.js   # Version-tagged for long-term caching
│   │   ├── external-links.js       # Auto-handle external links
│   │   ├── insert-data.js          # Data insertion utilities
│   │   ├── query-param-to-form.js  # URL params to form fields
│   │   ├── social-share.js         # Social sharing functionality
│   │   └── tooltip.js              # Interactive tooltips
│   ├── _redirects                  # Netlify redirects for cache busting
│   ├── _headers                    # Cache-Control headers for optimal performance
│   └── v/                          # Versioned snapshots (ignored in git)
│       ├── 2025-10-01/
│       │   └── v1/                 # First build of the day
│       │       ├── css/
│       │       └── js/
│       └── 2025-10-02/
│           ├── v1/                 # Versioned builds
│           ├── v2/
│           └── v3/
├── build.js                        # Build script (Lightning CSS)
├── netlify.toml                    # Deployment configuration
└── README.md
```

## 🎯 Features

### Core Components

- **Base Styles**: Foundation styling and resets
- **Grid System**: Flexible grid layouts
- **Buttons**: Comprehensive button styling system
- **Fluid Sizing**: Responsive sizing utilities
- **Gap & Spacing**: Consistent spacing system
- **Corners**: Border radius utilities
- **Text Controls**: Multi-line text truncation

### Framework Mapping

- **Color System**: Primitive and semantic color tokens
- **Typography**: Base fonts and rich text styling
- **Sizing System**: Consistent sizing scales
- **Button Variants**: Semantic button styles

### Icon System

- **Base Icons**: Core icon styling
- **Content Icons**: Content-specific icons
- **Icon Mapping**: Icon utility classes

### JavaScript Features

- **External Links**: Automatically opens external links in new tabs with proper security attributes
- **Tooltip System**: Interactive tooltips for enhanced UX
- **Social Sharing**: One-click social media sharing functionality
- **Form Utilities**: Automatically populate form fields from URL query parameters
- **Smart Loading**: Main.js automatically loads all modules with error handling

## 🔄 Versioning & Caching System

The framework uses an intelligent caching strategy for optimal performance:

### **Latest (always current):**
```html
<!-- Stable URL that redirects to the latest version-tagged file -->
<link rel="stylesheet" href="https://webflow.teamharvey.co/css/main.css" />
<script src="https://webflow.teamharvey.co/js/main.js"></script>
```

### **Stable versioned snapshots (pin to specific build):**
```html
<!-- Pin to specific date and version for guaranteed stability -->
<link rel="stylesheet" href="https://webflow.teamharvey.co/v/2025-11-13/v1/css/main.css" />
<script src="https://webflow.teamharvey.co/v/2025-11-13/v1/js/main.js"></script>
```

### **How it works:**

**Cache Performance Strategy:**
1. **Stable URLs** (`/css/main.css`, `/js/*.js`) → 302 redirect to version-tagged files
   - Cache-Control: `public, max-age=0, must-revalidate` (always fresh)
2. **Version-tagged files** (`main.2025-11-13-v1.css`) → Immutable, cached for 1 year
   - Cache-Control: `public, max-age=31536000, immutable`
3. **Result**: Browsers cache assets long-term while stable URLs stay fresh

**Versioning:**
- **Each deployment** creates a new dated snapshot in `/v/{YYYY-MM-DD}/v{N}/`
- **Multiple builds per day** get incremental versions (v1, v2, v3...)
- **All previous versions** remain available permanently
- **Format**: `v/{YYYY-MM-DD}/v{N}/css/main.css`

### **When to use each approach:**
- ✅ **Latest URL** - Development, always get newest features with browser caching
- ✅ **Versioned snapshots** - Production projects, client sites, guaranteed stability
- ✅ **Staging environments** - Test new versions before pinning to production

## 🚀 Performance

### **Before optimization:**
- 18 sequential HTTP requests via @import statements
- ~220KB total download across multiple files
- Render-blocking CSS loading waterfall
- No browser caching (always re-downloaded)

### **After optimization:**
- 1 HTTP request (single concatenated file)
- 198KB minified with Lightning CSS (12% reduction)
- Eliminates render-blocking import chain
- **Long-term browser caching** via version-tagged files (1-year immutable cache)
- **Stable URLs** automatically redirect to latest cached version
- **Significant improvement** on mobile, slower connections, and repeat visits

## 📖 Usage

### Basic Implementation

1. **Add the CSS framework to your Webflow project (`<head>`):**

   ```html
   <link rel="stylesheet" href="https://webflow.teamharvey.co/css/main.css" />
   ```

2. **Add JavaScript functionality (before `</body>`):**
   ```html
   <script src="https://webflow.teamharvey.co/js/main.js"></script>
   ```

### Individual Components

If you only need specific components, you can import them individually:

**CSS Components:**

```html
<!-- Just the button system -->
<link rel="stylesheet" href="https://webflow.teamharvey.co/css/core/buttons.css" />

<!-- Just the grid system -->
<link rel="stylesheet" href="https://webflow.teamharvey.co/css/core/grid.css" />
```

**JavaScript Modules:**

```html
<!-- Just external links functionality -->
<script src="https://webflow.teamharvey.co/js/external-links.js"></script>

<!-- Just tooltip functionality -->
<script src="https://webflow.teamharvey.co/js/tooltip.js"></script>
```

### JavaScript Framework Events

The framework dispatches a custom event when all modules are loaded:

```html
<script>
  document.addEventListener("webflowFrameworkReady", function (e) {
    console.log("🎉 Framework ready!", e.detail);
    // Your custom code here
  });
</script>
```

### Debug Information

Access framework debug information in the browser console:

```javascript
// Check what modules are loaded
console.log(window.WebflowFramework.modules);

// Manually reload all JavaScript modules
window.WebflowFramework.reload();
```

## 🔧 Development

### Making Changes

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Harvey-AU/webflow-framework.git
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Edit source files:**
   - **CSS**: Edit files in `src/css/` subfolders
   - **JS**: Edit files directly in `dist/js/` (no build needed)
   - **Add new CSS files**: Update `src/css/imports.css` import order

4. **Test build locally:**

   ```bash
   node build.js
   ```

5. **Commit and push changes:**

   ```bash
   git add .
   git commit -m "Update button styles"
   git push origin main
   ```

6. **Automatic deployment:**
   - Netlify builds and deploys within 1-2 minutes
   - Creates new versioned snapshot automatically
   - Both latest and versioned URLs updated

### Build Process

The framework uses Lightning CSS for optimal performance:

1. **Reads** `src/css/imports.css` to understand import order
2. **Concatenates** all imported CSS files into single files
3. **Minifies** using Lightning CSS (Rust-based, fastest available)
4. **Outputs** both debug and production versions
5. **Creates** automatic versioned snapshots

**Build outputs:**
- `dist/css/main.css` - Production version (198KB, Lightning CSS minified)
- `dist/css/main.{version-tag}.css` - Version-tagged file for long-term caching
- `dist/css/main.unminified.css` - Debug version (226KB, unminified)
- `dist/js/*.js` - Original JS files (stable URLs)
- `dist/js/*.{version-tag}.js` - Version-tagged JS files for long-term caching
- `dist/_redirects` - Netlify 302 redirects from stable URLs to version-tagged files
- `dist/_headers` - Cache-Control headers for optimal caching strategy
- `dist/v/{date}/v{n}/` - Versioned snapshots for backwards compatibility

**Build files:**
- `src/css/imports.css` - Source file defining import order
- `build.js` - Build script using Lightning CSS
- `netlify.toml` - Deployment configuration (`publish = "dist"`)
- `package.json` - Lightning CSS and esbuild dependencies

### Load Order

The framework loads components in this order:

1. Core base styles
2. Framework mapping (colors, fonts, sizing)
3. Core components
4. Icons
5. Library backend styles

JavaScript modules are loaded asynchronously in parallel for optimal performance.

### Adding New JavaScript Modules

To add a new JavaScript module to the framework:

1. Create your `.js` file in the `/js/` directory
2. Add the filename to the `JS_MODULES` array in `main.js`
3. Commit and push - the module will be automatically loaded

## 🌐 CDN Information

This framework is hosted via **Netlify** for optimal performance and reliability.

- **Base URL**: `https://webflow.teamharvey.co/`
- **Update Time**: 1-2 minutes after pushing changes
- **Caching Strategy**:
  - Stable URLs → 302 redirect (always revalidate)
  - Version-tagged files → Immutable, 1-year cache
  - Optimal for both development and production use
- **Reliability**: Backed by Netlify's global CDN infrastructure
- **Performance**: Long-term browser caching eliminates redundant downloads

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-component`)
3. Make your changes
4. Test in a Webflow project
5. Commit changes (`git commit -m 'Add new component'`)
6. Push to branch (`git push origin feature/new-component`)
7. Open a Pull Request

## 📝 File Naming Convention

- Use kebab-case for all file names
- Organise by functionality/category
- Keep individual files focused on single components
- Use descriptive names (e.g., `semantic-buttons.css` not `buttons2.css`)

## 📋 Roadmap

- [ ] Add animation utilities
- [ ] Expand icon system
- [ ] Add dark mode support
- [ ] Create component documentation

## 📄 License

MIT License - feel free to use in any project, but only really works with the Harvey Component library.

## 🐛 Issues & Support

Found a bug or need a feature? [Open an issue](https://github.com/Harvey-AU/webflow-framework/issues) on GitHub.

---

**Made with ❤️ for the Webflow community**
