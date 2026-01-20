import api, { configureAuthToken, extractData, handleApiError } from './base';

const authService = {
 
  login: async (email, password) => {
    try {
      console.log('🔐 Intentando Login para:', email);

      const response = await api.post('/auth/login', {
        email,
        password
      });

      console.log('✅ Login exitoso:', response.data);

      if (response.data.access_token && response.data.client) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('client', JSON.stringify(response.data.client));
        configureAuthToken(response.data.access_token);
        console.log('🔑 Token guardado en localStorage:', response.data.access_token);
        console.log('👤 Datos del cliente guardados en localStorage:', response.data.client);
      } else {
        console.error('❌ La respuesta del backend no contiene access_token o client');
        throw new Error('Respuesta inválida del servidor');
      }

      return response.data;

    } catch (error) {
      console.error('❌ Error en login:', error.response?.data || error.message);

      if (error.response?.status === 401) {
        throw new Error('Credenciales inválidas');
      } else if (error.response?.status === 404) {
        throw new Error('Endpoint no encontrado. Verifica la URL.');
      } else {
        throw new Error(error.response?.data?.detail || 'Error de conexión');
      }
    }
  },

  register: async (userData) => {
    try {
      console.log('📝 Intentando registro para:', userData.email);

      const response = await api.post('/auth/register', userData);

      console.log('✅ Registro exitoso:', response.data);

      if (response.data.access_token && response.data.client) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('client', JSON.stringify(response.data.client));
        configureAuthToken(response.data.access_token);
      }

      return response.data;

    } catch (error) {
      console.error('❌ Error en registro:', error.response?.data || error.message);

      if (error.response?.status === 400) {
        throw new Error(error.response.data.detail || 'Datos inválidos');
      } else {
        throw new Error(error.response?.data?.detail || 'Error de conexión');
      }
    }
  },

  logout: () => {
    console.log('🚪 Cerrando sesión...');
    localStorage.removeItem('token');
    localStorage.removeItem('client');
    delete api.defaults.headers.common['Authorization'];
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  getCurrentClient: () => {
    try {
      const clientStr = localStorage.getItem('client');
      return clientStr ? JSON.parse(clientStr) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token && token !== 'undefined' && token !== 'null';
  },

  isAdmin: () => {
    const client = authService.getCurrentClient();
    return client && client.id === 0;
  },

  // Método para probar la conexión
  testConnection: async () => {
    try {
      const response = await api.get('/health');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Verificar token en el servidor
  verifyToken: async () => {
    try {
      const response = await api.get('/auth/verify');
      return response.data;
    } catch (error) {
      console.error('Error verificando token:', error);
      throw error;
    }
  }
};

// Exportar funciones individualmente
export const login = authService.login;
export const register = authService.register;
export const logout = authService.logout;
export const getCurrentClient = authService.getCurrentClient;
export const isAuthenticated = authService.isAuthenticated;
export const testConnection = authService.testConnection;
export const verifyToken = authService.verifyToken;

// Función para setAuthToken que combina ambas acciones
export const setAuthToken = (token) => {
  localStorage.setItem('token', token);
  configureAuthToken(token);
};

export default authService;
