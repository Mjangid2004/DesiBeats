"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePlayer } from "@/context/PlayerContext";

export function useMediaSession() {
  const { state, dispatch, nextSong, prevSong } = usePlayer();

  const updateMediaSession = useCallback(() => {
    if (!("mediaSession" in navigator)) return;

    const currentSong = state.queue[state.currentIndex];
    if (!currentSong) {
      navigator.mediaSession.metadata = null;
      return;
    }

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title,
        artist: currentSong.artist,
        album: "DesiBeats",
        artwork: [
          { src: currentSong.thumbnail, sizes: "512x512", type: "image/png" },
        ],
      });
    } catch (e) {
      console.error("MediaMetadata error:", e);
    }
  }, [state.queue, state.currentIndex]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    navigator.mediaSession.setActionHandler("play", () => dispatch({ type: "TOGGLE_PLAY" }));
    navigator.mediaSession.setActionHandler("pause", () => dispatch({ type: "TOGGLE_PLAY" }));
    navigator.mediaSession.setActionHandler("previoustrack", () => {
      if (state.currentTime > 3) {
        dispatch({ type: "SET_CURRENT_TIME", payload: 0 });
      } else {
        prevSong();
      }
    });
    navigator.mediaSession.setActionHandler("nexttrack", () => nextSong());
    navigator.mediaSession.setActionHandler("seekbackward", (details: { seekOffset?: number }) => {
      const newTime = Math.max(0, state.currentTime - (details.seekOffset || 10));
      dispatch({ type: "SET_CURRENT_TIME", payload: newTime });
    });
    navigator.mediaSession.setActionHandler("seekforward", (details: { seekOffset?: number }) => {
      const newTime = Math.min(state.duration, state.currentTime + (details.seekOffset || 10));
      dispatch({ type: "SET_CURRENT_TIME", payload: newTime });
    });

    return () => {
      if (navigator.mediaSession) {
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
        navigator.mediaSession.setActionHandler("previoustrack", null);
        navigator.mediaSession.setActionHandler("nexttrack", null);
        navigator.mediaSession.setActionHandler("seekbackward", null);
        navigator.mediaSession.setActionHandler("seekforward", null);
      }
    };
  }, [dispatch, nextSong, prevSong, state.currentTime, state.duration]);

  useEffect(() => {
    updateMediaSession();
  }, [updateMediaSession]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    try {
      navigator.mediaSession.playbackState = state.isPlaying ? "playing" : "paused";
    } catch (e) {}
  }, [state.isPlaying]);

  return { updateMediaSession };
}

export function useBackgroundPlayback() {
  const { state } = usePlayer();
  const wasPlayingRef = useRef(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (state.offscreenPlay && state.isPlaying) {
        wasPlayingRef.current = state.isPlaying;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [state.isPlaying, state.offscreenPlay]);

  return null;
}