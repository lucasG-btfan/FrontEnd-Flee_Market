import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://comercio-digital.onrender.com/api/v1';
console.log('🔗 API URL configurada:', API_URL);

const isTokenValid = () => {
  const token = localStorage.getItem('token');
  if (!token || token === 'undefined' || token === 'null') {
    return false;
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    try {
      const payload = JSON.parse(atob(parts[1]));
      const exp = payload.exp * 1000;
      return exp > Date.now();
    } catch {
      return true;
    }
  } catch {
    return false;
  }
};

const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('client');
};

const getToken = () => {
  return localStorage.getItem('token');
};

const api = axios.create({
  baseURL: API_URL,  
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false,
});

// Interceptor de requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('🔧 [axios] Request a:', config.url);

    if (token && token !== 'undefined' && token !== 'null') {
      if (isTokenValid()) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ [axios] Token añadido a la solicitud');
      } else {
        console.warn('⚠️ [axios] Token inválido o expirado');
        localStorage.removeItem('token');
        localStorage.removeItem('client');
      }
    }
    return config;
  },
  (error) => {
    console.error('❌ [axios] Request error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`✅ [axios] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ [axios] Error ${error.response?.status}`, {
      url: error.config?.url,
      method: error.config?.method,
      headers: error.config?.headers,
      data: error.response?.data
    });
    
    return Promise.reject(error);
  }
);

export const configureAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

export const extractData = (response) => response?.data || null;

export const handleApiError = (error) => {
  if (error.response) {
    return {
      status: error.response.status,
      message: error.response.data?.detail || 'Error del servidor',
      data: error.response.data
    };
  }
  return {
    status: 0,
    message: 'Error de conexión',
    data: null
  };
};

export const isNotFoundError = (error) => error.response?.status === 404;
export const isRateLimitError = (error) => error.response?.status === 429;
export const isUnauthorizedError = (error) => error.response?.status === 401;

export default api;
