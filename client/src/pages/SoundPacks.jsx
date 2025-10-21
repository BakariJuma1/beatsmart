import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Package, Heart, ShoppingCart, Play, Pause, Loader, 
  Search, Filter, X, Grid, List, Star, Headphones,
  Download, Share2, Volume2, FileAudio, Layers
} from "lucide-react";
import {
  API_BASE_URL,
  GENRES,
  DEFAULT_PRICE_RANGE,
  DEFAULT_BPM_RANGE,
  SORT_OPTIONS
} from "../constants";

// Custom hook for sound packs data
const useSoundPacks = () => {
  const [soundPacks, setSoundPacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSoundPacks = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(`${API_BASE_URL}/sound-packs`, {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) throw new Error(`Failed to fetch sound packs: ${response.status}`);
        
        const data = await response.json();
        setSoundPacks(data.map(pack => ({ 
          ...pack, 
          isPlaying: false,
          popularity: pack.popularity || 0,
          downloads: pack.downloads || 0,
          rating: pack.rating || "4.8",
          sounds_count: pack.sounds_count || 50,
          format: pack.format || "WAV"
        })));
      } catch (err) {
        setError(err.name === 'AbortError' ? 'Request timeout' : err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSoundPacks();
  }, []);

  return { soundPacks, loading, error, setSoundPacks };
};

// Custom hook for wishlist (adapted for sound packs)
const useWishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState({});

  const addToWishlist = async (soundPack) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to add sound packs to wishlist");
      return false;
    }

    try {
      setWishlistLoading(prev => ({ ...prev, [soundPack.id]: true }));
      
      const response = await fetch(`${API_BASE_URL}/wishlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          item_type: "sound_pack",
          item_id: soundPack.id
        }),
      });

      if (response.ok) {
        setWishlist(prev => [...prev, soundPack.id]);
        return true;
      } else {
        throw new Error("Failed to add to wishlist");
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      alert("Error adding to wishlist. Please try again.");
      return false;
    } finally {
      setWishlistLoading(prev => ({ ...prev, [soundPack.id]: false }));
    }
  };

  const removeFromWishlist = async (packId) => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      setWishlistLoading(prev => ({ ...prev, [packId]: true }));
      
      const response = await fetch(`${API_BASE_URL}/wishlist/${packId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setWishlist(prev => prev.filter(id => id !== packId));
        return true;
      } else {
        throw new Error("Failed to remove from wishlist");
      }
    } catch (error) {
      console.error("Wishlist remove error:", error);
      alert("Error removing from wishlist. Please try again.");
      return false;
    } finally {
      setWishlistLoading(prev => ({ ...prev, [packId]: false }));
    }
  };

  const isInWishlist = (packId) => {
    return wishlist.includes(packId);
  };

  return { 
    wishlist, 
    wishlistLoading, 
    addToWishlist, 
    removeFromWishlist, 
    isInWishlist 
  };
};

