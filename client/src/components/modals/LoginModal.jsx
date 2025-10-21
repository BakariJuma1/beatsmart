import { motion } from "framer-motion";
import { X, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

export const LoginModal = ({ show, onClose, onLogin }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full border border-red-700"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Login Required</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-300">
            You need to be logged in to purchase beats. Sign in to continue with your purchase.
          </p>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={onLogin}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            Sign In to Purchase
          </Button>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full border-gray-600 text-gray-400 hover:bg-gray-800"
          >
            Maybe Later
          </Button>
        </div>
      </motion.div>
    </div>
  );
};