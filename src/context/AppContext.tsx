"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type ViewMode = 'home' | 'favorites' | 'history' | 'queue' | 'playlists' | 'search' | 'genre' | 'local';

interface AppContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showSearch: boolean;
  setShowSearch: (show: boolean) => void;
  clearSearch: () => void;
}

const AppContext = createContext<AppContextType>({
  viewMode: 'home',
  setViewMode: () => {},
  searchQuery: '',
  setSearchQuery: () => {},
  showSearch: false,
  setShowSearch: () => {},
  clearSearch: () => {},
});

export function useAppContext() {
  return useContext(AppContext);
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const clearSearch = () => {
    setSearchQuery('');
    setShowSearch(false);
  };

  return (
    <AppContext.Provider value={{ viewMode, setViewMode, searchQuery, setSearchQuery, showSearch, setShowSearch, clearSearch }}>
      {children}
    </AppContext.Provider>
  );
}
