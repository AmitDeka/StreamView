# StreamView 🎥

> **Watch Multiple Kick Streams Together in an Adaptive Multi View Interface**

StreamView is a modern, open-source web application designed for gaming enthusiasts and esports followers to discover connected live broadcasts on **Kick** and watch them simultaneously in an adaptive multi-view workspace using Kick's official embed players.

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2.35-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React 18](https://img.shields.io/badge/React-18.3.1-blue?style=flat-square&logo=react)](https://react.js.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![GitHub](https://img.shields.io/badge/GitHub-StreamView-181717?style=flat-square&logo=github)](https://github.com/AmitDeka/StreamView)

---

## 🌟 Key Features

### 1. Dual Layout Modes (1 to 6 Streams)
- **Stage View**:
  - **1 to 3 Streams**: 3:1 Flex layout featuring a dominant **Left Main Stage** (75% width) and a clean single-column sidecar (25% width) for secondary streams.
  - **4 to 6 Streams**: Features a 2-column scrollable sidecar with a distinct gold-accented border and high-visibility glow scrollbar.
  - **Instant Swap**: Click the subtle **`[ ⇄ Swap ]`** button on any secondary card to immediately focus that stream on the main stage without interruption.
  - **Dynamic Height Synchronization**: Left Stage and Right Sidecar maintain synchronized box heights via `ResizeObserver`.
- **Equal Grid**:
  - **2 Streams**: 50% / 50% split-screen (`grid-cols-2`).
  - **3 Streams**: 33.3% / 33.3% / 33.3% in a single row (`grid-cols-3`).
  - **4 Streams**: 2x2 grid with 4 equal 50% tiles (`grid-cols-2`).
  - **5 & 6 Streams**: 3-column arrangement (`grid-cols-3`).

### 2. Contextual Stream Discovery
- **Hashtag & Keyword Extraction**: Automatically extracts hashtags (e.g. `#yatraroleplay`, `#gta5rp`), game categories, and title keywords from your active reference stream.
- **Interactive Signal Chips**: Click contextual chips in the discovery drawer or bottom bar to instantly query and rank connected live creators playing on the same server.
- **Auto-Sync Channel Avatars & DPs**: Fetches official Kick channel profile pictures directly via `/api/kick/channel`.

### 3. Native Fullscreen Video Stage
- **Dedicated Video Stage Fullscreen**: Single-click fullscreen mode for the entire video arena without individual tile clutter.
- **In-Fullscreen Stream Addition**: The slide-out discovery drawer is mounted inside the fullscreen arena, allowing users to search, filter, and add/remove streams without exiting fullscreen.
- **Maximized Viewport**: Reduced top/bottom padding and vertically centered layout for complete display utilization.

### 4. Official Kick Embed Player
- Strictly integrates Kick's official sandboxed iframe player: `https://player.kick.com/{channel}?autoplay=true&muted=false`.
- Zero video proxying, zero restreaming, zero tampering, and zero playback latency.

### 5. Privacy-First Architecture
- **Zero Personal Data Collection**: No accounts, logins, passwords, or emails required.
- **Local Persistence**: Layout modes and selected streams are stored locally in the browser via `localStorage`.
- **Dedicated Legal Pages**: Complete [Privacy Policy](/privacy) and [Terms of Service](/terms) pages included.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server & Client Components)
- **UI Library**: [React 18](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom dark gaming theme
- **Icons**: [Lucide React](https://lucide.dev/)
- **Class Utilities**: `clsx`, `tailwind-merge`
- **Data Fetching**: Native Fetch API with server-side proxying & fallback mock data

---

## 📂 Project Structure

```text
StreamView/
├── app/
│   ├── api/
│   │   └── kick/
│   │       ├── channel/route.js    # Official Kick streamer avatar proxy
│   │       ├── related/route.js    # Contextual recommendation engine
│   │       ├── search/route.js     # Live stream & channel search
│   │       └── streams/route.js    # Live streams directory
│   ├── multi-view/
│   │   └── page.jsx                # Multi View workspace page
│   ├── privacy/
│   │   └── page.jsx                # Privacy Policy page
│   ├── terms/
│   │   └── page.jsx                # Terms of Service page
│   ├── globals.css                 # Custom scrollbars, glow utilities & palette
│   ├── layout.jsx                  # Root layout with Navbar and Footer
│   └── page.jsx                    # Landing page with Step-by-Step guide
├── components/
│   ├── home/                       # Landing page hero, preview, features, CTA
│   ├── kick/                       # Sandboxed Kick iframe video player
│   ├── layout/                     # Responsive Navbar & Footer
│   └── multiview/                  # Stage View, Grid, Drawer, Workspace
├── lib/
│   ├── discovery/                  # Hashtag regex & contextual rankers
│   ├── kick/                       # Kick API client, mock data, and search
│   ├── config.js                   # Application constants & layout options
│   ├── use-fullscreen.js           # HTML5 Fullscreen API hook
│   └── utils.js                    # Tailwind class utilities
├── package.json                    # Project dependencies & scripts
└── tailwind.config.js              # Custom theme colors and glow animations
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
# Optional: Official Kick API credentials (falls back to realistic mock dataset if omitted)
KICK_CLIENT_ID=your_client_id_here
KICK_CLIENT_SECRET=your_client_secret_here
```

> *Note: If credentials are not provided, StreamView runs smoothly using realistic GTA V RP mock streams with hashtag discovery.*

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
3. Next.js App Router defaults will automatically detect the build settings (`npm run build`).
4. Deploy!

### Deploy with Docker

```dockerfile
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
```

---

## ⚖️ Legal & Disclaimer

**StreamView is an independent third-party application and is not affiliated with, endorsed by, or sponsored by Kick.**

- All stream content, streamer logos, trademarks, and channel broadcasts are the property of their respective creators and Kick.
- Video streams are embedded directly via Kick's official iframe player (`player.kick.com`). StreamView does not host, re-transmit, or modify video content.

---

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE).

Made with ❤️ by [Amit Deka](https://github.com/AmitDeka).
