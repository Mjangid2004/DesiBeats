"use client";

import { useState, useEffect } from "react";
import { usePlayer } from "@/context/PlayerContext";
import ProgressBar from "@/components/ProgressBar";
import Controls from "@/components/Controls";
import VolumeControl from "@/components/VolumeControl";
import YouTubePlayer from "@/components/YouTubePlayer";
import { X, Music2, Heart, Plus, Loader2 } from "lucide-react";

export default function NowPlaying() {
  const { state, toggleFavorite, isFavorite, addToPlaylist, createPlaylist } = usePlayer();
  const [showPlayer, setShowPlayer] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [lyricsText, setLyricsText] = useState("");
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const currentSong = state.queue[state.currentIndex];

  const liked = currentSong ? isFavorite(currentSong) : false;

  useEffect(() => {
    if (!currentSong || !showLyrics) return;
    setLoadingLyrics(true);
    setLyricsText(`♪ ♫ ♪\n\n${currentSong.title}\n${currentSong.artist}\n\n♪ ♫ ♪\n\nSearching for lyrics...\n♪ ♫ ♪`);
    fetch(`/api/lyrics?title=${encodeURIComponent(currentSong.title)}&artist=${encodeURIComponent(currentSong.artist)}`)
      .then(res => res.json())
      .then(data => {
        if (data.lyrics) setLyricsText(data.lyrics);
      })
      .catch(() => {
        setLyricsText(`♪ ♫ ♪\n\n${currentSong.title}\n${currentSong.artist}\n\n♪ ♫ ♪\n\nLyrics not available for this song.\n♪ ♫ ♪`);
      })
      .finally(() => setLoadingLyrics(false));
  }, [currentSong?.id, showLyrics, currentSong]);

  const handleAddToPlaylist = (playlistId: string) => {
    if (currentSong) {
      addToPlaylist(playlistId, currentSong);
      setShowPlaylistMenu(false);
    }
  };

  const handleCreateAndAdd = () => {
    if (newPlaylistName.trim() && currentSong) {
      createPlaylist(newPlaylistName.trim(), [currentSong]);
      setNewPlaylistName("");
      setShowCreatePlaylist(false);
      setShowPlaylistMenu(false);
    }
  };

  useEffect(() => {
    if (!showPlaylistMenu && !showCreatePlaylist) return;
    const timer = setTimeout(() => {
      setShowPlaylistMenu(false);
      setShowCreatePlaylist(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, [showPlaylistMenu, showCreatePlaylist]);

  return (
    <>
      {showPlayer && (
        <div className="fixed inset-0 z-50 bg-black">
          <div className="h-full flex flex-col p-6">
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => setShowPlayer(false)} className="p-2 hover:bg-white/10 rounded-full">
                <X className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowPlaylistMenu(true)} className="p-2 hover:bg-white/10 rounded-full">
                  <Plus className="w-6 h-6" />
                </button>
                <button onClick={() => currentSong && toggleFavorite(currentSong)} className="p-2 hover:bg-white/10 rounded-full">
                  <Heart className={liked ? "w-6 h-6 text-red-500" : "w-6 h-6"} fill={liked ? "currentColor" : "none"} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center">
              {currentSong && (
                <img src={currentSong.thumbnail} alt={currentSong.title} className="w-72 h-72 rounded-xl object-cover shadow-2xl" />
              )}
            </div>
            
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-center">{currentSong?.title}</h2>
              <p className="text-gray-400 text-center mt-2">{currentSong?.artist}</p>
            </div>
            
            <div className="mt-8">
              <ProgressBar />
            </div>
            
            <div className="flex items-center justify-center gap-8 mt-6">
              <Controls />
            </div>
            
            <div className="mt-6">
              <VolumeControl />
            </div>
          </div>
        </div>
      )}

      {showLyrics && (
        <div className="fixed inset-0 z-50 bg-black/95">
          <div className="h-full flex flex-col p-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <button onClick={() => setShowLyrics(false)} className="p-2 hover:bg-white/10 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto mt-4">
              <h2 className="text-xl font-bold">{currentSong?.title}</h2>
              <p className="text-gray-400 mb-4">{currentSong?.artist}</p>
              <div className="bg-white/5 p-4 rounded-xl whitespace-pre-line text-gray-300">
                {loadingLyrics ? (
                  <div className="flex items-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    <span>Searching lyrics...</span>
                  </div>
                ) : (
                  lyricsText
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="hidden md:block h-28 bg-gradient-to-t from-black to-black/95 border-t border-white/10 px-4 flex items-center gap-4">
        <div className="flex items-center gap-3 w-64 cursor-pointer" onClick={() => setShowPlayer(true)}>
          {currentSong ? (
            <>
              <img src={currentSong.thumbnail} alt={currentSong.title} className="w-16 h-16 rounded object-cover" />
              <div>
                <p className="font-medium truncate text-sm">{currentSong.title}</p>
                <p className="text-xs text-gray-400 truncate">{currentSong.artist}</p>
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-500">No song playing</div>
          )}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-4">
            <div className="relative">
              <button onClick={() => setShowPlaylistMenu(!showPlaylistMenu)} className="p-2 hover:bg-white/10 rounded-full text-yellow-400">
                <Plus className="w-6 h-6" />
              </button>
              {showPlaylistMenu && (
                <div className="absolute top-full mt-2 left-0 w-56 bg-neutral-900 rounded-lg shadow-xl border border-white/10 overflow-hidden z-[300]">
                  <div className="p-2 border-b border-white/10">
                    <button onClick={() => setShowCreatePlaylist(true)} className="w-full text-left px-3 py-2 text-sm hover:bg-white/10 rounded flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Create new playlist
                    </button>
                  </div>
                  {state.playlists.length > 0 && (
                    <div className="max-h-48 overflow-y-auto">
                      {state.playlists.map((playlist) => (
                        <button key={playlist.id} onClick={() => handleAddToPlaylist(playlist.id)} className="w-full text-left px-3 py-2 text-sm hover:bg-white/10">
                          {playlist.name} ({playlist.songs.length})
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {showCreatePlaylist && (
                <div className="absolute top-full mt-2 left-0 w-56 bg-neutral-900 rounded-lg shadow-xl border border-white/10 p-3 z-[300]">
                  <input type="text" value={newPlaylistName} onChange={(e) => setNewPlaylistName(e.target.value)} placeholder="Playlist name..." className="w-full px-3 py-2 bg-white/10 rounded-lg text-sm mb-2" autoFocus />
                  <div className="flex gap-2">
                    <button onClick={handleCreateAndAdd} className="flex-1 py-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg text-sm">Create</button>
                    <button onClick={() => setShowCreatePlaylist(false)} className="px-3 py-2 bg-white/10 rounded-lg text-sm">Cancel</button>
                  </div>
                </div>
              )}
            </div>
            <Controls />
            <button onClick={() => setShowLyrics(true)} className="p-2 hover:bg-white/10 rounded-full text-blue-400">
              <Music2 className="w-6 h-6" />
            </button>
          </div>
          <div className="w-full mt-2">
            <ProgressBar />
          </div>
        </div>

        <div className="w-64 flex items-center justify-end gap-2">
          <button onClick={() => currentSong && toggleFavorite(currentSong)} className="p-2 hover:bg-white/10 rounded-full">
            <Heart className={liked ? "w-5 h-5 text-red-500" : "w-5 h-5"} fill={liked ? "currentColor" : "none"} />
          </button>
          <VolumeControl />
        </div>
      </div>

      <div className="md:hidden fixed bottom-14 left-0 right-0 bg-neutral-900 border-t border-neutral-800 z-40">
        <div className="px-3 pt-2">
          <ProgressBar />
        </div>
        <div className="h-16 px-3 flex items-center gap-2">
          <div className="flex items-center gap-2 w-32 cursor-pointer flex-shrink-0" onClick={() => setShowPlayer(true)}>
            {currentSong ? (
              <>
                <img src={currentSong.thumbnail} alt={currentSong.title} className="w-10 h-10 rounded" />
                <div className="overflow-hidden">
                  <p className="font-medium text-xs truncate">{currentSong.title}</p>
                  <p className="text-xs text-gray-400 truncate">{currentSong.artist}</p>
                </div>
              </>
            ) : (
              <div className="text-xs text-gray-500">No song</div>
            )}
          </div>
          <div className="flex-1 flex justify-center">
            <Controls />
          </div>
          <button onClick={() => setShowPlaylistMenu(!showPlaylistMenu)} className="p-2 hover:bg-white/10 rounded-full flex-shrink-0 text-yellow-400">
            <Plus className="w-5 h-5" />
          </button>
          <button onClick={() => currentSong && toggleFavorite(currentSong)} className="p-2 hover:bg-white/10 rounded-full flex-shrink-0">
            <Heart className={liked ? "w-5 h-5 text-red-500" : "w-5 h-5"} fill={liked ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      <YouTubePlayer />
    </>
  );
}