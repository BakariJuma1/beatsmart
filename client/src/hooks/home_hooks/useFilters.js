import { useState, useMemo, useCallback } from "react";
import { DEFAULT_PRICE_RANGE, DEFAULT_BPM_RANGE } from "../../constants";

export const useFilters = (beats) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState(DEFAULT_PRICE_RANGE);
  const [bpmRange, setBpmRange] = useState(DEFAULT_BPM_RANGE);
  const [showFilters, setShowFilters] = useState(false);

  const filteredBeats = useMemo(() => {
    return beats.filter((beat) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        beat.title.toLowerCase().includes(searchLower) ||
        beat.genre.toLowerCase().includes(searchLower) ||
        beat.producer?.name.toLowerCase().includes(searchLower) ||
        beat.key.toLowerCase().includes(searchLower);

      const matchesGenre =
        selectedGenre === "All" || beat.genre === selectedGenre;
      const matchesPrice =
        beat.price >= priceRange[0] && beat.price <= priceRange[1];
      const matchesBPM = beat.bpm >= bpmRange[0] && beat.bpm <= bpmRange[1];

      return matchesSearch && matchesGenre && matchesPrice && matchesBPM;
    });
  }, [beats, searchTerm, selectedGenre, priceRange, bpmRange]);

  const sortedBeats = useMemo(() => {
    return [...filteredBeats].sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "bpm":
          return a.bpm - b.bpm;
        case "newest":
          return new Date(b.created_at) - new Date(a.created_at);
        case "popular":
          return (b.popularity || 0) - (a.popularity || 0);
        default:
          return 0;
      }
    });
  }, [filteredBeats, sortBy]);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedGenre("All");
    setPriceRange(DEFAULT_PRICE_RANGE);
    setBpmRange(DEFAULT_BPM_RANGE);
    setSortBy("featured");
    setShowFilters(false);
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    selectedGenre,
    setSelectedGenre,
    sortBy,
    setSortBy,
    priceRange,
    setPriceRange,
    bpmRange,
    setBpmRange,
    showFilters,
    setShowFilters,
    filteredBeats,
    sortedBeats,
    clearFilters,
  };
};
