import { motion } from "framer-motion";
import { Heart, Play, Pause, Loader, ShoppingCart, Headphones, Star, Music } from "lucide-react";

export const BeatCard = ({
  beat,
  isPlaying,
  isInWishlist,
  wishlistLoading,
  onPlayToggle,
  onWishlistToggle,
  onPurchase,
  onDragEnd
}) => {
  return (
    <motion.div
      key={beat.id}
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={onDragEnd}
      whileDrag={{ scale: 1.02 }}
      className="bg-gray-900 border border-red-700 rounded-3xl p-6 shadow-2xl relative cursor-grab active:cursor-grabbing select-none"
    >
      {/* Wishlist loading indicator */}
      {wishlistLoading[beat.id] && (
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
          src={beat.cover_url || "/placeholder.png"} 
          alt={beat.title} 
          className="w-full h-64 object-cover transition-transform group-hover:scale-105" 
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        {/* Wishlist Heart Button */}
        <button
          onClick={() => onWishlistToggle(beat)}
          disabled={wishlistLoading[beat.id]}
          className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm z-20 transition-all ${
            isInWishlist(beat.id)
              ? 'bg-red-600 text-white' 
              : 'bg-black/60 text-gray-300 hover:bg-black/80'
          }`}
        >
          {wishlistLoading[beat.id] ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Heart 
              className={`w-5 h-5 ${
                isInWishlist(beat.id) ? 'fill-current' : ''
              }`} 
            />
          )}
        </button>

        {/* Play Button */}
        <button
          onClick={() => onPlayToggle(beat.id)}
          className="absolute bottom-4 right-4 w-14 h-14 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-all transform hover:scale-110 shadow-lg z-20"
        >
          {isPlaying ? 
            <Pause className="w-6 h-6 text-white" /> : 
            <Play className="w-6 h-6 text-white" />
          }
        </button>

        {/* Genre Badge */}
        <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full text-red-500 font-semibold text-sm border border-red-700/50 z-20">
          {beat.genre}
        </div>

        {/* BPM Badge */}
        <div className="absolute top-16 left-4 bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full text-gray-300 text-sm border border-gray-600 z-20">
          {beat.bpm} BPM
        </div>
      </div>

      {/* Beat Info */}
      <div className="text-center mb-6 relative z-20">
        <h3 className="text-2xl font-bold mb-2 text-white">{beat.title}</h3>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-300 mb-2">
          <span className="flex items-center gap-1">
            <Headphones className="w-4 h-4" />
            {beat.plays} plays
          </span>
          <span>•</span>
          <span className="text-green-400 font-semibold">${beat.price}</span>
        </div>
        <p className="text-gray-400 text-sm">
          by <span className="text-red-400">{beat.producer?.name || "Baraju"}</span>
        </p>
      </div>

      {/* Key and Stats */}
      <div className="flex justify-between items-center mb-6 text-sm text-gray-400 relative z-20">
        <span>Key: {beat.key}</span>
        <span className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-400" />
          {beat.rating}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 relative z-20">
        <button
          onClick={() => onWishlistToggle(beat)}
          disabled={wishlistLoading[beat.id]}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 border border-red-700 rounded-2xl hover:bg-gray-700 transition-all hover:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {wishlistLoading[beat.id] ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Heart className={`w-5 h-5 ${
              isInWishlist(beat.id) ? 'text-red-500 fill-current' : 'text-red-500'
            }`} />
          )}
          <span className="font-semibold">
            {isInWishlist(beat.id) ? 'In Wishlist' : 'Wishlist'}
          </span>
        </button>
        <button
          onClick={onPurchase} 
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-2xl transition-all transform hover:scale-105 shadow-lg"
        >
          <ShoppingCart className="w-5 h-5 text-white" />
          <span className="font-semibold text-white">Buy Now</span>
        </button>
      </div>
    </motion.div>
  );
};