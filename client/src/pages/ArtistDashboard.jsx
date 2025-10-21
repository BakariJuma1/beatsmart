import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'https://beatsmart.onrender.com';

export default function ArtistDashboard() {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [recentPurchases, setRecentPurchases] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch wishlist from backend
  const fetchWishlist = async () => {
    try {
      const token = await user.getIdToken();
      const response = await axios.get(`${API_BASE_URL}/api/wishlist`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Transform wishlist data to match our component structure
      const wishlistItems = response.data.map(item => ({
        id: item.id,
        beat_id: item.item_id,
        title: item.beat?.title || 'Unknown Beat',
        genre: item.beat?.genre || '',
        price: item.beat?.price || 0,
        cover_url: item.beat?.cover_url || '/default-cover.jpg',
        preview_url: item.beat?.preview_url,
        producer: item.beat?.producer
      }));
      
      setWishlist(wishlistItems);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError('Failed to load wishlist');
    }
  };

  // Fetch recent purchases
  const fetchRecentPurchases = async () => {
    try {
      const token = await user.getIdToken();
      // You'll need to implement this endpoint in your backend
      const response = await axios.get(`${API_BASE_URL}/api/purchases/recent`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setRecentPurchases(response.data);
    } catch (err) {
      console.error('Error fetching purchases:', err);
      // For now, we'll use empty array if endpoint doesn't exist
      setRecentPurchases([]);
    }
  };

  // Fetch all beats for browsing
  const fetchAllBeats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/beats`);
      return response.data;
    } catch (err) {
      console.error('Error fetching beats:', err);
      return [];
    }
  };

  // Remove from wishlist
  const handleRemoveFromWishlist = async (wishlistId) => {
    try {
      const token = await user.getIdToken();
      await axios.delete(`${API_BASE_URL}/api/wishlist/${wishlistId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Update local state
      setWishlist(wishlist.filter(item => item.id !== wishlistId));
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      setError('Failed to remove item from wishlist');
    }
  };

  // Add to wishlist
  const handleAddToWishlist = async (beatId) => {
    try {
      const token = await user.getIdToken();
      await axios.post(`${API_BASE_URL}/api/wishlist`, 
        {
          item_type: "beat",
          item_id: beatId
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Refresh wishlist
      await fetchWishlist();
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      setError('Failed to add item to wishlist');
    }
  };

  // Handle purchase
  const handleBuyNow = async (beat) => {
    try {
      const token = await user.getIdToken();
      const response = await axios.post(`${API_BASE_URL}/api/purchase`,
        {
          item_type: "beat",
          item_id: beat.beat_id || beat.id,
          file_type: "mp3", // Default file type
          callback_url: `${window.location.origin}/purchase-success`
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Redirect to Paystack payment page
      if (response.data.payment_url) {
        window.location.href = response.data.payment_url;
      }
    } catch (err) {
      console.error('Error initiating purchase:', err);
      setError('Failed to initiate purchase');
    }
  };

  // Handle audio preview
  const handlePlayPreview = (beat) => {
    if (beat.preview_url) {
      const audio = new Audio(beat.preview_url);
      audio.play().catch(err => {
        console.error('Error playing preview:', err);
        setError('Could not play audio preview');
      });
    } else {
      setError('No preview available for this beat');
    }
  };

  // Handle download
  const handleDownload = async (purchase) => {
    try {
      const token = await user.getIdToken();
      // You'll need to implement a download endpoint
      const response = await axios.get(`${API_BASE_URL}/api/download/${purchase.id}`, {
        headers: { 
          Authorization: `Bearer ${token}` 
        },
        responseType: 'blob'
      });
      
      // Create download link
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

  // Load all data on component mount
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
          <button 
            onClick={() => setError(null)}
            className="float-right font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Welcome Section */}
      <section className="mb-12">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-4">
            Welcome back, {user?.displayName || user?.email || 'Artist'}!
          </h1>
          <p className="text-purple-100 mb-6">
            Ready to create your next hit? Explore new beats and manage your music.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/beats"
              className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
            >
              Browse Beats
            </Link>
            <button
              onClick={() => document.getElementById('wishlist').scrollIntoView({ behavior: 'smooth' })}
              className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:bg-opacity-10 transition-colors"
            >
              View Wishlist
            </button>
            <Link
              to="/profile/edit"
              className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:bg-opacity-10 transition-colors"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - 2/3 width */}
        <div className="lg:col-span-2 space-y-8">
          {/* Wishlist Section */}
          <section id="wishlist" className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Wishlist</h2>
              <span className="text-gray-500">{wishlist.length} beats</span>
            </div>
            
            {wishlist.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Your wishlist is empty</p>
                <Link
                  to="/beats"
                  className="text-purple-600 hover:text-purple-700 font-semibold"
                >
                  Browse beats to add some
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {wishlist.map(beat => (
                  <div key={beat.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <img
                        src={beat.cover_url || '/default-cover.jpg'}
                        alt={beat.title}
                        className="w-16 h-16 rounded-lg object-cover"
                        onError={(e) => {
                          e.target.src = '/default-cover.jpg';
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{beat.title}</h3>
                        <p className="text-gray-600 text-sm">{beat.genre} • {beat.bpm}BPM</p>
                        <p className="text-green-600 font-bold">${beat.price}</p>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handlePlayPreview(beat)}
                            className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition-colors"
                          >
                            Play Preview
                          </button>
                          <button
                            onClick={() => handleBuyNow(beat)}
                            className="text-sm bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded transition-colors"
                          >
                            Buy Now
                          </button>
                          <button
                            onClick={() => handleRemoveFromWishlist(beat.id)}
                            className="text-sm text-red-600 hover:text-red-700 px-2"
                            title="Remove from wishlist"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Recent Purchases Section */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Purchases</h2>
            
            {recentPurchases.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No purchases yet</p>
                <Link
                  to="/beats"
                  className="text-purple-600 hover:text-purple-700 font-semibold"
                >
                  Browse beats to get started
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentPurchases.map(purchase => (
                  <div key={purchase.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <img
                        src={purchase.cover_url || '/default-cover.jpg'}
                        alt={purchase.title}
                        className="w-12 h-12 rounded object-cover"
                        onError={(e) => {
                          e.target.src = '/default-cover.jpg';
                        }}
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">{purchase.title}</h3>
                        <p className="text-gray-500 text-sm">
                          Purchased on {new Date(purchase.purchased_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-green-600 font-bold">${purchase.amount}</span>
                      <button
                        onClick={() => handleDownload(purchase)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="space-y-8">
          {/* Profile Summary */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Summary</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">Name</label>
                <p className="font-semibold">{user?.displayName || 'Not set'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <p className="font-semibold">{user?.email}</p>
              </div>
              <div className="flex gap-6 pt-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{recentPurchases.length}</div>
                  <div className="text-sm text-gray-500">Beats Purchased</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{wishlist.length}</div>
                  <div className="text-sm text-gray-500">Wishlisted</div>
                </div>
              </div>
            </div>
            <Link
              to="/profile/edit"
              className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-900 text-center py-2 rounded-lg font-semibold transition-colors block"
            >
              Edit Profile
            </Link>
          </section>

          {/* Quick Actions */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/beats?genre=hiphop"
                className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-semibold">Hip Hop Beats</h3>
                <p className="text-sm text-gray-600">Latest trap and boom bap</p>
              </Link>
              <Link
                to="/beats?genre=rnb"
                className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-semibold">R&B Beats</h3>
                <p className="text-sm text-gray-600">Smooth and melodic</p>
              </Link>
              <Link
                to="/beats?genre=afrobeats"
                className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-semibold">Afrobeats</h3>
                <p className="text-sm text-gray-600">Vibrant African rhythms</p>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}