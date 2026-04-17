"use client";

import { useRef, useState } from "react";
import { usePlayer } from "@/context/PlayerContext";
import { Upload, Folder, Plus, Trash2, Play, X, ListPlus } from "lucide-react";
import SongItem from "./SongItem";

export default function LocalSongs() {
  const { state, addLocalSongs, playSong, dispatch, createPlaylist, deletePlaylist } = usePlayer();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newSongs = Array.from(files).map((file, index) => {
      const objectUrl = URL.createObjectURL(file);
      const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
      
      return {
        id: `local-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
        title: nameWithoutExtension,
        artist: "Local File",
        thumbnail: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%236366f1' width='100' height='100'/%3E%3Ccircle cx='50' cy='50' r='25' fill='%23ffffff'/%3E%3C/svg%3E",
        duration: 0,
        videoId: objectUrl,
        isLocal: true,
        localUrl: objectUrl,
      };
    });

    addLocalSongs(newSongs);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName("");
      setShowCreatePlaylist(false);
    }
  };

  const handlePlayLocalSong = (song: any) => {
    const localQueue = state.localSongs.map(s => ({
      ...s,
      thumbnail: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%234a90d9' width='100' height='100'/%3E%3Ccircle cx='50' cy='50' r='30' fill='%23ffffff'/%3E%3C/svg%3E",
    }));
    dispatch({ type: "SET_QUEUE", payload: localQueue });
    dispatch({ type: "PLAY_SONG", payload: { song, queue: localQueue } });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Local Songs</h2>
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors"
            title="Add files"
          >
            <Upload className="w-5 h-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowCreatePlaylist(!showCreatePlaylist)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Playlist</span>
        </button>
      </div>

      {showCreatePlaylist && (
        <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
          <input
            type="text"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            placeholder="Playlist name..."
            className="flex-1 px-3 py-2 bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onKeyDown={(e) => e.key === "Enter" && handleCreatePlaylist()}
          />
          <button
            onClick={handleCreatePlaylist}
            className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowCreatePlaylist(false)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {state.localSongs.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
          <button
            onClick={() => handlePlayLocalSong(state.localSongs[0])}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            <Play className="w-4 h-4" />
            <span>Play All</span>
          </button>
          <span className="text-gray-400">{state.localSongs.length} songs</span>
        </div>
      )}

      {state.playlists.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-400">Your Playlists</h3>
          <div className="grid grid-cols-2 gap-2">
            {state.playlists.map((playlist) => (
              <div
                key={playlist.id}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{playlist.name}</p>
                  <p className="text-sm text-gray-400">{playlist.songs.length} songs</p>
                </div>
                <button
                  onClick={() => deletePlaylist(playlist.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {state.localSongs.length === 0 && state.playlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-gray-500 text-center">
          <Folder className="w-12 h-12 mb-2 opacity-50" />
          <p>No local songs yet.</p>
          <p className="text-sm">Click the upload button to add audio files from your device</p>
        </div>
      ) : (
        <div className="space-y-2">
          {state.localSongs.map((song) => (
            <div
              key={song.id}
              className="relative group"
            >
              <SongItem 
                song={song as any} 
                showFavorite={false}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}