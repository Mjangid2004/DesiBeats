"use client";

import { usePlayer } from "@/context/PlayerContext";
import { Volume2, VolumeX } from "lucide-react";

export default function VolumeControl() {
  const { state, dispatch } = usePlayer();

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: "SET_VOLUME", payload: parseFloat(e.target.value) });
  };

  const toggleMute = () => {
    if (state.volume > 0) {
      dispatch({ type: "SET_VOLUME", payload: 0 });
    } else {
      dispatch({ type: "SET_VOLUME", payload: 0.7 });
    }
  };

  return (
    <div className="flex items-center gap-3 px-4">
      <button
        onClick={toggleMute}
        className="text-gray-400 hover:text-white transition-colors"
      >
        {state.volume === 0 ? (
          <VolumeX className="w-5 h-5" />
        ) : (
          <Volume2 className="w-5 h-5" />
        )}
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={state.volume}
        onChange={handleVolumeChange}
        className="volume-slider w-24 h-1 accent-indigo-500"
      />
      <span className="text-xs text-gray-500 w-8">
        {Math.round(state.volume * 100)}%
      </span>
    </div>
  );
}
