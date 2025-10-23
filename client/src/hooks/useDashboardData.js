import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase'; // Import your Firebase auth
import axios from 'axios';
import { API_BASE_URL } from '../constants';

export const useDashboardData = () => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [recentPurchases, setRecentPurchases] = useState([]);
  const [stats, setStats] = useState({
    totalPurchases: 0,
    totalSpent: 0,
    wishlistCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to get Firebase token
  const getToken = useCallback(async () => {
    if (!user) {
      throw new Error("No user logged in");
    }
    
    try {
      // Get the current Firebase user and their token
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("No Firebase user found");
      }
      
      const token = await currentUser.getIdToken();
      if (!token) {
        throw new Error("Failed to get authentication token");
      }
      return token;
    } catch (error) {
      console.error("Error getting token:", error);
      throw new Error("Authentication token unavailable");
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(`${API_BASE_URL}/wishlist`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const wishlistItems = response.data.data?.map(item => ({
        id: item.id,
        beat_id: item.item_id,
        title: item.beat?.title || 'Unknown Beat',
        genre: item.beat?.genre || '',
        bpm: item.beat?.bpm || 0,
        price: item.beat?.price || 0,
        cover_url: item.beat?.cover_url || '/placeholder.png',
        preview_url: item.beat?.preview_url,
        producer: item.beat?.producer,
        rating: item.beat?.rating || "4.8",
        plays: item.beat?.plays || 0
      })) || [];
      
      setWishlist(wishlistItems);
      setStats(prev => ({ ...prev, wishlistCount: wishlistItems.length }));
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError('Failed to load wishlist');
    }
  };

  const fetchRecentPurchases = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(`${API_BASE_URL}/api/purchases/history`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const purchases = response.data || [];
      setRecentPurchases(purchases);
      setStats(prev => ({ 
        ...prev, 
        totalPurchases: purchases.length,
        totalSpent: purchases.reduce((sum, purchase) => sum + (purchase.amount || 0), 0)
      }));
    } catch (err) {
      console.error('Error fetching purchases:', err);
      // For now, we'll use empty array if endpoint doesn't exist
      setRecentPurchases([]);
    }
  };

  const removeFromWishlist = async (wishlistId) => {
    try {
      const token = await getToken();
      await axios.delete(`${API_BASE_URL}/wishlist/${wishlistId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setWishlist(prev => prev.filter(item => item.id !== wishlistId));
      setStats(prev => ({ ...prev, wishlistCount: prev.wishlistCount - 1 }));
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      setError('Failed to remove item from wishlist');
    }
  };

  const handlePurchase = async (beat) => {
    try {
      const token = await getToken();
      const response = await axios.post(`${API_BASE_URL}/beats/${beat.beat_id || beat.id}/purchase`,
        {
          file_type: "mp3",
          callback_url: `${window.location.origin}/purchase-success`
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.payment_url) {
        window.location.href = response.data.payment_url;
      } else {
        await fetchRecentPurchases();
        setError(null);
      }
    } catch (err) {
      console.error('Error initiating purchase:', err);
      setError('Failed to initiate purchase');
    }
  };

  const handleDownload = async (purchase) => {
    try {
      const token = await getToken();
      const response = await axios.get(`${API_BASE_URL}/download/beat/${purchase.id}`, {
        headers: { 
          Authorization: `Bearer ${token}` 
        },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${purchase.title}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading:', err);
      setError('Failed to download file');
    }
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          fetchWishlist(),
          fetchRecentPurchases()
        ]);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  return {
    wishlist,
    recentPurchases,
    stats,
    loading,
    error,
    setError,
    removeFromWishlist,
    handlePurchase,
    handleDownload,
    refetchData: () => {
      setLoading(true);
      Promise.all([fetchWishlist(), fetchRecentPurchases()]).finally(() => setLoading(false));
    }
  };
};