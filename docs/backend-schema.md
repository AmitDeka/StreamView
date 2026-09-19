# StreamView - Backend Schema & API Specifications

## 1. Architectural Overview
StreamView adopts a serverless, stateless API architecture built using Next.js 14 Route Handlers (`app/api/*`). The server operates as an intelligent micro-proxy and discovery engine between client browsers and third-party APIs (Kick Public/OAuth APIs and YouTube web services).

### Architectural Invariants:
- **No Database Dependency**: State is either client-persisted (`localStorage`) or computed on-demand.
- **Zero-Storage PII**: No user accounts, cookies, or tracking databases.
- **Strict SSRF Mitigation**: Outbound fetch requests are strictly pinned to allowlisted hostnames.
- **In-Memory Concurrency Bounds**: Global collections are bounded to prevent memory bloat and API rate exhaustion.

---

## 2. API Endpoint Schemas

### 2.1. GET `/api/kick/channel`
Retrieves live status and channel details for an individual Kick creator.

**Query Parameters:**
| Parameter | Type | Required | Description | Validation |
| :--- | :--- | :--- | :--- | :--- |
| `slug` | string | Yes | Channel handle/slug | Regex: `^[a-zA-Z0-9_-]{1,50}$` |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 123456,
    "user_id": 98765,
    "slug": "hathoda",
    "is_banned": false,
    "playback_url": null,
    "vod_enabled": true,
    "subscription_enabled": false,
    "followers_count": 45000,
    "subscriber_badges": [],
    "banner_image": { "url": "https://..." },
    "livestream": {
      "id": 998877,
      "slug": "hathoda-stream",
      "session_title": "YATRA RP | Day 124",
      "created_at": "2026-09-19T10:00:00.000Z",
      "language": "Hindi",
      "is_live": true,
      "viewer_count": 1450,
      "thumbnail": { "url": "https://..." },
      "categories": [{ "id": 16, "name": "Grand Theft Auto V", "slug": "grand-theft-auto-v" }]
    },
    "user": {
      "id": 98765,
      "username": "Hathoda",
      "profile_pic": "https://..."
    }
  }
}
```

---

### 2.2. GET `/api/kick/search`
Searches Kick live streams across categories, tags, and creator usernames.

**Query Parameters:**
| Parameter | Type | Required | Description | Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `q` | string | No | Search query / tag | Max length 100 |
| `limit` | integer | No | Max streams to return | Default: 20, Max: 100 |
| `exclude` | string | No | Comma-separated channel names to exclude | Splitted array |
| `known` | string | No | Comma-separated dynamic channel cache | Capped to 10 items |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "kick_998877",
      "channelName": "Hathoda",
      "title": "YATRA RP | Day 124 | Cop Action",
      "category": "Grand Theft Auto V",
      "language": "Hindi",
      "viewerCount": 1450,
      "thumbnailUrl": "https://...",
      "avatarUrl": "https://...",
      "isLive": true,
      "platform": "kick",
      "slug": "hathoda"
    }
  ],
  "count": 1
}
```

---

### 2.3. GET `/api/youtube/resolve`
Resolves arbitrary YouTube inputs (video URL, channel URL, handle) to an active live stream video ID and oEmbed metadata.

**Query Parameters:**
| Parameter | Type | Required | Description | Security Controls |
| :--- | :--- | :--- | :--- | :--- |
| `input` | string | Yes | YouTube URL or handle (`@...`) | Hostname allowlist + Pinned `https://www.youtube.com` |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "yt_dQw4w9WgXcQ",
    "channelName": "Rick Astley",
    "title": "Never Gonna Give You Up (Official Video)",
    "category": "YouTube Live",
    "language": "YouTube",
    "viewerCount": null,
    "thumbnailUrl": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    "avatarUrl": "https://api.dicebear.com/7.x/bottts/svg?seed=Rick%20Astley...",
    "isLive": true,
    "platform": "youtube",
    "youtubeVideoId": "dQw4w9WgXcQ",
    "customUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "authorUrl": "https://www.youtube.com/@RickAstleyYT"
  }
}
```

---

### 2.4. GET `/api/kick/streams`
Returns curated live streams partitioned by language or category.

**Query Parameters:**
- `limit` (integer, default 30)
- `language` (e.g. `hi`, `en`)
- `subcategory` (e.g. `grand-theft-auto-v`, `just-chatting`)

---

## 3. Normalized Data Models

### Unified `StreamItem` Schema
```typescript
interface StreamItem {
  id: string;                      // Unique identifier: "kick_<id>" or "yt_<videoId>"
  channelName: string;            // Display creator name
  title: string;                  // Stream or broadcast session title
  category: string;               // Game or category name
  language: string;               // Language tag ("Hindi", "English", "YouTube")
  viewerCount: number | null;     // Live concurrent viewers (null for YT unlisted)
  thumbnailUrl: string;           // Live stream preview poster
  avatarUrl: string;              // Creator profile avatar
  isLive: boolean;                // Live broadcasting status
  platform: "kick" | "youtube";   // Origin platform
  slug?: string;                  // Kick channel slug (for kickFetch)
  youtubeVideoId?: string;        // 11-char YouTube identifier
  customUrl?: string;             // Canonical source URL
  authorUrl?: string;             // Channel page URL
}
```

---

## 4. Security & Isolation Controls
1. **SSRF Guard**:
   - In `lib/youtube/resolve.js`, input URLs are validated against `new Set(["youtube.com", "www.youtube.com", "m.youtube.com"])`.
   - The target URL is reconstructed via `https://www.youtube.com${cleanPath}`, strictly eliminating intranet or malicious external destination routing.
2. **OAuth Token Lifecycle**:
   - `lib/kick/client.js` caches tokens in `cachedToken` with `tokenExpiresAt = Date.now() + (expires_in - 60) * 1000`.
   - Client secrets are strictly sourced from environment variables (`process.env.KICK_CLIENT_ID` & `KICK_CLIENT_SECRET`).
3. **In-Memory Collection Upper Bounds**:
   - In `lib/kick/yatra.js`, `MAX_DYNAMIC_YATRA_CHANNELS` is capped to `DEFAULT + 30`.
   - In `fetchYatraStreams()`, concurrent queries are capped with `.slice(0, 30)`.
