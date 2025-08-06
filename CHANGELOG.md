# Changelog

All notable changes to the Webflow Framework project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Multiple version updates may occur on the same date, each with its own version number.
Each version represents a distinct set of changes, even if released on the same day.

## [1.0.5] - 2025-07-17

### Changed

- Moved to Netlify CDN using sub-domain webflow.teamharvey.co

## [1.0.4] - 2025-07-17

### Changed

- Converted all American English spelling to British English throughout JavaScript files
  - "initialize" → "initialise"
  - "initialization" → "initialisation"
  - "expiration" → "expiry"
- Added comprehensive error handling with try-catch blocks to tooltip.js and social-share.js
- Enhanced error messages with module name prefixes for easier debugging

### Fixed

- Added DOM element existence checks in social-share.js to prevent silent failures
- Scripts now log clear error messages instead of failing silently when DOM elements are missing

## [1.0.3] - 2025-07-17

### Added

- Added `.gitignore` file with standard exclusions (.DS_Store, .env, claude.md)

### Changed

- Wrapped all JavaScript modules in IIFEs (Immediately Invoked Function Expressions)
- Added "use strict" mode to all JavaScript modules

### Fixed

- Resolved global namespace pollution issues
- Fixed variable scope issues that were accidentally creating global variables

## [1.0.2] - 2025-07-17

### Changed

- Replaced DOMContentLoaded event listeners with DOM readyState checks across all modules
- Scripts now check `document.readyState` and initialise immediately if DOM is already loaded

### Fixed

- Fixed bug where `urlParams` wasn't being passed to `createLead()` function in query-param-to-form.js
- Fixed timing issues where modules wouldn't initialise if loaded after DOMContentLoaded

## [1.0.1] - 2025-07-17

### Changed

- Refactored query-param-to-form.js timing logic
- Moved parameter capture logic into dedicated functions

### Fixed

- Removed hardcoded 2-second setTimeout delays
- Resolved form handling timing issues with proper DOM readyState checks

## [1.0.0] - 2025-07-17

### Added

- Initial release of Webflow Framework
- Core CSS framework with modular architecture
- JavaScript modules:
  - External links handler
  - Query parameter to form field mapper
  - Social sharing functionality
  - Tooltip system
- GitHub Pages CDN deployment
- No-build-process architecture for direct file serving

### Technical Details

- CSS served via main.css with ordered imports
- JavaScript modules loaded dynamically via main.js
- Custom event system (webflowFrameworkReady)
- Integration with Webflow's data attributes
