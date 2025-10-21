import { motion } from "framer-motion";
import { Heart, Music } from "lucide-react";
import { Button } from "@/components/ui/button";

export const WishlistPreview = ({ wishlistBeats, onClearWishlist }) => {
  if (wishlistBeats.length === 0) return null;

  return (
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
              onClick={onClearWishlist} 
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
  );
};