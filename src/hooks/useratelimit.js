import { useState, useCallback } from 'react';

export const useRateLimit = (options = {}) => {
  const [isLimited, setIsLimited] = useState(false);
  const [retryTime, setRetryTime] = useState(0);

  const executeWithRateLimit = useCallback(
    async (fn) => {
      if (isLimited) {
        throw new Error(`Rate limited. Please wait ${Math.ceil((retryTime - Date.now()) / 1000)} seconds.`);
      }

      try {
        const result = await fn();
        return result;
      } catch (error) {
        if (error.response?.status === 429) {
          const waitTime = error.response?.data?.retry_after || error.response?.headers['retry-after'] || 60;
          setIsLimited(true);
          setRetryTime(Date.now() + (waitTime * 1000));

          if (options.onRateLimit) {
            options.onRateLimit(waitTime);
          }

          // Auto-reset after wait time
          setTimeout(() => {
            setIsLimited(false);
            setRetryTime(0);
          }, waitTime * 1000);

          throw new Error(`Rate limited. Please wait ${waitTime} seconds.`);
        }
        throw error;
      }
    },
    [isLimited, retryTime, options]
  );

  return {
    executeWithRateLimit,
    isLimited,
    retryTime: isLimited ? Math.max(0, Math.ceil((retryTime - Date.now()) / 1000)) : 0,
  };
};
