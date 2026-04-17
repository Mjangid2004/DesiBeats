"use client";

import { usePlayer } from "@/context/PlayerContext";
import { useAppContext } from "@/context/AppContext";

export default function Playlist() {
  const { state } = usePlayer();
  const { viewMode } = useAppContext();

  const getSongs = () => {
    switch (viewMode) {
      case "favorites":
        return state.favorites;
      case "history":
        return state.history;
      default:
        return state.searchResults;
    }
  };

  const songs = getSongs();

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide px-2">
      {songs.length === 0 ? (
        <div className="flex items-center justify-center h-40 text-gray-500 text-center px-4">
          No songs in this playlist yet.
        </div>
      ) : (
        <div className="space-y-2">
          {songs.map((song) => (
            <div key={song.id} className="p-2 bg-white/5 rounded-lg">
              {song.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}