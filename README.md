# 🎵 MforMusic - Free Ad-Free Music Player

## 🚀 Live Demo

**Try it now:** https://mfor-music.vercel.app

## 📱 Install as App (PWA)

You can install MforMusic on your phone like any other app!

### On Mobile (Chrome / Safari):
1. Open **https://mfor-music.vercel.app** in your mobile browser
2. Tap the **"Install"** button at the top (or use browser menu)
3. Tap **"Add to Home Screen"**
4. Done! MforMusic will appear on your home screen 🎉

### On Desktop (Chrome / Edge):
1. Open **https://mfor-music.vercel.app**
2. Click the **install icon** in the address bar
3. Or use menu → **"Install MforMusic"**

---

## What is this App?

A **completely free, ad-free music player** that lets you:
- Stream unlimited songs from YouTube (yes, including all your favorite Haryana, Bollywood, Punjabi songs!)
- Download songs to your device
- Play your own local music files
- Save your liked songs and history automatically
- **No login, no signup, no premium** - just open and play!

---

## 🎯 Features Explained

### 1. Stream Unlimited Music
- Search any song from YouTube
- Works great with Indian music (Haryanvi, Bollywood, Punjabi, Bhojpuri, etc.)
- No ads, no interruptions

### 2. Auto-Save Everything
- **Liked Songs** - Click the heart icon, it's saved forever
- **Recently Played** - Your history is automatically saved
- **Queue** - Your playlist is saved
- **Volume** - Your volume preference is saved
- Everything stored in your browser (localStorage) - no account needed!

### 3. Queue Management
- **Add to Queue** - Click the ➕ icon to add a song to queue
- **Play Next** - Click the ⬆️ icon to play this song next
- **Download** - Click ⬇️ to download the song
- All songs play in order automatically

### 4. Genre Browsing
Pre-loaded genre categories:
- 🎵 **Haryanvi** - Jaat Niu, Sapna Chaudhary, Masoom Sharma songs
- 🎬 **Bollywood** - Latest Hindi movie songs
- 🪗 **Punjabi** - Sidhu Moose Wala style hits
- 🎤 **Bhojpuri** - Bhojpuri hits
- 🏜️ **Rajasthani** - Folk songs
- 🎧 **Hip Hop** - Rap music
- ☕ **Lo-Fi** - Chill beats
- 🎉 **EDM** - Party music

### 5. Local Files Support
- Click **"+ Local Files"** button
- Select MP3/audio files from your computer
- Perfect fallback when internet is slow!

### 6. Playback Controls
- ▶️ Play / ⏸️ Pause
- ⏭️ Next Song
- ⏮️ Previous Song
- 🔁 Play Modes:
  - **Order** - Play songs in queue order
  - **Repeat Once** - Play current song once
  - **Repeat 2x** - Loop song twice
  - **Repeat All** - Loop entire queue
  - **Shuffle** - Random order

### 7. Lyrics View
- Click on the song album art or music icon
- Opens full-screen view with:
  - Large album art
  - Song details
  - Lyrics section
  - All playback controls

---

## 💻 How It Works

### Architecture
```
┌─────────────┐      ┌─────────────┐      ┌──────────────┐
│   Browser   │ ──── │  Next.js   │ ──── │  YouTube    │
│   (React)   │      │   Server   │      │   API       │
└─────────────┘      └─────────────┘      └──────────────┘
       │                    │                    │
       ▼                    ▼                    ▼
┌─────────────┐      ┌─────────────┐      ┌──────────────┐
│ localStorage│      │  API Routes │      │   CORS     │
│ (Database)  │      │ (Search)    │      │   Proxy    │
└─────────────┘      └─────────────┘      └──────────────┘
```

### Data Flow
1. **User searches** → Sends request to `/api/search`
2. **Server fetches** from YouTube via proxy
3. **Results shown** → User clicks a song
4. **YouTube Player** loads the video (audio only, hidden)
5. **Song plays** → Added to history automatically
6. **User likes** → Saved to localStorage
7. **On reload** → All data restored from localStorage

### Tech Stack
| Technology | Purpose |
|------------|---------|
| Next.js 14 | Framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| React Context | State management |
| localStorage | Data persistence |
| YouTube IFrame | Audio playback |

---

## 📁 Project Structure

