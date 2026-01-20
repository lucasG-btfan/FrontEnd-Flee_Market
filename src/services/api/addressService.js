import api from './base';
import { getCurrentClient } from './authService';

export const addressService = {
  getByClientId: async (clientId) => {
    try {
      const response = await api.get(`/addresses/client/${clientId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching addresses for client ${clientId}:`, error);
      throw error;
    }
  },

  getStoreAddress: async () => {
    try {
      const response = await api.get('/addresses/store');
      return response.data;
    } catch (error) {
      console.error('Error fetching store address:', error);
      return {
        id_key: 1,
        client_id_key: 0,
        street: 'Av. Principal #123, Local Comercio',
        city: 'Buenos Aires',
        state: 'CABA',
        zip_code: 'C1001',
        address_type: 'store'
      };
    }
  },

  create: async (addressData) => {
    try {
      const response = await api.post('/addresses', addressData);
      return response.data;
    } catch (error) {
      console.error('Error creating address:', error);
      throw error;
    }
  },

  update: async (id, addressData) => {
    try {
      const response = await api.put(`/addresses/${id}`, addressData);
      return response.data;
    } catch (error) {
      console.error(`Error updating address ${id}:`, error);
      throw error;
    }
  },

  updateStoreAddress: async (addressData) => {
    try {
      const response = await api.put('/addresses/store', addressData);
      return response.data;
    } catch (error) {
      console.error('Error updating store address:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await api.delete(`/addresses/${id}`);
    } catch (error) {
      console.error(`Error deleting address ${id}:`, error);
      throw error;
    }
  },

  getMyAddresses: async () => {
    try {
      const client = getCurrentClient();
      if (!client?.id) {
        throw new Error('No hay cliente autenticado');
      }
      return await addressService.getByClientId(client.id);
    } catch (error) {
      console.error('Error fetching my addresses:', error);
      throw error;
    }
  }
};

export default addressService;