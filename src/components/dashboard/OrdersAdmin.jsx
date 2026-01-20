import React, { useState, useEffect } from 'react';
import orderService from '../../services/api/orderService';
import { getCurrentClient } from '../../services/api/authService';
import LoadingSpinner from '../common/LoadingSpinner';
import './OrdersAdmin.css';

// Importar iconos de React Icons
import {
  IoEyeOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoRefreshOutline,
  IoTimeOutline,
  IoCheckmarkDoneOutline,
  IoAlertCircleOutline,
  IoCalendarOutline,
  IoReceiptOutline,
  IoPersonOutline,
  IoCashOutline,
  IoArrowBackOutline,
  IoArrowForwardOutline,
  IoCloseOutline,
  IoEllipsisHorizontal,
  IoDownloadOutline,
  IoPrintOutline,
  IoSearchOutline,
  IoFilterOutline
} from 'react-icons/io5';

import {
  FiTruck,
  FiHome,
  FiPackage,
  FiShoppingBag,
  FiUser,
  FiDollarSign,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiRefreshCw
} from 'react-icons/fi';

import {
  BsThreeDotsVertical,
  BsShop,
  BsHouseDoorFill
} from 'react-icons/bs';

import {
  MdDeliveryDining,
  MdStore,
  MdDirectionsCar
} from 'react-icons/md';

