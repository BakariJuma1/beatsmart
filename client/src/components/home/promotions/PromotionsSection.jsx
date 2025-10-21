import { motion } from "framer-motion";
import { Tag, Zap, Gift, Clock, Star, Loader } from "lucide-react";
import { useState, useEffect } from "react";

// Use your existing API base URL
const API_BASE_URL = "https://beatsmart.onrender.com";

export const PromotionsSection = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/discounts/active`);
        
        if (!response.ok) throw new Error('Failed to fetch discounts');
        
        const data = await response.json();
        setDiscounts(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching discounts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscounts();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-black to-gray-900/50">
        <div className="container mx-auto px-4 text-center">
          <Loader className="w-8 h-8 text-red-600 animate-spin mx-auto" />
          <p className="text-gray-400 mt-4">Loading promotions...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gradient-to-b from-black to-gray-900/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-red-400">Error loading promotions: {error}</p>
        </div>
      </section>
    );
  }

  // Fallback to static promotions if no discounts from API
  const displayDiscounts = discounts.length > 0 ? discounts : [
    {
      code: "WELCOME20",
      percentage: 20,
      name: "First Purchase Discount",
      description: "Get 20% off your first beat or sound pack",
      applicable_to: "global",
      valid_until: null,
      max_uses: null,
      used_count: 0
    },
    {
      code: "3FOR2", 
      percentage: 33.33,
      name: "Beat Bundle Deal",
      description: "Buy 2 beats, get 1 free of equal or lesser value",
      applicable_to: "beat",
      valid_until: null,
      max_uses: null,
      used_count: 0
    },
    {
      code: "PACKDEAL",
      percentage: 25,
      name: "Sound Pack Special", 
      description: "Get any 2 sound packs for $30 (save $10)",
      applicable_to: "soundpack",
      valid_until: null,
      max_uses: null,
      used_count: 0
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-black to-gray-900/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Tag className="w-8 h-8 text-red-500" />
            <h2 className="text-3xl md:text-4xl font-bold">
              Current <span className="text-red-500">Promotions</span>
            </h2>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Limited time offers and exclusive deals
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {displayDiscounts.map((discount, index) => (
            <motion.div
              key={discount.code}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 border border-red-500/20 hover:border-red-500/50 transition-all group h-full"
              >
                {/* Discount Badge */}
                <div className="absolute -top-3 -right-3 bg-red-600 text-white px-4 py-1 rounded-full text-sm font-bold rotate-12">
                  {discount.percentage}% OFF
                </div>

                {/* Icon */}
                <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Tag className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-2">{discount.name}</h3>
                <p className="text-gray-400 mb-4">{discount.description}</p>

                {/* Code */}
                <div className="bg-gray-800 rounded-xl p-3 mb-3">
                  <div className="text-xs text-gray-400 mb-1">USE CODE AT CHECKOUT</div>
                  <div className="text-lg font-mono font-bold text-white">{discount.code}</div>
                </div>

                {/* Applicability */}
                <div className="text-sm text-gray-500 mb-2">
                  Applies to: {discount.applicable_to === 'global' ? 'All items' : 
                              discount.applicable_to === 'beat' ? 'Beats only' : 'Sound packs only'}
                </div>

                {/* Expiry & Usage */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>
                      {discount.valid_until ? 
                        `Expires ${new Date(discount.valid_until).toLocaleDateString()}` : 
                        'No expiry'}
                    </span>
                  </div>
                  {discount.max_uses && (
                    <span>{discount.used_count}/{discount.max_uses} used</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800 max-w-2xl mx-auto">
            <h4 className="text-lg font-bold text-white mb-2">Need Custom Pricing?</h4>
            <p className="text-gray-400 mb-4">
              Looking for bulk purchases, exclusive rights, or custom work? We offer flexible pricing for serious artists and labels.
            </p>
            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
              Contact for Custom Deals
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PromotionsSection;