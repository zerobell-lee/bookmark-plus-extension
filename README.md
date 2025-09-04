# 📚 Bookmark+

Enhanced bookmark management with tags and advanced search capabilities for Chrome extensions.

Built with [web-extension-starter](https://github.com/abhijithvijayan/web-extension-starter) boilerplate by [@abhijithvijayan](https://github.com/abhijithvijayan).

## Features

- 📚 Enhanced bookmark management
- 🏷️ Tag-based organization  
- 🔍 Advanced search functionality
- 🚀 Cross-browser support (Chrome, Firefox, Opera)
- ⚡ Fast and responsive UI built with React + TypeScript
- 🎨 Modern SASS styling
- 🔄 Auto-reload during development

## Browser Support

| [![Chrome](https://raw.github.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png)](/) | [![Firefox](https://raw.github.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png)](/) | [![Opera](https://raw.github.com/alrra/browser-logos/master/src/opera/opera_48x48.png)](/) | [![Edge](https://raw.github.com/alrra/browser-logos/master/src/edge/edge_48x48.png)](/) |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| 49 & later ✔                                                                                  | 52 & later ✔                                                                                     | 36 & later ✔                                                                               | 79 & later ✔                                                                            |

## 🚀 Development

Ensure you have [Node.js](https://nodejs.org) 10 or later installed.

### Installation

```bash
npm install
```

### Development Scripts

- `npm run dev:chrome` - Start development server for Chrome extension
- `npm run dev:firefox` - Start development server for Firefox addon  
- `npm run dev:opera` - Start development server for Opera extension

### Load Extension in Browser

#### Chrome
1. Go to `chrome://extensions`
2. Enable `Developer Mode`
3. Click `Load Unpacked Extension`
4. Select the `extension/chrome` folder

#### Firefox  
1. Go to `about:debugging`
2. Load as temporary Add-on
3. Select `manifest.json` in `extension/firefox` folder

#### Opera
1. Go to `opera:extensions` 
2. Enable `Developer Mode`
3. Load as unpacked from `extension/opera` folder

### Production Build

```bash
npm run build
```

Builds optimized extensions for all browsers in the `extension/` directory.

## 🛠️ Built With

- **React 17** - UI Library
- **TypeScript** - Type Safety
- **SASS** - Styling
- **Webpack** - Bundling
- **Web Extensions API** - Cross-browser compatibility

## 📁 Project Structure

```
Bookmark+/
├── source/           # Source code
├── views/           # HTML templates  
├── extension/       # Built extensions
└── webpack.config.js # Build configuration
```

## 🙏 Acknowledgments

This project is built upon the excellent [web-extension-starter](https://github.com/abhijithvijayan/web-extension-starter) boilerplate created by [Abhijith Vijayan](https://abhijithvijayan.in).

## 📄 License

MIT © [Bookmark+](https://zerobell.xyz)

See [LICENSE](./LICENCE) for details.