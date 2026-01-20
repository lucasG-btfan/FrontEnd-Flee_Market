import api from './base';
import { getCurrentClient } from './authService';

export const createOrder = async (orderData) => {
  try {
    console.log('📤 Creando orden...');

    const client = getCurrentClient();
    if (!client) {
      throw new Error('No se pudo obtener la información del cliente');
    }

    const orderPayload = {
      client_id_key: Number(client.id),
      total: Number(parseFloat(orderData.total).toFixed(2)),
      delivery_method: Number(orderData.delivery_method),
      status: Number(orderData.status || 1),
      address: String(orderData.address || ''),
      order_details: Array.isArray(orderData.order_details)
        ? orderData.order_details.map(item => ({
            product_id: Number(item.product_id),
            quantity: Number(item.quantity),
            price: Number(parseFloat(item.price).toFixed(2))
          }))
        : []
    };

    console.log('📦 Payload con ENUMS NUMÉRICOS:', {
      ...orderPayload,
      delivery_method_value: orderPayload.delivery_method,
      status_value: orderPayload.status,
      delivery_method_type: typeof orderPayload.delivery_method,
      status_type: typeof orderPayload.status
    });

    const response = await api.post('/orders', orderPayload);
    console.log('✅ Orden creada exitosamente:', response.data);
    return response.data;

  } catch (error) {
    console.error('❌ Error creando orden:', error);

    if (error.response?.data?.detail) {
      console.error('Errores de validación:', error.response.data.detail);
    }

    throw error;
  }
};

// Función para obtener órdenes del usuario
export const getMyOrders = async () => {
  try {
    const client = getCurrentClient();
    if (!client || client.id === undefined) {
      throw new Error('No autenticado');
    }

    console.log(`📋 Obteniendo órdenes para cliente ID: ${client.id}`);

    if (client.id === 0) {
      console.log('👑 Admin no tiene órdenes personales');
      return [];
    }

    const response = await api.get(`/orders/client/${client.id}`);
    return Array.isArray(response.data) ? response.data : [];

  } catch (error) {
    console.error('❌ Error obteniendo órdenes:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });

    // Por si el endpoint no existe
    if (error.response?.status === 404) {
      console.warn('⚠️ Endpoint /orders/client/{id} no encontrado');
      return [];
    }

    throw error;
  }
};

// Función para obtener todas las órdenes (solo el admin puede)
export const getAllOrders = async () => {
  try {
    console.log('📋 Obteniendo todas las órdenes (admin)...');
    const response = await api.get('/orders');

    return Array.isArray(response.data) ? response.data : [];

  } catch (error) {
    console.error('❌ Error obteniendo todas las órdenes:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });

    // Si no es admin (403)
    if (error.response?.status === 403) {
      console.log('⚠️ Usuario no es admin, no puede ver todas las órdenes');
      return [];
    }

    throw error;
  }
};

export const cancelOrder = async (orderId) => {
  try {
    console.log(`❌ Cancelando orden ${orderId}...`);
    
    const response = await api.put(`/orders/${orderId}/cancel`);
    
    if (response.data.success) {
      console.log(`✅ Orden ${orderId} cancelada exitosamente`);
      return response.data;
    } else {
      throw new Error('La respuesta del backend no indica éxito');
    }
    
  } catch (error) {
    console.error('❌ Error cancelando orden:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    
    let errorMessage = error.message;
    if (error.response?.status === 403) {
      errorMessage = 'No tienes permiso para cancelar esta orden';
    } else if (error.response?.status === 400) {
      errorMessage = error.response.data.detail || 'No se puede cancelar esta orden';
    } else if (error.response?.status === 404) {
      errorMessage = 'Orden no encontrada';
    }
    
    throw new Error(errorMessage);
  }
};

// Función para obtener los detalles de una orden
export const getOrderDetails = async (orderId) => {
  try {
    console.log(`📋 Obteniendo detalles de la orden ${orderId}...`);
    const response = await api.get(`/orders/${orderId}/details`);
    return response.data;

  } catch (error) {
    console.error('❌ Error obteniendo detalles de la orden:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });

    // Si no tiene permiso (403)
    if (error.response?.status === 403) {
      console.log('⚠️ Usuario no tiene permiso para ver los detalles de esta orden');
      return null;
    }

    throw error;
  }
};

// Función para marcar una orden como entregada
export const markAsDelivered = async (orderId) => {
  try {
    console.log(`📦 Marcando orden ${orderId} como entregada...`);
    const response = await api.put(`/orders/${orderId}/deliver`);
    return response.data;

  } catch (error) {
    console.error('❌ Error marcando orden como entregada:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });

    // Si no tiene permiso (403)
    if (error.response?.status === 403) {
      console.log('⚠️ Solo el admin puede marcar órdenes como entregadas');
      return null;
    }

    throw error;
  }
};

// Función para obtener el estado de una orden
export const getOrderStatus = async (orderId) => {
  try {
    console.log(`🔍 Obteniendo estado de la orden ${orderId}...`);
    const response = await api.get(`/orders/${orderId}/status`);
    return response.data;

  } catch (error) {
    console.error('❌ Error obteniendo estado de la orden:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });

    // Si no tiene permiso (403)
    if (error.response?.status === 403) {
      console.log('⚠️ Usuario no tiene permiso para ver el estado de esta orden');
      return null;
    }

    throw error;
  }
};

// Exportar como objeto
const orderService = {
  create: createOrder,
  getMyOrders,
  getAllOrders,
  cancelOrder,
  getOrderDetails,
  markAsDelivered,
  getOrderStatus
};

export default orderService;
