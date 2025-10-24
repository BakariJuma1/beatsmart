import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Download, FileText, Music, Folder, Crown, X, ArrowLeft, Check, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '@/constants';

// Constants and configuration
const FILE_TYPE_CONFIGS = {
  mp3: {
    icon: Music,
    title: 'MP3 License',
    description: 'Basic license for one project',
    features: ['MP3 File', 'Non-exclusive', 'Credit required', 'Basic License'],
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10'
  },
  wav: {
    icon: Download,
    title: 'WAV License', 
    description: 'High quality WAV file',
    features: ['WAV File', 'Better quality', 'Commercial use', 'Premium License'],
    color: 'text-green-400',
    bgColor: 'bg-green-500/10'
  },
  trackout: {
    icon: Folder,
    title: 'Trackout Stems',
    description: 'Professional stems for mixing',
    features: ['All Stems', 'WAV Format', 'Mixing ready', 'Professional License'],
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10'
  },
  exclusive: {
    icon: Crown,
    title: 'Exclusive Rights',
    description: 'Full ownership transfer',
    features: ['All Files', 'Exclusive Rights', 'Full Ownership', 'Rights Transfer'],
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10'
  }
};

const DEFAULT_FILE_OPTIONS = [
  { file_type: 'mp3', price: 29, name: 'MP3 License' },
  { file_type: 'wav', price: 39, name: 'WAV License' },
  { file_type: 'trackout', price: 59, name: 'Trackout Stems' },
  { file_type: 'exclusive', price: 129, name: 'Exclusive Rights' }
];

// Custom hook for file options
const useFileOptions = (beat) => {
  const [fileOptions, setFileOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFileOptions = async () => {
      if (!beat?.id) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/beats/${beat.id}/file-options`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch file options: ${response.status}`);
        }

        const data = await response.json();
        setFileOptions(data.file_options || DEFAULT_FILE_OPTIONS);
      } catch (err) {
        console.error('Error fetching file options:', err);
        setError(err.message);
        setFileOptions(DEFAULT_FILE_OPTIONS);
      } finally {
        setLoading(false);
      }
    };

    fetchFileOptions();
  }, [beat?.id]);

  return { fileOptions, loading, error };
};

