import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Package, Download, ShoppingCart } from 'lucide-react';

export const PurchasesSection = ({ purchases, onDownload }) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-gray-900 rounded-3xl border border-red-700/30 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
          <Package className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Recent Purchases</h2>
          <p className="text-gray-400">Your latest acquisitions</p>
        </div>
      </div>
      
      {purchases.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-4">No purchases yet</p>
          <Link to="/">
            <Button className="bg-red-600 hover:bg-red-700">
              Browse Beats
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {purchases.map(purchase => (
            <PurchaseItem
              key={purchase.id}
              purchase={purchase}
              onDownload={onDownload}
            />
          ))}
        </div>
      )}
    </motion.section>
  );
};

const PurchaseItem = ({ purchase, onDownload }) => (
  <div className="flex items-center justify-between p-4 bg-gray-800 border border-red-700/30 rounded-xl hover:border-red-500 transition-all">
    <div className="flex items-center gap-4">
      <img
        src={purchase.cover_url || '/placeholder.png'}
        alt={purchase.title}
        className="w-12 h-12 rounded-lg object-cover"
        onError={(e) => {
          e.target.src = '/placeholder.png';
        }}
      />
      <div>
        <h3 className="font-semibold text-white">{purchase.title}</h3>
        <p className="text-gray-400 text-sm">
          Purchased on {new Date(purchase.purchased_date).toLocaleDateString()}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <span className="text-green-400 font-bold">${purchase.amount}</span>
      <Button
        onClick={() => onDownload(purchase)}
        size="sm"
        className="bg-green-600 hover:bg-green-700"
      >
        <Download className="w-4 h-4 mr-1" />
        Download
      </Button>
    </div>
  </div>
);