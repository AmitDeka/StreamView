# StreamView - UI/UX Design System Brief

## 1. Design Philosophy: "The Cinema Cockpit"
StreamView's interface is designed as an immersive, distraction-free control room for live video:
- **Content is Hero**: High-contrast dark theme minimizes eye strain and makes colorful live video feeds stand out.
- **Frictionless Transitions**: Swapping streams and changing layouts happens instantaneously without page reloads or layout jumping.
- **Information Density with Breathing Room**: Vital metadata (viewers, badges, category tags) is clear at a glance while preserving maximum pixel area for video.

---

## 2. Color Palette & Design Tokens

```css
/* Primary Theme Palette */
--bg-base: #09070C;            /* Deep Obsidian Canvas */
--surface-card: #140E19;        /* Elevated Card Background */
--surface-card-hover: #1E100F;  /* Hover State Background */
--border-subtle: rgba(255, 255, 255, 0.08);
--border-active: rgba(244, 197, 66, 0.4);

/* Brand Accents */
--brand-gold: #F4C542;          /* Primary Accent & CTAs */
--brand-orange: #FF8A2A;        /* Secondary Vibrant Accent */
--brand-red: #E13D32;           /* Urgent / Live Glow */
--brand-pink: #F01867;          /* Gradient Complement */

/* Status Indicators */
--status-live: #22C55E;         /* Neon Green Live Pulse */
--platform-kick: #53FC18;       /* Official Kick Neon Green */
--platform-yt: #FF0000;         /* Official YouTube Red */

/* Typography */
--text-primary: #FFFFFF;
--text-secondary: #9CA3AF;      /* Gray 400 */
--text-muted: #6B7280;          /* Gray 500 */
```

---

## 3. Typography Hierarchy

- **Headings & Display**: `Sora` (Google Font, weights 600, 700, 800)
  - Geometric, tech-forward, distinctive personality.
  - Used for hero titles, section headers, brand badges, and numbers.
- **Body & Controls**: `Inter` (Google Font, weights 400, 500, 600)
  - Optimized for small screens and UI labels.
  - Used for channel titles, search inputs, buttons, and metadata tags.

---

## 4. Multi-View Layout Paradigms

### 4.1. Equal Grid Mode
Symmetrical grid adapting automatically to active stream count:
- **1 Stream**: `w-full h-[80vh]`
- **2 Streams**: `grid-cols-1 md:grid-cols-2`
- **3 Streams**: Top full-width or `grid-cols-1 md:grid-cols-3`
- **4 Streams**: `grid-cols-1 sm:grid-cols-2 md:grid-cols-2` (2x2 square)
- **5-6 Streams**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` (3x2 matrix)

### 4.2. Stage View Mode
- **Primary Screen (Stage)**: Occupies 70–75% of visual area.
- **Secondary Ribbon**: Thumbnail cards rendered along the bottom or right sidebar.
- Each thumbnail displays:
  - Mini live video preview.
  - "Solo Audio" speaker icon.
  - "Promote to Stage" button.
  - "Remove" icon.

---

## 5. Micro-Interactions & States

1. **Hover Action Overlays**:
   - Hovering over any stream reveals semi-transparent action buttons (Solo Audio, Promote to Stage, Remove Stream, Open Official Channel).
2. **Audio Focus Animation**:
   - The active audio stream features a glowing gold/green speaker icon, ensuring the user immediately knows where sound is coming from.
3. **Live Indicator Pulse**:
   - `.animate-pulse` on a `bg-live` green dot next to active stream titles.
4. **Empty State Prompt**:
   - Centered minimal cockpit with quick search input, YouTube URL resolver preview, and one-click trending community tags.

---

## 6. Accessibility & Responsive Targets
- **Keyboard Navigation**: Search inputs support instant `Enter` to add and `Escape` to clear.
- **Contrast Compliance**: Text contrast meets WCAG 2.1 AA standards against the `#09070C` dark background.
- **Mobile Adaptations**: On mobile (< 640px), multi-view automatically stacks streams vertically with sticky audio controls.
