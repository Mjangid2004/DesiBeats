"use client";

import { useAppContext } from "@/context/AppContext";
import { Home, Heart, Clock, ListMusic, Download, Library } from "lucide-react";
import { useState } from "react";

export default function BottomNav() {
  const { viewMode, setViewMode, clearSearch, setSearchQuery } = useAppContext();
  const [showInstallHelp, setShowInstallHelp] = useState(false);

  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

  const handleInstall = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowInstallHelp(true);
  };

  const tabs = [
    { id: "home" as const, label: "Home", icon: <Home className="w-5 h-5" /> },
    { id: "queue" as const, label: "Queue", icon: <ListMusic className="w-5 h-5" /> },
    { id: "playlists" as const, label: "Playlist", icon: <Library className="w-5 h-5" /> },
    { id: "favorites" as const, label: "Liked", icon: <Heart className="w-5 h-5" /> },
    { id: "history" as const, label: "History", icon: <Clock className="w-5 h-5" /> },
  ];

  const handleTabClick = (tabId: typeof tabs[0]['id']) => {
    setShowInstallHelp(false);
    clearSearch();
    setSearchQuery('');
    setViewMode(tabId);
  };

  return (
    <>
      {showInstallHelp && (
        <div 
          className="md:hidden fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-6"
          onClick={(e) => { e.stopPropagation(); setShowInstallHelp(false); }}
        >
          <div className="bg-neutral-900 rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Install DesiBeats</h3>
            {isIOS ? (
              <div className="space-y-3 text-sm text-gray-300">
                <p>1. Tap the <strong>Share</strong> button</p>
                <p>2. Scroll and tap <strong>"Add to Home Screen"</strong></p>
                <p>3. Tap <strong>"Add"</strong></p>
              </div>
            ) : (
              <div className="space-y-3 text-sm text-gray-300">
                <p>1. Tap the <strong>menu button</strong> (⋮)</p>
                <p>2. Tap <strong>"Install app"</strong></p>
              </div>
            )}
            <button
              onClick={() => setShowInstallHelp(false)}
              className="w-full mt-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl font-medium"
            >
              Got it
            </button>
          </div>
        </div>
      )}
      
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-800 z-50 h-14">
        <div className="flex justify-around items-center h-full">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                viewMode === tab.id
                  ? "text-pink-500"
                  : "text-gray-500 hover:text-white"
              }`}
            >
              {tab.icon}
              <span className="text-xs mt-1">{tab.label}</span>
            </button>
          ))}
          <button
            onClick={handleInstall}
            className="flex flex-col items-center justify-center flex-1 h-full text-gray-500 hover:text-white transition-colors"
          >
            <Download className="w-5 h-5" />
            <span className="text-xs mt-1">Install</span>
          </button>
        </div>
      </div>
    </>
  );
}