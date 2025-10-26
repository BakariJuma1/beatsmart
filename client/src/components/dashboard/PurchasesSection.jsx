import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Package, Download, ShoppingCart, Loader } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

const API_BASE_URL = "https://beatsmart.onrender.com";

const PurchasesSection = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getIdToken } = useAuth();

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        setLoading(true);
        const token = await getIdToken();
        
        if (!token) {
          setError('No authentication token found');
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/purchases/history`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Authentication failed. Please login again.');
          } else if (response.status === 404) {
            setPurchases([]);
            return;
          }
          throw new Error(`Failed to fetch purchases: ${response.status}`);
        }

        const data = await response.json();
        setPurchases(data);
      } catch (err) {
        console.error('Error fetching purchases:', err);
        setError(err.message);
        
        // If it's a network error, provide more specific message
        if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
          setError('Network error: Unable to connect to server');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [getIdToken]);

  const handleDownload = async (purchase) => {
    try {
      const token = await getIdToken();
      
      if (!token) {
        alert('Please login to download files');
        return;
      }

      if (purchase.item_type === 'beat') {
        const response = await fetch(
          `${API_BASE_URL}/beats/${purchase.item_id}/files/${purchase.file_type || 'mp3'}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          
          if (data.file_url) {
            const link = document.createElement('a');
            link.href = data.file_url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } else {
            alert('Download URL not found in response');
          }
        } else {
          const errorText = await response.text();
          console.error('Download failed:', errorText);
          alert('Download failed. Please check your purchase.');
        }
      } else {
        alert('Sound pack download functionality coming soon!');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Error downloading file. Please try again.');
    }
  };

  if (loading) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
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
        <div className="text-center py-8">
          <Loader className="w-8 h-8 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading purchases...</p>
        </div>
      </motion.section>
    );
  }

  if (error) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
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
        <div className="text-center py-8">
          <p className="text-red-400 mb-4">Error loading purchases: {error}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700"
          >
            Try Again
          </Button>
        </div>
      </motion.section>
    );
  }

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
              onDownload={handleDownload}
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
        src={purchase.item_cover || '/placeholder.png'}
        alt={purchase.item_title}
        className="w-12 h-12 rounded-lg object-cover"
        onError={(e) => {
          e.target.src = '/placeholder.png';
        }}
      />
      <div>
        <h3 className="font-semibold text-white">{purchase.item_title}</h3>
        <p className="text-gray-400 text-sm capitalize">
          {purchase.item_type} • {purchase.file_type || 'standard'}
        </p>
        <p className="text-gray-500 text-xs">
          Purchased on {new Date(purchase.purchased_at).toLocaleDateString()}
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

export default PurchasesSection;