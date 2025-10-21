import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";

// Hooks
import { useBeats } from "../hooks/useBeats";
import { useWishlist } from "../hooks/useWishlist";
import { useUser } from "../hooks/useUser";
import { useFilters } from "../hooks/useFilters";
import { useAudio } from "../hooks/useAudio";

// Components
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { LoginPrompt } from "../components/layout/LoginPrompt";
import { BeatFilters } from "../components/beats/BeatFilters";
import { BeatSwipe } from "../components/beats/BeatSwipe";
import { BeatPlayer } from "../components/beats/BeatPlayer";
import { FeaturesSection } from "../components/features/FeaturesSection";
import { WishlistPreview } from "../components/wishlist/WishlistPreview";
import { ContractModal } from "../components/modals/ContractModal";
import { LoginModal } from "../components/modals/LoginModal";

const HomePage = () => {
  // Hooks
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
  
  const {
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
    clearFilters
  } = useFilters(beats);

  const {
    playingBeat,
    setPlayingBeat,
    audioElement,
    setAudioElement,
    closeAudioPlayer
  } = useAudio();

  // State
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);
  const [showContractModal, setShowContractModal] = useState(false);
  const [purchasedBeat, setPurchasedBeat] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Memoized values
  const currentBeat = sortedBeats[currentBeatIndex];
  const wishlistBeats = useMemo(() => 
    beats.filter(beat => wishlist.includes(beat.id)), 
    [beats, wishlist]
  );

  // Audio management
  useEffect(() => {
    if (playingBeat && audioElement) {
      audioElement.play().catch(console.error);
    }
  }, [playingBeat, audioElement]);

  // Enhanced swipe handler
  const handleSwipe = useCallback(async (direction) => {
    if (!sortedBeats.length || !currentBeat) return;

    if (direction === "right") {
      // SWIPE RIGHT - PURCHASE BEAT
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
      // SWIPE LEFT - ADD TO WISHLIST
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

  // Enhanced drag end handler
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
  }, [audioElement, setBeats, setPlayingBeat]);

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

  // Keyboard navigation
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

  // Modal handlers
  const closeContractModal = useCallback(() => {
    setShowContractModal(false);
    setPurchasedBeat(null);
  }, []);

  const handleLogin = useCallback(() => {
    login();
    setShowLoginPrompt(false);
  }, [login]);

  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <Header 
        loading={loading} 
        error={error} 
        beats={beats} 
        onRetry={handleRetry} 
      />

      {/* Filters */}
      <BeatFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedGenre={selectedGenre}
        setSelectedGenre={setSelectedGenre}
        sortBy={sortBy}
        setSortBy={setSortBy}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        bpmRange={bpmRange}
        setBpmRange={setBpmRange}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        clearFilters={clearFilters}
        filteredBeats={filteredBeats}
        beats={beats}
      />

      {/* Beat Swipe Section */}
      <section className="py-12">
        <div className="container mx-auto max-w-md">
          <BeatSwipe
            sortedBeats={sortedBeats}
            currentBeatIndex={currentBeatIndex}
            setCurrentBeatIndex={setCurrentBeatIndex}
            isPlaying={currentBeat?.isPlaying || false}
            isInWishlist={isInWishlist}
            wishlistLoading={wishlistLoading}
            onPlayToggle={togglePlay}
            onWishlistToggle={handleManualWishlist}
            onPurchase={() => handleSwipe('right')}
            onDragEnd={handleDragEnd}
            loading={loading}
            user={user}
          />
        </div>
      </section>

      {/* Wishlist Preview */}
      <WishlistPreview 
        wishlistBeats={wishlistBeats} 
        onClearWishlist={clearWishlist} 
      />

      {/* Features Section */}
      <FeaturesSection />

      {/* Audio Player */}
      <BeatPlayer
        playingBeat={playingBeat}
        currentBeat={currentBeat}
        audioElement={audioElement}
        onClose={closeAudioPlayer}
      />

      {/* Modals */}
      <ContractModal 
        purchasedBeat={purchasedBeat} 
        onClose={closeContractModal} 
      />

      <LoginModal
        show={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        onLogin={handleLogin}
      />

      {/* Footer */}
      <Footer />

      {/* Login Prompt */}
      <LoginPrompt user={user} onLogin={handleLogin} />
    </div>
  );
};

export default HomePage;