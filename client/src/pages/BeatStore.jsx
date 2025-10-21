import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Music, Heart, ShoppingCart, Play, Pause, Loader, 
  Search, Filter, X, Grid, List, Star, Headphones,
  Download, Share2, Volume2
} from "lucide-react";

// Constants
const API_BASE_URL = "https://beatsmart.onrender.com";
const GENRES = ["All", "Afrobeat", "Hip Hop", "Dancehall", "Electronic", "R&B", "Trap", "Pop", "Drill"];

// Custom hook for beats data (reuse from your homepage)
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

// Custom hook for wishlist
const useWishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState({});

  const addToWishlist = async (beat) => {
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
        setWishlist(prev => [...prev, beat.id]);
        return true;
      } else {
        throw new Error("Failed to add to wishlist");
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      alert("Error adding to wishlist. Please try again.");
      return false;
    } finally {
      setWishlistLoading(prev => ({ ...prev, [beat.id]: false }));
    }
  };

  const removeFromWishlist = async (beatId) => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      setWishlistLoading(prev => ({ ...prev, [beatId]: true }));
      
      // You'll need to implement this endpoint
      const response = await fetch(`${API_BASE_URL}/wishlist/${beatId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setWishlist(prev => prev.filter(id => id !== beatId));
        return true;
      } else {
        throw new Error("Failed to remove from wishlist");
      }
    } catch (error) {
      console.error("Wishlist remove error:", error);
      alert("Error removing from wishlist. Please try again.");
      return false;
    } finally {
      setWishlistLoading(prev => ({ ...prev, [beatId]: false }));
    }
  };

  const isInWishlist = (beatId) => {
    return wishlist.includes(beatId);
  };

  return { 
    wishlist, 
    wishlistLoading, 
    addToWishlist, 
    removeFromWishlist, 
    isInWishlist 
  };
};

const BeatStore = () => {
  const { beats, loading, error, setBeats } = useBeats();
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
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [bpmRange, setBpmRange] = useState([60, 180]);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"
  const [playingBeat, setPlayingBeat] = useState(null);
  const [audioElement, setAudioElement] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBeat, setSelectedBeat] = useState(null);
  const [showBeatModal, setShowBeatModal] = useState(false);

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
        case "popular": return (b.popularity || 0) - (a.popularity || 0);
        case "name": return a.title.localeCompare(b.title);
        default: return new Date(b.created_at) - new Date(a.created_at); // newest first
      }
    });
  }, [filteredBeats, sortBy]);

  // Audio management
  useEffect(() => {
    if (playingBeat && audioElement) {
      audioElement.play().catch(console.error);
    }
  }, [playingBeat, audioElement]);

  const togglePlay = (beat) => {
    setBeats(prev =>
      prev.map(b => {
        if (b.id === beat.id) {
          if (b.isPlaying) {
            setPlayingBeat(null);
            audioElement?.pause();
            return { ...b, isPlaying: false };
          } else {
            const newPlayingBeat = beat.preview_url;
            setPlayingBeat(newPlayingBeat);
            return { ...b, isPlaying: true };
          }
        }
        return { ...b, isPlaying: false };
      })
    );
  };

  const closeAudioPlayer = () => {
    setPlayingBeat(null);
    audioElement?.pause();
    setBeats(prev => prev.map(beat => ({ ...beat, isPlaying: false })));
  };

  const handleWishlistToggle = async (beat) => {
    if (isInWishlist(beat.id)) {
      await removeFromWishlist(beat.id);
    } else {
      await addToWishlist(beat);
    }
  };

  const handlePurchase = (beat) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to purchase beats");
      return;
    }
    setSelectedBeat(beat);
    setShowBeatModal(true);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedGenre("All");
    setPriceRange([0, 500]);
    setBpmRange([60, 180]);
    setSortBy("newest");
  };

  // Beat Card Component
  const BeatCard = ({ beat }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 rounded-2xl border border-red-700/30 overflow-hidden hover:border-red-500 transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/10"
    >
      {/* Beat Image with Overlay */}
      <div className="relative aspect-square overflow-hidden">
        <img 
          src={beat.cover_url || "/placeholder.png"} 
          alt={beat.title}
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
        
        {/* Overlay with Play Button */}
        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={() => togglePlay(beat)}
            className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-all transform hover:scale-110 shadow-lg"
          >
            {beat.isPlaying ? 
              <Pause className="w-6 h-6 text-white" /> : 
              <Play className="w-6 h-6 text-white" />
            }
          </button>
        </div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <span className="bg-black/80 backdrop-blur-sm px-2 py-1 rounded-full text-red-500 text-xs font-semibold border border-red-700/50">
            {beat.genre}
          </span>
          <span className="bg-black/80 backdrop-blur-sm px-2 py-1 rounded-full text-gray-300 text-xs border border-gray-600">
            {beat.bpm} BPM
          </span>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={() => handleWishlistToggle(beat)}
          disabled={wishlistLoading[beat.id]}
          className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-all ${
            isInWishlist(beat.id)
              ? 'bg-red-600 text-white' 
              : 'bg-black/60 text-gray-300 hover:bg-black/80'
          }`}
        >
          {wishlistLoading[beat.id] ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Heart className={`w-5 h-5 ${isInWishlist(beat.id) ? 'fill-current' : ''}`} />
          )}
        </button>
      </div>

      {/* Beat Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-white text-lg truncate flex-1 mr-2">{beat.title}</h3>
          <span className="text-green-400 font-bold text-lg">${beat.price}</span>
        </div>
        
        <p className="text-gray-400 text-sm mb-3">
          by <span className="text-red-400">{beat.producer?.name || "Baraju"}</span>
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
          <span className="flex items-center gap-1">
            <Headphones className="w-4 h-4" />
            {beat.plays}
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400" />
            {beat.rating}
          </span>
          <span>Key: {beat.key}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={() => handlePurchase(beat)}
            className="flex-1 bg-red-600 hover:bg-red-700"
            size="sm"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Buy
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedBeat(beat);
              setShowBeatModal(true);
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

  // Beat List Item Component
  const BeatListItem = ({ beat }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-900 rounded-2xl border border-red-700/30 p-4 hover:border-red-500 transition-all"
    >
      <div className="flex items-center gap-4">
        {/* Beat Image */}
        <div className="relative">
          <img 
            src={beat.cover_url || "/placeholder.png"} 
            alt={beat.title}
            className="w-16 h-16 rounded-xl object-cover"
          />
          <button
            onClick={() => togglePlay(beat)}
            className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl"
          >
            {beat.isPlaying ? 
              <Pause className="w-5 h-5 text-white" /> : 
              <Play className="w-5 h-5 text-white" />
            }
          </button>
        </div>

        {/* Beat Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-bold text-white text-lg truncate">{beat.title}</h3>
            <span className="text-green-400 font-bold">${beat.price}</span>
          </div>
          <p className="text-gray-400 text-sm mb-2">
            by <span className="text-red-400">{beat.producer?.name || "Baraju"}</span>
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs">
              {beat.genre}
            </span>
            <span>{beat.bpm} BPM</span>
            <span>Key: {beat.key}</span>
            <span className="flex items-center gap-1">
              <Headphones className="w-4 h-4" />
              {beat.plays}
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400" />
              {beat.rating}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleWishlistToggle(beat)}
            disabled={wishlistLoading[beat.id]}
            className={`p-2 rounded-lg transition-all ${
              isInWishlist(beat.id)
                ? 'bg-red-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {wishlistLoading[beat.id] ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Heart className={`w-4 h-4 ${isInWishlist(beat.id) ? 'fill-current' : ''}`} />
            )}
          </button>
          <Button
            onClick={() => handlePurchase(beat)}
            className="bg-red-600 hover:bg-red-700"
            size="sm"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Buy
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedBeat(beat);
              setShowBeatModal(true);
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Beat <span className="text-red-500">Store</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Browse our complete collection of premium beats. Filter by genre, BPM, price and more.
          </p>
        </div>

        {/* Search and Controls */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-red-700/30 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 w-full max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search beats, producers, genres..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-red-700/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-gray-800 rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "grid" ? "bg-red-600 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "list" ? "bg-red-600 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Toggle */}
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="border-red-700 text-red-400 hover:bg-red-700/20"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {(selectedGenre !== "All" || priceRange[0] > 0 || priceRange[1] < 500 || bpmRange[0] > 60 || bpmRange[1] < 180) && (
                <span className="ml-2 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </Button>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-800 border border-red-700/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 min-w-[160px]"
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="bpm">BPM</option>
              <option value="name">Name</option>
            </select>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-red-700/30"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Genre Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Genre</label>
                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="w-full bg-gray-800 border border-red-700/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
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
            Showing {filteredBeats.length} of {beats.length} beats
            {searchTerm && ` for "${searchTerm}"`}
          </p>
          {wishlist.length > 0 && (
            <p className="text-red-400 text-sm">
              <Heart className="w-4 h-4 inline mr-1" />
              {wishlist.length} in your wishlist
            </p>
          )}
        </div>

        {/* Beats Grid/List */}
        {loading ? (
          <div className="text-center py-20">
            <Loader className="w-8 h-8 text-red-600 animate-spin mx-auto mb-4" />
            <h3 className="text-xl text-gray-400">Loading beats...</h3>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="bg-red-900/20 border border-red-700 rounded-xl p-6 max-w-md mx-auto">
              <p className="text-red-400 mb-4">Error loading beats: {error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-red-600 hover:bg-red-700"
              >
                Try Again
              </Button>
            </div>
          </div>
        ) : sortedBeats.length > 0 ? (
          <motion.div
            layout
            className={
              viewMode === "grid" 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }
          >
            <AnimatePresence>
              {sortedBeats.map(beat => (
                viewMode === "grid" ? 
                  <BeatCard key={beat.id} beat={beat} /> : 
                  <BeatListItem key={beat.id} beat={beat} />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl text-gray-400 mb-2">No beats found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
            <Button 
              onClick={clearFilters}
              className="bg-red-600 hover:bg-red-700"
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>

      {/* Audio Player */}
      {playingBeat && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-gray-900 border-t border-red-700 p-4">
          <div className="container mx-auto flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <Volume2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-red-500 text-sm font-semibold">Now Playing</p>
                <p className="text-gray-300 text-sm">
                  {beats.find(b => b.isPlaying)?.title || "Preview"}
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

      {/* Beat Detail Modal */}
      {showBeatModal && selectedBeat && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full border border-red-700 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Beat Details</h3>
              <button 
                onClick={() => setShowBeatModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Beat Image */}
              <div className="relative">
                <img 
                  src={selectedBeat.cover_url || "/placeholder.png"} 
                  alt={selectedBeat.title}
                  className="w-full rounded-2xl"
                />
                <button
                  onClick={() => togglePlay(selectedBeat)}
                  className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl"
                >
                  {selectedBeat.isPlaying ? 
                    <Pause className="w-12 h-12 text-white" /> : 
                    <Play className="w-12 h-12 text-white" />
                  }
                </button>
              </div>

              {/* Beat Info */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-3xl font-bold text-white mb-2">{selectedBeat.title}</h4>
                  <p className="text-gray-400 text-lg">
                    by <span className="text-red-400">{selectedBeat.producer?.name || "Baraju"}</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800 rounded-xl p-4">
                    <p className="text-gray-400 text-sm">Genre</p>
                    <p className="text-white font-semibold">{selectedBeat.genre}</p>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-4">
                    <p className="text-gray-400 text-sm">BPM</p>
                    <p className="text-white font-semibold">{selectedBeat.bpm}</p>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-4">
                    <p className="text-gray-400 text-sm">Key</p>
                    <p className="text-white font-semibold">{selectedBeat.key}</p>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-4">
                    <p className="text-gray-400 text-sm">Price</p>
                    <p className="text-green-400 font-bold text-xl">${selectedBeat.price}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Headphones className="w-4 h-4" />
                    {selectedBeat.plays} plays
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    {selectedBeat.rating}
                  </span>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => handlePurchase(selectedBeat)}
                    className="flex-1 bg-red-600 hover:bg-red-700 py-3"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Purchase Beat
                  </Button>
                  <Button
                    onClick={() => handleWishlistToggle(selectedBeat)}
                    disabled={wishlistLoading[selectedBeat.id]}
                    variant="outline"
                    className="border-red-700 text-red-400 hover:bg-red-700/20"
                  >
                    {wishlistLoading[selectedBeat.id] ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <Heart className={`w-5 h-5 ${isInWishlist(selectedBeat.id) ? 'fill-current' : ''}`} />
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

export default BeatStore;