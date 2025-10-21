import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, Play, ShoppingCart, Star } from 'lucide-react';

export const WishlistSection = ({ 
  wishlist, 
  onRemoveFromWishlist, 
  onPurchase, 
  onPlayPreview 
}) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      id="wishlist"
      className="bg-gray-900 rounded-3xl border border-red-700/30 p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Your Wishlist</h2>
            <p className="text-gray-400">{wishlist.length} beats saved</p>
          </div>
        </div>
        <span className="text-red-500 font-bold">{wishlist.length} beats</span>
      </div>
      
      {wishlist.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-4">Your wishlist is empty</p>
          <Link to="/">
            <Button className="bg-red-600 hover:bg-red-700">
              Browse Beats
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {wishlist.map(beat => (
            <WishlistItem
              key={beat.id}
              beat={beat}
              onRemove={() => onRemoveFromWishlist(beat.id)}
              onPurchase={() => onPurchase(beat)}
              onPlayPreview={() => onPlayPreview(beat)}
            />
          ))}
        </div>
      )}
    </motion.section>
  );
};

const WishlistItem = ({ beat, onRemove, onPurchase, onPlayPreview }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-gray-800 border border-red-700/30 rounded-2xl p-4 hover:border-red-500 transition-all group"
  >
    <div className="flex items-start gap-4">
      <div className="relative">
        <img
          src={beat.cover_url}
          alt={beat.title}
          className="w-16 h-16 rounded-xl object-cover"
          onError={(e) => {
            e.target.src = '/placeholder.png';
          }}
        />
        <button
          onClick={onPlayPreview}
          className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Play className="w-6 h-6 text-white" />
        </button>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-white truncate">{beat.title}</h3>
        <div className="flex items-center gap-3 text-sm text-gray-400 mb-2">
          <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs">
            {beat.genre}
          </span>
          <span>{beat.bpm} BPM</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-green-400 font-bold text-lg">${beat.price}</span>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-400">{beat.rating}</span>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <Button
            onClick={onPurchase}
            size="sm"
            className="bg-red-600 hover:bg-red-700 flex-1"
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            Buy
          </Button>
          <Button
            onClick={onRemove}
            variant="outline"
            size="sm"
            className="border-red-700 text-red-400 hover:bg-red-700/20"
          >
            Remove
          </Button>
        </div>
      </div>
    </div>
  </motion.div>
);