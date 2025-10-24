import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

import { FileTypeModal } from "../components/home/modals/FileTypeModal";
import { API_BASE_URL } from "@/constants";
import { useDashboardData } from "../hooks/useDashboardData";
import { useAudioPlayer } from "../hooks/useAudioPlayer";

import { LoadingSpinner } from "../components/dashboard/LoadingSpinner";
import { WelcomeSection } from "../components/dashboard/WelcomeSection";
import { WishlistSection } from "../components/dashboard/WishlistSection";
import { PurchasesSection } from "../components/dashboard/PurchasesSection";
import { ProfileSummary } from "../components/dashboard/ProfileSummary";
import { QuickActions } from "../components/dashboard/QuickActions";
import { ErrorDisplay } from "../components/dashboard/ErrorDisplay";

export default function ArtistDashboard() {
  const { user } = useAuth();
  const {
    wishlist,
    recentPurchases,
    stats,
    loading,
    error,
    setError,
    removeFromWishlist,
   
    handleDownload,
    refetchData,
  } = useDashboardData();

  const [showFileTypeModal, setShowFileTypeModal] = useState(false);
  const [selectedBeat, setSelectedBeat] = useState(null);
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  const { playPreview, stopAudio, isPlaying, currentBeat } = useAudioPlayer();

  const handlePurchaseInit = (beat) => {
    setSelectedBeat(beat);
    setShowFileTypeModal(true);
  };
  
  const handleFileTypeSelect = async (fileType) => {
    setPurchaseLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/purchase`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          item_type: "beat",
          item_id: selectedBeat.id,
          file_type: fileType,
          callback_url: `${window.location.origin}/purchase-success`,
        }),
      });

      const data = await response.json();

      if (data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        throw new Error(data.error || "Purchase failed");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      alert("Purchase failed. Please try again.");
    } finally {
      setPurchaseLoading(false);
      setShowFileTypeModal(false);
    }
  };

  const handlePlayPreview = (beat) => {
    playPreview(beat, setError);
  };

  const handleRetry = () => {
    setError(null);
    refetchData();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <ErrorDisplay error={error} onDismiss={() => setError(null)} />

        <WelcomeSection user={user} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">
            <WishlistSection
              wishlist={wishlist}
              onRemoveFromWishlist={removeFromWishlist}
              onPurchase={handlePurchaseInit} 
              onPlayPreview={handlePlayPreview}
              isPlaying={isPlaying}
            />

            <PurchasesSection
              purchases={recentPurchases}
              onDownload={handleDownload}
            />
          </div>

         
          <div className="space-y-8">
            <ProfileSummary user={user} stats={stats} />
            <QuickActions />
          </div>
        </div>

        {/* File Type Modal */}
        <FileTypeModal
          show={showFileTypeModal}
          onClose={() => setShowFileTypeModal(false)}
          beat={selectedBeat}
          onFileTypeSelect={handleFileTypeSelect}
          isLoading={purchaseLoading}
        />

        {/* Audio Player (if you want to add a global player) */}
        {currentBeat && (
          <div className="fixed bottom-4 left-4 bg-gray-900 border border-red-700 rounded-xl p-4">
            <p className="text-sm text-gray-400">Now Playing</p>
            <p className="text-white font-semibold">{currentBeat.title}</p>
            <button
              onClick={stopAudio}
              className="text-red-400 hover:text-white text-sm mt-2"
            >
              Stop
            </button>
          </div>
        )}
      </div>
    </div>
  );
}