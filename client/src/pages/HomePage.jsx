import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

// Hooks
import { useBeats } from "../hooks/home_hooks/useBeats";
import { useWishlist } from "../hooks/home_hooks/useWishlist";
import { useFilters } from "../hooks/home_hooks/useFilters";
import { useAudio } from "../hooks/home_hooks/useAudio";
import { useAuth } from "../context/AuthContext";

// Components
import { Header } from "../components/home/layout/Header";
import { Footer } from "../components/home/layout/Footer";
import { LoginPrompt } from "../components/home/layout/LoginPrompt";
import { BeatFilters } from "../components/home/beats/BeatFilters";
import { BeatSwipe } from "../components/home/beats/BeatSwipe";
import { BeatPlayer } from "../components/home/beats/BeatPlayer";
import { FeaturesSection } from "../components/home/features/FeaturesSection";
import { WishlistPreview } from "../components/home/wishlist/WishlistPreview";
import { ContractModal } from "../components/home/modals/ContractModal";
import { LoginModal } from "../components/home/modals/LoginModal";

// New Components
import { NavigationCTAs } from "../components/home/navigation/NavigationCTAs";
import { PricingBanner } from "../components/home/pricing/PricingBanner";
import { PromotionsSection } from "../components/home/promotions/PromotionsSection";

const HomePage = () => {
  // Hooks
  const { beats, loading, error, setBeats } = useBeats();
  const { user, loading: authLoading } = useAuth();
  const {
    wishlist,
    wishlistItems,
    wishlistLoading,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    fetchWishlist,
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
    clearFilters,
  } = useFilters(beats);

  const {
    playingBeat,
    setPlayingBeat,
    audioElement,
    setAudioElement,
    closeAudioPlayer,
  } = useAudio();

  // State
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);
  const [showContractModal, setShowContractModal] = useState(false);
  const [purchasedBeat, setPurchasedBeat] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Memoized values
  const currentBeat = sortedBeats[currentBeatIndex];
  const wishlistBeats = useMemo(
    () => beats.filter((beat) => wishlist.includes(beat.id)),
    [beats, wishlist]
  );

  // Audio management
  useEffect(() => {
    if (playingBeat && audioElement) {
      audioElement.play().catch(console.error);
    }
  }, [playingBeat, audioElement]);

  // Enhanced swipe handler
  const handleSwipe = useCallback(
    async (direction) => {
      if (!sortedBeats.length || !currentBeat) return;

      if (direction === "right") {
        // SWIPE RIGHT - PURCHASE BEAT
        if (!user) {
          setShowLoginPrompt(true);
          return;
        }

        try {
          setPurchasedBeat(currentBeat);
          setShowContractModal(true);
          setCurrentBeatIndex((prev) =>
            prev < sortedBeats.length - 1 ? prev + 1 : 0
          );
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
          setCurrentBeatIndex((prev) =>
            prev < sortedBeats.length - 1 ? prev + 1 : 0
          );
        }
      }
    },
    [sortedBeats, currentBeatIndex, user, currentBeat, addToWishlist]
  );

  // Enhanced drag end handler
  const handleDragEnd = useCallback(
    (event, info) => {
      const swipeThreshold = 100;
      const swipeVelocity = 500;

      if (
        Math.abs(info.velocity.x) > swipeVelocity ||
        Math.abs(info.offset.x) > swipeThreshold
      ) {
        if (info.offset.x > 0 || info.velocity.x > 0) {
          handleSwipe("right");
        } else {
          handleSwipe("left");
        }
      }
    },
    [handleSwipe]
  );

  const togglePlay = useCallback(
    (beatId) => {
      setBeats((prev) =>
        prev.map((beat) => {
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
    },
    [audioElement, setBeats, setPlayingBeat]
  );

  // Manual wishlist button handler
  const handleManualWishlist = useCallback(
    async (beat) => {
      if (!user) {
        setShowLoginPrompt(true);
        return;
      }

      if (isInWishlist(beat.id)) {
        await removeFromWishlist(beat.id);
      } else {
        await addToWishlist(beat);
      }
    },
    [user, isInWishlist, addToWishlist, removeFromWishlist]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "ArrowLeft") {
        handleSwipe("left");
      } else if (e.key === "ArrowRight") {
        handleSwipe("right");
      } else if (e.key === " " && currentBeat) {
        e.preventDefault();
        togglePlay(currentBeat.id);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleSwipe, togglePlay, currentBeat]);

  // Reset index when filters change
  useEffect(() => {
    setCurrentBeatIndex(0);
  }, [filteredBeats.length]);

  // Refresh wishlist when user logs in
  useEffect(() => {
    if (user && !authLoading) {
      fetchWishlist();
    }
  }, [user, authLoading, fetchWishlist]);

  // Modal handlers
  const closeContractModal = useCallback(() => {
    setShowContractModal(false);
    setPurchasedBeat(null);
  }, []);

  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <Header
        loading={loading}
        error={error}
        beats={beats}
        onRetry={handleRetry}
      />

      {/* SECTION 1: BEATS FIRST - Immediate Action */}
      <section className="py-8 bg-gradient-to-b from-red-900/10 to-black">
        <div className="container mx-auto px-4">
          {/* Quick Intro */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Find Your <span className="text-red-500">Next Hit</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Swipe to discover beats tailored for you
            </p>
          </div>

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
          <div className="max-w-md mx-auto">
            <BeatSwipe
              sortedBeats={sortedBeats}
              currentBeatIndex={currentBeatIndex}
              setCurrentBeatIndex={setCurrentBeatIndex}
              isPlaying={currentBeat?.isPlaying || false}
              isInWishlist={isInWishlist}
              wishlistLoading={wishlistLoading}
              onPlayToggle={togglePlay}
              onWishlistToggle={handleManualWishlist}
              onPurchase={() => handleSwipe("right")}
              onDragEnd={handleDragEnd}
              loading={loading}
              user={user}
            />
          </div>
        </div>
      </section>

      {/* SECTION 2: Wishlist (If they've saved beats) */}
      <WishlistPreview
        wishlistBeats={wishlistBeats}
        onClearWishlist={clearWishlist}
      />

      {/* SECTION 3: Promotions (After they've engaged with beats) */}
      <PromotionsSection />

      {/* SECTION 4: Pricing (When they're ready to understand costs) */}
      <PricingBanner />

      {/* SECTION 5: Navigation to Full Catalog (Alternative browsing) */}
      <NavigationCTAs />

      {/* SECTION 6: Features & Trust Signals */}
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
      />

      {/* Footer */}
      <Footer />

      {/* Login Prompt */}
      <LoginPrompt user={user} />
    </div>
  );
};

export default HomePage;