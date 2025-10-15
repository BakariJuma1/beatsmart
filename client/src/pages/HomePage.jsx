import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Music, Zap, Shield, TrendingUp, Search, Filter, Heart, ShoppingCart, Play, Pause, Loader } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const [beats, setBeats] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playingBeat, setPlayingBeat] = useState(null);

  const genres = ["All", "Afrobeat", "Hip Hop", "Dancehall", "Electronic", "R&B", "Trap"];

  // Fetch beats from Flask backend
  useEffect(() => {
    const fetchBeats = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://127.0.0.1:6666/beats');
        if (!response.ok) {
          throw new Error('Failed to fetch beats');
        }
        const data = await response.json();
        setBeats(data.map(beat => ({
          ...beat,
          isPlaying: false
        })));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBeats();
  }, []);

  const handleSwipe = async (beatId, direction) => {
    const beat = beats.find(b => b.id === beatId);
    
    if (direction === 'right') {
      try {
        const response = await fetch(`http://localhost:5000/api/beats/${beatId}/purchase`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          alert(`Successfully purchased: ${beat.title} - $${beat.price}`);
        } else {
          alert('Please login to purchase beats');
        }
      } catch (err) {
        alert('Error processing purchase');
      }
    } else {
      setWishlist(prev => [...prev, beat]);
      alert(`Added to wishlist: ${beat.title}`);
    }
    
    // Remove swiped beat from display
    setBeats(prev => prev.filter(b => b.id !== beatId));
  };

  const togglePlay = (beatId) => {
    setBeats(prev => prev.map(beat => {
      if (beat.id === beatId) {
        if (beat.isPlaying) {
          // Stop playing
          setPlayingBeat(null);
          return { ...beat, isPlaying: false };
        } else {
          // Start playing this beat, stop others
          setPlayingBeat(beat.preview_url);
          return { ...beat, isPlaying: true };
        }
      }
      return { ...beat, isPlaying: false };
    }));
  };

  // Filter and sort beats
  const filteredBeats = beats.filter(beat => {
    const matchesSearch = beat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         beat.genre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === "All" || beat.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const sortedBeats = [...filteredBeats].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "bpm":
        return a.bpm - b.bpm;
      default:
        return 0; // Default sort (you can change this to created_at when available)
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading beats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error loading beats: {error}</p>
          <Button onClick={() => window.location.reload()} className="bg-purple-600 hover:bg-purple-700">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-purple-500/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Beats by Baraju
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/artist-dashboard">
              <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-purple-500/20">
                For Artists
              </Button>
            </Link>
            <Link to="/producer-dashboard">
              <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-purple-500/20">
                For Producers
              </Button>
            </Link>
            <Button variant="hero" size="lg" className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Audio Player */}
      {playingBeat && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-gray-800 border-t border-purple-500/20 p-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Now Playing Preview</span>
              <audio 
                controls 
                autoPlay 
                className="w-full max-w-md"
                onEnded={() => setPlayingBeat(null)}
              >
                <source src={playingBeat} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setPlayingBeat(null)}
                className="text-gray-400 hover:text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section - Fixed: Removed heroImage reference */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          {/* Gradient background instead of image */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/10"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-purple-900/20 to-black"></div>
        </div>
        
        <div className="container mx-auto px-4 z-10 text-center animate-fade-in">
          <h2 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
            BEATS BY BARAJU
          </h2>
          <h3 className="text-3xl md:text-5xl font-bold mb-8 text-gray-200">
            Premium Quality Beats
          </h3>
          <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
            Swipe <span className="text-green-400 font-bold">RIGHT</span> to buy instantly, 
            swipe <span className="text-yellow-400 font-bold">LEFT</span> to wishlist. 
            Your next hit is one swipe away.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/beat-store">
              <Button variant="hero" size="xl" className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 w-full sm:w-auto transform hover:scale-105 transition-all">
                <Music className="mr-2" />
                Explore All Beats
              </Button>
            </Link>
            <Link to="/producer-dashboard">
              <Button variant="outline" size="xl" className="border-purple-500 text-purple-400 hover:bg-purple-500/20 w-full sm:w-auto">
                Upload Your Beats
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Beat Discovery Section */}
      <section className="py-24 bg-gradient-to-b from-black to-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Discover Your Sound
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Swipe through premium beats. Right to buy, left to save. Find your perfect match.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-6 bg-gray-800/30 rounded-2xl border border-purple-500/20 backdrop-blur-sm">
              {/* Search */}
              <div className="flex-1 w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search beats by title or genre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              {/* Genre Filter */}
              <div className="flex gap-2 items-center">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                >
                  {genres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div className="flex gap-2 items-center">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="bpm">BPM</option>
                </select>
              </div>
            </div>
          </div>

          {/* Beat Cards */}
          <div className="max-w-4xl mx-auto">
            {sortedBeats.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedBeats.map((beat) => (
                  <div
                    key={beat.id}
                    className="bg-gray-800/30 border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300 backdrop-blur-sm hover:shadow-2xl hover:shadow-purple-500/10 group"
                  >
                    {/* Beat Cover Image */}
                    <div className="relative mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20 aspect-square">
                      {beat.cover_url ? (
                        <img 
                          src={beat.cover_url} 
                          alt={beat.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Music className="w-16 h-16 text-purple-400/50" />
                        </div>
                      )}
                      
                      {/* Play Button */}
                      <button
                        onClick={() => togglePlay(beat.id)}
                        className="absolute bottom-4 right-4 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors shadow-lg"
                      >
                        {beat.isPlaying ? (
                          <Pause className="w-5 h-5 text-white" />
                        ) : (
                          <Play className="w-5 h-5 text-white" />
                        )}
                      </button>
                    </div>

                    {/* Beat Info */}
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                        {beat.title}
                      </h3>
                      <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                        <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full">
                          {beat.genre}
                        </span>
                        <span>{beat.bpm} BPM • {beat.key}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        by {beat.producer?.name || 'Baraju'}
                      </p>
                    </div>

                    {/* Price and Actions */}
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-green-400">
                        ${beat.price}
                      </div>
                      <div className="flex gap-2">
                        {/* Swipe Left - Wishlist */}
                        <button
                          onClick={() => handleSwipe(beat.id, 'left')}
                          className="w-12 h-12 bg-yellow-500/20 border border-yellow-500/30 rounded-full flex items-center justify-center hover:bg-yellow-500/30 transition-colors"
                          title="Add to Wishlist"
                        >
                          <Heart className="w-5 h-5 text-yellow-400" />
                        </button>
                        
                        {/* Swipe Right - Buy */}
                        <button
                          onClick={() => handleSwipe(beat.id, 'right')}
                          className="w-12 h-12 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center hover:bg-green-500/30 transition-colors"
                          title="Buy Now"
                        >
                          <ShoppingCart className="w-5 h-5 text-green-400" />
                        </button>
                      </div>
                    </div>

                    {/* Swipe Instructions */}
                    <div className="mt-4 text-xs text-gray-500 text-center">
                      Swipe left to wishlist • Swipe right to buy
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl text-gray-400 mb-2">No beats found</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </div>
            )}
          </div>

          {/* Wishlist Preview */}
          {wishlist.length > 0 && (
            <div className="max-w-4xl mx-auto mt-12">
              <div className="bg-gray-800/30 border border-yellow-500/20 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Heart className="w-6 h-6 text-yellow-400" />
                  <h3 className="text-xl font-bold text-white">Your Wishlist ({wishlist.length})</h3>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {wishlist.map(beat => (
                    <span key={beat.id} className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm">
                      {beat.title}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-gray-900/50 to-black">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Why Choose Beats by Baraju?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-gray-800/30 border border-purple-500/20 rounded-2xl p-8 hover:border-purple-500/50 transition-all shadow-2xl hover:shadow-purple-500/20 backdrop-blur-sm">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Swipe to Buy</h3>
              <p className="text-gray-400 leading-relaxed">
                Revolutionary swipe interface. Right to purchase instantly, left to save for later. Finding your perfect beat has never been this fast.
              </p>
            </div>

            <div className="bg-gray-800/30 border border-purple-500/20 rounded-2xl p-8 hover:border-purple-500/50 transition-all shadow-2xl hover:shadow-purple-500/20 backdrop-blur-sm">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Secure Licensing</h3>
              <p className="text-gray-400 leading-relaxed">
                Every purchase includes proper licensing and contracts. Download your beats with peace of mind and full legal rights.
              </p>
            </div>

            <div className="bg-gray-800/30 border border-purple-500/20 rounded-2xl p-8 hover:border-purple-500/50 transition-all shadow-2xl hover:shadow-purple-500/20 backdrop-blur-sm">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Premium Quality</h3>
              <p className="text-gray-400 leading-relaxed">
                Professional grade beats crafted with industry-standard tools. Every beat is mixed and mastered to perfection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-b from-black to-purple-900/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white">
            Ready to Find Your Sound?
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Join thousands of artists discovering their next hit with our revolutionary swipe-to-buy experience.
          </p>
          <Link to="/beat-store">
            <Button variant="hero" size="xl" className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 transform hover:scale-105 transition-all">
              Start Swiping Beats
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 py-12 bg-black">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full flex items-center justify-center">
              <Music className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Beats by Baraju
            </h3>
          </div>
          <p className="text-gray-400 mb-2">Premium Beats & Soundpacks</p>
          <p className="text-gray-500 text-sm">&copy; 2025 Beats by Baraju. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;