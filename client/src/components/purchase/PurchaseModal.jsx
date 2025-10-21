import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Tag, Check, XCircle, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDiscount } from '@/hooks/useDiscount';

export const PurchaseModal = ({ 
  item, 
  itemType, 
  isOpen, 
  onClose, 
  onPurchase 
}) => {
  const [selectedFileType, setSelectedFileType] = useState('mp3');
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  
  const { validateDiscount, validating, validationError, clearValidation } = useDiscount();

  const fileTypes = [
    { type: 'mp3', label: 'MP3 Lease', price: item.price },
    { type: 'wav', label: 'WAV Lease', price: item.price * 1.2 },
    { type: 'trackout', label: 'Trackouts', price: item.price * 1.5 }
  ];

  const selectedPrice = fileTypes.find(ft => ft.type === selectedFileType)?.price || item.price;
  const originalPrice = selectedPrice;
  const finalPrice = appliedDiscount ? appliedDiscount.final_price : originalPrice;

  const handleDiscountApply = async () => {
    if (!discountCode.trim()) return;
    
    const result = await validateDiscount(discountCode, itemType, item.id);
    if (result?.valid) {
      setAppliedDiscount(result.discount);
    }
  };

  const handleDiscountRemove = () => {
    setAppliedDiscount(null);
    setDiscountCode('');
    clearValidation();
  };

  const handlePurchase = () => {
    onPurchase({
      itemType,
      itemId: item.id,
      fileType: selectedFileType,
      discountCode: appliedDiscount?.code,
      amount: finalPrice
    });
  };

  useEffect(() => {
    if (!isOpen) {
      setSelectedFileType('mp3');
      setDiscountCode('');
      setAppliedDiscount(null);
      clearValidation();
    }
  }, [isOpen, clearValidation]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-red-700"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">Complete Purchase</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Item Info */}
        <div className="bg-gray-800 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <img 
              src={item.cover_url} 
              alt={item.title}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div>
              <h4 className="font-semibold text-white">{item.title}</h4>
              <p className="text-gray-400 text-sm">
                by {item.producer?.name || 'Baraju'}
              </p>
            </div>
          </div>
        </div>

        {/* File Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Select License Type:
          </label>
          <div className="space-y-2">
            {fileTypes.map(fileType => (
              <div
                key={fileType.type}
                onClick={() => setSelectedFileType(fileType.type)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedFileType === fileType.type
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">{fileType.label}</span>
                  <span className="text-green-400 font-bold">
                    ${fileType.price}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Discount Code */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Discount Code:
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={discountCode}
                onChange={(e) => {
                  setDiscountCode(e.target.value);
                  clearValidation();
                }}
                placeholder="Enter discount code"
                disabled={!!appliedDiscount}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-red-500 disabled:opacity-50"
              />
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
            
            {!appliedDiscount ? (
              <Button
                onClick={handleDiscountApply}
                disabled={!discountCode.trim() || validating}
                className="bg-red-600 hover:bg-red-700 whitespace-nowrap"
              >
                {validating ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  'Apply'
                )}
              </Button>
            ) : (
              <Button
                onClick={handleDiscountRemove}
                variant="outline"
                className="border-gray-600 text-gray-400 hover:bg-gray-800"
              >
                Remove
              </Button>
            )}
          </div>

          {/* Discount Validation Messages */}
          {validationError && (
            <div className="flex items-center gap-2 text-red-400 text-sm mt-2">
              <XCircle className="w-4 h-4" />
              {validationError}
            </div>
          )}

          {appliedDiscount && (
            <div className="flex items-center gap-2 text-green-400 text-sm mt-2">
              <Check className="w-4 h-4" />
              Discount applied! Saved ${appliedDiscount.savings.toFixed(2)}
            </div>
          )}
        </div>

        {/* Price Summary */}
        <div className="bg-gray-800 rounded-xl p-4 mb-6">
          <div className="space-y-2">
            <div className="flex justify-between text-gray-300">
              <span>Original Price:</span>
              <span>${originalPrice.toFixed(2)}</span>
            </div>
            
            {appliedDiscount && (
              <div className="flex justify-between text-green-400">
                <span>Discount ({appliedDiscount.percentage}%):</span>
                <span>-${appliedDiscount.savings.toFixed(2)}</span>
              </div>
            )}

            <div className="border-t border-gray-600 pt-2">
              <div className="flex justify-between text-white font-bold text-lg">
                <span>Total:</span>
                <span>${finalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

      
        <Button
          onClick={handlePurchase}
          className="w-full bg-red-600 hover:bg-red-700 py-3 text-lg font-semibold"
        >
          Purchase Now - ${finalPrice.toFixed(2)}
        </Button>
      </motion.div>
    </div>
  );
};