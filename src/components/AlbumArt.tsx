"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { usePlayer } from "@/context/PlayerContext";

export default function AlbumArt() {
  const { state } = usePlayer();
  const currentSong = state.queue[state.currentIndex];

  const [gradient, setGradient] = useState(
    state.theme === "dark"
      ? "from-indigo-900/50 to-purple-900/50"
      : "from-indigo-100 to-purple-100"
  );

  useEffect(() => {
    if (currentSong?.thumbnail && state.theme === "dynamic") {
      const img = document.createElement("img");
      img.crossOrigin = "anonymous";
      img.src = currentSong.thumbnail;
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = 10;
          canvas.height = 10;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, 10, 10);
            const data = ctx.getImageData(0, 0, 10, 10).data;
            const colors: number[] = [];
            for (let i = 0; i < data.length; i += 4) {
              colors.push(data[i], data[i + 1], data[i + 2]);
            }
            const avg = (arr: number[]) =>
              Math.round(arr.reduce((a, b) => a + b) / arr.length);
            const r = avg(colors.filter((_, i) => i % 3 === 0));
            const g = avg(colors.filter((_, i) => i % 3 === 1));
            const b = avg(colors.filter((_, i) => i % 3 === 2));
            const color = `rgb(${r}, ${g}, ${b})`;
            setGradient(`from-[${color}]/50 to-purple-900/50`);
          }
        } catch {
          setGradient("from-indigo-900/50 to-purple-900/50");
        }
      };
    } else if (state.theme === "dark") {
      setGradient("from-indigo-900/50 to-purple-900/50");
    } else {
      setGradient("from-indigo-100 to-purple-100");
    }
  }, [currentSong, state.theme]);

  return (
    <div className="relative w-64 h-64 mx-auto">
      <div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} blur-3xl opacity-50`}
      />
      {currentSong?.thumbnail ? (
        <Image
          src={currentSong.thumbnail}
          alt={currentSong.title}
          width={256}
          height={256}
          className="relative w-full h-full rounded-2xl object-cover shadow-2xl"
        />
      ) : (
        <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-white/20" />
          </div>
        </div>
      )}
    </div>
  );
}
