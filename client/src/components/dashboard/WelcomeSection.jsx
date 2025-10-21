import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Music, Heart } from 'lucide-react';

export const WelcomeSection = ({ user }) => {
  return (
    <section className="mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-red-900/30 to-gray-900 rounded-3xl p-8 border border-red-700/30 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/5 to-transparent"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome back, <span className="text-red-500">{user?.name || user?.email || 'Artist'}!</span>
          </h1>
          <p className="text-gray-300 text-lg mb-6 max-w-2xl">
            Ready to create your next hit? Explore new beats and manage your music collection.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/">
              <Button className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105">
                <Music className="w-5 h-5 mr-2" />
                Browse Beats
              </Button>
            </Link>
            <Button
              onClick={() => document.getElementById('wishlist').scrollIntoView({ behavior: 'smooth' })}
              variant="outline"
              className="border-red-700 text-red-400 hover:bg-red-700/20 px-6 py-3 rounded-xl font-semibold"
            >
              <Heart className="w-5 h-5 mr-2" />
              View Wishlist
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
};