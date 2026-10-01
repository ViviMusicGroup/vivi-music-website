<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:152671,50:5669bd,100:afbeff&height=200&section=header&text=VIVI%20Music%20Website&fontSize=60&fontColor=ffffff&fontAlignY=38&desc=Official%20Landing%20Page%20for%20vivi-music&descAlignY=58&descSize=18&animation=fadeIn" width="100%"/>

<br/>

[![Status](https://img.shields.io/badge/Status-Live-brightgreen?style=for-the-badge&logoColor=white&labelColor=152671&color=22c55e)](https://vivimusicweb.com/)
[![License](https://img.shields.io/badge/License-GPL_3.0-blue?style=for-the-badge&logo=opensource&logoColor=white&labelColor=152671&color=5669bd)](LICENSE)
[![Deployment](https://img.shields.io/badge/Deploy-Cloudflare-orange?style=for-the-badge&logo=cloudflare&logoColor=white&labelColor=152671&color=f38020)](https://pages.cloudflare.com/)

<br/>

> **The beautiful, highly-optimized promotional landing page for [`vivi-music`](https://github.com/vivizzz007/vivi-music) — a free, open-source, and ad-free YouTube Music client built for Android.**

<br/>

</div>

---

## ✦ Overview

This repository holds the source code for [ViviMusicWeb.com](https://vivimusicweb.com/). It is a static, highly optimized front-end designed to showcase the features of the VIVI Music Android application, drive user downloads, and offer comprehensive documentation for the community.

The aesthetic leans on modern tech-forward principles: dark mode by default, glassmorphism, elegant typefaces (Sora & Geist), and smooth micro-animations.

---

## ✨ Technology Stack

- **HTML5 & Vanilla JS** — Pure, dependency-free logical structure.
- **Tailwind CSS v3** — Configured extensively with custom brand colors (`vivi-blue`, `vivi-purple`).
- **Cloudflare Pages** — Deployed directly from this repository for blazing-fast global edge delivery. 
- **Google Fonts** — Leveraging *Sora* for bold headings, *Geist* for technical typography, and *Material Symbols Outlined* for iconography.

---

## 📂 Project Structure

```
vivi-music-website/
├── 📄 index.html           ← Main landing page
├── 🎨 index.css            ← Tailwind utility layers and custom keyframes
├── ⚙️  index.js             ← Navigation, video fallback, and UI logic
├── 📄 docs.html            ← Documentation & Support Hub
├── 📄 sponsor.html         ← Sponsor and Contribution page
├── 📁 screenshots/         ← Assets for the device mockups and feature sliders
├── 📁 appicon/             ← Favicons and logo vectors
└── 🤖 wrangler.jsonc       ← Cloudflare Pages backend config
```

---

## ⚡ Deployment & Hosting

This site requires **zero build steps**. Because it's completely static and imports Tailwind via CDN, it can be hosted anywhere. 

We officially recommend and use **Cloudflare Pages**:
1. Connect Cloudflare to your GitHub account.
2. Select the `vivi-music-website` repository.
3. Leave the build command **blank**.
4. Set the output directory to `/`.
5. Deploy instantly.

---

## 🔗 Related Projects

| Project | Description | Link |
|---|---|---|
| **`vivi-music`** | The core Android Application. | [View Repo](https://github.com/vivizzz007/vivi-music) |
| **`vivi-playerx`** | Autonomous YouTube JS signature decryption node. | [View Repo](https://github.com/ViviMusicGroup/vivi-playerx) |

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:afbeff,50:5669bd,100:152671&height=100&section=footer" width="100%"/>

<sub>**Vivi Music Project © 2026** · All rights reserved · [vivimusicweb.com](https://vivimusicweb.com/)</sub>

</div>
