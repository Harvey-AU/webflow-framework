![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![GitHub last commit](https://img.shields.io/github/last-commit/Harvey-AU/webflow-framework)

# Harvey Webflow Framework

A CSS and JavaScript framework designed for Webflow projects using the Harvey Component Library. This framework provides reusable components, utilities, and styling systems.

## 🚀 Quick Start

[![Netlify Status](https://api.netlify.com/api/v1/badges/c4d00a68-902c-4007-bb57-0c88ce6ebceb/deploy-status)](https://app.netlify.com/projects/harvey-webflow-component-library/deploys)

Add this single line to your Webflow project's custom code (`<head>` section):

```html
<link rel="stylesheet" href="https://webflow.teamharvey.co/css/main.css" />
```

**Optional: Add JavaScript functionality** before closing `</body>` tag:

```html
<script src="https://webflow.teamharvey.co/js/main.js"></script>
```

## 📁 Project Structure

```
webflow-framework/
├── css/
│   ├── main.css                    # Main import file (use this in Webflow)
│   ├── core/                       # Core framework components
│   │   ├── base.css
│   │   ├── buttons.css
│   │   ├── corners.css
│   │   ├── fluid-sizing.css
│   │   ├── gap.css
│   │   ├── grid.css
│   │   └── max-lines.css
│   ├── framework-mapping/          # Mapping CSS variables from Library Project to Local project variables
│   │   ├── colour/
│   │   │   ├── primitive.css
│   │   │   ├── semantic.css
│   │   │   └── semantic-buttons.css
│   │   ├── fonts/
│   │   │   ├── base.css
│   │   │   └── rich-text.css
│   │   └── sizing/
│   │       ├── border-corner.css
│   │       ├── button.css
│   │       ├── gap-spacing.css
│   │       └── general.css
│   ├── icons/                      # Icon system
│   │   ├── base.css
│   │   ├── content.css
│   │   ├── mapping.css
│   │   └── simple.css
│   └── framework.css               # Backend library styles
├── js/                             # JavaScript functionality
│   ├── main.js                     # Main JS loader (use this in Webflow)
│   ├── external-links.js           # Auto-handle external links
│   ├── query-param-to-form.js      # URL params to form fields
│   ├── social-share.js             # Social sharing functionality
│   └── tooltip.js                  # Interactive tooltips
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

2. **Edit CSS/JS files** as needed

3. **Commit and push changes:**

   ```bash
   git add .
   git commit -m "Update button styles"
   git push origin main
   ```

4. **Changes go live automatically** via Netlify deployment within 1-2 minutes

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
- **Update Time**: 1-10 minutes after pushing changes
- **Caching**: Optimised for both development and production use
- **Reliability**: Backed by Netlify's global CDN infrastructure

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
