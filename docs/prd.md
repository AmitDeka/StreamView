# StreamView - Product Requirements Document (PRD)

## 1. Product Overview & Vision
**StreamView** is a high-performance streaming aggregator and multi-view workspace that allows gaming fans and community viewers to watch multiple live streams simultaneously from **Kick** and **YouTube** in a single browser tab.

### The Problem
- In gaming and roleplay communities (such as GTA V Roleplay / Yatra RP), storylines happen across multiple perspectives at once (e.g., Police, Criminals, EMS, Civilians).
- Viewers are forced to keep 5–10 browser tabs open, causing high RAM/CPU usage, audio conflicts, out-of-sync playback, and constant tab switching.
- Furthermore, creators often stream on different platforms (some on Kick, some on YouTube), making multi-platform viewing impossible on single-platform tools.

### The Solution
StreamView delivers an adaptive, zero-lag **Multi-View Cockpit**:
- Watch up to 6 Kick and YouTube streams side-by-side.
- Smart audio management: 1-click **"Solo Audio"** silences other streams so you hear only who you want.
- Dynamic layouts: Switch between an **Equal Grid** and a **Stage View** (1 major cinema screen + 5 monitoring tiles).
- Community-focused discovery: Automated indexing of live Yatra RP creators, even those with single-digit viewer counts.

---

## 2. Target Audience & Personas

### Persona 1: "The Roleplay Follower" (Aryan, 21)
- **Behavior**: Watches GTA V Yatra RP every evening.
- **Pain Point**: Wants to see a bank heist from both the robber's POV and the pursuing cop's POV simultaneously.
- **Value Realized**: Loads both streams side-by-side on StreamView, follows the pursuit in real-time, and clicks "Solo Audio" to switch audio focus as the scene unfolds.

### Persona 2: "The Esports & Tournament Watcher" (Rohan, 25)
- **Behavior**: Watches Valorant, Counter-Strike 2, or COD tournaments.
- **Pain Point**: Wants main broadcast commentary on the center stage while keeping player POV streams open on the side.
- **Value Realized**: Sets the main broadcast as "Stage" and monitors player POVs in the side ribbon.

---

## 3. Core Functional Requirements

### 3.1. Discovery & Search (P0)
- Instant live channel search across Kick creators.
- Instant YouTube stream resolution via channel handle (`@username`) or video URL.
- Community tag shortcuts (`#yatraroleplay`, `GTA V`, `Hindi`, `English`).
- Live status indicator showing active viewer count, category, and real-time stream title.

### 3.2. Multi-View Workspace (P0)
- Add up to 6 streams simultaneously.
- **Layout Switcher**: Toggle between **Equal Grid** (symmetrical tiles) and **Stage View** (focused theater mode).
- **Stage Swap**: Click "Promote to Stage" on any secondary tile to promote it to the primary screen with zero reload.
- **Audio Soloing**: Independent volume and one-click mute/unmute isolation.
- **Parametrized Sharing**: "Share Workspace" button copies a deep link containing active stream IDs (`?channels=...&yt=...`).

### 3.3. Persistence & Personalization (P1)
- **Pinned Channels**: Quick-access bookmarks stored in client `localStorage` for 1-click workspace assembly.
- **Recent Searches**: Quick recall of past 50 searched channels.

### 3.4. Technical Hygiene & Compliance (P0)
- Official embed players for both Kick and YouTube respecting creators' ad revenue and view counters.
- Zero collection of personally identifiable information (PII).
- Accessible and responsive on desktop, tablet, and mobile browsers.

---

## 4. Success Metrics & Key Performance Indicators (KPIs)

1. **Average Session Duration**: Target `> 25 minutes` per session.
2. **Streams per Workspace**: Average `≥ 2.5` simultaneous streams per active user.
3. **Multi-View Conversion**: `> 65%` of landing page visitors launch into `/multi-view`.
4. **Link Sharing Rate**: `> 12%` of active multi-viewers copy and share parametrized URLs with friends.
