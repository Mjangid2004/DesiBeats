"use client";

import { useEffect, useState, useCallback } from "react";
import { PlayerProvider } from "@/context/PlayerContext";
import Sidebar from "@/components/Sidebar";
import MainContent from "@/components/MainContent";
import NowPlaying from "@/components/NowPlaying";
import BottomNav from "@/components/BottomNav";

function MusicPlayerApp() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    document.documentElement.classList.add("dark");

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      });
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isIOS) {
      alert("To install DesiBeats on iPhone:\n\n1. Tap the Share button (square with arrow)\n2. Scroll down and tap 'Add to Home Screen'\n3. Tap 'Add'");
      return;
    }

    const trigger = document.getElementById('install-trigger') as any;
    if (trigger && trigger.prompt) {
      trigger.prompt();
    }
  };

  return (
    <PlayerProvider>
      <div className="h-screen flex flex-col bg-black text-white overflow-hidden">
        <button 
          id="install-trigger" 
          style={{ display: 'none' }} 
          onClick={handleInstallClick}
        />
        
        <div className="flex-1 flex overflow-hidden">
          <div className="hidden md:block w-64 lg:w-72">
            <Sidebar />
          </div>
          <MainContent />
        </div>
        <BottomNav />
        <NowPlaying />
      </div>
    </PlayerProvider>
  );
}

export default function Home() {
  return <MusicPlayerApp />;
}