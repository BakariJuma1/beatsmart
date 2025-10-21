import { useState } from 'react';

export const useAudioPlayer = () => {
  const [playingAudio, setPlayingAudio] = useState(null);

  const playPreview = async (beat, onError) => {
    if (playingAudio) {
      playingAudio.pause();
      setPlayingAudio(null);
    }

    if (beat.preview_url) {
      try {
        const audio = new Audio(beat.preview_url);
        await audio.play();
        setPlayingAudio(audio);
        
        audio.onended = () => setPlayingAudio(null);
      } catch (err) {
        console.error('Error playing preview:', err);
        onError('Could not play audio preview');
      }
    } else {
      onError('No preview available for this beat');
    }
  };

  const stopAudio = () => {
    if (playingAudio) {
      playingAudio.pause();
      setPlayingAudio(null);
    }
  };

  return {
    playingAudio,
    playPreview,
    stopAudio
  };
};