import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Music, Heart, ShoppingCart, Play, Pause, Loader, 
  Zap, Shield, TrendingUp, Search, Filter, X, 
  Star, Download, Headphones
} from "lucide-react";

// Constants
const API_BASE_URL = "https://beatsmart.onrender.com";
const GENRES = ["All", "Afrobeat", "Hip Hop", "Dancehall", "Electronic", "R&B", "Trap", "Pop", "Drill"];
const DEFAULT_PRICE_RANGE = [0, 500];
const DEFAULT_BPM_RANGE = [60, 180];

// Custom hook for beats data
const useBeats = () => {
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
          headers: {
            'Content-Type': 'application/json',
          }
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

// Custom hook for wishlist - UPDATED TO MATCH FLASK API
const useWishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState({});
  const [wishlistItems, setWishlistItems] = useState([]);

  // Fetch user's wishlist from backend
  const fetchWishlist = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/wishlist`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWishlistItems(data);
        // Extract beat IDs for quick lookup
        const beatIds = data
          .filter(item => item.item_type === 'beat')
          .map(item => item.item_id);
        setWishlist(beatIds);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  }, []);

  // Load wishlist on component mount
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const addToWishlist = useCallback(async (beat) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to add beats to wishlist");
      return false;
    }

    try {
      setWishlistLoading(prev => ({ ...prev, [beat.id]: true }));

      const response = await fetch(`${API_BASE_URL}/wishlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          item_type: "beat",
          item_id: beat.id
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // Update local state
        setWishlist(prev => [...prev, beat.id]);
        setWishlistItems(prev => [...prev, result]);
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add to wishlist");
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      alert(error.message || "Error adding to wishlist. Please try again.");
      return false;
    } finally {
      setWishlistLoading(prev => ({ ...prev, [beat.id]: false }));
    }
  }, []);

  const removeFromWishlist = useCallback(async (beatId) => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      setWishlistLoading(prev => ({ ...prev, [beatId]: true }));

      // Find the wishlist item ID for this beat
      const wishlistItem = wishlistItems.find(item => 
        item.item_type === 'beat' && item.item_id === beatId
      );

      if (!wishlistItem) {
        throw new Error("Wishlist item not found");
      }

      const response = await fetch(`${API_BASE_URL}/wishlist/${wishlistItem.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Update local state
        setWishlist(prev => prev.filter(id => id !== beatId));
        setWishlistItems(prev => prev.filter(item => 
          !(item.item_type === 'beat' && item.item_id === beatId)
        ));
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to remove from wishlist");
      }
    } catch (error) {
      console.error("Wishlist remove error:", error);
      alert(error.message || "Error removing from wishlist. Please try again.");
      return false;
    } finally {
      setWishlistLoading(prev => ({ ...prev, [beatId]: false }));
    }
  }, [wishlistItems]);

  const clearWishlist = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      // Delete all wishlist items one by one
      const deletePromises = wishlistItems.map(item => 
        fetch(`${API_BASE_URL}/wishlist/${item.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );

      await Promise.all(deletePromises);
      
      // Clear local state
      setWishlist([]);
      setWishlistItems([]);
      return true;
    } catch (error) {
      console.error("Clear wishlist error:", error);
      alert("Error clearing wishlist. Please try again.");
      return false;
    }
  }, [wishlistItems]);

  const isInWishlist = useCallback((beatId) => {
    return wishlist.includes(beatId);
  }, [wishlist]);

  return { 
    wishlist, 
    wishlistItems,
    wishlistLoading, 
    addToWishlist, 
    removeFromWishlist, 
    clearWishlist, 
    isInWishlist,
    fetchWishlist 
  };
};

