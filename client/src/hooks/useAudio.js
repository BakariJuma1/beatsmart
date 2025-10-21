import { useState, useCallback } from "react";

export const useAudio = () => {
  const [playingBeat, setPlayingBeat] = useState(null);
  const [audioElement, setAudioElement] = useState(null);

  const closeAudioPlayer = useCallback(() => {
    setPlayingBeat(null);
    audioElement?.pause();
  }, [audioElement]);

  return {
    playingBeat,
    setPlayingBeat,
    audioElement,
    setAudioElement,
    closeAudioPlayer
  };
};