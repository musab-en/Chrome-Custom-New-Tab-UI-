<div align="center">

# ✨ Easenmia - Next-Gen New Tab Experience

A beautiful, high-performance, and commercial-grade "New Tab" browser extension built with React, Vite, and Material You design principles. Transform your browser workspace into a dynamic, personalized dashboard.

[![Built by Axiabits](https://img.shields.io/badge/Powered%20by-Axiabits-blueviolet?style=for-the-badge)](https://axiabits.com)
[![React](https://img.shields.io/badge/React-19.2.4-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0.4-purple?style=for-the-badge&logo=vite)](https://vitejs.dev/)

</div>

---

## 🌟 Features

*   **🎨 Material You Theming**: Dynamic theming engine that embraces glassmorphism and liquid display UI aesthetics.
*   **⚡ Blazing Fast**: Built with Vite and React for snappy, instant load times.
*   **🛠️ Modular Widgets**: Includes highly-customizable widgets like dynamic Clock, Weather, Tasks, and more, all with drag-and-drop repositioning.
*   **🔒 Secure & Private**: Manifest V3 compliant. No gross tracking—just pure utility on your local machine.
*   **🎭 Fluid Animations**: Smooth, premium micro-animations powered by `framer-motion`.

## 🚀 Quick Start

If you want to run this extension locally or contribute to the development, follow these steps:

### Prerequisites
Make sure you have Node.js and NPM installed on your machine.

### Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <your-repo-url>
   cd chrome_ui_extension
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server** (for browser preview):
   ```bash
   npm run dev
   ```

4. **Build the extension**:
   ```bash
   npm run build
   ```
   > This will generate a `dist` folder. This is the compiled extension that Chrome reads!

## 🧩 Loading into Chrome

Since the `dist` and `node_modules` folders are intentionally not pushed to GitHub, you need to follow the Build step (#4) above first. Once you have your compiled `dist` folder:

1. Open Google Chrome.
2. Navigate to `chrome://extensions`.
3. Enable **Developer Mode** using the toggle in the top right corner.
4. Click the **Load unpacked** button in the top left.
5. Select the newly generated `dist` folder located inside the project directory.

Boom! You should now see your beautiful new tab replacement every time you open a new tab.

## 🛠️ Built With
*   **[React](https://react.dev/)** - The web framework used
*   **[Vite](https://vitejs.dev/)** - Next Generation Frontend Tooling
*   **[Zustand](https://github.com/pmndrs/zustand)** - Lightweight state management
*   **[Framer Motion](https://www.framer.com/motion/)** - For magical UI animations
*   **[Material Color Utilities](https://github.com/material-foundation/material-color-utilities)** - Dynamic palette generation

---

<div align="center">

### 💡 Proudly Developed & Designed by [Axiabits](https://axiabits.com)

Need enterprise-grade web applications, stunning UI/UX, or powerful browser extensions? <br>
👉 **[Visit Axiabits.com](https://axiabits.com)** to bring your vision to life.

</div>
