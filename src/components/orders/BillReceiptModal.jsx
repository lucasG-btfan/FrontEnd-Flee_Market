import React from 'react';
import { Printer } from 'lucide-react';
import { DeliveryMethod, OrderStatus, PaymentType } from '../../enums';
import './BillReceiptModal.css';

const BillReceiptModal = ({ order, client, show, onClose }) => {
  if (!show || !order) return null;

  // Formatear fecha para Argentina
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Formatear moneda para Argentina (pesos)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  // Obtener texto para método de entrega
  const getDeliveryMethodText = (method) => {
    const methods = {
      [DeliveryMethod.DRIVE_THRU]: 'Drive Thru (Recoger en auto)',
      [DeliveryMethod.ON_HAND]: 'Recoger en Tienda',
      [DeliveryMethod.HOME_DELIVERY]: 'Entrega a Domicilio',
    };
    return methods[method] || 'No especificado';
  };

  // Obtener texto para método de pago
  const getPaymentTypeText = (type) => {
    const types = {
      [PaymentType.CASH]: 'Efectivo',
      [PaymentType.CARD]: 'Tarjeta de Crédito',
      [PaymentType.DEBIT]: 'Tarjeta de Débito',
      [PaymentType.CREDIT]: 'Crédito',
      [PaymentType.BANK_TRANSFER]: 'Transferencia Bancaria',
    };
    return types[type] || 'No especificado';
  };

  // Obtener texto para estado de la orden
  const getOrderStatusText = (status) => {
    const statusTexts = {
      [OrderStatus.PENDING]: 'Pendiente',
      [OrderStatus.IN_PROGRESS]: 'En Progreso',
      [OrderStatus.DELIVERED]: 'Entregado',
      [OrderStatus.CANCELED]: 'Cancelado',
    };
    return statusTexts[status] || 'No especificado';
  };

  // Calcular total si no está en la orden
  const calculateTotal = () => {
    if (order.total) return order.total;
    if (order.order_details) {
      return order.order_details.reduce((sum, item) => {
        return sum + (item.unit_price || item.price || 0) * (item.quantity || 1);
      }, 0);
  };
    return 0;
  };

  const total = calculateTotal();

  return (
    <div className="br-modal-overlay" onClick={onClose}>
      <div className="br-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="br-modal-header">
          <h2>🎫 Factura de Compra</h2>
          <div className="br-modal-subtitle">
            Orden #{order.id_key || order.id || 'N/A'} • {formatDate(order.order_date || order.created_at)}
          </div>
        </div>

        <div className="br-content">
          {/* Información del cliente */}
          <div className="br-content-section">
            <h3>📋 Información del Cliente</h3>
            <div className="br-info-row">
              <span className="br-info-label">Nombre:</span>
              <span className="br-info-value">{client?.name || order.client_name || 'No disponible'}</span>
            </div>
            <div className="br-info-row">
              <span className="br-info-label">ID Cliente:</span>
              <span className="br-info-value">{client?.id || order.client_id || 'N/A'}</span>
            </div>
            <div className="br-info-row">
              <span className="br-info-label">Email:</span>
              <span className="br-info-value">{client?.email || 'No disponible'}</span>
            </div>
            <div className="br-info-row">
              <span className="br-info-label">Método de Entrega:</span>
              <span className="br-info-value">{getDeliveryMethodText(order.delivery_method)}</span>
            </div>
            <div className="br-info-row">
              <span className="br-info-label">Dirección:</span>
              <span className="br-info-value">{order.address || 'Recoger en tienda'}</span>
            </div>
            <div className="br-info-row">
              <span className="br-info-label">Método de Pago:</span>
              <span className="br-info-value">{getPaymentTypeText(order.payment_type)}</span>
            </div>
            <div className="br-info-row">
              <span className="br-info-label">Estado:</span>
              <span className={`br-status-badge ${
                order.status === OrderStatus.PENDING ? 'br-status-pending' :
                order.status === OrderStatus.DELIVERED ? 'br-status-completed' :
                order.status === OrderStatus.CANCELED ? 'br-status-cancelled' :
                'br-status-in-progress'
              }`}>
                {getOrderStatusText(order.status)}
              </span>
            </div>
          </div>

          {/* Número de factura y fecha */}
          {order.bill_id && (
            <div className="br-content-section">
              <h3>📄 Factura</h3>
              <div className="br-info-row">
                <span className="br-info-label">Número de Factura:</span>
                <span className="br-info-value">{order.bill_number || order.bill_id}</span>
              </div>
              <div className="br-info-row">
                <span className="br-info-label">Fecha de Factura:</span>
                <span className="br-info-value">{formatDate(order.bill_date || order.date || order.created_at)}</span>
              </div>
            </div>
          )}

          {/* Productos */}
          <div className="br-content-section">
            <h3>🛒 Productos Comprados</h3>
            <table className="br-items-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio Unitario</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.order_details && order.order_details.length > 0 ? (
                  order.order_details.map((item, index) => {
                    const unitPrice = item.unit_price || item.price || 0;
                    const quantity = item.quantity || 1;
                    const subtotal = unitPrice * quantity;

                    return (
                      <tr key={index}>
                        <td>{item.product?.name || item.product_name || `Producto ${item.product_id}`}</td>
                        <td>{quantity}</td>
                        <td>{formatCurrency(unitPrice)}</td>
                        <td>{formatCurrency(subtotal)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: '#999' }}>
                      No hay detalles de productos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totales */}
          <div className="br-total-section">
            <div className="br-total-row">
              <span>Total a Pagar:</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        <div className="br-modal-actions">
          <button className="br-btn br-btn-print" onClick={() => window.print()}>
            <Printer size={18} /> Imprimir Factura
          </button>
          <button className="br-btn br-btn-close" onClick={onClose}>
            ✅ Continuar Comprando
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillReceiptModal;