// Custom hook for user authentication
const useUser = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setUser({ name: "Artist", email: "artist@example.com" });
    }
  }, []);

  const login = useCallback(() => {
    localStorage.setItem("token", "mock-token");
    setUser({ name: "Artist", email: "artist@example.com" });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  return { user, login, logout };
};

const HomePage = () => {
  const { beats, loading, error, setBeats } = useBeats();
  const { user, login } = useUser();
  const { 
    wishlist, 
    wishlistItems,
    wishlistLoading, 
    addToWishlist, 
    removeFromWishlist, 
    clearWishlist, 
    isInWishlist 
  } = useWishlist();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState(DEFAULT_PRICE_RANGE);
  const [bpmRange, setBpmRange] = useState(DEFAULT_BPM_RANGE);
  const [playingBeat, setPlayingBeat] = useState(null);
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);
  const [showContractModal, setShowContractModal] = useState(false);
  const [purchasedBeat, setPurchasedBeat] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [audioElement, setAudioElement] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Memoized filtered and sorted beats
  const filteredBeats = useMemo(() => {
    return beats.filter(beat => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        beat.title.toLowerCase().includes(searchLower) ||
        beat.genre.toLowerCase().includes(searchLower) ||
        beat.producer?.name.toLowerCase().includes(searchLower) ||
        beat.key.toLowerCase().includes(searchLower);

      const matchesGenre = selectedGenre === "All" || beat.genre === selectedGenre;
      const matchesPrice = beat.price >= priceRange[0] && beat.price <= priceRange[1];
      const matchesBPM = beat.bpm >= bpmRange[0] && beat.bpm <= bpmRange[1];

      return matchesSearch && matchesGenre && matchesPrice && matchesBPM;
    });
  }, [beats, searchTerm, selectedGenre, priceRange, bpmRange]);

  const sortedBeats = useMemo(() => {
    return [...filteredBeats].sort((a, b) => {
      switch (sortBy) {
        case "price-low": return a.price - b.price;
        case "price-high": return b.price - a.price;
        case "bpm": return a.bpm - b.bpm;
        case "newest": return new Date(b.created_at) - new Date(a.created_at);
        case "popular": return (b.popularity || 0) - (a.popularity || 0);
        default: return 0;
      }
    });
  }, [filteredBeats, sortBy]);

  const currentBeat = sortedBeats[currentBeatIndex];

  // Get wishlist beat details for display
  const wishlistBeats = useMemo(() => {
    return beats.filter(beat => wishlist.includes(beat.id));
  }, [beats, wishlist]);

  // Audio management
  useEffect(() => {
    if (playingBeat && audioElement) {
      audioElement.play().catch(console.error);
    }
  }, [playingBeat, audioElement]);

  // Enhanced swipe handler with proper login checks for wishlist
  const handleSwipe = useCallback(async (direction) => {
    if (!sortedBeats.length || !currentBeat) return;

    if (direction === "right") {
      // SWIPE RIGHT - PURCHASE BEAT (requires login)
      if (!user) {
        setShowLoginPrompt(true);
        return;
      }
      
      try {
        const response = await fetch(`${API_BASE_URL}/beats/${currentBeat.id}/purchase`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        
        if (response.ok) {
          setPurchasedBeat(currentBeat);
          setShowContractModal(true);
          setCurrentBeatIndex(prev => (prev < sortedBeats.length - 1 ? prev + 1 : 0));
        } else {
          alert("Purchase failed. Please try again.");
        }
      } catch (error) {
        console.error("Purchase error:", error);
        alert("Error processing purchase. Please check your connection.");
      }
    } else {
      // SWIPE LEFT - ADD TO WISHLIST (requires login for database storage)
      if (!user) {
        setShowLoginPrompt(true);
        return;
      }

      const success = await addToWishlist(currentBeat);
      if (success) {
        setCurrentBeatIndex(prev => (prev < sortedBeats.length - 1 ? prev + 1 : 0));
      }
    }
  }, [sortedBeats, currentBeatIndex, user, currentBeat, addToWishlist]);

  // Enhanced drag end handler with visual feedback
  const handleDragEnd = useCallback((event, info) => {
    const swipeThreshold = 100;
    const swipeVelocity = 500;

    if (Math.abs(info.velocity.x) > swipeVelocity || Math.abs(info.offset.x) > swipeThreshold) {
      if (info.offset.x > 0 || info.velocity.x > 0) {
        handleSwipe('right');
      } else {
        handleSwipe('left');
      }
    }
  }, [handleSwipe]);

  const togglePlay = useCallback((beatId) => {
    setBeats(prev =>
      prev.map(beat => {
        if (beat.id === beatId) {
          if (beat.isPlaying) {
            setPlayingBeat(null);
            audioElement?.pause();
            return { ...beat, isPlaying: false };
          } else {
            const newPlayingBeat = beat.preview_url;
            setPlayingBeat(newPlayingBeat);
            return { ...beat, isPlaying: true };
          }
        }
        return { ...beat, isPlaying: false };
      })
    );
  }, [audioElement, setBeats]);

  // Manual wishlist button handler
  const handleManualWishlist = useCallback(async (beat) => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    if (isInWishlist(beat.id)) {
      await removeFromWishlist(beat.id);
    } else {
      await addToWishlist(beat);
    }
  }, [user, isInWishlist, addToWishlist, removeFromWishlist]);

  // Keyboard navigation with enhanced feedback
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') {
        handleSwipe('left');
      } else if (e.key === 'ArrowRight') {
        handleSwipe('right');
      } else if (e.key === ' ' && currentBeat) {
        e.preventDefault();
        togglePlay(currentBeat.id);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleSwipe, togglePlay, currentBeat]);

  // Reset index when filters change
  useEffect(() => {
    setCurrentBeatIndex(0);
  }, [filteredBeats.length]);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedGenre("All");
    setPriceRange(DEFAULT_PRICE_RANGE);
    setBpmRange(DEFAULT_BPM_RANGE);
    setSortBy("featured");
    setShowFilters(false);
  }, []);

  const closeContractModal = useCallback(() => {
    setShowContractModal(false);
    setPurchasedBeat(null);
  }, []);

  const closeAudioPlayer = useCallback(() => {
    setPlayingBeat(null);
    audioElement?.pause();
    setBeats(prev => prev.map(beat => ({ ...beat, isPlaying: false })));
  }, [audioElement, setBeats]);

  const handleLogin = useCallback(() => {
    login();
    setShowLoginPrompt(false);
  }, [login]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Enhanced Hero Section */}
      <section className="pt-32 pb-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-900/10 to-black pointer-events-none"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            Find Your Next <span className="text-red-500">Hit Beat</span>
          </motion.h1>
          
          {/* Show loading indicator only for beats section */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <Loader className="w-8 h-8 text-red-600 animate-spin mr-3" />
              <span className="text-gray-300">Loading beats...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-700 rounded-xl p-4 max-w-md mx-auto mb-6">
              <p className="text-red-400">Error loading beats: {error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-2 bg-red-600 hover:bg-red-700"
                size="sm"
              >
                Retry
              </Button>
            </div>
          )}

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
          >
            Swipe right to buy instantly, swipe left to save for later. 
            Your next chart-topper is one swipe away.
          </motion.p>

          {/* Quick Stats - Show even when loading */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{loading ? "..." : beats.length}</div>
              <div className="text-gray-400 text-sm">Premium Beats</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{GENRES.length - 1}+</div>
              <div className="text-gray-400 text-sm">Genres</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">24/7</div>
              <div className="text-gray-400 text-sm">Support</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search and Filters Section */}
      <section className="py-8 bg-gray-900/50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
            {/* Search Bar */}
            <div className="flex-1 w-full max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search beats, genres, keys..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-red-700/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="border-red-700 text-red-400 hover:bg-red-700/20"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-800 border border-red-700/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="popular">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="bpm">BPM</option>
            </select>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gray-800 rounded-xl p-6 border border-red-700/30"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Genre Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Genre</label>
                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="w-full bg-gray-700 border border-red-700/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
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

                {/* BPM Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    BPM: {bpmRange[0]} - {bpmRange[1]}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="range"
                      min="60"
                      max="180"
                      value={bpmRange[0]}
                      onChange={(e) => setBpmRange([parseInt(e.target.value), bpmRange[1]])}
                      className="w-full"
                    />
                    <input
                      type="range"
                      min="60"
                      max="180"
                      value={bpmRange[1]}
                      onChange={(e) => setBpmRange([bpmRange[0], parseInt(e.target.value)])}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Results Count */}
          <div className="text-center mt-4">
            <p className="text-gray-400">
              Showing {filteredBeats.length} of {beats.length} beats
              {searchTerm && ` for "${searchTerm}"`}
            </p>
          </div>
        </div>
      </section>

      {/* Enhanced Beat Swipe Section */}
      <section className="py-12">
        <div className="container mx-auto max-w-md">
          {loading ? (
            <div className="text-center py-12 bg-gray-900 rounded-3xl border border-red-700">
              <Loader className="w-8 h-8 text-red-600 animate-spin mx-auto mb-4" />
              <h3 className="text-xl text-gray-400 mb-2">Loading beats...</h3>
              <p className="text-gray-500">Please wait while we load the latest beats</p>
            </div>
          ) : sortedBeats.length > 0 ? (
            <>
              <AnimatePresence mode="wait">
                {currentBeat && (
                  <motion.div
                    key={currentBeat.id}
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -300, opacity: 0 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={handleDragEnd}
                    whileDrag={{ scale: 1.02 }}
                    className="bg-gray-900 border border-red-700 rounded-3xl p-6 shadow-2xl relative cursor-grab active:cursor-grabbing select-none"
                  >
                    {/* Wishlist loading indicator */}
                    {wishlistLoading[currentBeat.id] && (
                      <div className="absolute inset-0 bg-black/70 rounded-3xl flex items-center justify-center z-30">
                        <Loader className="w-8 h-8 text-red-600 animate-spin" />
                      </div>
                    )}

                    {/* Swipe Direction Hints */}
                    <div className="absolute inset-0 pointer-events-none z-10">
                      <motion.div
                        animate={{ opacity: [0.3, 0.1, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-red-500/20 rounded-lg p-2"
                      >
                        <Heart className="w-6 h-6 text-red-400" />
                        <span className="text-xs text-red-400 block mt-1">Wishlist</span>
                      </motion.div>
                      <motion.div
                        animate={{ opacity: [0.3, 0.1, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-green-500/20 rounded-lg p-2"
                      >
                        <ShoppingCart className="w-6 h-6 text-green-400" />
                        <span className="text-xs text-green-400 block mt-1">Buy</span>
                      </motion.div>
                    </div>

                    {/* Beat Image with Overlay */}
                    <div className="relative rounded-2xl overflow-hidden mb-4 group">
                      <img 
                        src={currentBeat.cover_url || "/placeholder.png"} 
                        alt={currentBeat.title} 
                        className="w-full h-64 object-cover transition-transform group-hover:scale-105" 
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      
                      {/* Wishlist Heart Button */}
                      <button
                        onClick={() => handleManualWishlist(currentBeat)}
                        disabled={wishlistLoading[currentBeat.id]}
                        className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm z-20 transition-all ${
                          isInWishlist(currentBeat.id)
                            ? 'bg-red-600 text-white' 
                            : 'bg-black/60 text-gray-300 hover:bg-black/80'
                        }`}
                      >
                        {wishlistLoading[currentBeat.id] ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Heart 
                            className={`w-5 h-5 ${
                              isInWishlist(currentBeat.id) ? 'fill-current' : ''
                            }`} 
                          />
                        )}
                      </button>

                      {/* Play Button */}
                      <button
                        onClick={() => togglePlay(currentBeat.id)}
                        className="absolute bottom-4 right-4 w-14 h-14 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-all transform hover:scale-110 shadow-lg z-20"
                      >
                        {currentBeat.isPlaying ? 
                          <Pause className="w-6 h-6 text-white" /> : 
                          <Play className="w-6 h-6 text-white" />
                        }
                      </button>

                      {/* Genre Badge */}
                      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full text-red-500 font-semibold text-sm border border-red-700/50 z-20">
                        {currentBeat.genre}
                      </div>

                      {/* BPM Badge */}
                      <div className="absolute top-16 left-4 bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full text-gray-300 text-sm border border-gray-600 z-20">
                        {currentBeat.bpm} BPM
                      </div>
                    </div>

                    {/* Beat Info */}
                    <div className="text-center mb-6 relative z-20">
                      <h3 className="text-2xl font-bold mb-2 text-white">{currentBeat.title}</h3>
                      <div className="flex items-center justify-center gap-4 text-sm text-gray-300 mb-2">
                        <span className="flex items-center gap-1">
                          <Headphones className="w-4 h-4" />
                          {currentBeat.plays} plays
                        </span>
                        <span>•</span>
                        <span className="text-green-400 font-semibold">${currentBeat.price}</span>
                      </div>
                      <p className="text-gray-400 text-sm">
                        by <span className="text-red-400">{currentBeat.producer?.name || "Baraju"}</span>
                      </p>
                    </div>

                    {/* Key and Stats */}
                    <div className="flex justify-between items-center mb-6 text-sm text-gray-400 relative z-20">
                      <span>Key: {currentBeat.key}</span>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400" />
                        {currentBeat.rating}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 relative z-20">
                      <button
                        onClick={() => handleSwipe('left')}
                        disabled={wishlistLoading[currentBeat.id]}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 border border-red-700 rounded-2xl hover:bg-gray-700 transition-all hover:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {wishlistLoading[currentBeat.id] ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Heart className={`w-5 h-5 ${
                            isInWishlist(currentBeat.id) ? 'text-red-500 fill-current' : 'text-red-500'
                          }`} />
                        )}
                        <span className="font-semibold">
                          {isInWishlist(currentBeat.id) ? 'In Wishlist' : 'Wishlist'}
                        </span>
                      </button>
                      <button
                        onClick={() => handleSwipe('right')}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-2xl transition-all transform hover:scale-105 shadow-lg"
                      >
                        <ShoppingCart className="w-5 h-5 text-white" />
                        <span className="font-semibold text-white">Buy Now</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Progress and Navigation */}
              <div className="text-center mt-6">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <span className="text-gray-400">
                    {currentBeatIndex + 1} of {sortedBeats.length}
                  </span>
                </div>
                
                {/* Enhanced Swipe Instructions */}
                <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span>Swipe left to wishlist {!user && "(login required)"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-green-500" />
                    <span>Swipe right to buy {!user && "(login required)"}</span>
                  </div>
                </div>
                
                {/* Keyboard Shortcuts Hint */}
                <div className="mt-4 text-xs text-gray-600">
                  <span>Pro tip: Use ← → arrow keys to swipe • Spacebar to play</span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-gray-900 rounded-3xl border border-red-700">
              <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl text-gray-400 mb-2">No beats found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
              <Button 
                onClick={clearFilters}
                className="bg-red-600 hover:bg-red-700"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Enhanced Wishlist Preview */}
      {wishlistBeats.length > 0 && (
        <section className="py-8">
          <div className="container mx-auto max-w-md">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900 border border-red-700 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Heart className="w-6 h-6 text-red-500" />
                  <div>
                    <h3 className="text-white font-bold">Your Wishlist</h3>
                    <p className="text-gray-400 text-sm">{wishlistBeats.length} beats saved</p>
                  </div>
                </div>
                <Button 
                  onClick={clearWishlist} 
                  variant="outline" 
                  size="sm"
                  className="border-red-700 text-red-400 hover:bg-red-700/20"
                >
                  Clear All
                </Button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {wishlistBeats.slice(0, 6).map(beat => (
                  <span 
                    key={beat.id} 
                    className="bg-gray-800 text-gray-300 px-3 py-2 rounded-xl border border-red-700/30 text-sm flex items-center gap-2"
                  >
                    <Music className="w-3 h-3" />
                    {beat.title}
                  </span>
                ))}
                {wishlistBeats.length > 6 && (
                  <span className="bg-gray-800 text-gray-400 px-3 py-2 rounded-xl text-sm">
                    +{wishlistBeats.length - 6} more
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 bg-gray-900/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Choose <span className="text-red-500">Beats by Baraju</span>?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Instant Delivery</h3>
              <p className="text-gray-400">Get your beats immediately after purchase with full stems and contracts</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Clear Licensing</h3>
              <p className="text-gray-400">Professional contracts and clear rights for commercial use</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Premium Quality</h3>
              <p className="text-gray-400">Industry-standard production quality ready for radio play</p>
            </div>
          </div>
        </div>
      </section>

      {/* Audio Player */}
      {playingBeat && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-gray-900 border-t border-red-700 p-4">
          <div className="container mx-auto flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <Music className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-red-500 text-sm font-semibold">Now Playing Preview</p>
                <p className="text-gray-300 text-sm">{currentBeat?.title}</p>
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
              <source src={playingBeat} type="audio/mpeg" />
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

      {/* Contract Modal */}
      {showContractModal && purchasedBeat && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-red-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-white">🎉 Purchase Successful!</h3>
              <button 
                onClick={closeContractModal}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                  <Music className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">{purchasedBeat.title}</h4>
                  <p className="text-gray-400 text-sm">{purchasedBeat.genre} • {purchasedBeat.bpm} BPM</p>
                </div>
              </div>
            </div>

            <p className="text-gray-300 mb-6">
              Your beat has been purchased successfully! Download your files and contract below.
            </p>

            <div className="space-y-3">
              <Button className="w-full bg-red-600 hover:bg-red-700">
                <Download className="w-4 h-4 mr-2" />
                Download Beat & Stems
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-red-700 text-red-400 hover:bg-red-700/20"
                asChild
              >
                <a href={purchasedBeat.contract_url} target="_blank" rel="noopener noreferrer">
                  Download License Contract
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Enhanced Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full border border-red-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Login Required</h3>
              <button 
                onClick={() => setShowLoginPrompt(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <p className="text-gray-300">
                You need to be logged in to purchase beats. Sign in to continue with your purchase.
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleLogin}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Sign In to Purchase
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowLoginPrompt(false)}
                className="w-full border-gray-600 text-gray-400 hover:bg-gray-800"
              >
                Maybe Later
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-12 border-t border-red-700/30 bg-black">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Beats by Baraju</h3>
              <p className="text-red-400 text-sm">Premium Beats & Soundpacks</p>
            </div>
          </div>
          <p className="text-gray-400 mb-2">
            Your trusted source for professional beats and soundpacks
          </p>
          <p className="text-gray-500 text-sm">
            &copy; 2025 Beats by Baraju. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Login Prompt */}
      {!user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 right-4 z-40"
        >
          <div className="bg-gray-900 border border-red-700 rounded-xl p-4 shadow-2xl">
            <p className="text-white text-sm mb-3">Login to purchase beats instantly</p>
            <Button onClick={handleLogin} className="bg-red-600 hover:bg-red-700 w-full">
              Sign In to Continue
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default HomePage;