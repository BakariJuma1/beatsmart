import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "../constants";

export const useWishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState({});
  const [wishlistItems, setWishlistItems] = useState([]);

  const fetchWishlist = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setWishlistItems(data);
        const beatIds = data
          .filter(item => item.item_type === 'beat')
          .map(item => item.item_id);
        setWishlist(beatIds);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const addToWishlist = useCallback(async (beat) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to add beats to wishlist");
      return false;
    }

    try {
      setWishlistLoading(prev => ({ ...prev, [beat.id]: true }));

      const response = await fetch(`${API_BASE_URL}/wishlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ item_type: "beat", item_id: beat.id }),
      });

      if (response.ok) {
        const result = await response.json();
        setWishlist(prev => [...prev, beat.id]);
        setWishlistItems(prev => [...prev, result]);
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add to wishlist");
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      alert(error.message || "Error adding to wishlist. Please try again.");
      return false;
    } finally {
      setWishlistLoading(prev => ({ ...prev, [beat.id]: false }));
    }
  }, []);

  const removeFromWishlist = useCallback(async (beatId) => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      setWishlistLoading(prev => ({ ...prev, [beatId]: true }));

      const wishlistItem = wishlistItems.find(item => 
        item.item_type === 'beat' && item.item_id === beatId
      );

      if (!wishlistItem) throw new Error("Wishlist item not found");

      const response = await fetch(`${API_BASE_URL}/wishlist/${wishlistItem.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setWishlist(prev => prev.filter(id => id !== beatId));
        setWishlistItems(prev => prev.filter(item => 
          !(item.item_type === 'beat' && item.item_id === beatId)
        ));
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to remove from wishlist");
      }
    } catch (error) {
      console.error("Wishlist remove error:", error);
      alert(error.message || "Error removing from wishlist. Please try again.");
      return false;
    } finally {
      setWishlistLoading(prev => ({ ...prev, [beatId]: false }));
    }
  }, [wishlistItems]);

  const clearWishlist = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      const deletePromises = wishlistItems.map(item => 
        fetch(`${API_BASE_URL}/wishlist/${item.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      await Promise.all(deletePromises);
      setWishlist([]);
      setWishlistItems([]);
      return true;
    } catch (error) {
      console.error("Clear wishlist error:", error);
      alert("Error clearing wishlist. Please try again.");
      return false;
    }
  }, [wishlistItems]);

  const isInWishlist = useCallback((beatId) => wishlist.includes(beatId), [wishlist]);

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