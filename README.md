# FAST Face Droop — Browser Prototype
This repo contains a client-side prototype for detecting facial asymmetry (face droop) using MediaPipe FaceMesh.  
**Educational only — not a medical diagnostic tool.**
## Features
- Runs entirely in the browser (privacy-friendly)
- MediaPipe FaceMesh for facial landmarks
- Simple asymmetry heuristics for mouth/eye positions
- Deployable to GitHub Pages
## How to run locally
1. `git clone <this-repo>`
2. Serve with a local static server (recommended) e.g. `npx http-server` or VS Code Live Server
3. Open `index.html` in your browser and allow camera access
## Deployment
- Push to GitHub and enable GitHub Pages (branch: gh-pages or use Actions included).
## Disclaimer
Not a diagnostic tool. Always call emergency services if you suspect stroke.
