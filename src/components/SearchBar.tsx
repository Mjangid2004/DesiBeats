"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePlayer } from "@/context/PlayerContext";
import { Song } from "@/lib/types";
import { Search, X, Loader2, Sparkles } from "lucide-react";

export default function SearchBar() {
  const { state, dispatch, playSong, setCurrentTab } = usePlayer();
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [recommendations, setRecommendations] = useState<Song[]>([]);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastSearchRef = useRef<string>("");

  const fetchRecommendations = useCallback(async (searchTerm: string, currentVideoId?: string, artistName?: string, songTitle?: string) => {
    try {
      if (currentVideoId) {
        const response = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            videoId: currentVideoId,
            artistName: artistName,
            songTitle: songTitle,
          }),
        });
        const data = await response.json();
        if (data.results && Array.isArray(data.results)) {
          setRecommendations(data.results.slice(0, 5));
        }
        return;
      }
      
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      
      if (data.results && Array.isArray(data.results)) {
        setRecommendations(data.results.slice(0, 5));
      }
    } catch (error) {
      console.error("Recommendations error:", error);
    }
  }, []);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      dispatch({ type: "SET_SEARCH_RESULTS", payload: [] });
      setRecommendations([]);
      return;
    }

    setIsSearching(true);
    dispatch({ type: "SET_LOADING", payload: true });
    lastSearchRef.current = searchQuery;

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (data.results && Array.isArray(data.results)) {
        dispatch({ type: "SET_SEARCH_RESULTS", payload: data.results });
        setRecommendations(data.results.slice(0, 5));
      } else {
        dispatch({ type: "SET_SEARCH_RESULTS", payload: [] });
        setRecommendations([]);
      }
    } catch (error) {
      console.error("Search failed:", error);
      dispatch({ type: "SET_SEARCH_RESULTS", payload: [] });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
      setIsSearching(false);
    }
  }, [dispatch]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const currentSong = state.queue[state.currentIndex];
      if (!query && currentSong?.videoId) {
        fetchRecommendations("", currentSong.videoId, currentSong.artist, currentSong.title);
      } else if (query) {
        performSearch(query);
      }
    }, 800);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, performSearch, fetchRecommendations, state.queue, state.currentIndex]);

  const handlePlayRecommendation = (song: Song) => {
    playSong(song, recommendations);
    setCurrentTab("search");
  };

  const handleClear = () => {
    setQuery("");
    dispatch({ type: "SET_SEARCH_RESULTS", payload: [] });
    setRecommendations([]);
    lastSearchRef.current = "";
  };

  const searchSuggestions = [
    "Haryanvi Songs",
    "Bollywood Hits",
    "Punjabi Songs",
    "Bhojpuri Songs",
    "Rajasthani Folk",
  ];

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for songs, artists, or albums..."
          className="w-full pl-12 pr-10 py-3 rounded-xl bg-white/10 border border-white/10 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-gray-500"
        />
        {isSearching ? (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400 animate-spin" />
        ) : query ? (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        ) : null}
      </div>

      {!query && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-400 px-1">
            <Sparkles className="w-4 h-4" />
            <span>Popular searches</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {searchSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setQuery(suggestion)}
                className="px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10 rounded-full border border-white/10 hover:border-indigo-500/30 transition-all"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {recommendations.length > 0 && !isSearching && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-indigo-400 px-1">
            <Sparkles className="w-4 h-4" />
            <span>
              {!query && state.queue[state.currentIndex]?.videoId
                ? `Related to "${state.queue[state.currentIndex]?.title}"`
                : `Recommended for "${lastSearchRef.current}"`}
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {recommendations.map((song) => (
              <button
                key={song.id}
                onClick={() => handlePlayRecommendation(song)}
                className="flex-shrink-0 w-36 p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-indigo-500/30 transition-all group"
              >
                <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-2">
                  <img
                    src={song.thumbnail}
                    alt={song.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center">
                      <Play className="w-5 h-5 text-white ml-0.5" />
                    </div>
                  </div>
                </div>
                <p className="text-sm font-medium truncate">{song.title}</p>
                <p className="text-xs text-gray-400 truncate">{song.artist}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Play(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
