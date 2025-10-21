import { useState, useCallback } from 'react';

const API_BASE_URL = "https://beatsmart.onrender.com";

export const useDiscount = () => {
  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const validateDiscount = useCallback(async (code, itemType, itemId) => {
    if (!code) return null;
    
    try {
      setValidating(true);
      setValidationError(null);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/discounts/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code,
          item_type: itemType,
          item_id: itemId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Validation failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      setValidationError(error.message);
      return null;
    } finally {
      setValidating(false);
    }
  }, []);

  const clearValidation = useCallback(() => {
    setValidationError(null);
  }, []);

  return {
    validateDiscount,
    validating,
    validationError,
    clearValidation
  };
};