import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import  orderService  from '../../services/api/orderService';
import LoadingSpinner from '../common/LoadingSpinner';
import './OrderList.css';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    skip: 0,
    limit: 10,
    total: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, [pagination.skip]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAll(pagination.skip, pagination.limit);
      let ordersArray = [];

      if (response.data && Array.isArray(response.data)) {
        ordersArray = response.data;
      } else if (response.orders) {
        ordersArray = response.orders;
      } else if (response.items) {
        ordersArray = response.items;
      } else if (Array.isArray(response)) {
        ordersArray = response;
      }

      const total = response.total || ordersArray.length || 0;

      setOrders(ordersArray);
      setPagination(prev => ({ ...prev, total }));
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('No se pudieron cargar las órdenes');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getDeliveryMethodText = (method) => {
    if (!method) return 'No especificado';
    
    const methodStr = String(method).toUpperCase();
    if (methodStr.includes('DRIVE_THRU')) return 'Drive Thru';
    if (methodStr.includes('HOME_DELIVERY')) return 'Entrega a Domicilio';
    if (methodStr.includes('ON_HAND')) return 'Recoger en Tienda';
    return method;
  };

  <div className="orders-page__info-row">
    <span className="orders-page__label">Método de Entrega:</span>
    <span className="orders-page__value">
      {getDeliveryMethodText(order.delivery_method)} 
    </span>
  </div>
  {order.address && (
    <div className="orders-page__info-row">
      <span className="orders-page__label">Dirección:</span>
      <span className="orders-page__value orders-page__address">
        {order.address} 
      </span>
    </div>
  )}

  const getStatusText = (status) => {
    const statuses = {
      1: 'Pending',
      2: 'In Progress',
      3: 'Delivered',
      4: 'Cancelled',
      'PENDING': 'Pending',
      'IN_PROGRESS': 'In Progress',
      'DELIVERED': 'Delivered',
      'CANCELED': 'Cancelled'
    };
    return statuses[status] || status;
  };

  const getStatusClass = (status) => {
    const statusStr = String(status).toUpperCase();
    if (statusStr.includes('PENDING')) return 'status-pending';
    if (statusStr.includes('PROGRESS')) return 'status-in-progress';
    if (statusStr.includes('DELIVERED')) return 'status-delivered';
    if (statusStr.includes('CANCEL')) return 'status-cancelled';
    return '';
  };

  const handlePageChange = (newSkip) => {
    setPagination(prev => ({ ...prev, skip: newSkip }));
  };

  if (loading && orders.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="order-list-container">
      <div className="order-list-header">
        <h2>📋 Lista de Órdenes</h2>
        <button onClick={fetchOrders} className="btn-refresh">
          🔄 Actualizar
        </button>
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="no-orders">
          <p>No hay órdenes registradas</p>
        </div>
      ) : (
        <>
          <div className="order-list">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Método de Entrega</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id || order.id_key}>
                    <td>#{order.id || order.id_key}</td>
                    <td>{new Date(order.date || order.created_at).toLocaleDateString()}</td>
                    <td>{order.client_name || `Cliente #${order.client_id || order.client_id_key}`}</td>
                    <td>${parseFloat(order.total || 0).toFixed(2)}</td>
                    <td>{getDeliveryMethodText(order.delivery_method)}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-view-details"
                        onClick={() => console.log('Ver detalles de orden:', order)}
                      >
                      </button>
                      {order.bill_id && (
                        <button
                          className="btn-view-bill"
                          onClick={() => navigate(`/bills/order/${order.id}`)}
                        >
                          📄 Ver Factura
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="pagination">
            <button
              onClick={() => handlePageChange(pagination.skip - pagination.limit)}
              disabled={pagination.skip === 0}
              className="btn-pagination"
            >
              ◀️ Anterior
            </button>

            <span className="page-info">
              Página {Math.floor(pagination.skip / pagination.limit) + 1} de {Math.ceil(pagination.total / pagination.limit)}
            </span>

            <button
              onClick={() => handlePageChange(pagination.skip + pagination.limit)}
              disabled={pagination.skip + pagination.limit >= pagination.total}
              className="btn-pagination"
            >
              Siguiente ▶️
            </button>
          </div>

          <div className="order-stats">
            <p>Mostrando {orders.length} de {pagination.total} órdenes</p>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderList;
