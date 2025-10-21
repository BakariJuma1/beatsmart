import { useState, useEffect } from "react";
import { API_BASE_URL } from "../constants";

export const useBeats = () => {
  const [beats, setBeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBeats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(`${API_BASE_URL}/beats`, {
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) throw new Error(`Failed to fetch beats: ${response.status}`);
        
        const data = await response.json();
        setBeats(data.map(beat => ({ 
          ...beat, 
          isPlaying: false,
          popularity: beat.popularity || 0,
          plays: beat.plays || 0,
          rating: beat.rating || "4.8"
        })));
      } catch (err) {
        setError(err.name === 'AbortError' ? 'Request timeout' : err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBeats();
  }, []);

  return { beats, loading, error, setBeats };
};