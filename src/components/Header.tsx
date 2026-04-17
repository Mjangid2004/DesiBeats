"use client";

import { usePlayer } from "@/context/PlayerContext";
import { Music } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
          <Music className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg">Music Player</h1>
          <p className="text-xs text-gray-400">Ad-free YouTube Music</p>
        </div>
      </div>
      <ThemeToggle />
    </header>
  );
}
