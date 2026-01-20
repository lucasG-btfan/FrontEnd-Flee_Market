import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 
                'https://comercio-digital.onrender.com';

const rootApi = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

const healthService = {
  /**
   * Health check - prueba endpoints en la raíz
   */
  check: async () => {
    try {
      console.log('🏥 Checking API health at:', baseURL);
      
      const endpoints = [
        '/health',
        '/health_check', 
        '/'
      ];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`🔍 Trying: ${baseURL}${endpoint}`);
          const response = await rootApi.get(endpoint);
          console.log(`✅ ${endpoint}: OK (${response.status})`);
          
          return {
            status: 'healthy',
            message: 'API is responding correctly',
            endpoint: endpoint,
            baseURL: baseURL,
            data: response.data,
            timestamp: new Date().toISOString()
          };
        } catch (error) {
          console.log(`⚠️ ${endpoint} failed:`, error.message);
        }
      }
      
      return {
        status: 'unhealthy',
        message: 'No API endpoints responded',
        baseURL: baseURL,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('🏥 Health check failed:', error.message);
      return {
        status: 'unhealthy',
        message: 'Health check failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  },

  /**
   * Ping rápido a la API
   */
  ping: async () => {
    try {
      const response = await rootApi.get('/', { timeout: 3000 });
      return response.status === 200;
    } catch {
      return false;
    }
  },

  /**
   * Obtiene información de la API
   */
  getBackendInfo: async () => {
    try {
      console.log('📊 Getting backend info from:', baseURL);
      const response = await rootApi.get('/');
      console.log('✅ Backend info received:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error getting backend info:', error.message);
      return {
        service: "Ecommerce Backend API",
        status: "offline",
        version: "unknown",
        error: error.message,
        docs: `${baseURL}/docs`
      };
    }
  },

  /**
   * Alias para compatibilidad
   */
  getApiInfo: async () => {
    return healthService.getBackendInfo();
  }
};

export default healthService;