const OrdersAdmin = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [client, setClient] = useState(null);
  const [processingDelivery, setProcessingDelivery] = useState({});
  const [processingCancel, setProcessingCancel] = useState({});

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);

      const currentClient = getCurrentClient();
      if (!currentClient) {
        setError('No autenticado');
        setLoading(false);
        return;
      }

      setClient(currentClient);

      if (currentClient.id !== 0) {
        setError('Solo los administradores pueden ver esta página');
        setLoading(false);
        return;
      }

      console.log('👑 Cargando todas las órdenes (admin)...');

      const data = await orderService.getAllOrders();
      console.log('✅ Órdenes recibidas (admin):', data);

      setOrders(Array.isArray(data) ? data : []);
      setError(null);

    } catch (err) {
      console.error('❌ Error cargando órdenes (admin):', err);
      setError('Error al cargar las órdenes: ' + (err.message || 'Desconocido'));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsDelivered = async (orderId) => {
    if (!window.confirm('¿Marcar esta orden como entregada? Esta acción permitirá al cliente calificar los productos.')) {
      return;
    }

    try {
      setProcessingDelivery(prev => ({ ...prev, [orderId]: true }));

      console.log(`📤 Enviando PUT /orders/${orderId}/deliver`);
      const response = await orderService.markAsDelivered(orderId);
      console.log('✅ Respuesta del backend:', response);

      if (response.success) {
        setOrders(prev => prev.map(order =>
          order.id_key === orderId
            ? {
                ...order,
                status: 3,
                status_text: 'Entregado',
                delivered_date: response.delivered_date || new Date().toISOString()
              }
            : order
        ));

        alert(`✅ Orden #${orderId} marcada como entregada exitosamente.\n\nEl cliente ahora podrá calificar los productos.`);
      } else {
        alert('❌ Error: La respuesta del backend no indica éxito');
      }

    } catch (err) {
      console.error('❌ Error marcando orden como entregada:', err);

      let errorMessage = 'Error al marcar como entregada';
      if (err.response) {
        console.error('Detalles de la respuesta:', err.response.data);
        errorMessage += `: ${err.response.data.detail || err.response.statusText}`;
      } else if (err.request) {
        console.error('No hubo respuesta del servidor');
        errorMessage += ': No se recibió respuesta del servidor';
      } else {
        errorMessage += `: ${err.message}`;
      }

      alert(errorMessage);
    } finally {
      setProcessingDelivery(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('¿Estás seguro de cancelar esta orden?\n\n⚠️ Esta acción no se puede deshacer. Se restaurará el stock automáticamente.')) {
      return;
    }

    try {
      setProcessingCancel(prev => ({ ...prev, [orderId]: true }));

      console.log(`📤 Enviando PUT /orders/${orderId}/cancel`);
      const response = await orderService.cancelOrder(orderId);
      console.log('✅ Respuesta de cancelación:', response);

      if (response.success) {
        setOrders(prev => prev.map(order =>
          order.id_key === orderId
            ? {
                ...order,
                status: 4,
                status_text: 'Cancelado',
                cancelled_at: response.cancelled_at || new Date().toISOString()
              }
            : order
        ));

        alert(`✅ Orden #${orderId} cancelada exitosamente.${response.stock_restored ? ` Stock restaurado para ${response.stock_restored} productos.` : ''}`);
      } else {
        alert('❌ Error: La respuesta del backend no indica éxito');
      }

    } catch (err) {
      console.error('❌ Error cancelando orden:', err);

      let errorMessage = 'Error al cancelar la orden';
      if (err.response) {
        console.error('Detalles de la respuesta:', err.response.data);
        errorMessage += `: ${err.response.data.detail || err.response.statusText}`;
      } else if (err.request) {
        errorMessage += ': No se recibió respuesta del servidor';
      } else {
        errorMessage += `: ${err.message}`;
      }

      alert(errorMessage);
    } finally {
      setProcessingCancel(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetails(true);
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

    if (typeof status === 'string') {
      switch(status.toUpperCase()) {
        case 'PENDING': return 'Pendiente';
        case 'PROGRESS': return 'En Proceso';
        case 'DELIVERED': return 'Entregado';
        case 'CANCELED': return 'Cancelado';
        default: return status;
      }
    }

    return 'Desconocido';
  };

  const getStatusBadgeClass = (status) => {
    const statusNum = typeof status === 'number' ? status :
                     status === 'PENDING' || status === 'pending' ? 1 :
                     status === 'PROGRESS' || status === 'progress' ? 2 :
                     status === 'DELIVERED' || status === 'delivered' ? 3 : 4;

    switch(statusNum) {
      case 1: return 'status-pending';
      case 2: return 'status-progress';
      case 3: return 'status-delivered';
      case 4: return 'status-cancelled';
      default: return 'status-unknown';
    }
  };

  const getStatusIcon = (status) => {
    const statusNum = typeof status === 'number' ? status :
                     status === 'PENDING' || status === 'pending' ? 1 :
                     status === 'PROGRESS' || status === 'progress' ? 2 :
                     status === 'DELIVERED' || status === 'delivered' ? 3 : 4;

    switch(statusNum) {
      case 1: return <FiClock className="status-icon icon-pending" />;
      case 2: return <FiRefreshCw className="status-icon icon-progress" />;
      case 3: return <FiCheckCircle className="status-icon icon-delivered" />;
      case 4: return <FiXCircle className="status-icon icon-cancelled" />;
      default: return <IoAlertCircleOutline className="status-icon icon-unknown" />;
    }
  };

  const getDeliveryMethodIcon = (method) => {
    if (!method) return <BsThreeDotsVertical className="delivery-icon icon-unknown" />;

    if (typeof method === 'number') {
      switch(method) {
        case 1: return <MdDirectionsCar className="delivery-icon icon-drive-thru" />;
        case 2: return <MdStore className="delivery-icon icon-pickup" />;
        case 3: return <MdDeliveryDining className="delivery-icon icon-home" />;
        default: return <BsThreeDotsVertical className="delivery-icon icon-unknown" />;
      }
    }

    const methodStr = String(method).toUpperCase();
    if (methodStr.includes('DRIVE_THRU')) return <MdDirectionsCar className="delivery-icon icon-drive-thru" />;
    if (methodStr.includes('PICKUP') || methodStr.includes('ON_HAND')) return <MdStore className="delivery-icon icon-pickup" />;
    if (methodStr.includes('HOME') || methodStr.includes('DELIVERY')) return <MdDeliveryDining className="delivery-icon icon-home" />;
    return <BsThreeDotsVertical className="delivery-icon icon-unknown" />;
  };

  const getDeliveryMethodText = (method) => {
    if (!method) return 'No especificado';

    if (typeof method === 'number') {
      switch(method) {
        case 1: return 'Drive Thru';
        case 2: return 'Recoger en Tienda';
        case 3: return 'Entrega a Domicilio';
        default: return `Método ${method}`;
      }
    }

    const methodStr = String(method).toUpperCase();
    if (methodStr.includes('DRIVE_THRU')) return 'Drive Thru';
    if (methodStr.includes('PICKUP') || methodStr.includes('ON_HAND')) return 'Recoger en Tienda';
    if (methodStr.includes('HOME') || methodStr.includes('DELIVERY')) return 'Entrega a Domicilio';
    return method;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  const canMarkAsDelivered = (order) => {
    const status = order.status;
    return status === 1 || status === 2 ||
           status === 'PENDING' || status === 'PROGRESS' ||
           status === 'pending' || status === 'progress';
  };

  const canCancel = (order) => {
    const status = order.status;
    return status === 1 || status === 2 ||
           status === 'PENDING' || status === 'PROGRESS' ||
           status === 'pending' || status === 'progress';
  };

  const renderActionButtons = (order) => {
    const isProcessing = processingDelivery[order.id_key];
    const isCancelling = processingCancel[order.id_key];
    const canDeliver = canMarkAsDelivered(order);
    const canCancelOrder = canCancel(order);

    return (
      <div className="action-buttons">
        <button
          className="btn-action btn-view"
          onClick={() => handleViewDetails(order)}
          title="Ver detalles"
        >
          <IoEyeOutline />
        </button>

        {canDeliver && (
          <button
            className="btn-action btn-deliver"
            onClick={() => handleMarkAsDelivered(order.id_key)}
            disabled={isProcessing}
            title="Marcar como entregada"
          >
            {isProcessing ? <FiRefreshCw className="spinning" /> : <FiCheckCircle />}
          </button>
        )}

        {canCancelOrder && (
          <button
            className="btn-action btn-cancel"
            onClick={() => handleCancelOrder(order.id_key)}
            disabled={isCancelling}
            title="Cancelar orden"
          
          >
            {isCancelling ? <FiRefreshCw className="spinning" /> : <FiXCircle />}
          </button>
        )}

        {(order.status === 3 || order.status === 'DELIVERED') && (
          <span className="delivered-badge" title="Ya entregada">
            <FiCheckCircle />
          </span>
        )}
      </div>
    );
  };

  if (loading) return <LoadingSpinner text="Cargando órdenes..." />;

  if (error) return (
    <div className="orders-admin">
      <div className="admin-error">
        <h3>❌ Error</h3>
        <p>{error}</p>
        <button onClick={loadOrders} className="btn-retry">
          Reintentar
        </button>
      </div>
    </div>
  );

  if (client && client.id !== 0) {
    return (
      <div className="orders-admin">
        <div className="admin-error">
          <h3>⛔ Acceso Denegado</h3>
          <p>Solo los administradores pueden acceder a esta página.</p>
          <button onClick={() => window.location.href = '/'} className="btn-home">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-admin">
      <div className="admin-header">
        <h2>📋 Gestión de Órdenes ({orders.length})</h2>
        <div className="admin-header-actions">
          <button onClick={loadOrders} className="btn-refresh">
            <IoRefreshOutline /> Actualizar
          </button>
          <span className="admin-info">Panel de Administración</span>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="admin-stats-cards">
        <div className="stat-card stat-pending">
          <span className="stat-icon"><FiClock /></span>
          <span className="stat-number">
            {orders.filter(o =>
              o.status === 1 || o.status === 'PENDING' || o.status === 'pending'
            ).length}
          </span>
          <span className="stat-label">Pendientes</span>
        </div>
        <div className="stat-card stat-progress">
          <span className="stat-icon"><FiRefreshCw /></span>
          <span className="stat-number">
            {orders.filter(o =>
              o.status === 2 || o.status === 'PROGRESS' || o.status === 'progress'
            ).length}
          </span>
          <span className="stat-label">En Proceso</span>
        </div>
        <div className="stat-card stat-delivered">
          <span className="stat-icon"><FiCheckCircle /></span>
          <span className="stat-number">
            {orders.filter(o =>
              o.status === 3 || o.status === 'DELIVERED' || o.status === 'delivered'
            ).length}
          </span>
          <span className="stat-label">Entregadas</span>
        </div>
        <div className="stat-card stat-cancelled">
          <span className="stat-icon"><FiXCircle /></span>
          <span className="stat-number">
            {orders.filter(o =>
              o.status === 4 || o.status === 'CANCELED' || o.status === 'canceled'
            ).length}
          </span>
          <span className="stat-label">Canceladas</span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No hay órdenes registradas</h3>
          <p>Cuando los clientes realicen compras, aparecerán aquí.</p>
          <button onClick={loadOrders} className="btn-retry">
            Reintentar
          </button>
        </div>
      ) : (
        <>
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Entrega</th>
                  <th>Fecha</th>
                  <th>Factura</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => {
                  return (
                    <tr key={order.id_key} className={`
                      order-row
                      ${order.status === 3 || order.status === 'DELIVERED' ? 'delivered' : ''}
                      ${order.status === 4 || order.status === 'CANCELED' ? 'cancelled' : ''}
                    `}>
                      <td className="order-id">
                        <strong>#{order.id_key}</strong>
                      </td>
                      <td>
                        <span className="client-id"><IoPersonOutline /> {order.client_id_key}</span>
                      </td>
                      <td className="total-column">
                        <span className="total-amount"><FiDollarSign />{order.total?.toFixed(2) || '0.00'}</span>
                      </td>
                      <td>
                        <div className="status-cell">
                          <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span className="status-text">{getStatusText(order.status)}</span>
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="delivery-method-cell">
                          {getDeliveryMethodIcon(order.delivery_method)}
                          <span className="delivery-text">{getDeliveryMethodText(order.delivery_method)}</span>
                        </div>
                      </td>
                      <td>
                        <span className="order-date">
                          <IoCalendarOutline /> {formatDate(order.date || order.created_at)}
                        </span>
                      </td>
                      <td>
                        {order.bill_id ? (
                          <a
                            href={`/bills/${order.bill_id}`}
                            className="bill-link"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <IoReceiptOutline /> Ver
                          </a>
                        ) : (
                          <span className="bill-pending"><FiClock /></span>
                        )}
                      </td>
                      <td className="actions-cell">
                        {renderActionButtons(order)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Modal de detalles */}
          {showDetails && selectedOrder && (
            <div className="modal-overlay" onClick={() => setShowDetails(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Detalles de Orden #{selectedOrder.id_key}</h3>
                  <button onClick={() => setShowDetails(false)} className="modal-close">
                    <IoCloseOutline />
                  </button>
                </div>
                <div className="modal-body">
                  <div className="order-details-grid">
                    <div className="detail-item">
                      <strong>ID Orden:</strong>
                      <span>#{selectedOrder.id_key}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Cliente ID:</strong>
                      <span><IoPersonOutline /> {selectedOrder.client_id_key}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Total:</strong>
                      <span className="total-amount"><FiDollarSign />{selectedOrder.total?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Estado:</strong>
                      <span className={`status-badge ${getStatusBadgeClass(selectedOrder.status)}`}>
                        {getStatusIcon(selectedOrder.status)}
                        <span className="status-text">{getStatusText(selectedOrder.status)}</span>
                      </span>
                    </div>
                    <div className="detail-item">
                      <strong>Método de Entrega:</strong>
                      <div className="delivery-method-cell">
                        {getDeliveryMethodIcon(selectedOrder.delivery_method)}
                        <span>{getDeliveryMethodText(selectedOrder.delivery_method)}</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <strong>Dirección:</strong>
                      <span>{selectedOrder.address || 'No especificada'}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Fecha Creación:</strong>
                      <span><IoCalendarOutline /> {formatDate(selectedOrder.created_at)}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Fecha Orden:</strong>
                      <span><IoCalendarOutline /> {formatDate(selectedOrder.date)}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Factura ID:</strong>
                      <span>{selectedOrder.bill_id || 'Pendiente'}</span>
                    </div>
                    {selectedOrder.delivered_date && (
                      <div className="detail-item">
                        <strong>Fecha Entrega:</strong>
                        <span className="delivered-date">
                          <FiCheckCircle /> {formatDate(selectedOrder.delivered_date)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="modal-actions-details">
                    {canMarkAsDelivered(selectedOrder) && (
                      <button
                        className="btn-mark-delivered"
                        onClick={() => {
                          setShowDetails(false);
                          handleMarkAsDelivered(selectedOrder.id_key);
                        }}
                      >
                        <FiCheckCircle /> Marcar como Entregada
                      </button>
                    )}

                    {canCancel(selectedOrder) && (
                      <button
                        className="btn-cancel-order"
                        onClick={() => {
                          setShowDetails(false);
                          handleCancelOrder(selectedOrder.id_key);
                        }}
                      >
                        <FiXCircle /> Cancelar Orden
                      </button>
                    )}

                    <button
                      className="btn-view-products"
                      onClick={() => window.location.href = `/orders/${selectedOrder.id_key}/details`}
                    >
                      <FiPackage /> Ver Productos
                    </button>
                  </div>
                </div>
                <div className="modal-footer">
                  <button onClick={() => setShowDetails(false)} className="btn-close">
                    <IoCloseOutline /> Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrdersAdmin;
