export interface Song {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: number;
  videoId: string;
  isLocal?: boolean;
  localUrl?: string;
}

export type PlayMode = "order" | "once" | "repeat2" | "repeat-all" | "shuffle";
export type Theme = "light" | "dark" | "dynamic";
export type ViewMode = "home" | "search" | "favorites" | "history" | "queue" | "playlists" | "genre";

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  coverImage?: string;
}