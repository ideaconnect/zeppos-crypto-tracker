# GitHub Copilot Instructions

> **MANDATORY:** Read [AGENTS.md](../AGENTS.md) before suggesting or generating any code for this project.

This is a **Zepp OS Mini Program** project. All code must conform to the Zepp OS JavaScript framework and runtime constraints documented in [AGENTS.md](../AGENTS.md).

Key rules (full details in AGENTS.md):
- No browser or Node.js APIs (`fetch`, `window`, `document`, `require`, etc.)
- Network requests belong in `app-side/index.js` only
- Watch UI is built with Zepp OS widget APIs, not HTML/CSS
- New pages must be registered in `app.json`
- Plain JavaScript only — no TypeScript compilation

Docs: https://docs.zepp.com/docs/intro/
