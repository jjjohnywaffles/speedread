# Speed Read

A browser extension that lets you speed-read any article on the web. It extracts the main content from a page (stripping ads, navigation, etc.) and flashes words one at a time at a configurable speed.

Built with [Plasmo](https://docs.plasmo.com/), React, TypeScript, and Tailwind CSS.

## Features

- Extracts article content using Mozilla's Readability (the same engine behind Firefox Reader View)
- Configurable reading speed (100–1000 WPM)
- Overlay controls: play/pause, reset, skip forward/back, and a live WPM slider
- Progress bar and word position indicator
- Works on Chrome (Manifest V3) and Firefox (Manifest V2)

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

### Loading the extension

**Chrome:**
1. Go to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked" and select `build/chrome-mv3-dev`

**Firefox:**
1. Go to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select any file inside `build/firefox-mv2-dev`

## Usage

1. Navigate to any article or webpage
2. Click the Speed Read extension icon
3. Adjust the WPM slider if desired
4. Click "Start Reading" to open the overlay
5. Press "Start" in the overlay to begin flashing words

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Chrome dev server with hot reload |
| `npm run dev:firefox` | Start Firefox dev server with hot reload |
| `npm run build` | Production build for both Chrome and Firefox |
| `npm run build:chrome` | Production build for Chrome only |
| `npm run build:firefox` | Production build for Firefox only |
| `npm run validate` | Run typecheck, lint, format check, and build |
| `npm run lint` | Run ESLint |
| `npm run format` | Check Prettier formatting |

## Project Structure

```
├── popup.tsx              # Extension popup (toggle + WPM slider)
├── contents/
│   └── speed-reader.ts    # Content script (text extraction + overlay)
├── assets/                # Extension icons
├── style.css              # Tailwind CSS
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.mjs
├── tsconfig.json
└── package.json
```
