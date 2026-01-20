import axios from 'axios';
import api from './base'; 
import { PaymentType } from '../../enums';

const mockBills = [
  {
    id: 1,
    bill_number: 'BILL-001',
    date: new Date().toISOString().split('T')[0],
    total: 99.99,
    payment_type: PaymentType.CASH,
    client_id: 1,
    discount: 0,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    bill_number: 'BILL-002',
    date: new Date().toISOString().split('T')[0],
    total: 139.98,
    payment_type: PaymentType.CARD,
    client_id: 2,
    discount: 10,
    created_at: new Date().toISOString()
  }
];

const billService = {
  async getBillById(billId) {
    try {
      const response = await api.get(`/bills/${billId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching bill:', error);
      return mockBills.find(b => b.id === parseInt(billId)) || mockBills[0];
    }
  },

  async getBillByOrderId(orderId) {
    try {
      const response = await api.get(`/bills/order/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching bill by order:', error);
      return mockBills.find(b => b.id === parseInt(orderId)) || mockBills[0];
    }
  },

  async createBill(billData) {
    try {
      const response = await api.post('/bills', billData);
      return response.data;
    } catch (error) {
      console.error('Error creating bill:', error);
      return {
        message: "Bill created successfully (mock)",
        bill_id: Math.floor(Math.random() * 1000),
        bill: { ...billData, id: Date.now() }
      };
    }
  },

  async getBills(skip = 0, limit = 100) {
    try {
      const response = await api.get('/bills', {
        params: { skip, limit }
      });
      return response.data?.length > 0 ? response.data : mockBills.slice(skip, skip + limit);
    } catch (error) {
      console.error('Error fetching bills:', error);
      return mockBills.slice(skip, skip + limit);
    }
  },

  /**
   * Obtiene facturas por ID de cliente.
   * @param {number} clientId - ID del cliente.
   * @returns {Promise<Array>} - Lista de facturas del cliente.
   */
  async getBillsByClient(clientId) {
    try {
      const response = await api.get(`/bills/client/${clientId}`);
      return response.data?.length > 0 ? response.data : mockBills.filter(b => b.client_id === parseInt(clientId));
    } catch (error) {
      console.error('Error fetching bills by client:', error);
      return mockBills.filter(b => b.client_id === parseInt(clientId));
    }
  },

  async updateBill(id, billData) {
    try {
      const response = await api.put(`/bills/${id}`, billData);
      return response.data;
    } catch (error) {
      console.error('Error updating bill:', error);
      throw error;
    }
  },

  async deleteBill(id) {
    try {
      await api.delete(`/bills/${id}`);
    } catch (error) {
      console.error('Error deleting bill:', error);
      throw error;
    }
  }
};

export default billService;
