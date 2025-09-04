<div align="center">
  <img src="bookmarkplus-logo.png" alt="Bookmark+ Logo" width="120" height="120">
  
  # 📚 Bookmark+
  
  <p align="center">
    <strong>Enhanced bookmark management with intelligent tagging and lightning-fast search</strong>
  </p>
  
  <p align="center">
    <a href="#features">Features</a> •
    <a href="#installation">Installation</a> •
    <a href="#development">Development</a> •
    <a href="#contributing">Contributing</a> •
    <a href="#license">License</a>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/version-1.0.0-blue.svg?style=flat-square" alt="Version">
    <img src="https://img.shields.io/badge/license-MIT-green.svg?style=flat-square" alt="License">
    <img src="https://img.shields.io/badge/build-passing-brightgreen.svg?style=flat-square" alt="Build Status">
  </p>
  
  <p align="center">
    <img src="https://img.shields.io/badge/React-17.0.2-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React">
    <img src="https://img.shields.io/badge/TypeScript-4.9.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
    <img src="https://img.shields.io/badge/Webpack-5.90.0-8DD6F9?style=for-the-badge&logo=webpack&logoColor=black" alt="Webpack">
    <img src="https://img.shields.io/badge/Sass-1.70.0-CC6699?style=for-the-badge&logo=sass&logoColor=white" alt="Sass">
  </p>
  
  <p align="center">
    <img src="https://img.shields.io/badge/Chrome-49+-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Chrome">
    <img src="https://img.shields.io/badge/Firefox-52+-FF7139?style=for-the-badge&logo=firefox&logoColor=white" alt="Firefox">
    <img src="https://img.shields.io/badge/Opera-36+-FF1B2D?style=for-the-badge&logo=opera&logoColor=white" alt="Opera">
    <img src="https://img.shields.io/badge/Edge-79+-0078D4?style=for-the-badge&logo=microsoftedge&logoColor=white" alt="Edge">
  </p>
</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🚀 **Core Features**
- 📚 **Smart Bookmark Management** - Organize your bookmarks intelligently
- 🏷️ **Advanced Tagging System** - Flexible tag-based organization
- 🔍 **Lightning Search** - Find bookmarks instantly with advanced filters
- ⚡ **Fast Performance** - Optimized React + TypeScript architecture
- 🎨 **Beautiful UI** - Modern, responsive design with SASS styling

</td>
<td width="50%">

### 🌐 **Cross-Platform**
- 🔵 **Chrome Extensions** - Full Chrome Web Store support
- 🦊 **Firefox Add-ons** - Complete Firefox compatibility  
- 🔴 **Opera Extensions** - Native Opera integration
- 🔷 **Edge Extensions** - Microsoft Edge support
- 🔄 **Unified Codebase** - One source for all browsers

</td>
</tr>
</table>

## 🚀 Quick Start

### Prerequisites

<p align="left">
  <img src="https://img.shields.io/badge/Node.js-10+-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Yarn-1.0+-2C8EBB?style=flat-square&logo=yarn&logoColor=white" alt="Yarn">
  <img src="https://img.shields.io/badge/npm-6+-CB3837?style=flat-square&logo=npm&logoColor=white" alt="npm">
</p>

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/bookmark-plus.git
cd bookmark-plus

# Install dependencies
npm install
# or
yarn install
```

### Development

```bash
# Development mode with hot reload
npm run dev:chrome    # 🔵 Chrome
npm run dev:firefox   # 🦊 Firefox  
npm run dev:opera     # 🔴 Opera

# Production build
npm run build         # 🚀 All browsers
npm run build:chrome  # 🔵 Chrome only
```

### Browser Installation

<details>
<summary><strong>🔵 Chrome Installation</strong></summary>

1. Open `chrome://extensions/`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `extension/chrome` folder
5. 🎉 Ready to use!

</details>

<details>
<summary><strong>🦊 Firefox Installation</strong></summary>

1. Open `about:debugging`
2. Click **This Firefox**
3. Click **Load Temporary Add-on**
4. Select `manifest.json` in `extension/firefox`
5. 🎉 Ready to use!

</details>

<details>
<summary><strong>🔴 Opera Installation</strong></summary>

