# StreamView - Technical Requirements Document (TRD)

## 1. Technical Stack & Dependencies

| Component | Technology | Version | Rationale |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | `^14.2.35` | Server-rendered metadata, edge route handlers, zero client waterfalls. Patched against security advisories. |
| **Runtime** | Node.js / Vercel Serverless | `>= 18.17.0` | High concurrency, modern fetch APIs, and global Edge distribution. |
| **UI Library** | React | `^18.3.1` | Concurrent mode, transitions, and stable context state. |
| **Styling** | Tailwind CSS | `^3.4.14` | Atomic utility classes, dark-mode first design, zero runtime CSS overhead. |
| **Icons** | Lucide React | `^0.453.0` | Lightweight, accessible tree-shakeable SVG icons. |
| **Class Utilities**| `clsx` & `tailwind-merge` | `^2.1.1` / `^2.5.4` | Deterministic conditional className construction. |

---

## 2. Performance & SLA Requirements

### 2.1. Web Vitals Targets
- **First Contentful Paint (FCP)**: `< 0.8s` on desktop, `< 1.2s` on mobile 4G.
- **Largest Contentful Paint (LCP)**: `< 1.8s` for landing and discovery views.
- **Cumulative Layout Shift (CLS)**: `0.00` (reserved aspect ratio containers on all players).
- **Interaction to Next Paint (INP)**: `< 100ms` for audio soloing and layout switches.

### 2.2. API Performance & Resilience
- **Edge Route Latency**: `< 300ms` p95 for cached channel and search endpoints.
- **AbortSignal Timeouts**: All upstream HTTP requests are guarded with explicit timeouts (4,000ms - 6,000ms) to prevent hanging serverless execution.
- **Failure Gracefulness**: When Kick OAuth fails or is unconfigured, endpoints degrade gracefully to unauthenticated routes without throwing unhandled exceptions.

---

## 3. Security & Privacy Architecture

### 3.1. Iframe Sandboxing Directives
Both Kick and YouTube players are embedded using hardened HTML5 iframe configurations:

```html
<!-- Kick Player -->
<iframe
  src="https://player.kick.com/{channel}?muted=true&autoplay=true"
  allow="autoplay; fullscreen"
  sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
/>

<!-- YouTube Player -->
<iframe
  src="https://www.youtube.com/embed/{videoId}?autoplay=1&mute=1&enablejsapi=1"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; presentation"
  sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
/>
```

### 3.2. SSRF Prevention Model
All user-provided URLs in `/api/youtube/resolve` are processed through a three-stage validation pipeline:
1. Candidate string parsed using standard `new URL()`.
2. `parsed.hostname` checked against an exact allowlist: `youtube.com`, `www.youtube.com`, `m.youtube.com`.
3. Outbound fetch destination is strictly reconstructed as `https://www.youtube.com${normalizedPath}`, preventing host spoofing, IP manipulation, or loopback requests.

### 3.3. Client Storage Bounds
In `lib/client-storage.js`:
- All reads wrap `JSON.parse` in defensive try/catch blocks with fallbacks.
- History and pinned channel arrays are strictly bounded to `50` items with `.slice(0, 50)`, preventing `QUOTA_EXCEEDED_ERR` in browser storage.

---

## 4. Scalability & System Limits

- **Maximum Streams per Workspace**: 6 concurrent players (balances CPU/GPU decode loads on consumer hardware).
- **Concurrent API Queries**: Capped at 30 concurrent sub-requests in `fetchYatraStreams`.
- **Dynamic In-Memory Registry**: Capped at `DEFAULT_CHANNELS.length + 30` entries to preserve low serverless memory footprints (< 128MB).
