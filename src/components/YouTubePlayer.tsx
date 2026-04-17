"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import YouTube from "react-youtube";
import { usePlayer } from "@/context/PlayerContext";

function LocalAudioPlayer() {
  const { state, dispatch } = usePlayer();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentSong = state.queue[state.currentIndex];
  const isLocal = currentSong?.isLocal && currentSong?.localUrl;
  const hasValidUrl = isLocal && currentSong.localUrl && currentSong.localUrl.startsWith("blob:");

  useEffect(() => {
    if (!hasValidUrl || !audioRef.current) return;
    try {
      if (state.isPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    } catch (e) {}
  }, [state.isPlaying, currentSong?.id, hasValidUrl]);

  useEffect(() => {
    if (!hasValidUrl || !audioRef.current) return;
    try {
      audioRef.current.volume = state.volume;
    } catch (e) {}
  }, [state.volume, currentSong?.id, hasValidUrl]);

  if (!hasValidUrl) return null;

  return (
    <audio
      ref={audioRef}
      src={currentSong.localUrl}
      onEnded={() => {
        try {
          dispatch({ type: "NEXT_SONG" });
        } catch (e) {}
      }}
      onTimeUpdate={() => {
        try {
          if (audioRef.current) {
            dispatch({ type: "SET_CURRENT_TIME", payload: audioRef.current.currentTime });
            dispatch({ type: "SET_DURATION", payload: audioRef.current.duration || 0 });
          }
        } catch (e) {}
      }}
      onError={() => {
        try {
          dispatch({ type: "NEXT_SONG" });
        } catch (e) {}
      }}
      autoPlay
    />
  );
}

export default function YouTubePlayer() {
  const { state, dispatch } = usePlayer();
  const playerRef = useRef<any>(null);
  const currentVideoId = useRef<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const currentSong = state.queue[state.currentIndex];
  const isLocal = currentSong?.isLocal || currentSong?.localUrl;

  if (isLocal) {
    return <LocalAudioPlayer />;
  }

  const handleReady = useCallback((event: any) => {
    try {
      playerRef.current = event.target;
      (window as any).youtubePlayer = event.target;
      event.target.setVolume(state.volume * 100);
      setIsReady(true);
    } catch (e) {
      console.error("Player ready error:", e);
    }
  }, [state.volume]);

  const handleError = useCallback((event: any) => {
    console.error("YouTube player error:", event);
    dispatch({ type: "NEXT_SONG" });
  }, [dispatch]);

  const handleEnd = useCallback(() => {
    try {
      if (state.playMode === "once") {
        dispatch({ type: "TOGGLE_PLAY" });
      } else if (state.playMode === "repeat2") {
        if (state.repeatCount < 2) {
          dispatch({ type: "SET_REPEAT_COUNT", payload: state.repeatCount + 1 });
          playerRef.current?.seekTo(0);
          playerRef.current?.playVideo();
        } else {
          dispatch({ type: "SET_REPEAT_COUNT", payload: 0 });
          dispatch({ type: "NEXT_SONG" });
        }
      } else {
        dispatch({ type: "NEXT_SONG" });
      }
    } catch (e) {
      console.error("Handle end error:", e);
    }
  }, [state.playMode, state.repeatCount, dispatch]);

  useEffect(() => {
    if (!playerRef.current || !currentSong || !isReady) return;

    try {
      if (currentSong.videoId !== currentVideoId.current) {
        currentVideoId.current = currentSong.videoId;
        dispatch({ type: "SET_CURRENT_TIME", payload: 0 });
        dispatch({ type: "SET_DURATION", payload: 0 });
        playerRef.current?.loadVideoById(currentSong.videoId);
        playerRef.current?.setVolume(state.volume * 100);
      }
    } catch (e) {
      console.error("Load video error:", e);
    }
  }, [currentSong?.id, dispatch, state.volume, isReady, currentSong?.videoId]);

  useEffect(() => {
    if (!playerRef.current || !currentSong || !isReady) return;

    try {
      if (state.isPlaying) {
        playerRef.current?.playVideo();
      } else {
        playerRef.current?.pauseVideo();
      }
    } catch (e) {
      console.error("Play/pause error:", e);
    }
  }, [state.isPlaying, currentSong, isReady]);

  useEffect(() => {
    if (!playerRef.current || !isReady) return;
    try {
      playerRef.current?.setVolume(state.volume * 100);
    } catch (e) {
      console.error("Volume error:", e);
    }
  }, [state.volume, isReady]);

  const updateProgress = useCallback(() => {
    try {
      if (playerRef.current) {
        const time = playerRef.current.getCurrentTime?.() || 0;
        const duration = playerRef.current.getDuration?.() || 0;
        if (time > 0) dispatch({ type: "SET_CURRENT_TIME", payload: time });
        if (duration > 0) dispatch({ type: "SET_DURATION", payload: duration });
      }
    } catch (e) {
      // Ignore progress errors
    }
  }, [dispatch]);

  useEffect(() => {
    const interval = setInterval(updateProgress, 1000);
    return () => clearInterval(interval);
  }, [updateProgress]);

  const opts = {
    height: "1",
    width: "1",
    playerVars: {
      autoplay: 1,
      playsinline: 1,
      controls: 0,
      disablekb: 1,
      enablejsapi: 1,
      fs: 0,
      modestbranding: 1,
      rel: 0,
    },
  };

  if (!currentSong) return null;

  if (isLocal) return <LocalAudioPlayer />;

  return (
    <div style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0, pointerEvents: 'none' }}>
      <YouTube
        videoId={currentSong.videoId}
        opts={opts}
        onReady={handleReady}
        onEnd={handleEnd}
        onError={handleError}
        containerClassName="youtube-container"
      />
    </div>
  );
}
