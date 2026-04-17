# Music Player - SPEC.md

## 1. Concept & Vision

A sleek, ad-free music player that sources audio from YouTube via Invidious API. Features intelligent auto-suggestions based on genre/language, dynamic theming that adapts to album art colors, and smart playlist management. The experience should feel premium and immersive.

## 2. Design Language

### Aesthetic Direction
Glassmorphism meets minimalism - frosted glass cards floating over gradient backgrounds that shift based on current song artwork.

### Color Palette
- **Light Theme**: 
  - Background: `#f8fafc`
  - Surface: `rgba(255, 255, 255, 0.7)`
  - Primary: `#6366f1` (Indigo)
  - Text: `#1e293b`
  
- **Dark Theme**:
  - Background: `#0f172a`
  - Surface: `rgba(30, 41, 59, 0.8)`
  - Primary: `#818cf8`
  - Text: `#f1f5f9`

- **Dynamic**: Extract dominant colors from album art for gradient backgrounds

### Typography
- Font: Inter (Google Fonts)
- Headings: 600 weight
- Body: 400 weight

### Motion Philosophy
- Smooth 300ms transitions for UI changes
- Slide/fade animations for song changes
- Pulse animation for playing indicator
- Progress bar smooth scrubbing

## 3. Layout & Structure

```
┌─────────────────────────────────────┐
│  Header (Logo + Theme Toggle)        │
├─────────────────────────────────────┤
│  Search Bar                         │
├─────────────────────────────────────┤
│  Dynamic Background Gradient        │
│  ┌─────────────────────────────┐    │
│  │  Album Art (with glow)      │    │
│  │  Song Title                  │    │
│  │  Artist                       │    │
│  └─────────────────────────────┘    │
├─────────────────────────────────────┤
│  Progress Bar (seekable)           │
├─────────────────────────────────────┤
│  Controls: ⏮ | ▶/⏸ | ⏭ | 🔀 | 🔁   │
├─────────────────────────────────────┤
│  Volume Slider                      │
├─────────────────────────────────────┤
│  Playlists Tabs:                   │
│  [Search] [Favorites] [History] [Top]│
│  ─────────────────────────────────  │
│  Song List                          │
└─────────────────────────────────────┘
```

## 4. Features & Interactions

### Playback Modes
- **Play Order**: Sequential queue playback
- **Once**: Play current song once, stop
- **Repeat x2**: Loop current song twice
- **Repeat All**: Loop entire queue
- **Shuffle**: Random queue order

### Auto-Suggestions
- After song ends, analyze current song metadata
- Fetch similar songs from YouTube via Invidious
- Add suggestions to queue automatically

### Playlist Management
1. **Favorites**: Heart icon to save songs (persisted in localStorage)
2. **Session History**: Songs played this session
3. **Most Played**: Top most frequently played

### Controls
- Play/Pause toggle with loading indicator
- Previous (restart if >3s in, else previous song)
- Next (skip to next in queue)
- Progress bar click to seek
- Volume slider (0-100%)

### Theme
- Toggle: Light / Dark / Dynamic
- Dynamic: Extract colors from album art

## 5. Technical Approach

### Stack
- **Frontend**: Next.js 14
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State**: React hooks + Context
- **Storage**: localStorage
- **Audio**: Howler.js + Invidious API

### API Design
- `/api/search?q={query}` - Search via Invidious (music type)
- `/api/stream?videoId={id}` - Get audio stream URL from Invidious

### Invidious Instances Used
- yewtu.be (primary)
- inv.nadeko.net (fallback)

### Data Model
```typescript
interface Song {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: number;
  videoId: string;
}
```

## 6. Deployment
- Frontend: Vercel
- API: Vercel Serverless Functions (API routes)
