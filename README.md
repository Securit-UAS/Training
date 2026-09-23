# Securit Guarding Training Compliance Dashboard — V7.4

GitHub Pages upload package.

## Files
- `index.html` — dashboard, auth UI, filters, WhatsApp links, certificate generation and print/share features
- `config.js` — Power Automate endpoint configuration
- `securit-logo.png` — Securit logo
- `signature-jpbw.png` — certificate sign-off signature image

## Current features
- Login with email + PIN through Power Automate auth flows
- Forced PIN change on first login
- Session validation and browser session persistence
- Dynamic RAG / provider / search filters and counters
- WhatsApp training links for modules requiring action
- Single-page A4 landscape certificate printing
- Certificate image sharing workflow for WhatsApp-compatible devices/browsers
- Animated loading screen and progress counter
- Certificate signed by J.P. Bewsey-Wilkinson — Technical Development & Business Intelligence

## Important production note
The current Power Automate trigger URLs in `config.js` are test endpoints. Rotate/harden them before production deployment.
