import { useState, useEffect } from 'react';
import { 
  handleApiError, 
  isRateLimitError, 
  isNotFoundError 
} from '../services/api/base';

export const useApi = (apiCall, dependencies = [], options = {}) => {
  const { enabled = true, onError } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiCall();
        if (mounted) {
          setData(result);
        }
      } catch (err) {
        if (mounted) {
          const errorMessage = handleApiError(err);
          setError(errorMessage);
          
          // Call custom error handler if provided
          if (onError) {
            onError(err, errorMessage);
          }
          
          // Log specific error types
          if (isRateLimitError(err)) {
            console.warn('Rate limit hit for API call');
          } else if (isNotFoundError(err)) {
            console.warn('Resource not found for API call');
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [...dependencies, enabled]);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      if (onError) {
        onError(err, errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
};