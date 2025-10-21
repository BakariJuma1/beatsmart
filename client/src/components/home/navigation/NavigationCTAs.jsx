import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Music, Package, ArrowRight, Grid, Layers } from "lucide-react";

export const NavigationCTAs = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-gray-900/50 to-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Explore Our <span className="text-red-500">Full Collection</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Discover more ways to find your perfect sound
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Beat Store CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="group"
          >
            <Link
              to="/beat-store"
              className="block bg-gray-900 rounded-2xl p-8 border border-red-700/30 hover:border-red-500 transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/10"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Grid className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-2xl font-bold text-white">Beat Store</h3>
                    <p className="text-red-400">Browse Full Collection</p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-gray-400 text-left mb-4">
                Explore our complete catalog of premium beats. Filter by genre, BPM, price, and more to find exactly what you need.
              </p>
              <ul className="text-sm text-gray-500 space-y-1 text-left">
                <li>• Advanced search and filtering</li>
                <li>• Grid/list view options</li>
                <li>• Sort by popularity, price, BPM</li>
                <li>• Detailed beat information</li>
              </ul>
            </Link>
          </motion.div>

          {/* Sound Packs CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="group"
          >
            <Link
              to="/sound-packs"
              className="block bg-gray-900 rounded-2xl p-8 border border-blue-700/30 hover:border-blue-500 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Layers className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-2xl font-bold text-white">Sound Packs</h3>
                    <p className="text-blue-400">Drum Kits & Samples</p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-gray-400 text-left mb-4">
                Professional sample packs, drum kits, and sound libraries. Everything you need for your next production.
              </p>
              <ul className="text-sm text-gray-500 space-y-1 text-left">
                <li>• High-quality WAV samples</li>
                <li>• Royalty-free sounds</li>
                <li>• Organized by genre and type</li>
                <li>• Instant download</li>
              </ul>
            </Link>
          </motion.div>
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-12 pt-8 border-t border-gray-800"
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">500+</div>
            <div className="text-gray-400 text-sm">Premium Beats</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">50+</div>
            <div className="text-gray-400 text-sm">Sound Packs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">100%</div>
            <div className="text-gray-400 text-sm">Satisfaction</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default NavigationCTAs;