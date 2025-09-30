import { useState } from 'react';
import { aiService } from '../api/services/aiService';

export const useTextEnhancement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const enhanceText = async (text, reference) => {
    if (!text.trim()) {
      setError('Please provide text to enhance');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await aiService.textEnhancement.enhance({
        text: text.trim(),
        reference: reference || ''
      });

      if (response.success && response.data) {
        return response.data;
      } else {
        setError('Failed to enhance text');
        return null;
      }
    } catch (err) {
      setError(err.message || 'Failed to enhance text');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    enhanceText,
    isLoading,
    error,
    clearError: () => setError(null)
  };
};
