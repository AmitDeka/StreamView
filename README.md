# StreamView 🎥

> **Watch Multiple Kick Streams Together in an Adaptive Multi View Interface**  
> _Dedicated with ❤️ to the Yatra RP Community_

StreamView is a modern, open-source web application engineered for roleplay communities, esports followers, and gaming fans to discover connected live broadcasts on **Kick** and watch them simultaneously in an adaptive multi-view workspace using Kick's official embed players.

[![Version: 1.3.0](https://img.shields.io/badge/Version-1.3.0-gold?style=flat-square)](https://github.com/AmitDeka/StreamView/releases)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.2.15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React 18](https://img.shields.io/badge/React-18.3.1-blue?style=flat-square&logo=react)](https://react.js.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Live Demo](https://img.shields.io/badge/Live_Demo-stream--view.vercel.app-brightgreen?style=flat-square)](https://stream-view-beige.vercel.app)

---

## 🌟 Key Features

### 1. Dedicated to the Yatra RP Community ❤️

- **Self-Learning Roleplay Engine**: Automatically identifies live Yatra Roleplay creators and Hindi streams down to single-digit view counts.
- **Dynamic Community Discovery**: Seamlessly discovers active streamers across `#yatraroleplay`, `#yatrarp`, `yatra`, and Indian GTA RP servers (e.g. Hathoda, Qayzer4, OnHypeGamer, Kryzor9, Shreeplayz, CandidGaming, Thunderboltgaming, iMRocky, GamerGill, Stelvin777, and emerging community creators).
- **Multi-POV Roleplay Viewing**: Watch criminal chases, police operations, courtrooms, and server storylines unfolding from multiple creator perspectives at the same time.

### 2. Dual Adaptive Layout Modes (1 to 6 Streams)

- **Stage View**:
  - **1 to 3 Streams**: 3:1 Flex layout featuring a dominant **Left Main Stage** (75% width) and a clean single-column standby sidecar (25% width).
  - **4 to 6 Streams**: 2-column scrollable sidecar with gold-accented styling and smooth height synchronization via `ResizeObserver`.
  - **Instant Swap**: Click **`[ ⇄ Swap ]`** on any standby tile or tap on mobile to instantly spotlight that stream on the main player.
- **Equal Grid**:
  - **2 Streams**: 50% / 50% split-screen (`grid-cols-2`).
  - **3 Streams**: Single-row 33% split on desktop (`lg:grid-cols-3`) / 2-column on tablets (`sm:grid-cols-2`).
  - **4 Streams**: 2x2 grid with 4 equal 50% tiles (`grid-cols-2`).
  - **5 & 6 Streams**: 3-column arrangement on desktop / 2-column on tablets.
  - **Solo Mode**: Single-click maximization of any individual stream with audio focus.

### 3. Fully Optimized for Mobile & Tablet 📱

- **Adaptive Breakpoints**: Custom UX for mobile phones (`<640px`), small tablets & foldables (`640px–768px`), and full-size tablets (`768px–1024px`).
- **Touch-Momentum Standby Rail**: Secondary streams on mobile/tablet arrange in a smooth horizontal touch-swipe strip (`touch-pan-x`) with 1-tap **Swap to Main Stage** (saving mobile battery & bandwidth).
- **Responsive Workspace Toolbar**: Universal Stage View / Equal Grid toggle and controls bar with 44px+ touch targets and safe bottom clearance.
- **Expandable Add Stream Drawer**: Full-width on mobile with horizontally scrollable discovery tags.

### 4. Sticky 1-Click Bookmark FAB 🔖

- **Persistent Bottom-Right Button**: Floating bookmark button with subtle pulsing indicator.
- **Instant Browser Saving**: Detects client operating system (Windows, Mac, Mobile) and displays exact shortcut keys (`Ctrl+D` / `Cmd+D`) and 1-click URL copying.

### 5. Native Fullscreen Video Stage 🖥️

- **Cockpit Fullscreen**: 1-click fullscreen mode for the entire video arena without browser borders or distraction.
- **In-Fullscreen Stream Management**: Add, remove, or switch streams directly inside fullscreen without needing to exit.

### 6. Official Kick Embed Players ⚡

- Strictly integrates Kick's official sandboxed iframe player (`https://player.kick.com/{channel}?autoplay=true`).
- Zero video proxying, zero restreaming, zero tampering, and zero playback latency.

### 7. Search Engine Optimization (SEO) & Analytics 📈

- **Google Analytics 4 (GA4)**: Built-in integration via `next/script` with `strategy="afterInteractive"` for zero page-load penalty.
- **Dynamic Sitemap & Robots**: Native Next.js 14 `sitemap.js` and `robots.js` generating `/sitemap.xml` and `/robots.txt` for continuous search engine indexation.
- **Schema.org Structured Data**: Integrated JSON-LD schemas (`WebSite` with Sitelinks SearchBox, `WebApplication`, `Organization`).
- **Dynamic OpenGraph Social Cards**: Automatic 1200x630 social preview card generation via `app/opengraph-image.jsx` using `next/og` Edge runtime.
- **Targeted Gaming Keywords**: Pre-configured metadata for Kick multistreaming, Yatra RP, GTA V RP, and Hindi streaming communities.

### 8. Privacy-First Architecture 🔒

- **Zero Personal Data Collection**: No sign-ups, accounts, logins, or trackers.
- **Local Persistence**: Layout preferences, active streams, and audio settings are safely stored on device via `localStorage`.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server & Client Components)
- **UI Library**: [React 18](https://react.dev/)
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/) with custom dark gaming theme
- **Icons**: [Lucide React](https://lucide.dev/)
- **Analytics**: Google Analytics 4 (GA4)
- **SEO**: Schema.org JSON-LD, Dynamic `sitemap.xml`, `robots.txt`, `next/og`
- **Data Fetching**: Native Fetch API with direct Kick live channel & stream API integration
- **Class Utilities**: `clsx`, `tailwind-merge`

---

## 📂 Project Structure

```text
StreamView/
├── app/
│   ├── api/
│   │   └── kick/
│   │       ├── channel/route.js        # Official Kick channel profile proxy
│   │       ├── related/route.js        # Contextual recommendation engine
│   │       ├── search/route.js         # Unified stream & channel search
│   │       └── streams/route.js        # Live streams directory
│   ├── multi-view/
│   │   └── page.jsx                    # Multi View workspace page
│   ├── privacy/
│   │   └── page.jsx                    # Privacy Policy page
│   ├── terms/
│   │   └── page.jsx                    # Terms of Service page
│   ├── globals.css                     # Custom scrollbars, glow utilities & palette
│   ├── layout.jsx                      # Root layout with Navbar, Footer, GA4 & SEO
│   ├── opengraph-image.jsx             # Dynamic 1200x630 social card generator
│   ├── page.jsx                        # Landing page with Yatra RP dedication & guide
│   ├── robots.js                       # Dynamic robots.txt route handler
│   └── sitemap.js                      # Dynamic sitemap.xml route handler
├── components/
│   ├── common/
│   │   ├── bookmark-fab.jsx            # Sticky bottom-right floating bookmark button
│   │   ├── bookmark-modal.jsx          # Interactive bookmark guide & URL copier
│   │   ├── google-analytics.jsx        # Google Analytics 4 (GA4) script embed
│   │   └── structured-data.jsx         # Schema.org JSON-LD structured data
│   ├── home/                           # Landing hero, preview arena, features, CTA
│   ├── kick/                           # Sandboxed Kick iframe video player
│   ├── layout/                         # Responsive Navbar & Footer
│   └── multiview/                      # Stage View, Equal Grid, Drawer, Workspace
├── lib/
│   ├── discovery/                      # Hashtag regex & contextual rankers
│   ├── kick/
│   │   ├── search.js                   # Live stream search with Yatra engine
│   │   ├── yatra.js                    # Self-learning Yatra Roleplay engine
│   │   └── streams.js                  # Kick API live stream fetchers
│   ├── config.js                       # Application constants & layout options
│   ├── use-fullscreen.js               # HTML5 Fullscreen API hook
│   └── utils.js                        # Tailwind class utilities
├── package.json                        # Version 1.1.0 dependencies & scripts
└── tailwind.config.js                  # Custom theme colors, animations & shadows
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: Version 18.17.0 or higher
- **npm**: Version 9.0.0 or higher (or pnpm / yarn)

### 1. Clone the Repository

```bash
git clone https://github.com/AmitDeka/StreamView.git
cd StreamView
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables (Optional)

Create a `.env.local` file in the root directory:

```env
# Google Analytics 4 Measurement ID (e.g. G-XXXXXXXXXX)
NEXT_PUBLIC_GA_ID=your_ga4_measurement_id_here

# Base canonical URL for SEO and social sharing cards
NEXT_PUBLIC_APP_URL=https://stream-view-beige.vercel.app

# Optional: Official Kick API credentials (for global livestreams indexing)
KICK_CLIENT_ID=your_client_id_here
KICK_CLIENT_SECRET=your_client_secret_here
```

> _Note: Even without API credentials, StreamView directly queries Kick's live channel APIs to fetch real streamer profiles and stream embeds on demand._

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Production Deployment

### Build and Start

```bash
# Create an optimized production build
npm run build

# Start the production server
npm run start
```

### Deploy on Vercel

1. Push your repository to GitHub: `https://github.com/AmitDeka/StreamView`
2. Import the repository into [Vercel](https://vercel.com).
3. Next.js App Router defaults will automatically detect build settings (`npm run build`).
4. Deploy!

---

## ⚖️ Legal & Disclaimer

**StreamView is an independent third-party application and is not affiliated with, endorsed by, or sponsored by Kick.**

- All stream content, streamer logos, trademarks, and channel broadcasts are the property of their respective creators and Kick.
- Video streams are embedded directly via Kick's official iframe player (`player.kick.com`). StreamView does not host, re-transmit, or modify video content.

---

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE).

Made with ❤️ for the gaming and roleplay community by [Amit Deka](https://github.com/AmitDeka).
