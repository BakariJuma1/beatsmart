import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

export const ErrorDisplay = ({ error, onDismiss }) => {
  if (!error) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 bg-red-900/20 border border-red-700 rounded-xl p-4"
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-400">{error}</p>
        </div>
        <button 
          onClick={onDismiss}
          className="text-red-400 hover:text-white transition-colors"
        >
          ×
        </button>
      </div>
    </motion.div>
  );
};