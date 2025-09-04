# CLAUDE.md - Bookmark+ Project

## Project Overview

**Bookmark+** is an enhanced bookmark management Chrome extension that provides advanced tagging and search capabilities. This project is built upon the excellent [web-extension-starter](https://github.com/abhijithvijayan/web-extension-starter) boilerplate by Abhijith Vijayan.

## Technology Stack

- **Framework**: React 17 + TypeScript
- **Build Tool**: Webpack 5
- **Styling**: SASS with advanced CSS reset
- **Browser APIs**: Web Extensions API with polyfills
- **Development**: Hot reload, ESLint, Prettier

## Development Commands

```bash
# Install dependencies
npm install

# Development (with hot reload)
npm run dev:chrome    # Chrome extension
npm run dev:firefox   # Firefox addon  
npm run dev:opera     # Opera extension

# Production builds
npm run build:chrome  # Chrome only
npm run build:firefox # Firefox only
npm run build:opera   # Opera only
npm run build         # All browsers

# Code quality
npm run lint          # Check code style
npm run lint:fix      # Auto-fix linting issues
```

## Project Structure

```
bookmark-plus/
├── source/                 # TypeScript/React source code
│   ├── Background/         # Background scripts
│   ├── ContentScript/      # Content scripts
│   ├── Popup/             # Extension popup
│   ├── Options/           # Options page
│   └── manifest.json      # Extension manifest
├── views/                 # HTML templates
├── extension/             # Built extensions
│   ├── chrome/
│   ├── firefox/
│   └── opera/
├── webpack.config.js      # Build configuration
└── package.json          # Project configuration
```

## Browser Testing

### Chrome
1. Navigate to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `extension/chrome` folder

### Firefox
1. Navigate to `about:debugging`
2. Click "This Firefox"
3. Click "Load Temporary Add-on"
4. Select `manifest.json` in `extension/firefox`

### Opera
1. Navigate to `opera:extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `extension/opera` folder

## Key Features Implementation

- **Enhanced Bookmarks**: Advanced bookmark management beyond browser defaults
- **Tag System**: Flexible tagging system for better organization
- **Advanced Search**: Quick search with filtering capabilities
- **Cross-browser**: Unified codebase for Chrome, Firefox, and Opera
- **Modern UI**: React-based responsive interface

## Build Information

- **Version**: 1.0.0
- **License**: MIT
- **Author**: lee@zerobell.xyz (https://zerobell.xyz)
- **Based on**: web-extension-starter by Abhijith Vijayan

## Development Notes

- The extension manifest is automatically generated for each browser target
- Webpack handles TypeScript compilation and asset bundling
- ESLint configuration follows Airbnb style guide
- Auto-reload functionality speeds up development workflow
- Production builds are optimized and minified

## Browser Compatibility

| Browser | Minimum Version | Status |
|---------|----------------|--------|
| Chrome  | 49+            | ✅ Supported |
| Firefox | 52+            | ✅ Supported |
| Opera   | 36+            | ✅ Supported |
| Edge    | 79+            | ✅ Supported |

---

*This CLAUDE.md file serves as project documentation for Claude AI assistant interactions.*