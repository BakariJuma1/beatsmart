import { motion } from "framer-motion";
import { Music, Zap, Shield, TrendingUp } from "lucide-react";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { ErrorDisplay } from "../common/ErrorDisplay";

export const Header = ({ loading, error, beats, onRetry }) => {
  return (
    <section className="pt-32 pb-16 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-red-900/10 to-black pointer-events-none"></div>
      <div className="container mx-auto px-4 relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-bold mb-6"
        >
          Find Your Next <span className="text-red-500">Hit Beat</span>
        </motion.h1>

        {loading && <LoadingSpinner message="Loading beats..." />}
        {error && <ErrorDisplay error={error} onRetry={onRetry} />}

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
        >
          Swipe right to buy instantly, swipe left to save for later. Your next
          chart-topper is one swipe away.
        </motion.p>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8"
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">
              {loading ? "..." : beats.length}
            </div>
            <div className="text-gray-400 text-sm">Premium Beats</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">8+</div>
            <div className="text-gray-400 text-sm">Genres</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">24/7</div>
            <div className="text-gray-400 text-sm">Support</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
