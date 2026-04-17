"use client";

import { useState, useRef } from "react";
import { usePlayer } from "@/context/PlayerContext";

export default function ProgressBar() {
  const { state, dispatch, seek } = usePlayer();
  const [isDragging, setIsDragging] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  
  const currentSong = state.queue[state.currentIndex];
  const progress = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!state.duration || !currentSong) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = percent * state.duration;
    
    seek(newTime);
    
    const youtubePlayer = (window as any).youtubePlayer;
    if (youtubePlayer && youtubePlayer.seekTo) {
      youtubePlayer.seekTo(newTime, true);
    }
  };

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleSeek(e);
  };

  const handleDragMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !state.duration) return;
    handleSeek(e);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div 
      className="w-full px-4 space-y-2"
      onMouseLeave={handleDragEnd}
    >
      <div
        ref={progressRef}
        className="relative h-2 bg-white/20 rounded-full cursor-pointer group"
        onClick={handleSeek}
        onMouseDown={handleDragStart}
        onMouseMove={isDragging ? handleDragMove : undefined}
        onMouseUp={handleDragEnd}
      >
        <div
          className="absolute h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
        <div
          className="absolute w-4 h-4 bg-white rounded-full -top-1 shadow-lg opacity-0 group-hover:opacity-100 transition-all"
          style={{ left: `${progress}%`, transform: 'translateX(-50%)' }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400 font-medium">
        <span>{formatTime(state.currentTime)}</span>
        <span>{formatTime(state.duration)}</span>
      </div>
    </div>
  );
}