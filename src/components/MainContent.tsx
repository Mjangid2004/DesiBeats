"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePlayer } from "@/context/PlayerContext";
import { useAppContext } from "@/context/AppContext";
import { Song } from "@/lib/types";

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

export default function MainContent() {
  const { state, playSong, dispatch, toggleFavorite, isFavorite, addToPlaylist, createPlaylist } = usePlayer();
  const { viewMode, setViewMode, searchQuery, setSearchQuery } = useAppContext();
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<typeof GENRES[0] | null>(null);
  const [genreSongs, setGenreSongs] = useState<Song[]>([]);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
  const [songToAdd, setSongToAdd] = useState<Song | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSelectedGenre(null);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (data.results && Array.isArray(data.results)) {
        setSearchResults(data.results);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (searchQuery) performSearch(searchQuery);
    }, 600);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, performSearch]);

  const handlePlaySong = (song: Song, songs: Song[]) => {
    setSelectedGenre(null);
    playSong(song, songs);
  };

  const handleAddToQueue = (e: React.MouseEvent, song: Song) => {
    e.stopPropagation();
    dispatch({ type: "ADD_TO_QUEUE", payload: song });
  };

  const handlePlayNext = (e: React.MouseEvent, song: Song) => {
    e.stopPropagation();
    const currentIndex = state.currentIndex;
    const newQueue = [...state.queue];
    newQueue.splice(currentIndex + 1, 0, song);
    dispatch({ type: "SET_QUEUE", payload: newQueue });
  };

  const handleLoadGenre = async (genre: typeof GENRES[0]) => {
    setSelectedGenre(genre);
    setIsSearching(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(genre.query)}`);
      const data = await response.json();
      if (data.results && Array.isArray(data.results)) {
        const filtered = data.results.filter((song: Song) => {
          const duration = song.duration || 0;
          return duration > 0 && duration <= 600;
        });
        setGenreSongs(filtered);
      }
    } catch (error) {
      console.error("Failed to load genre:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newSongs: Song[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith("audio/")) {
        const url = URL.createObjectURL(file);
        newSongs.push({
          id: `local-${Date.now()}-${i}`,
          title: file.name.replace(/\.[^/.]+$/, ""),
          artist: "Local File",
          thumbnail: "https://img.youtube.com/vi/local/mqdefault.jpg",
          duration: 0,
          videoId: url,
          isLocal: true,
        });
      }
    }

    if (newSongs.length > 0) {
      if (state.queue.length === 0) {
        playSong(newSongs[0], newSongs);
      } else {
        newSongs.forEach(song => {
          dispatch({ type: "ADD_TO_QUEUE", payload: song });
        });
      }
    }

    if (fileInputRef.current) (fileInputRef.current as HTMLInputElement).value = "";
  };

  const downloadSong = async (e: React.MouseEvent, song: Song) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/stream?videoId=${song.videoId}`);
      const data = await response.json();
      if (data.audioUrl) {
        const a = document.createElement("a");
        a.href = data.audioUrl;
        a.download = `${song.title}.mp3`;
        a.click();
      }
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleLike = (e: React.MouseEvent, song: Song) => {
    e.stopPropagation();
    toggleFavorite(song);
  };

  const handleAddToPlaylistClick = (e: React.MouseEvent, song: Song) => {
    e.stopPropagation();
    setSongToAdd(song);
    setShowAddToPlaylist(true);
  };

  const handleAddSongToPlaylist = (playlistId: string) => {
    if (songToAdd) {
      addToPlaylist(playlistId, songToAdd);
      setShowAddToPlaylist(false);
      setSongToAdd(null);
    }
  };

  const handleCreateAndAdd = (name: string) => {
    if (songToAdd) {
      createPlaylist(name, [songToAdd]);
      setShowAddToPlaylist(false);
      setSongToAdd(null);
    }
  };

  const formatDuration = (seconds: number): string => {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const SongItem = ({ song, allSongs, showActions = true }: { song: Song; allSongs: Song[]; showActions?: boolean }) => {
    const liked = isFavorite(song);
    const isCurrentSong = state.queue[state.currentIndex]?.id === song.id;
    
    return (
      <div
        className={`flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg cursor-pointer group transition-all ${isCurrentSong ? 'bg-pink-500/20' : 'hover:bg-white/10'}`}
        onClick={() => handlePlaySong(song, allSongs)}
      >
        <div className="relative w-10 h-10 md:w-12 md:h-12 flex-shrink-0">
          <img src={song.thumbnail} alt="" className="w-full h-full rounded object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded flex items-center justify-center">
            <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="white" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-sm md:text-base truncate ${liked ? 'text-pink-400' : ''}`}>{song.title}</p>
          <p className="text-xs md:text-sm text-gray-400 truncate">{song.artist}</p>
        </div>
        <span className="text-xs md:text-sm text-gray-400 hidden md:block">{formatDuration(song.duration)}</span>
        
        {showActions && (
          <div className="flex items-center gap-1 md:gap-2">
            <button
              onClick={(e) => handleLike(e, song)}
              className={`p-1 md:p-2 hover:scale-110 transition-all ${liked ? 'text-red-500' : 'text-gray-400 opacity-0 group-hover:opacity-100'}`}
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <button onClick={(e) => handleAddToQueue(e, song)} className="p-1 md:p-2 text-gray-400 hover:text-pink-400 opacity-0 group-hover:opacity-100">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button onClick={(e) => handlePlayNext(e, song)} className="p-1 md:p-2 text-gray-400 hover:text-pink-400 opacity-0 group-hover:opacity-100">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
            <button onClick={(e) => handleAddToPlaylistClick(e, song)} className="p-1 md:p-2 text-gray-400 hover:text-yellow-400 opacity-0 group-hover:opacity-100">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m-4-4h8" />
              </svg>
            </button>
            <button onClick={(e) => downloadSong(e, song)} className="p-1 md:p-2 text-gray-400 hover:text-pink-400 opacity-0 group-hover:opacity-100">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 bg-gradient-to-b from-neutral-900 to-black overflow-y-auto p-4 md:p-6 pb-28 md:pb-6">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="audio/*"
        multiple
        className="hidden"
        id="local-audio"
      />

      <div className="space-y-6">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search songs, artists..."
              className="w-full pl-10 md:pl-12 pr-4 py-2 md:py-3 rounded-full bg-white/10 border border-white/10 focus:border-pink-500 focus:outline-none text-sm md:text-base"
            />
            <svg className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 md:px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-xs md:text-sm whitespace-nowrap"
          >
            + Local
          </button>
        </div>

        {searchQuery && searchQuery.length > 0 ? (
          <div className="space-y-2">
            <h3 className="font-bold text-base md:text-lg">Search Results</h3>
            {isSearching ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full" />
              </div>
            ) : searchResults.length === 0 ? (
              <p className="text-gray-400 text-sm">No results found for "{searchQuery}"</p>
            ) : (
              searchResults.map((song, index) => (
                <SongItem key={`search-${song.id}-${index}`} song={song} allSongs={searchResults} />
              ))
            )}
          </div>
        ) : viewMode === 'favorites' ? (
          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">Liked Songs</h2>
            {state.favorites.length === 0 ? (
              <p className="text-gray-400 text-sm">No liked songs yet. Tap the heart on any song!</p>
            ) : (
              state.favorites.map((song, index) => (
                <SongItem key={`fav-${song.id}-${index}`} song={song} allSongs={state.favorites} />
              ))
            )}
          </div>
        ) : viewMode === 'history' ? (
          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">Recently Played</h2>
            {state.history.length === 0 ? (
              <p className="text-gray-400 text-sm">No recently played songs.</p>
            ) : (
              state.history.map((song, index) => (
                <SongItem key={`hist-${song.id}-${index}`} song={song} allSongs={state.history} />
              ))
            )}
          </div>
        ) : viewMode === 'queue' ? (
          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">Queue</h2>
            {state.queue.length === 0 ? (
              <p className="text-gray-400 text-sm">Queue is empty. Add songs to play next!</p>
            ) : (
              <>
                <p className="text-sm text-gray-400">{state.queue.length} songs in queue</p>
                <div className="space-y-2">
                  {state.queue.map((song, index) => (
                    <div 
                      key={`queue-${song.id}-${index}`} 
                      className={`flex items-center gap-2 p-2 rounded-lg ${index === state.currentIndex ? 'bg-pink-500/20' : 'hover:bg-white/10'}`}
                    >
                      <span className="text-sm text-gray-500 w-6 flex-shrink-0">
                        {index === state.currentIndex ? '▶' : `${index + 1}.`}
                      </span>
                      <div 
                        className="flex-1 min-w-0 cursor-pointer" 
                        onClick={() => playSong(song, state.queue)}
                      >
                        <p className="font-medium text-sm truncate">{song.title}</p>
                        <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                      </div>
                      <button
                        onClick={() => {
                          const newQueue = state.queue.filter((_, i) => i !== index);
                          dispatch({ type: "SET_QUEUE", payload: newQueue });
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 flex-shrink-0"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : viewMode === 'playlists' ? (
          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">Your Playlists</h2>
            {state.playlists.length === 0 ? (
              <p className="text-gray-400 text-sm">No playlists yet. Create one from sidebar!</p>
            ) : (
              <div className="space-y-2">
                {state.playlists.map((playlist) => (
                  <div 
                    key={`playlist-${playlist.id}`} 
                    className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer"
                    onClick={() => {
                      if (playlist.songs.length > 0) {
                        playSong(playlist.songs[0], playlist.songs);
                      }
                    }}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{playlist.name}</p>
                      <p className="text-sm text-gray-400">{playlist.songs.length} songs</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : selectedGenre ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button onClick={() => setSelectedGenre(null)} className="text-sm text-gray-400 hover:text-white">
                ← Back
              </button>
              <button 
                onClick={() => {
                  setGenreSongs([]);
                  handleLoadGenre(selectedGenre);
                }} 
                className="text-sm text-pink-400 hover:text-pink-300"
              >
                ↻ Refresh
              </button>
            </div>
            <h2 className="text-xl md:text-2xl font-bold">{selectedGenre.name}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
              {genreSongs.slice(0, 10).map((song, index) => (
                <div
                  key={`genre-grid-${song.id}-${index}`}
                  onClick={() => handlePlaySong(song, genreSongs)}
                  className="p-2 md:p-4 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer group"
                >
                  <div className="relative aspect-square rounded-lg overflow-hidden mb-2 md:mb-3">
                    <img src={song.thumbnail} alt="" className="w-full h-full object-cover" />
                    <div className="absolute bottom-2 right-2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-pink-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <svg className="w-4 h-4 md:w-5 md:h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  <p className="font-medium text-xs md:text-sm truncate">{song.title}</p>
                  <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <h3 className="text-base md:text-lg font-bold">All {selectedGenre.name} Songs</h3>
              {genreSongs.map((song, index) => (
                <SongItem key={`genre-${song.id}-${index}`} song={song} allSongs={genreSongs} />
              ))}
            </div>
          </div>
        ) : viewMode === 'search' ? (
          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">Search</h2>
            <p className="text-gray-400 text-sm">Search for your favorite songs, artists, or albums!</p>
          </div>
        ) : viewMode === 'local' ? (
          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">Local Files</h2>
            {state.localSongs.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-400 text-sm mb-4">No local files added yet.</p>
                <p className="text-gray-500 text-xs">Use "+ Local" button to add audio files from your device</p>
              </div>
            ) : (
              <>
                <button
                  onClick={() => state.localSongs.length > 0 && playSong(state.localSongs[0], state.localSongs)}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg font-medium mb-4"
                >
                  Play All ({state.localSongs.length})
                </button>
                <div className="space-y-2">
                  {state.localSongs.map((song) => (
                    <SongItem key={song.id} song={song} allSongs={state.localSongs} />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6 md:space-y-8">
            <div className="flex gap-3 md:gap-4">
              <button
                onClick={() => setViewMode('favorites')}
                className="flex-1 h-24 md:h-32 rounded-xl bg-gradient-to-br from-pink-500 to-red-500 p-3 md:p-4 flex flex-col justify-between hover:scale-105 transition-transform"
              >
                <svg className="w-6 h-6 md:w-8 md:h-8" fill="white" viewBox="0 0 24 24">
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <div>
                  <p className="font-bold text-sm md:text-base">Liked Songs</p>
                  <p className="text-xs opacity-80">{state.favorites.length} songs</p>
                </div>
              </button>
              <button
                onClick={() => setViewMode('history')}
                className="flex-1 h-24 md:h-32 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 p-3 md:p-4 flex flex-col justify-between hover:scale-105 transition-transform"
              >
                <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="white" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-bold text-sm md:text-base">Recently Played</p>
                  <p className="text-xs opacity-80">{state.history.length} songs</p>
                </div>
              </button>
            </div>

            <div>
              <h2 className="text-lg md:text-2xl font-bold mb-3 md:mb-4">Browse Genres</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                {GENRES.map((genre) => (
                  <button
                    key={genre.name}
                    onClick={() => handleLoadGenre(genre)}
                    className={`h-16 md:h-24 rounded-lg md:rounded-xl bg-gradient-to-br ${genre.color} p-2 md:p-4 text-left hover:scale-105 transition-transform`}
                  >
                    <span className="font-bold text-xs md:text-base block truncate">{genre.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {state.history.length > 0 && (
              <div>
                <h2 className="text-base md:text-xl font-bold mb-3 md:mb-4">Recently Played</h2>
                <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-4">
                  {state.history.slice(0, 6).map((song, index) => (
                    <div
                      key={`recent-${song.id}-${index}`}
                      onClick={() => handlePlaySong(song, state.history)}
                      className="p-2 md:p-4 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer group"
                    >
                      <div className="relative aspect-square rounded-lg overflow-hidden mb-2 md:mb-3">
                        <img src={song.thumbnail} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded flex items-center justify-center">
                          <svg className="w-8 h-8 md:w-10 md:h-10" fill="white" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-xs md:text-sm font-medium truncate">{song.title}</p>
                      <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showAddToPlaylist && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 rounded-xl p-6 w-full max-w-sm border border-white/10">
            <h3 className="text-lg font-bold mb-4">Add to Playlist</h3>
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {state.playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => handleAddSongToPlaylist(playlist.id)}
                  className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg"
                >
                  {playlist.name} ({playlist.songs.length})
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                const name = prompt("Create new playlist:");
                if (name) handleCreateAndAdd(name);
              }}
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg font-medium mb-2"
            >
              + Create New Playlist
            </button>
            <button
              onClick={() => setShowAddToPlaylist(false)}
              className="w-full py-3 bg-white/10 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}