```
music-player/
│
├── 📄 README.md                 # This file
├── 📄 SPEC.md                   # Technical specifications
│
├── 📂 src/
│   │
│   ├── 📂 app/                 # Next.js app router
│   │   ├── api/
│   │   │   ├── search/
│   │   │   │   └── route.ts    # YouTube search API
│   │   │   └── stream/
│   │   │       └── route.ts    # Audio stream API
│   │   │
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Main app page
│   │
│   ├── 📂 components/           # React components
│   │   ├── Controls.tsx        # ▶️ ⏭️ ⏮️ controls
│   │   ├── MainContent.tsx      # Main area (search, genres)
│   │   ├── NowPlaying.tsx       # Bottom bar + lyrics
│   │   ├── ProgressBar.tsx      # Seekable progress bar
│   │   ├── Sidebar.tsx         # Left sidebar
│   │   ├── VolumeControl.tsx   # Volume slider
│   │   └── YouTubePlayer.tsx    # Hidden YouTube player
│   │
│   ├── 📂 context/
│   │   └── PlayerContext.tsx   # Global state (reducer)
│   │
│   └── 📂 lib/
│       └── types.ts             # TypeScript interfaces
│
├── 📂 public/                   # Static assets
│
├── package.json                 # Dependencies
├── tailwind.config.ts           # Tailwind config
└── tsconfig.json               # TypeScript config
```

---

## 🚀 Deployment Guide

### Option 1: Vercel (Recommended)

**Step 1: Push to GitHub**
```bash
# Initialize git (if not done)
git init
git add .
git commit -m "Music Player v1.0"

# Create new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/music-player.git
git branch -M main
git push -u origin main
```

**Step 2: Deploy on Vercel**
1. Go to https://vercel.com
2. Click **"Add New Project"**
3. Import your GitHub repo
4. Click **"Deploy"**
5. Wait 1-2 minutes
6. Get your live URL! 🎉

### Option 2: Netlify

1. Push to GitHub
2. Go to https://netlify.com
3. Connect your repo
4. Deploy!

### Option 3: Local Server

```bash
# Install dependencies
npm install

# Development mode
npm run dev
# Opens at http://localhost:3000

# Production build
npm run build
npm start
```

---

## ❓ Troubleshooting

### Songs not loading?
- Check your internet connection
- YouTube might be blocked in your region
- Wait and try again

### Download not working?
- Some videos don't allow downloads
- Try a different song
- Use local files instead

### Search returns empty?
- API might be rate limited
- Try different search terms
- Refresh the page

---

## 🔒 Privacy & Data

- **No login required** - Everything stored locally
- **No data sent to servers** - Only YouTube API calls
- **localStorage** - Your browser stores all data
- **Clear cache** - If you want to reset all data

---

## 📱 How to Use (Step by Step)

### Playing a Song
1. Type song name in search bar
2. Click on the song
3. Enjoy! 🎵

### Liking a Song
1. Find the heart icon (❤️) on any song
2. Click it
3. Song is saved to "Liked Songs"

### Adding to Queue
1. Hover over any song
2. Click ➕ to add to queue
3. Click ⬆️ to play next

### Downloading
1. Hover over any song
2. Click ⬇️ download icon
3. File downloads to your device

### Playing Local Files
1. Click **"+ Local Files"**
2. Select audio files
3. Songs play offline!

---

## 🎨 Design Features

- **Dark Theme** - Easy on the eyes
- **Glassmorphism** - Modern glass effects
- **Gradient Cards** - Beautiful genre cards
- **Smooth Animations** - Transitions everywhere
- **Responsive** - Works on phone & desktop

---

## ⚡ Performance

- **Fast Loading** - Static pages prerendered
- **Lazy Search** - Debounced API calls
- **Auto-save** - Efficient localStorage usage
- **No Memory Leaks** - Proper cleanup

---

## 🌟 Why This App?

| Spotify | This App |
|---------|----------|
| ❌ Ads | ✅ Ad-free |
| ❌ Premium required | ✅ 100% Free |
| ❌ Limited offline | ✅ Local files work |
| ❌ No Indian music | ✅ Full YouTube library |
| ❌ Login required | ✅ No signup |

---

## 📞 Support

If you face any issues:
1. Refresh the page
2. Clear browser cache
3. Check internet connection
4. Try a different browser

---

**Made with ❤️ for music lovers who deserve free, unlimited music!**

**License: Free to use, no restrictions!**