// Sub-components for better organization
const ModalHeader = ({ showPayment, onBack, onClose, beat }) => (
  <div className="p-6 border-b border-gray-800 flex items-center justify-between">
    <div className="flex items-center gap-3">
      {showPayment && (
        <button
          onClick={onBack}
          className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
          aria-label="Back to license selection"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}
      <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
        <FileText className="w-5 h-5 text-white" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-white">
          {showPayment ? 'Complete Payment' : 'Choose License Type'}
        </h3>
        <p className="text-gray-400 text-sm">
          {showPayment ? 'Secure payment via Paystack' : `Select your license for ${beat.title}`}
        </p>
      </div>
    </div>
    <button
      onClick={onClose}
      className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
      aria-label="Close modal"
    >
      <X className="w-5 h-5" />
    </button>
  </div>
);

const FileOptionCard = ({ option, isSelected, onClick }) => {
  const config = FILE_TYPE_CONFIGS[option.file_type] || FILE_TYPE_CONFIGS.mp3;
  const IconComponent = config.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
        isSelected
          ? 'border-red-500 bg-red-500/10'
          : 'border-gray-700 hover:border-gray-600'
      }`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
      aria-selected={isSelected}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-gray-800 ${config.color}`}>
            <IconComponent className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-white">{config.title}</h4>
            <p className="text-green-400 font-bold text-lg">
              {option.price === 0 ? 'Contact for Price' : `$${option.price}`}
            </p>
          </div>
        </div>
        {isSelected && (
          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <Check className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
      
      <p className="text-gray-400 text-sm mb-3">{config.description}</p>
      
      <div className="grid grid-cols-2 gap-1">
        {config.features.map((feature, index) => (
          <div key={index} className="flex items-center text-xs text-gray-300">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 flex-shrink-0"></span>
            <span className="truncate">{feature}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const PaymentView = ({ selectedOption, paymentLoading, beat }) => {
  const config = selectedOption ? FILE_TYPE_CONFIGS[selectedOption.file_type] : null;

  if (!selectedOption || !config) return null;

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 rounded-xl p-4">
        <h4 className="font-semibold text-white mb-2">Order Summary</h4>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-white">{config.title}</p>
            <p className="text-gray-400 text-sm">{beat.title}</p>
          </div>
          <p className="text-green-400 font-bold text-lg">
            ${selectedOption.price}
          </p>
        </div>
      </div>

      <div className="text-center p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
        <p className="text-blue-400 text-sm">
          You will be redirected to Paystack to complete your payment securely
        </p>
      </div>

      {paymentLoading && (
        <div className="text-center py-4">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin mx-auto mb-2" />
          <p className="text-gray-400">Processing payment...</p>
        </div>
      )}
    </div>
  );
};

const ActionButtons = ({ 
  showPayment, 
  onCancel, 
  onContinue, 
  onBack, 
  onPay, 
  selectedType, 
  paymentLoading 
}) => {
  if (!showPayment) {
    return (
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-3 px-4 border border-gray-700 text-gray-300 rounded-xl hover:border-gray-600 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          onClick={onContinue}
          disabled={!selectedType}
          className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          Continue to Payment
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={onBack}
        disabled={paymentLoading}
        className="flex-1 py-3 px-4 border border-gray-700 text-gray-300 rounded-xl hover:border-gray-600 transition-colors font-medium disabled:opacity-50"
      >
        Back
      </button>
      <button
        onClick={onPay}
        disabled={paymentLoading}
        className="flex-1 py-3 px-4 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
      >
        {paymentLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Pay Now'
        )}
      </button>
    </div>
  );
};

// Main component
export const FileTypeModal = ({ 
  beat, 
  onFileTypeSelect, 
  onClose,
  isLoading = false 
}) => {
  const [selectedType, setSelectedType] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const { fileOptions, loading: optionsLoading } = useFileOptions(beat);

  const selectedOption = useMemo(() => 
    fileOptions.find(opt => opt.file_type === selectedType),
    [fileOptions, selectedType]
  );

  const resetState = useCallback(() => {
    setSelectedType(null);
    setShowPayment(false);
    setPaymentLoading(false);
  }, []);

  const handleCloseModal = useCallback(() => {
    resetState();
    onClose?.();
  }, [resetState, onClose]);

  const handleBackToSelection = useCallback(() => {
    setShowPayment(false);
    setPaymentLoading(false);
  }, []);

  const handleContinueToPayment = useCallback(() => {
    if (!selectedType) return;
    setShowPayment(true);
  }, [selectedType]);

  const initiatePayment = useCallback(async () => {
    if (!selectedType || !beat?.id) return;
    
    setPaymentLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }

      const response = await fetch(`${API_BASE_URL}/api/purchases`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          item_type: 'beat',
          item_id: beat.id,
          file_type: selectedType,
          callback_url: `${window.location.origin}/purchase-success`
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Purchase failed');
      }

      if (data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        throw new Error('No payment URL received');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert(error.message || 'Payment failed. Please try again.');
      setPaymentLoading(false);
    }
  }, [selectedType, beat?.id]);

  // Don't render if beat is null
  if (!beat) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleCloseModal}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900 rounded-2xl border border-red-500/30 max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <ModalHeader 
            showPayment={showPayment}
            onBack={handleBackToSelection}
            onClose={handleCloseModal}
            beat={beat}
          />

          <div className="p-4 max-h-96 overflow-y-auto">
            {optionsLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
              </div>
            ) : !showPayment ? (
              <div className="space-y-3">
                {fileOptions.map((option) => (
                  <FileOptionCard
                    key={option.file_type}
                    option={option}
                    isSelected={selectedType === option.file_type}
                    onClick={() => setSelectedType(option.file_type)}
                  />
                ))}
              </div>
            ) : (
              <PaymentView 
                selectedOption={selectedOption}
                paymentLoading={paymentLoading}
                beat={beat}
              />
            )}
          </div>

          <div className="p-4 border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm">
            <ActionButtons
              showPayment={showPayment}
              onCancel={handleCloseModal}
              onContinue={handleContinueToPayment}
              onBack={handleBackToSelection}
              onPay={initiatePayment}
              selectedType={selectedType}
              paymentLoading={paymentLoading}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};