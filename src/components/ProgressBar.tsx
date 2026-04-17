"use client";

import { useState } from "react";
import { usePlayer } from "@/context/PlayerContext";

export default function ProgressBar() {
  const { state, dispatch } = usePlayer();
  const [isDragging, setIsDragging] = useState(false);
  
  const currentSong = state.queue[state.currentIndex];
  const progress = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!state.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * state.duration;
    dispatch({ type: "SET_CURRENT_TIME", payload: newTime });
    
    const player = (window as any).youtubePlayer;
    if (player && player.seekTo) {
      player.seekTo(newTime);
    }
  };

  return (
    <div className="w-full px-4 space-y-2">
      <div
        onClick={handleClick}
        className="relative h-1.5 bg-white/20 rounded-full cursor-pointer group"
      >
        <div
          className="absolute h-full bg-white rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
        <div
          className="absolute w-3 h-3 bg-white rounded-full -top-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `${progress}%`, transform: 'translateX(-50%)' }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400">
        <span>{formatTime(state.currentTime)}</span>
        <span>{formatTime(state.duration)}</span>
      </div>
    </div>
  );
}
