import api from './base';
import { extractData } from './base';

export const clientService = {
  getMyProfile: async () => {
    try {
      const response = await api.get('/clients/me');
      return extractData(response);
    } catch (error) {
      console.error('❌ Error fetching profile:', error.response?.data || error.message);
      throw error;
    }
  },

  // Obtener todos los clientes (admin)
  getAll: async (page = 1, limit = 10) => {
    try {
      const skip = (page - 1) * limit;
      
      console.log(`📞 [clientService] Llamando GET /clients con:`, {
        skip,
        limit,
        page
      });
      
      const response = await api.get('/clients', {
        params: { skip, limit }
      });
      
      console.log('✅ [clientService] Response status:', response.status);
      console.log('✅ [clientService] Response data:', response.data);
      
      const data = extractData(response);
      
      const result = {
        items: data.items || [],
        total: data.total || 0,
        page: data.page || page,
        size: data.size || limit,
        pages: data.pages || 1
      };
      
      console.log('✅ [clientService] Datos procesados:', result);
      return result;
      
    } catch (error) {
      console.error('❌ [clientService] Error en getAll:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 422) {
        console.error('🔴 Error 422 - Validación fallida:', error.response.data);
      }
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw error;
      }
      
      return {
        items: [],
        total: 0,
        page: 1,
        size: limit,
        pages: 1
      };
    }
  },

  // Buscar clientes
  search: async (query, page = 1, limit = 10) => {
    try {
      const skip = (page - 1) * limit;
      
      console.log(`🔍 [clientService] Buscando clientes:`, { query, skip, limit });
      
      const response = await api.get('/clients/search', {
        params: { q: query, skip, limit }
      });
      
      const data = extractData(response);
      
      return {
        items: data.items || [],
        total: data.total || 0,
        page: data.page || page,
        size: data.size || limit,
        pages: data.pages || 1
      };
      
    } catch (error) {
      console.error('❌ [clientService] Error en search:', error);
      
      // Fallback: buscar localmente si el backend falla
      try {
        console.log('⚠️ Intentando fallback local para búsqueda...');
        const allClients = await clientService.getAll(1, 1000);
        
        const filtered = allClients.items.filter(client => {
          const searchStr = query.toLowerCase();
          return (
            (client.name && client.name.toLowerCase().includes(searchStr)) ||
            (client.lastname && client.lastname.toLowerCase().includes(searchStr)) ||
            (client.email && client.email.toLowerCase().includes(searchStr)) ||
            (client.phone && client.phone.toLowerCase().includes(searchStr))
          );
        });
        
        const start = (page - 1) * limit;
        const paginated = filtered.slice(start, start + limit);
        
        return {
          items: paginated,
          total: filtered.length,
          page,
          size: limit,
          pages: Math.ceil(filtered.length / limit)
        };
      } catch (fallbackError) {
        console.error('❌ Fallback también falló:', fallbackError);
        return {
          items: [],
          total: 0,
          page: 1,
          size: limit,
          pages: 1
        };
      }
    }
  },

  // Obtener cliente por ID
  getById: async (id) => {
    try {
      console.log(`📞 [clientService] Obteniendo cliente ID: ${id}`);
      
      const response = await api.get(`/clients/${id}`);
      const client = extractData(response);
      
      // Normalizar ID
      return {
        ...client,
        id: client.id_key || client.id
      };
      
    } catch (error) {
      console.error(`❌ [clientService] Error fetching client ${id}:`, error);
      throw error;
    }
  },

  create: async (clientData) => {
    try {
      console.log('📞 [clientService] Creando cliente:', clientData);
      
      const response = await api.post('/clients', clientData);
      return extractData(response);
      
    } catch (error) {
      console.error('❌ [clientService] Error creating client:', error);
      throw error;
    }
  },

  // Actualizar cliente
  update: async (id, clientData) => {
    try {
      console.log(`📞 [clientService] Actualizando cliente ${id}:`, clientData);
      
      const response = await api.put(`/clients/${id}`, clientData);
      return extractData(response);
      
    } catch (error) {
      console.error(`❌ [clientService] Error updating client ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      console.log(`📞 [clientService] Eliminando cliente ${id}`);
      
      const response = await api.delete(`/clients/${id}`);
      const result = extractData(response);
      
      console.log(`✅ [clientService] Cliente ${id} eliminado:`, result);
      return result;
      
    } catch (error) {
      console.error(`❌ [clientService] Error deleting client ${id}:`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      // Propagar el error con más información
      const errorMessage = error.response?.data?.detail || error.message || 'Error desconocido';
      throw new Error(`Error al eliminar cliente: ${errorMessage}`);
    }
  },

  // Test endpoint
  test: async () => {
    try {
      console.log('📞 [clientService] Testing /clients/test');
      
      const response = await api.get('/clients/test');
      return extractData(response);
      
    } catch (error) {
      console.error('❌ [clientService] Error testing clients endpoint:', error);
      throw error;
    }
  },

  // Debug auth endpoint
  debugAuth: async () => {
    try {
      console.log('📞 [clientService] Testing /clients/debug-auth');
      
      const response = await api.get('/clients/debug-auth');
      const data = extractData(response);
      
      console.log('✅ Debug auth response:', data);
      return data;
      
    } catch (error) {
      console.error('❌ [clientService] Error in debug auth:', error);
      return null;
    }
  }
};

export default clientService;