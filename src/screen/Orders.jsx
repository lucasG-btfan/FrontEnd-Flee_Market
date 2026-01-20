import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import orderService from '../services/api/orderService';
import { getCurrentClient } from '../services/api/authService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FaPlus, FaEye, FaTrash, FaFileInvoice, FaExclamationTriangle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import '../styles/Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [client, setClient] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadClientAndOrders();
  }, []);

  const loadClientAndOrders = async () => {
    try {
      setLoading(true);
      setError('');

      // 1. Obtener cliente actual
      const currentClient = getCurrentClient();
      console.log('🔍 Cliente actual:', currentClient);

      if (!currentClient || currentClient.id === undefined) {
        setError('Por favor inicia sesión para ver tus órdenes');
        setLoading(false);
        return;
      }

      setClient(currentClient);

      // 2. Si es admin, mostrar mensaje especial
      if (currentClient.id === 0) {
        console.log('👑 Admin - no tiene órdenes personales');
        setOrders([]);
        setError('Los administradores no tienen órdenes personales. Usa el panel de administración para ver todas las órdenes.');
        return;
      }

      // 3. Cargar órdenes del cliente
      console.log(`🔄 Cargando órdenes para cliente ID: ${currentClient.id}`);
      const data = await orderService.getMyOrders();
      console.log('✅ Órdenes recibidas:', data);

      setOrders(Array.isArray(data) ? data : []);

    } catch (err) {
      console.error('❌ Error cargando órdenes:', err);
      setError(err.message || 'Error al cargar las órdenes');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewBill = (orderId, billId) => {
    if (billId) {
      navigate(`/bills/${billId}`);
    } else {
      navigate(`/orders/${orderId}/bill`);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm(
      '¿Estás seguro de cancelar esta orden?\n\n' +
      '⚠️ Esta acción no se puede deshacer.\n' +
      '✅ El stock de productos será restaurado automáticamente.'
    )) return;

    try {
      console.log(`📤 Intentando cancelar orden ${orderId}...`);
      const result = await orderService.cancelOrder(orderId);
      console.log('✅ Respuesta de cancelación:', result);

      // Actualizar estado local
      setOrders(prev => prev.map(order =>
        order.id_key === orderId
          ? {
              ...order,
              status: 4,
              status_text: 'Cancelado',
              cancelled_at: result.cancelled_at || new Date().toISOString()
            }
          : order
      ));

      // Mostrar mensaje de éxito con detalles
      let successMessage = `✅ Orden #${orderId} cancelada exitosamente.`;
      if (result.stock_restored > 0) {
        successMessage += ` Stock restaurado para ${result.stock_restored} productos.`;
      }
      if (result.remaining_stock_issues > 0) {
        successMessage += ` (${result.remaining_stock_issues} productos no pudieron restaurar stock)`;
      }

      alert(successMessage);

    } catch (err) {
      console.error('❌ Error cancelando orden:', err);

      // Mensajes de error específicos
      let errorMessage = 'Error cancelando orden';

      if (err.message.includes('No tienes permiso')) {
        errorMessage = 'No tienes permiso para cancelar esta orden';
      } else if (err.message.includes('ya está cancelada')) {
        errorMessage = 'Esta orden ya está cancelada';
      } else if (err.message.includes('ya entregada')) {
        errorMessage = 'No se puede cancelar una orden ya entregada';
      } else if (err.message.includes('tiempo para cancelar')) {
        errorMessage = 'El tiempo para cancelar esta orden ha expirado (30 minutos)';
      } else if (err.message.includes('Orden no encontrada')) {
        errorMessage = 'La orden no fue encontrada';
      } else {
        errorMessage = err.message || 'Error desconocido';
      }

      alert(`❌ ${errorMessage}`);
    }
  };

  const canCancelOrder = (orderStatus) => {
    if (orderStatus === 'CANCELED' || orderStatus === 4) return false;
    if (orderStatus === 'DELIVERED' || orderStatus === 3) return false;
    return true;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  const getStatusText = (status) => {
    if (typeof status === 'number') {
      switch(status) {
        case 1: return 'Pendiente';
        case 2: return 'En Proceso';
        case 3: return 'Entregado';
        case 4: return 'Cancelado';
        default: return `Estado ${status}`;
      }
    }
    return status;
  };

  const getStatusBadgeClass = (status) => {
    const statusNum = typeof status === 'string' ?
      (status.includes('PENDING') ? 1 :
      status.includes('PROGRESS') ? 2 :
      status.includes('DELIVERED') ? 3 : 4) : status;

    switch(statusNum) {
      case 1: return 'status-pending';
      case 2: return 'status-progress';
      case 3: return 'status-delivered';
      case 4: return 'status-cancelled';
      default: return 'status-unknown';
    }
  };

  const getDeliveryMethodText = (method) => {
    if (!method) return 'No especificado';

    const methodNum = Number(method);
    switch(methodNum) {
      case 1: return 'Drive Thru';
      case 2: return 'Recoger en Tienda';
      case 3: return 'Entrega a Domicilio';
      default: return `Método ${method}`;
    }
  };

  if (loading) {
    return (
      <div className="orders-page">
        <div className="orders-page__header">
          <h1>📋 Mis Órdenes</h1>
        </div>
        <div className="orders-page__loading">
          <LoadingSpinner />
          <p>Cargando tus órdenes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-page__header">
        <h1>📋 Mis Órdenes</h1>
        {client && client.id !== 0 && (
          <Link to="/cart" className="orders-page__new-order-btn">
            <FaPlus /> Nueva Orden
          </Link>
        )}
      </div>

      {client && client.id === 0 && (
        <div className="orders-page__admin-notice">
          <FaExclamationTriangle />
          <p>
            <strong>Eres administrador.</strong> Los administradores no tienen órdenes personales.
            Usa el <Link to="/admin">Panel de Administración</Link> para ver y gestionar todas las órdenes.
          </p>
        </div>
      )}

      {error && client?.id !== 0 && (
        <div className={`orders-page__message ${error.includes('Error') ? 'orders-page__error' : 'orders-page__info'}`}>
          {error}
          <button onClick={loadClientAndOrders} className="orders-page__retry-btn">
            Reintentar
          </button>
        </div>
      )}

      {orders.length === 0 && client && client.id !== 0 ? (
        <div className="orders-page__no-orders">
          <div className="no-orders-icon">🛒</div>
          <h3>No tienes órdenes realizadas</h3>
          <p>¡Empieza a comprar y verás tus órdenes aquí!</p>
          <div className="no-orders-actions">
            <Link to="/products" className="orders-page__shop-btn">
              Ver Productos
            </Link>
            <Link to="/cart" className="orders-page__cart-btn">
              <FaPlus /> Ir al Carrito
            </Link>
          </div>
        </div>
      ) : (
        <div className="orders-page__list">
          {orders.map((order) => (
            <div key={order.id_key} className="orders-page__card">
              <div className="orders-page__card-header">
                <div className="orders-page__order-id">
                  <strong>Orden #</strong> {order.id_key}
                </div>
                <span className={`orders-page__status-badge ${getStatusBadgeClass(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>

              <div className="orders-page__card-info">
                <div className="orders-page__info-row">
                  <span className="orders-page__label">Fecha:</span>
                  <span className="orders-page__value">
                    {formatDate(order.date || order.created_at)}
                  </span>
                </div>
                <div className="orders-page__info-row">
                  <span className="orders-page__label">Total:</span>
                  <span className="orders-page__value orders-page__total">
                    ${order.total ? order.total.toFixed(2) : '0.00'}
                  </span>
                </div>
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
              </div>

              <div className="orders-page__actions">
                <button
                  className="orders-page__btn orders-page__btn-view"
                  onClick={() => handleViewBill(order.id_key, order.bill_id)}
                  title="Ver factura"
                >
                  <FaFileInvoice /> Factura
                </button>

                {canCancelOrder(order.status) && (
                  <button
                    className="orders-page__btn orders-page__btn-cancel"
                    onClick={() => handleCancelOrder(order.id_key)}
                    title="Cancelar orden"
                  >
                    <FaTrash /> Cancelar
                  </button>
                )}

                <button
                  className="orders-page__btn orders-page__btn-details"
                  onClick={() => navigate(`/orders/${order.id_key}/details`)}
                  title="Ver detalles y calificar"
                >
                  <FaEye /> {order.status === 3 || order.status === 'DELIVERED' ? 'Ver/Calificar' : 'Detalles'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {orders.length > 0 && (
        <div className="orders-page__footer">
          <p>Mostrando {orders.length} órdenes</p>
          <button onClick={loadClientAndOrders} className="orders-page__refresh-btn">
            Actualizar Lista
          </button>
        </div>
      )}
    </div>
  );
};

export default Orders;
