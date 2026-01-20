import { useState, useEffect } from 'react';
import  healthService  from '../services/api/healthService';

export const useHealth = (interval = 30000) => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkHealth = async () => {
    try {
      setLoading(true);
      const data = await healthService.check();
      setHealth(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();

    const intervalId = setInterval(checkHealth, interval);

    return () => clearInterval(intervalId);
  }, [interval]);

  return { health, loading, error, refetch: checkHealth };
};