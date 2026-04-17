"use client";

import { useState } from "react";
import { usePlayer } from "@/context/PlayerContext";
import { useAppContext } from "@/context/AppContext";
import { 
  Home, Search, Heart, Clock, ListMusic, 
  Plus, Download, ChevronDown, Music
} from "lucide-react";

const GENRES = [
  { name: "Haryanvi", query: "haryanvi song 2024", color: "from-orange-500 to-red-500" },
  { name: "Bollywood", query: "bollywood song 2024", color: "from-purple-500 to-pink-500" },
  { name: "Punjabi", query: "punjabi song 2024", color: "from-green-500 to-teal-500" },
  { name: "Rajasthani", query: "rajasthani song", color: "from-pink-500 to-rose-500" },
  { name: "Bhojpuri", query: "bhojpuri song 2024", color: "from-amber-500 to-orange-500" },
  { name: "Hip Hop", query: "hip hop song 2024", color: "from-blue-500 to-indigo-500" },
  { name: "Lo-Fi", query: "lofi song 2024", color: "from-cyan-500 to-blue-500" },
  { name: "Trending", query: "trending india 2024", color: "from-yellow-500 to-orange-500" },
  { name: "Old Hits", query: "old hindi songs 90s", color: "from-gray-500 to-gray-600" },
  { name: "DJ Mix", query: "hindi dj song 2024", color: "from-violet-500 to-purple-500" },
];

export default function Sidebar() {
  const { state, playSong, createPlaylist } = usePlayer();
  const { viewMode, setViewMode, clearSearch, setSearchQuery } = useAppContext();
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [showInstallHelp, setShowInstallHelp] = useState(false);

  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

  const handleTabClick = (mode: any) => {
    clearSearch();
    setSearchQuery('');
    setViewMode(mode);
  };

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName("");
      setShowCreatePlaylist(false);
    }
  };

  return (
    <>
      {showInstallHelp && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-6">
          <div className="bg-neutral-900 rounded-2xl p-6 max-w-sm w-full border border-white/10">
            <h3 className="text-xl font-bold mb-4">Install DesiBeats</h3>
            {isIOS ? (
              <div className="space-y-3 text-sm text-gray-300">
                <p>1. Open in <strong>Safari</strong></p>
                <p>2. Tap <strong>Share</strong> button</p>
                <p>3. Tap <strong>"Add to Home Screen"</strong></p>
                <p>4. Tap <strong>"Add"</strong></p>
              </div>
            ) : (
              <div className="space-y-3 text-sm text-gray-300">
                <p>1. Tap the <strong>install icon</strong> in the address bar</p>
                <p>Or tap <strong>menu (⋮)</strong> → <strong>"Install app"</strong></p>
              </div>
            )}
            <button
              onClick={() => setShowInstallHelp(false)}
              className="w-full mt-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl font-medium"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <div className="h-full bg-black flex flex-col p-4 overflow-hidden">
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center">
            <Music className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
            DesiBeats
          </span>
        </div>

        <nav className="space-y-1 mb-6">
          <button
            onClick={() => handleTabClick('home')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${viewMode === 'home' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">Home</span>
          </button>
          <button
            onClick={() => handleTabClick('search')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${viewMode === 'search' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Search className="w-5 h-5" />
            <span className="font-medium">Search</span>
          </button>
        </nav>

        <div className="px-4 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400 uppercase tracking-wider font-medium">Library</span>
            <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 hover:text-white text-gray-400">
              <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        <nav className="space-y-1 flex-1 overflow-y-auto">
          <button
            onClick={() => handleTabClick('favorites')}
            className={`w-full flex items-center gap-4 px-4 py-2 rounded-lg transition-colors ${viewMode === 'favorites' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Heart className={`w-5 h-5 ${viewMode === 'favorites' ? 'text-pink-500' : ''}`} />
            <span className="font-medium">Liked Songs</span>
            <span className="ml-auto text-xs text-gray-500">{state.favorites.length}</span>
          </button>
          <button
            onClick={() => handleTabClick('history')}
            className={`w-full flex items-center gap-4 px-4 py-2 rounded-lg transition-colors ${viewMode === 'history' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Clock className="w-5 h-5" />
            <span className="font-medium">Recently Played</span>
            <span className="ml-auto text-xs text-gray-500">{state.history.length}</span>
          </button>
          <button
            onClick={() => handleTabClick('queue')}
            className={`w-full flex items-center gap-4 px-4 py-2 rounded-lg transition-colors ${viewMode === 'queue' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <ListMusic className="w-5 h-5" />
            <span className="font-medium">Queue</span>
            <span className="ml-auto text-xs text-gray-500">{state.queue.length}</span>
          </button>
          <button
            onClick={() => handleTabClick('playlists')}
            className={`w-full flex items-center gap-4 px-4 py-2 rounded-lg transition-colors ${viewMode === 'playlists' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <ListMusic className="w-5 h-5" />
            <span className="font-medium">Playlists</span>
            <span className="ml-auto text-xs text-gray-500">{state.playlists.length}</span>
          </button>

          {isExpanded && (
            <div className="mt-2 space-y-1">
              {state.playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => playSong(playlist.songs[0], playlist.songs)}
                  className="w-full flex items-center gap-4 px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <div className="w-5 h-5 bg-gradient-to-br from-pink-500 to-rose-500 rounded flex items-center justify-center">
                    <span className="text-xs font-bold">♪</span>
                  </div>
                  <span className="font-medium truncate">{playlist.name}</span>
                  <span className="ml-auto text-xs text-gray-500">{playlist.songs.length}</span>
                </button>
              ))}
            </div>
          )}
        </nav>

        <div className="border-t border-white/10 pt-4 mt-4 space-y-1">
          <button
            onClick={() => setShowCreatePlaylist(true)}
            className="w-full flex items-center gap-4 px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Create Playlist</span>
          </button>
          <button
            onClick={() => setShowInstallHelp(true)}
            className="w-full flex items-center gap-4 px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Download className="w-5 h-5" />
            <span className="font-medium">Install App</span>
          </button>
        </div>
      </div>

      {showCreatePlaylist && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 rounded-xl p-6 w-full max-w-sm border border-white/10">
            <h3 className="text-lg font-bold mb-4">Create New Playlist</h3>
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Playlist name"
              className="w-full px-4 py-3 bg-white/10 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-pink-500"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handleCreatePlaylist}
                className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg font-medium"
              >
                Create
              </button>
              <button
                onClick={() => setShowCreatePlaylist(false)}
                className="px-4 py-3 bg-white/10 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}