const SoundPacks = () => {
  const { soundPacks, loading, error, setSoundPacks } = useSoundPacks();
  const { 
    wishlist, 
    wishlistLoading, 
    addToWishlist, 
    removeFromWishlist, 
    isInWishlist 
  } = useWishlist();

  // State for filters and UI
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState(DEFAULT_PRICE_RANGE);
  const [viewMode, setViewMode] = useState("grid");
  const [playingPack, setPlayingPack] = useState(null);
  const [audioElement, setAudioElement] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPack, setSelectedPack] = useState(null);
  const [showPackModal, setShowPackModal] = useState(false);

  // Memoized filtered and sorted sound packs
  const filteredPacks = useMemo(() => {
    return soundPacks.filter(pack => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        pack.title.toLowerCase().includes(searchLower) ||
        pack.genre.toLowerCase().includes(searchLower) ||
        pack.producer?.name.toLowerCase().includes(searchLower) ||
        pack.description?.toLowerCase().includes(searchLower);

      const matchesGenre = selectedGenre === "All" || pack.genre === selectedGenre;
      const matchesPrice = pack.price >= priceRange[0] && pack.price <= priceRange[1];

      return matchesSearch && matchesGenre && matchesPrice;
    });
  }, [soundPacks, searchTerm, selectedGenre, priceRange]);

  const sortedPacks = useMemo(() => {
    return [...filteredPacks].sort((a, b) => {
      switch (sortBy) {
        case "price-low": return a.price - b.price;
        case "price-high": return b.price - a.price;
        case "popular": return (b.popularity || 0) - (a.popularity || 0);
        case "downloads": return (b.downloads || 0) - (a.downloads || 0);
        case "sounds": return (b.sounds_count || 0) - (a.sounds_count || 0);
        case "name": return a.title.localeCompare(b.title);
        default: return new Date(b.created_at) - new Date(a.created_at);
      }
    });
  }, [filteredPacks, sortBy]);

  // Audio management
  useEffect(() => {
    if (playingPack && audioElement) {
      audioElement.play().catch(console.error);
    }
  }, [playingPack, audioElement]);

  const togglePlay = (pack) => {
    setSoundPacks(prev =>
      prev.map(p => {
        if (p.id === pack.id) {
          if (p.isPlaying) {
            setPlayingPack(null);
            audioElement?.pause();
            return { ...p, isPlaying: false };
          } else {
            const newPlayingPack = pack.preview_url;
            setPlayingPack(newPlayingPack);
            return { ...p, isPlaying: true };
          }
        }
        return { ...p, isPlaying: false };
      })
    );
  };

  const closeAudioPlayer = () => {
    setPlayingPack(null);
    audioElement?.pause();
    setSoundPacks(prev => prev.map(pack => ({ ...pack, isPlaying: false })));
  };

  const handleWishlistToggle = async (pack) => {
    if (isInWishlist(pack.id)) {
      await removeFromWishlist(pack.id);
    } else {
      await addToWishlist(pack);
    }
  };

  const handlePurchase = (pack) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to purchase sound packs");
      return;
    }
    setSelectedPack(pack);
    setShowPackModal(true);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedGenre("All");
    setPriceRange(DEFAULT_PRICE_RANGE);
    setSortBy("newest");
  };

  // Sound Pack Card Component
  const SoundPackCard = ({ pack }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 rounded-2xl border border-blue-700/30 overflow-hidden hover:border-blue-500 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10"
    >
      {/* Pack Image with Overlay */}
      <div className="relative aspect-square overflow-hidden">
        <img 
          src={pack.cover_url || "/placeholder-soundpack.png"} 
          alt={pack.title}
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
        
        {/* Overlay with Play Button */}
        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={() => togglePlay(pack)}
            className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-all transform hover:scale-110 shadow-lg"
          >
            {pack.isPlaying ? 
              <Pause className="w-6 h-6 text-white" /> : 
              <Play className="w-6 h-6 text-white" />
            }
          </button>
        </div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <span className="bg-black/80 backdrop-blur-sm px-2 py-1 rounded-full text-blue-500 text-xs font-semibold border border-blue-700/50">
            {pack.genre}
          </span>
          <span className="bg-black/80 backdrop-blur-sm px-2 py-1 rounded-full text-gray-300 text-xs border border-gray-600">
            {pack.sounds_count} Sounds
          </span>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={() => handleWishlistToggle(pack)}
          disabled={wishlistLoading[pack.id]}
          className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-all ${
            isInWishlist(pack.id)
              ? 'bg-blue-600 text-white' 
              : 'bg-black/60 text-gray-300 hover:bg-black/80'
          }`}
        >
          {wishlistLoading[pack.id] ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Heart className={`w-5 h-5 ${isInWishlist(pack.id) ? 'fill-current' : ''}`} />
          )}
        </button>
      </div>

      {/* Pack Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-white text-lg truncate flex-1 mr-2">{pack.title}</h3>
          <span className="text-green-400 font-bold text-lg">${pack.price}</span>
        </div>
        
        <p className="text-gray-400 text-sm mb-3">
          by <span className="text-blue-400">{pack.producer?.name || "Baraju"}</span>
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
          <span className="flex items-center gap-1">
            <Download className="w-4 h-4" />
            {pack.downloads}
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400" />
            {pack.rating}
          </span>
          <span className="flex items-center gap-1">
            <FileAudio className="w-4 h-4" />
            {pack.format}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={() => handlePurchase(pack)}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Buy
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedPack(pack);
              setShowPackModal(true);
            }}
            className="border-gray-600 text-gray-400 hover:bg-gray-800"
            size="sm"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );

  // Sound Pack List Item Component
  const SoundPackListItem = ({ pack }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-900 rounded-2xl border border-blue-700/30 p-4 hover:border-blue-500 transition-all"
    >
      <div className="flex items-center gap-4">
        {/* Pack Image */}
        <div className="relative">
          <img 
            src={pack.cover_url || "/placeholder-soundpack.png"} 
            alt={pack.title}
            className="w-16 h-16 rounded-xl object-cover"
          />
          <button
            onClick={() => togglePlay(pack)}
            className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl"
          >
            {pack.isPlaying ? 
              <Pause className="w-5 h-5 text-white" /> : 
              <Play className="w-5 h-5 text-white" />
            }
          </button>
        </div>

        {/* Pack Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-bold text-white text-lg truncate">{pack.title}</h3>
            <span className="text-green-400 font-bold">${pack.price}</span>
          </div>
          <p className="text-gray-400 text-sm mb-2">
            by <span className="text-blue-400">{pack.producer?.name || "Baraju"}</span>
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs">
              {pack.genre}
            </span>
            <span className="flex items-center gap-1">
              <Layers className="w-4 h-4" />
              {pack.sounds_count} sounds
            </span>
            <span className="flex items-center gap-1">
              <FileAudio className="w-4 h-4" />
              {pack.format}
            </span>
            <span className="flex items-center gap-1">
              <Download className="w-4 h-4" />
              {pack.downloads}
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400" />
              {pack.rating}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleWishlistToggle(pack)}
            disabled={wishlistLoading[pack.id]}
            className={`p-2 rounded-lg transition-all ${
              isInWishlist(pack.id)
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {wishlistLoading[pack.id] ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Heart className={`w-4 h-4 ${isInWishlist(pack.id) ? 'fill-current' : ''}`} />
            )}
          </button>
          <Button
            onClick={() => handlePurchase(pack)}
            className="bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Buy
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedPack(pack);
              setShowPackModal(true);
            }}
            className="border-gray-600 text-gray-400 hover:bg-gray-800"
            size="sm"
          >
            Details
          </Button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">
              Sound <span className="text-blue-500">Packs</span>
            </h1>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Premium sample packs, drum kits, and sound libraries. Everything you need for professional production.
          </p>
        </div>

        {/* Search and Controls */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-blue-700/30 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 w-full max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search sound packs, kits, samples..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-blue-700/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-gray-800 rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "grid" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "list" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Toggle */}
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="border-blue-700 text-blue-400 hover:bg-blue-700/20"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {(selectedGenre !== "All" || priceRange[0] > 0 || priceRange[1] < 500) && (
                <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </Button>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-800 border border-blue-700/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 min-w-[160px]"
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
              <option value="downloads">Most Downloads</option>
              <option value="sounds">Most Sounds</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name</option>
            </select>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-blue-700/30"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Genre Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Genre</label>
                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="w-full bg-gray-800 border border-blue-700/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    {GENRES.map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Price Range: ${priceRange[0]} - ${priceRange[1]}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="range"
                      min="0"
                      max="500"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                      className="w-full"
                    />
                    <input
                      type="range"
                      min="0"
                      max="500"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              <div className="flex justify-end mt-4">
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="border-gray-600 text-gray-400 hover:bg-gray-800"
                  size="sm"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-400">
            Showing {filteredPacks.length} of {soundPacks.length} sound packs
            {searchTerm && ` for "${searchTerm}"`}
          </p>
          {wishlist.length > 0 && (
            <p className="text-blue-400 text-sm">
              <Heart className="w-4 h-4 inline mr-1" />
              {wishlist.length} in your wishlist
            </p>
          )}
        </div>

        {/* Sound Packs Grid/List */}
        {loading ? (
          <div className="text-center py-20">
            <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <h3 className="text-xl text-gray-400">Loading sound packs...</h3>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="bg-red-900/20 border border-red-700 rounded-xl p-6 max-w-md mx-auto">
              <p className="text-red-400 mb-4">Error loading sound packs: {error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-blue-600 hover:bg-blue-700"
              >
                Try Again
              </Button>
            </div>
          </div>
        ) : sortedPacks.length > 0 ? (
          <motion.div
            layout
            className={
              viewMode === "grid" 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }
          >
            <AnimatePresence>
              {sortedPacks.map(pack => (
                viewMode === "grid" ? 
                  <SoundPackCard key={pack.id} pack={pack} /> : 
                  <SoundPackListItem key={pack.id} pack={pack} />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl text-gray-400 mb-2">No sound packs found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
            <Button 
              onClick={clearFilters}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>

      {/* Audio Player */}
      {playingPack && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-gray-900 border-t border-blue-700 p-4">
          <div className="container mx-auto flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <Volume2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-blue-500 text-sm font-semibold">Now Playing</p>
                <p className="text-gray-300 text-sm">
                  {soundPacks.find(p => p.isPlaying)?.title || "Preview"}
                </p>
              </div>
            </div>
            <audio 
              ref={setAudioElement}
              controls 
              autoPlay 
              className="flex-1 max-w-md" 
              onEnded={closeAudioPlayer}
              onError={() => {
                alert("Error playing audio preview");
                closeAudioPlayer();
              }}
            >
              <source src={playingPack} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            <Button 
              variant="ghost" 
              onClick={closeAudioPlayer}
              className="text-gray-400 hover:text-white"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Sound Pack Detail Modal */}
      {showPackModal && selectedPack && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full border border-blue-700 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Sound Pack Details</h3>
              <button 
                onClick={() => setShowPackModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Pack Image */}
              <div className="relative">
                <img 
                  src={selectedPack.cover_url || "/placeholder-soundpack.png"} 
                  alt={selectedPack.title}
                  className="w-full rounded-2xl"
                />
                <button
                  onClick={() => togglePlay(selectedPack)}
                  className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl"
                >
                  {selectedPack.isPlaying ? 
                    <Pause className="w-12 h-12 text-white" /> : 
                    <Play className="w-12 h-12 text-white" />
                  }
                </button>
              </div>

              {/* Pack Info */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-3xl font-bold text-white mb-2">{selectedPack.title}</h4>
                  <p className="text-gray-400 text-lg">
                    by <span className="text-blue-400">{selectedPack.producer?.name || "Baraju"}</span>
                  </p>
                </div>

                <p className="text-gray-300">{selectedPack.description || "Premium sound pack with professional samples and loops."}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800 rounded-xl p-4">
                    <p className="text-gray-400 text-sm">Genre</p>
                    <p className="text-white font-semibold">{selectedPack.genre}</p>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-4">
                    <p className="text-gray-400 text-sm">Sounds</p>
                    <p className="text-white font-semibold">{selectedPack.sounds_count}</p>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-4">
                    <p className="text-gray-400 text-sm">Format</p>
                    <p className="text-white font-semibold">{selectedPack.format}</p>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-4">
                    <p className="text-gray-400 text-sm">Price</p>
                    <p className="text-green-400 font-bold text-xl">${selectedPack.price}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    {selectedPack.downloads} downloads
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    {selectedPack.rating}
                  </span>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => handlePurchase(selectedPack)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 py-3"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Purchase Pack
                  </Button>
                  <Button
                    onClick={() => handleWishlistToggle(selectedPack)}
                    disabled={wishlistLoading[selectedPack.id]}
                    variant="outline"
                    className="border-blue-700 text-blue-400 hover:bg-blue-700/20"
                  >
                    {wishlistLoading[selectedPack.id] ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <Heart className={`w-5 h-5 ${isInWishlist(selectedPack.id) ? 'fill-current' : ''}`} />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SoundPacks;