1. Open `opera:extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `extension/opera` folder
5. 🎉 Ready to use!

</details>

## 🏗️ Architecture

### Tech Stack

<div align="center">
  <table>
    <tr>
      <td align="center" width="96">
        <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" width="48" height="48" alt="React" />
        <br>React
      </td>
      <td align="center" width="96">
        <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg" width="48" height="48" alt="TypeScript" />
        <br>TypeScript
      </td>
      <td align="center" width="96">
        <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/webpack/webpack-original.svg" width="48" height="48" alt="Webpack" />
        <br>Webpack
      </td>
      <td align="center" width="96">
        <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/sass/sass-original.svg" width="48" height="48" alt="Sass" />
        <br>Sass
      </td>
      <td align="center" width="96">
        <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/babel/babel-original.svg" width="48" height="48" alt="Babel" />
        <br>Babel
      </td>
      <td align="center" width="96">
        <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/eslint/eslint-original.svg" width="48" height="48" alt="ESLint" />
        <br>ESLint
      </td>
    </tr>
  </table>
</div>

### Project Structure

```
📦 bookmark-plus/
├── 📂 source/                    # 🎯 TypeScript + React source
│   ├── 📂 Background/            # 🔧 Background scripts
│   ├── 📂 ContentScript/         # 📄 Content scripts  
│   ├── 📂 Popup/                 # 🖼️ Extension popup
│   ├── 📂 Options/               # ⚙️ Options page
│   ├── 📂 components/            # 🧩 Reusable components
│   ├── 📂 services/              # 🛠️ Business logic
│   └── 📄 manifest.json          # 📋 Extension manifest
├── 📂 views/                     # 🌐 HTML templates
├── 📂 extension/                 # 📦 Built extensions
│   ├── 📂 chrome/               # 🔵 Chrome build
│   ├── 📂 firefox/              # 🦊 Firefox build
│   └── 📂 opera/                # 🔴 Opera build
├── 📄 webpack.config.js         # ⚡ Build configuration
└── 📄 package.json              # 📋 Project metadata
```

## 🔧 Development Scripts

| Command | Description | Usage |
|---------|-------------|-------|
| `npm run dev:chrome` | 🔵 Chrome development with hot reload | Daily development |
| `npm run dev:firefox` | 🦊 Firefox development with hot reload | Firefox testing |
| `npm run dev:opera` | 🔴 Opera development with hot reload | Opera testing |
| `npm run build` | 🚀 Production build for all browsers | Release preparation |
| `npm run lint` | 🔍 Code quality check | Pre-commit hook |
| `npm run lint:fix` | 🔧 Auto-fix linting issues | Code cleanup |

## 🤝 Contributing

We love contributions! Here's how you can help make Bookmark+ even better:

<div align="center">
  <table>
    <tr>
      <td align="center">
        <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=for-the-badge" alt="PRs Welcome">
      </td>
      <td align="center">
        <img src="https://img.shields.io/badge/Issues-Welcome-blue.svg?style=for-the-badge" alt="Issues Welcome">
      </td>
      <td align="center">
        <img src="https://img.shields.io/badge/Discussions-Open-purple.svg?style=for-the-badge" alt="Discussions Open">
      </td>
    </tr>
  </table>
</div>

1. 🍴 **Fork** the repository
2. 🌿 **Create** your feature branch (`git checkout -b feature/amazing-feature`)
3. 💻 **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. 🚀 **Push** to the branch (`git push origin feature/amazing-feature`)
5. 🎯 **Open** a Pull Request

## 🙏 Acknowledgments

<div align="center">
  <p>Built with 💜 using the excellent <a href="https://github.com/abhijithvijayan/web-extension-starter">web-extension-starter</a> boilerplate</p>
  <p>Special thanks to <a href="https://github.com/abhijithvijayan">@abhijithvijayan</a> for the amazing foundation!</p>
</div>

---

<div align="center">
  
  ## 📄 License
  
  <p>
    <strong>MIT License</strong> © 2024 <a href="https://zerobell.xyz">Bookmark+</a>
  </p>
  
  <p>
    <a href="./LICENSE">
      <img src="https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge" alt="License MIT">
    </a>
  </p>
  
  ---
  
  <p>
    <strong>Made with ❤️ for the developer community</strong>
  </p>
  
  <p>
    <a href="https://www.buymeacoffee.com/zerobell">
      <img src="https://img.shields.io/badge/Buy%20Me%20a%20Coffee-orange?logo=buy-me-a-coffee" alt="Buy Me a Coffee">
    </a>
  </p>
  
  <p>
    <a href="mailto:lee@zerobell.xyz">📧 Contact</a> •
    <a href="https://zerobell.xyz">🌐 Website</a>
  </p>
  
</div>