import { useState, useEffect, useCallback } from 'react';
import healthService from '../services/api/healthService';

export const useConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apiInfo, setApiInfo] = useState(null);

  const checkConnection = useCallback(async () => {
    try {
      console.log('🔍 Checking API connection...');
      setIsLoading(true);

      // Obtener información básica del backend
      const info = await healthService.getBackendInfo();
      setApiInfo(info);

      // Hacer health check
      const health = await healthService.check();
      setIsConnected(health.status === 'healthy');

    } catch (error) {
      console.error('API connection check failed:', error);
      setIsConnected(false);
      setApiInfo({
        service: "Ecommerce Backend API",
        status: "offline",
        version: "unknown",
        docs: "https://comercio-digital.onrender.com/docs"
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkConnection();
    // Verificar conexión periódicamente (cada minuto)
    const interval = setInterval(checkConnection, 60000);
    return () => clearInterval(interval);
  }, [checkConnection]);

  return {
    isConnected,
    isLoading,
    apiInfo,
    checkConnection
  };
};
