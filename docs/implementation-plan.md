# StreamView - Engineering Implementation Plan & Architecture Guide

## 1. System Architecture Diagram

```mermaid
graph TB
    subgraph Client Layer [Browser / Next.js Client Components]
        UI[Page Views / Layout]
        Context[MultiViewContext]
        Storage[(Local Storage)]
        KP[KickPlayer Iframe]
        YP[YouTubePlayer Iframe]
    end

    subgraph API Gateway [Next.js App Router API Handlers]
        RouteKickSearch[/api/kick/search]
        RouteKickChannel[/api/kick/channel]
        RouteKickStreams[/api/kick/streams]
        RouteYTResolve[/api/youtube/resolve]
    end

    subgraph Core Engine [Business Logic & Normalization]
        KickClient[lib/kick/client.js]
        YatraEngine[lib/kick/yatra.js]
        YTResolver[lib/youtube/resolve.js]
        Signals[lib/discovery/signals.js]
    end

    subgraph External Platforms [Third-Party Services]
        KickOAuth[id.kick.com/oauth/token]
        KickAPI[api.kick.com/public/v1]
        YouTubeWeb[www.youtube.com]
        YouTubeOEmbed[www.youtube.com/oembed]
    end

    UI --> Context
    Context <--> Storage
    Context --> KP
    Context --> YP

    UI --> RouteKickSearch
    UI --> RouteKickChannel
    UI --> RouteYTResolve

    RouteKickSearch --> YatraEngine
    RouteKickSearch --> KickClient
    RouteKickChannel --> KickClient
    RouteYTResolve --> YTResolver

    KickClient --> KickOAuth
    KickClient --> KickAPI
    YTResolver --> YouTubeWeb
    YTResolver --> YouTubeOEmbed
```

---

## 2. Directory Structure & File Responsibilities

```
StreamView/
├── app/
│   ├── api/
│   │   ├── kick/
│   │   │   ├── channel/route.js    # Channel live lookup & metadata
│   │   │   ├── related/route.js    # Category & streamer associations
│   │   │   ├── search/route.js     # Unified Kick search with yatra caching
│   │   │   └── streams/route.js    # Featured & localized streams
│   │   └── youtube/
│   │       └── resolve/route.js    # YouTube stream resolution handler
│   ├── how-it-works/page.jsx       # Architecture & discovery explanation
│   ├── multi-view/page.jsx         # Multi-View workspace route
│   ├── privacy/page.jsx            # Privacy policy & data protection
│   ├── terms/page.jsx              # Terms of service & third-party disclaimers
│   ├── layout.jsx                  # Root layout, fonts, GA, JSON-LD, SEO
│   ├── page.jsx                    # Landing page view
│   ├── sitemap.js                  # Dynamic XML sitemap generator
│   └── robots.js                   # Web crawler directives
├── components/
│   ├── cards/
│   │   └── stream-card.jsx         # Card component for stream results
│   ├── common/
│   │   ├── google-analytics.jsx    # GA4 client script initializer
│   │   └── structured-data.jsx     # Schema.org JSON-LD structured data
│   ├── layout/
│   │   ├── navbar.jsx              # Top header with search & links
│   │   └── footer.jsx              # Footer with branding & disclaimers
│   ├── multiview/
│   │   ├── multiview-context.jsx   # Global workspace state provider
│   │   ├── multiview-workspace.jsx # Core multi-stream player layout
│   │   ├── empty-state.jsx         # Zero-stream prompt and search bar
│   │   ├── layout-switcher.jsx     # Equal vs Stage mode selector
│   │   ├── stage-layout.jsx        # Cinema stage presentation mode
│   │   └── grid-layout.jsx         # Symmetrical matrix grid mode
│   └── players/
│       ├── KickPlayer.jsx          # Secure Kick embed iframe wrapper
│       └── YouTubePlayer.jsx       # Secure YouTube embed iframe wrapper
├── lib/
│   ├── client-storage.js           # LocalStorage wrapper with bounds
│   ├── config.js                   # Application constants, tags, and URLs
│   ├── discovery/
│   │   └── signals.js              # Title & tag relevance heuristic engine
│   ├── kick/
│   │   ├── client.js               # Kick OAuth client & fetch proxy
│   │   ├── search.js               # Multi-stage Kick stream search engine
│   │   ├── streams.js              # Category & language live streams
│   │   └── yatra.js                # Dedicated Yatra RP discovery logic
│   └── youtube/
│       └── resolve.js              # Secure YouTube URL & live resolver
└── package.json                    # Dependencies and scripts (Next 14.2.35)
```

---

## 3. Implementation Phases Completed

### Phase 1: Core Stream Engine & Kick Discovery
- Implemented Kick API client with OAuth token caching and proxy agent support.
- Built `lib/discovery/signals.js` to filter GTA V streams specifically matching the Yatra Roleplay server (filtering out unrelated RP servers like SoulCity, Subharambh, Glory).
- Created `data/yatra-streamers.json` containing seed creators.

### Phase 2: Multi-View Workspace
- Developed `MultiViewContext` with persistence for pinned streams and recent searches.
- Created `StageLayout` (primary stage + side thumbnails) and `GridLayout` (responsive 1-6 stream matrix).
- Built one-click audio isolation ("Solo Audio") and instant stream hot-swapping.

### Phase 3: YouTube Multi-Stream Integration
- Built `lib/youtube/resolve.js` supporting handles (`@creator`), standard watch URLs, short URLs (`youtu.be`), and channel IDs.
- Implemented YouTube oEmbed enrichment for stream title and creator avatar.
- Added `YouTubePlayer.jsx` with sandbox isolation.

### Phase 4: Security Hardening (Cloudflare Security Audit)
- Eliminated SSRF vulnerabilities via URL validation and hostname allowlisting.
- Removed hardcoded credentials from version control; enforced `process.env` configuration.
- Capped memory growth on dynamic channel caches and bounded concurrent network requests.
- Pinned Next.js to `14.2.35` to remediate upstream CVEs.

---

## 4. Future Roadmap & Milestones

| Phase | Feature | Target Scope |
| :--- | :--- | :--- |
| **Phase 5** | **Multi-Chat Drawer** | Side-by-side or tabbed live chat for both Kick and YouTube streams. |
| **Phase 6** | **Custom Preset Layouts** | Save named workspace setups (e.g. "Yatra Cops", "Grand RP") exportable to JSON. |
| **Phase 7** | **Twitch Integration** | Add Twitch embed player and API proxy to support tri-platform multi-streaming. |
| **Phase 8** | **PWA & Offline Mode** | Full progressive web app support with Picture-in-Picture (PiP) controls. |
