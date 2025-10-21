import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingCart, Loader, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BeatCard } from "./BeatCard";
import { LoadingSpinner } from "../common/LoadingSpinner";

export const BeatSwipe = ({
  sortedBeats,
  currentBeatIndex,
  setCurrentBeatIndex,
  isPlaying,
  isInWishlist,
  wishlistLoading,
  onPlayToggle,
  onWishlistToggle,
  onPurchase,
  onDragEnd,
  loading,
  user
}) => {
  if (loading) {
    return (
      <div className="text-center py-12 bg-gray-900 rounded-3xl border border-red-700">
        <LoadingSpinner message="Loading beats..." />
      </div>
    );
  }

  if (sortedBeats.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-900 rounded-3xl border border-red-700">
        <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl text-gray-400 mb-2">No beats found</h3>
        <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
      </div>
    );
  }

  const currentBeat = sortedBeats[currentBeatIndex];

  return (
    <>
      <AnimatePresence mode="wait">
        {currentBeat && (
          <BeatCard
            beat={currentBeat}
            isPlaying={isPlaying}
            isInWishlist={isInWishlist}
            wishlistLoading={wishlistLoading}
            onPlayToggle={onPlayToggle}
            onWishlistToggle={onWishlistToggle}
            onPurchase={onPurchase}
            onDragEnd={onDragEnd}
          />
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
  );
};