import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "../constants";
import { useAuth } from "../context/AuthContext";
import { auth } from "../firebase"; 

export const useWishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState({});
  const [wishlistItems, setWishlistItems] = useState([]);
  const { user, loading: authLoading } = useAuth();

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

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlistItems([]);
      setWishlist([]);
      return;
    }

    try {
      const token = await getToken();
      console.log("Fetching wishlist with token:", token); // Debug log
      
      const response = await fetch(`${API_BASE_URL}/wishlist`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch wishlist: ${response.status}`);
      }

      const result = await response.json();
      console.log("Wishlist API response:", result); // Debug log
      
      if (result.data) {
        setWishlistItems(result.data);
        const beatIds = result.data
          .filter(item => item.item_type === 'beat')
          .map(item => item.item_id);
        setWishlist(beatIds);
      } else {
        // Handle case where backend returns different structure
        setWishlistItems(result);
        const beatIds = result
          .filter(item => item.item_type === 'beat')
          .map(item => item.item_id);
        setWishlist(beatIds);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      // Don't alert here to avoid spam on page load
    }
  }, [user, getToken]);

  useEffect(() => {
    if (!authLoading) {
      fetchWishlist();
    }
  }, [fetchWishlist, authLoading]);

  const addToWishlist = useCallback(async (beat) => {
    if (!user) {
      alert("Please login to add beats to wishlist");
      return false;
    }

    try {
      setWishlistLoading(prev => ({ ...prev, [beat.id]: true }));
      const token = await getToken();
      console.log("Adding to wishlist with token:", token); // Debug log

      const response = await fetch(`${API_BASE_URL}/wishlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          item_type: "beat", 
          item_id: beat.id 
        }),
      });

      const result = await response.json();
      console.log("Add to wishlist response:", result); // Debug log

      if (!response.ok) {
        throw new Error(result.error || "Failed to add to wishlist");
      }

      // Update local state
      if (result.data) {
        setWishlist(prev => [...prev, beat.id]);
        setWishlistItems(prev => [...prev, result.data]);
      } else if (result.message === "Item already in wishlist") {
        // Item already exists, just refresh the list
        await fetchWishlist();
      }
      
      return true;

    } catch (error) {
      console.error("Wishlist error:", error);
      alert(error.message || "Error adding to wishlist. Please try again.");
      return false;
    } finally {
      setWishlistLoading(prev => ({ ...prev, [beat.id]: false }));
    }
  }, [user, getToken, fetchWishlist]);

  const removeFromWishlist = useCallback(async (beatId) => {
    if (!user) return false;

    try {
      setWishlistLoading(prev => ({ ...prev, [beatId]: true }));
      const token = await getToken();
      console.log("Removing from wishlist with token:", token); // Debug log

      // Find the wishlist item ID for this beat
      const wishlistItem = wishlistItems.find(item => 
        item.item_type === 'beat' && item.item_id === beatId
      );

      if (!wishlistItem) {
        throw new Error("Wishlist item not found");
      }

      const response = await fetch(`${API_BASE_URL}/wishlist/${wishlistItem.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      console.log("Remove from wishlist response:", result); // Debug log

      if (!response.ok) {
        throw new Error(result.error || "Failed to remove from wishlist");
      }

      // Update local state
      setWishlist(prev => prev.filter(id => id !== beatId));
      setWishlistItems(prev => prev.filter(item => 
        !(item.item_type === 'beat' && item.item_id === beatId)
      ));
      
      return true;

    } catch (error) {
      console.error("Wishlist remove error:", error);
      alert(error.message || "Error removing from wishlist. Please try again.");
      return false;
    } finally {
      setWishlistLoading(prev => ({ ...prev, [beatId]: false }));
    }
  }, [user, getToken, wishlistItems]);

  const clearWishlist = useCallback(async () => {
    if (!user) return false;

    try {
      const token = await getToken();
      console.log("Clearing wishlist with token:", token); // Debug log
      
      // Get all wishlist items first
      const response = await fetch(`${API_BASE_URL}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error("Failed to fetch wishlist for clearing");
      
      const result = await response.json();
      const itemsToDelete = result.data || result;

      if (!itemsToDelete || itemsToDelete.length === 0) return true;

      // Delete all wishlist items
      const deletePromises = itemsToDelete.map(item => 
        fetch(`${API_BASE_URL}/wishlist/${item.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      await Promise.all(deletePromises);
      
      // Clear local state
      setWishlist([]);
      setWishlistItems([]);
      
      return true;
    } catch (error) {
      console.error("Clear wishlist error:", error);
      alert("Error clearing wishlist. Please try again.");
      return false;
    }
  }, [user, getToken]);

  const isInWishlist = useCallback((beatId) => {
    return wishlist.includes(beatId);
  }, [wishlist]);

  return { 
    wishlist, 
    wishlistItems,
    wishlistLoading, 
    addToWishlist, 
    removeFromWishlist, 
    clearWishlist, 
    isInWishlist,
    fetchWishlist 
  };
};