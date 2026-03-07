# AGENTS.md — Mandatory Reading

> **This file MUST be read in full before making any changes to this project.**
> It applies to all AI agents, automated tools, and human contributors.

---

## Project Overview

This is a **Zepp OS Mini Program** — a lightweight application running on Zepp OS, the health management operating system for Amazfit smart wearables (e.g., Amazfit Active 2, Amazfit T-Rex 3, Amazfit Balance).

- **Zepp OS Docs:** https://docs.zepp.com/docs/intro/
- **Quick Start Guide:** https://docs.zepp.com/docs/guides/quick-start/
- **API Reference:** https://docs.zepp.com/docs/reference/
- **Device List:** https://docs.zepp.com/docs/reference/related-resources/device-list/

---

## What is Zepp OS?

Zepp OS is a health-centric OS designed for smart wearable devices. It supports:

- **Watch Faces** — custom clock/display layouts
- **Mini Programs** — small sandboxed apps running on the device

Mini Programs use a **proprietary JavaScript-based framework**, NOT standard web APIs or Node.js. The runtime is highly constrained (no DOM, no browser APIs, limited memory).

---

## Project Structure

```
forex-ticker/
├── app.js                  # App entry point (lifecycle hooks)
├── app.json                # App manifest (permissions, targets, pages)
├── app-side/
│   └── index.js            # App-side (companion/phone-side) logic
├── page/
│   └── index.js            # Watch-side page logic
├── setting/
│   └── index.js            # Settings page (shown in Zepp app)
└── assets/                 # Bundled image/resource files
```

### Key Concepts

| File/Folder | Purpose |
|---|---|
| `app.js` | App lifecycle (`onCreate`, `onDestroy`) |
| `app.json` | Manifest: targets, permissions, pages list |
| `app-side/index.js` | Phone-side companion code (HTTP requests live here) |
| `page/index.js` | Watch UI rendering using Zepp OS widget APIs |
| `setting/index.js` | Settings UI using the Settings framework |

---

## Critical Development Rules

### 1. No Standard Web/Node APIs
Do **not** use `fetch`, `XMLHttpRequest`, `window`, `document`, `process`, `require`, `fs`, or any Node.js/browser globals. Zepp OS has its own APIs.

### 2. Network Requests Must Be in `app-side/`
All HTTP/HTTPS network calls must be made from `app-side/index.js` using the Zepp OS `fetch` equivalent from `@zepp-app/utils` or the built-in side-service API. Data is passed to the watch via messaging APIs.

### 3. UI Uses Widget APIs
Watch-side UI is built with Zepp OS widget constructors (e.g., `hmUI.createWidget`, `hmUI.widget.TEXT`, `hmUI.widget.IMG`), not HTML/CSS.

### 4. `app.json` is the Manifest
Adding a new page requires registering it in `app.json` under `"targets"`. Do not create page files without updating the manifest.

### 5. Coordinate System
The display uses absolute pixel coordinates. Layouts differ per device resolution — check target device specs before hardcoding positions.

### 6. JavaScript Only — No TypeScript Compilation Step
Source files are plain `.js`. There is no build/transpile step beyond what the Zepp CLI handles.

---

## Tooling

- **Zeus CLI** (`@zeppos/zeus-cli`) — used to create, preview, and package Mini Programs
- **Zepp OS Simulator** — desktop simulator for testing without a physical device
- **Zepp App** — companion phone app used to sideload and configure Mini Programs

---

## References

- Intro: https://docs.zepp.com/docs/intro/
- Quick Start: https://docs.zepp.com/docs/guides/quick-start/
- App Configuration (`app.json`): https://docs.zepp.com/docs/reference/app-json/
- UI Widgets: https://docs.zepp.com/docs/reference/device-app-api/newAPI/ui/widget/
- App-Side API: https://docs.zepp.com/docs/reference/app-side-api/
- Settings API: https://docs.zepp.com/docs/reference/app-settings-api/
