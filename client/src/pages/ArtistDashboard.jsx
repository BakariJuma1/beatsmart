import React from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

// Hooks
import { useDashboardData } from '../hooks/useDashboardData';
import { useAudioPlayer } from '../hooks/useAudioPlayer';

// Components
import { LoadingSpinner } from '../components/dashboard/LoadingSpinner';
import { WelcomeSection } from '../components/dashboard/WelcomeSection';
import { WishlistSection } from '../components/dashboard/WishlistSection';
import { PurchasesSection } from '../components/dashboard/PurchasesSection';
import { ProfileSummary } from '../components/dashboard/ProfileSummary';
import { QuickActions } from '../components/dashboard/QuickActions';
import { ErrorDisplay } from '../components/dashboard/ErrorDisplay';

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
    handlePurchase,
    handleDownload,
    refetchData
  } = useDashboardData();

  const { playPreview, stopAudio, isPlaying, currentBeat } = useAudioPlayer();

  if (loading) {
    return <LoadingSpinner />;
  }

  const handlePlayPreview = (beat) => {
    playPreview(beat, setError);
  };

  const handleRetry = () => {
    setError(null);
    refetchData();
  };

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
              onPurchase={handlePurchase}
              onPlayPreview={handlePlayPreview}
              isPlaying={isPlaying}
            />

            <PurchasesSection
              purchases={recentPurchases}
              onDownload={handleDownload}
            />
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-8">
            <ProfileSummary user={user} stats={stats} />
            <QuickActions />
          </div>
        </div>

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