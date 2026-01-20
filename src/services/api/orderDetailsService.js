import api from './base';

export const orderDetailService = {
  getAll: async (skip = 0, limit = 100) => {
    const response = await api.get('/order_details', {
      params: { skip, limit }
    });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/order_details/${id}`);
    return response.data;
  },

create: async (orderDetailData) => {
  try {
    console.log('🔍 DEPURANDO orderDetailService.create()');
    console.log('📦 Datos a enviar:', orderDetailData);

    const response = await api.post('/order_details', orderDetailData);
    console.log('✅ Order detail creado:', response.data);
    return response.data;

  } catch (error) {
    console.error('💥 Error order detail:', error);
    throw error;
  }
},


  update: async (id, orderDetailData) => {
    const response = await api.put(`/order_details/${id}`, orderDetailData);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/order_details/${id}`);
  }
};