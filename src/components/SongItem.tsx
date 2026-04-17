"use client";

import { usePlayer } from "@/context/PlayerContext";
import { Heart, Play, Pause, ListPlus } from "lucide-react";
import Image from "next/image";
import { Song } from "@/lib/types";

interface SongItemProps {
  song: Song;
  isPlaying?: boolean;
  showFavorite?: boolean;
  showAddToQueue?: boolean;
}

export default function SongItem({ song, isPlaying, showFavorite = true, showAddToQueue = true }: SongItemProps) {
  const { playSong, togglePlay, toggleFavorite, isFavorite, state, dispatch } = usePlayer();

  const isCurrentSong = state.queue[state.currentIndex]?.id === song.id;
  const isThisPlaying = isCurrentSong && state.isPlaying;

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentSong) {
      togglePlay();
    } else {
      playSong(song);
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(song);
  };

  const handleAddToQueue = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: "ADD_TO_QUEUE", payload: song });
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      onClick={handlePlay}
      className={`group flex items-center gap-3 p-3 rounded-xl transition-all duration-300 cursor-pointer ${
        isCurrentSong
          ? "bg-indigo-500/20 border border-indigo-500/30"
          : "hover:bg-white/5 border border-transparent"
      }`}
    >
      <div className="relative w-12 h-12 flex-shrink-0">
        <Image
          src={song.thumbnail}
          alt={song.title}
          width={48}
          height={48}
          className="w-full h-full rounded-lg object-cover"
        />
        <div
          className={`absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center transition-opacity ${
            isThisPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          {isThisPlaying ? (
            <div className="flex items-end gap-0.5 h-4">
              <div className="w-1 h-2 bg-indigo-400 rounded-full animate-bars" style={{ animationDelay: "0s" }} />
              <div className="w-1 h-3 bg-indigo-400 rounded-full animate-bars" style={{ animationDelay: "0.2s" }} />
              <div className="w-1 h-4 bg-indigo-400 rounded-full animate-bars" style={{ animationDelay: "0.4s" }} />
            </div>
          ) : (
            <Play className="w-5 h-5 text-white" />
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className={`font-medium truncate ${isCurrentSong ? "text-indigo-400" : ""}`}>
          {song.title}
        </p>
        <p className="text-sm text-gray-400 truncate">{song.artist}</p>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500">{formatDuration(song.duration)}</span>
        {showAddToQueue && (
          <button
            onClick={handleAddToQueue}
            className="p-2 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-indigo-400 transition-all"
            title="Add to queue"
          >
            <ListPlus className="w-4 h-4" />
          </button>
        )}
        {showFavorite && (
          <button
            onClick={handleFavorite}
            className={`p-2 rounded-full transition-all ${
              isFavorite(song)
                ? "text-red-500 hover:text-red-400"
                : "text-gray-400 opacity-0 group-hover:opacity-100 hover:text-white"
            }`}
          >
            <Heart
              className="w-4 h-4"
              fill={isFavorite(song) ? "currentColor" : "none"}
            />
          </button>
        )}
      </div>
    </div>
  );
}
