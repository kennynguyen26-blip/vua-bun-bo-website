# Vua Bún Bò — Restaurant Website

Official website for **Vua Bún Bò**, Houston's authentic Bún Bò Huế restaurant.

🌐 **Live site:** *(Vercel URL — update after deploy)*

---

## About

Vua Bún Bò serves traditional Bún Bò Huế — a rich, spicy Vietnamese beef noodle soup from the imperial city of Huế. Located at **11800 Bellaire Blvd, Houston, TX 77072**.

**Hours:** Mon – Wed & Fri – Sun: 9:00 AM – 5:00 PM · Thursday: Closed
**Phone:** (346) 409-2336

---

## Features

- **Bilingual (EN / VI)** — Full English/Vietnamese language toggle with first-visit splash screen
- **Scroll-driven video** — GSAP ScrollTrigger drives an ingredient explode video synced to scroll position
- **Interactive menu** — Tabbed menu panels (House Specials, Bún Bò Huế, Bánh Mì & Stews, Hủ Tiếu & Bánh Canh, Kids, Sides, Extras, Drinks)
- **Order Now modal** — Phone + DoorDash ordering with live hours
- **Gallery** — Photo gallery section (coming soon)
- **Reviews carousel** — Google review cards with auto-rotate on mobile
- **Responsive** — Fully mobile-optimized

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Markup | HTML5 |
| Styling | CSS3 (custom properties, Grid, Flexbox) |
| Scripting | Vanilla JavaScript (ES6+) |
| Animation | GSAP 3.12.5 + ScrollTrigger |
| Fonts | Google Fonts — Playfair Display, Be Vietnam Pro |
| Deployment | Vercel |

No build step. No framework. No dependencies to install.

---

## Project Structure

```
vua-bun-bo-website/
├── index.html          # Single-page site
├── css/
│   └── styles.css      # All styles (~1900 lines)
├── js/
│   └── main.js         # All JavaScript (~700 lines)
└── images/
    ├── logo.jpg
    ├── hero-cover.jpg
    ├── about-bowl.jpg
    ├── bun-bo-explode.mp4
    └── ...
```

---

## Running Locally

No build step needed — just open the file:

```bash
open index.html
```

Or serve with any static server:

```bash
npx serve .
# or
python3 -m http.server 8080
```

---

## Deployment

Deployed via **Vercel** as a static site. Push to `main` → auto-deploys.

To deploy manually:
```bash
npm i -g vercel
vercel --prod
```
