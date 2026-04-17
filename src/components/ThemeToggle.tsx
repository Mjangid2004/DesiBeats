"use client";

import { usePlayer } from "@/context/PlayerContext";
import { Theme } from "@/lib/types";
import { Sun, Moon, Palette } from "lucide-react";

export default function ThemeToggle() {
  const { state, dispatch } = usePlayer();

  const themes: { id: Theme; icon: React.ReactNode; label: string }[] = [
    { id: "light", icon: <Sun className="w-4 h-4" />, label: "Light" },
    { id: "dark", icon: <Moon className="w-4 h-4" />, label: "Dark" },
    { id: "dynamic", icon: <Palette className="w-4 h-4" />, label: "Dynamic" },
  ];

  const cycleTheme = () => {
    const currentIndex = themes.findIndex((t) => t.id === state.theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length].id;
    dispatch({ type: "SET_THEME", payload: nextTheme });
  };

  return (
    <button
      onClick={cycleTheme}
      title={`Theme: ${state.theme}`}
      className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300"
    >
      {themes.find((t) => t.id === state.theme)?.icon}
    </button>
  );
}
