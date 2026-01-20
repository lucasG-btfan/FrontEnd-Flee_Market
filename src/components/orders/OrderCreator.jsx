import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import orderService from '../../services/api/orderService';
import { getCurrentClient } from '../../services/api/authService';
import productService from '../../services/api/productService';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';
import { FaPlus, FaMinus, FaTrash, FaShoppingCart, FaTruck, FaExclamationTriangle } from 'react-icons/fa';
import { DeliveryMethod } from '../../enums';
import BillReceiptModal from './BillReceiptModal';
import './OrderCreator.css';

const OrderCreator = () => {
  const { cartItems, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  const [deliveryMethod, setDeliveryMethod] = useState(DeliveryMethod.DRIVE_THRU);
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [currentOrder, setCurrentOrder] = useState(null);
  const [showBillModal, setShowBillModal] = useState(false);
  const [client, setClient] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadClient = () => {
      const currentClient = getCurrentClient();
      console.log('🔍 Cliente autenticado:', currentClient);

      // Aceptar admin (ID 0) como usuario válido
      if (!currentClient || currentClient.id === undefined) {
        console.warn('⚠️ Usuario no autenticado, redirigiendo a login...');
        navigate('/login');
        return;
      }

      setClient(currentClient);
    };

    loadClient();

    // Verificar carrito
    if (cartItems.length === 0) {
      showMessage('El carrito está vacío. Agrega productos para continuar.', 'warning');
    }
  }, [navigate]);

  const handleSubmitOrder = async () => {
    if (!client || client.id === undefined) {
      showMessage('Debes iniciar sesión para realizar una compra.', 'error');
      navigate('/login');
      return;
    }

    // Si es admin
    if (client.id === 0) {
      const confirmAdminOrder = window.confirm(
        '⚠️ Estás creando una orden como administrador.\n' +
        'Nota: Las órdenes de admin pueden no aparecer en "Mis Órdenes".\n' +
        '¿Deseas continuar?'
      );
      if (!confirmAdminOrder) return;
    }

    if (cartItems.length === 0) {
      showMessage('El carrito está vacío. Agrega productos para continuar.', 'error');
      return;
    }

    if (deliveryMethod === DeliveryMethod.HOME_DELIVERY && !address.trim()) {
      showMessage('Por favor ingresa una dirección de entrega.', 'error');
      return;
    }

    setSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      // Obtener el cliente REAL del authService
      const currentClient = getCurrentClient();
      
      if (!currentClient || currentClient.id === undefined) {
        showMessage('No se pudo obtener la información del cliente.', 'error');
        return;
      }

      // 1. Verificar stock antes de proceder
      const stockCheck = await verifyStock(cartItems);
      if (!stockCheck.success) {
        showMessage(`❌ ${stockCheck.message}`, 'error');
        return;
      }

      const orderData = {
        client_id_key: currentClient.id,
        total: parseFloat(totalPrice.toFixed(2)),
        delivery_method: deliveryMethod, 
        status: 1, 
        address: deliveryMethod === 3 ? address : 
                (deliveryMethod === 1 ? 'Drive-thru: Estacionamiento lateral' : 
                'Recoger en tienda: Mostrador principal'),
        order_details: cartItems.map(item => ({
          product_id: item.id_key || item.id,
          quantity: item.quantity,
          price: parseFloat((item.price || item.unit_price || 0).toFixed(2)),
        })),
      };

      console.log('📦 Datos de la orden:', orderData);

      // 2. Crear orden en el backend
      const orderResponse = await orderService.create(orderData);
      console.log('✅ Orden creada exitosamente:', orderResponse);

      const orderId = orderResponse.id_key || orderResponse.id;
      
      if (!orderId) {
        throw new Error('La orden no fue creada correctamente');
      }

      // 3. Actualizar stock de productos
      try {
        const stockUpdateResult = await updateProductsStock(cartItems);
        console.log('✅ Stock actualizado:', stockUpdateResult);
        
        if (!stockUpdateResult.success) {
          console.warn('⚠️ Algunos productos no pudieron actualizar stock:', stockUpdateResult.errors);
        }
      } catch (stockError) {
        console.error('❌ Error actualizando stock:', stockError);
        // cancelar la orden si no se pudo actualizar stock
        await orderService.cancelOrder(orderId);
        throw new Error('Error al actualizar stock. Orden cancelada.');
      }

      // 4. Limpiar carrito y mostrar éxito
      clearCart();
      localStorage.removeItem('cart');

      setCurrentOrder({
        ...orderResponse,
        client_name: currentClient.name || 'Cliente'
      });
      setShowBillModal(true);

      showMessage(`✅ ¡Orden creada exitosamente! ID: ${orderId}`, 'success');
      setAddress('');
      setDeliveryMethod(1); 

    } catch (error) {
      console.error('❌ Error completo al crear orden:', error);

      let errorMsg = 'Error al procesar la orden';

      if (error.response) {
        const { status, data } = error.response;
        console.error(`Backend error ${status}:`, data);

        if (status === 401 || status === 403) {
          errorMsg = 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.';
          localStorage.removeItem('token');
          localStorage.removeItem('clientId');
          localStorage.removeItem('clientName');
          localStorage.removeItem('clientEmail');
          setTimeout(() => navigate('/login'), 2000);
        } else if (status === 400) {
          errorMsg = data.detail || 'Datos inválidos';
        } else if (status === 404) {
          errorMsg = 'Cliente no encontrado';
        } else {
          errorMsg = `Error del servidor (${status}): ${data.detail || 'Intenta más tarde'}`;
        }
      } else if (error.request) {
        errorMsg = 'No se pudo conectar con el servidor. Verifica tu conexión.';
      } else {
        errorMsg = error.message || 'Error desconocido';
      }

      showMessage(`❌ ${errorMsg}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };


  const verifyStock = async (items) => {
    try {
      // Prepara los items para verificación
      const itemsToCheck = items.map(item => ({
        product_id: item.id_key || item.id,
        name: item.name,
        quantity: item.quantity
      }));
      
      const result = await productService.verifyStock(itemsToCheck);
      return result;
      
    } catch (error) {
      console.error('❌ Error verificando stock:', error);
      return {
        success: false,
        message: 'Error al verificar stock'
      };
    }
  };

  const updateProductsStock = async (items) => {
    try {
      const stockUpdates = items.map(item => ({
        product_id: item.id_key || item.id,
        quantity: -item.quantity  // Restar del stock
      }));
      
      const result = await productService.batchUpdateStock(stockUpdates);
      return result;
      
    } catch (error) {
      console.error('❌ Error actualizando stock:', error);
      throw error;
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    if (type === 'error' || type === 'warning') {
      setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    }
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  if (!client) {
    return (
      <div className="order-creator">
        <div className="loading-client">
          <LoadingSpinner />
          <p>Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-creator">
      {submitting && <LoadingSpinner />}

      {message.text && (
        <div className={`message message-${message.type}`}>
          {message.type === 'error' && <FaExclamationTriangle />}
          {message.text}
        </div>
      )}

      <div className="order-creator-layout">
        {/* Left Side - Productos en carrito */}
        <div className="products-section">
          <h2><FaShoppingCart /> Tu Carrito ({cartItems.length})</h2>
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <p>No hay productos en el carrito.</p>
              <button
                className="btn-browse"
                onClick={() => navigate('/products')}
              >
                Ver Productos
              </button>
            </div>
          ) : (
            <ul className="product-list">
              {cartItems.map(item => (
                <li key={item.id_key || item.id} className="product-item">
                  <div className="product-info">
                    <span className="product-name">{item.name || item.product?.name}</span>
                    <span className="product-price">
                      ${(item.price || item.unit_price || 0).toFixed(2)} x {item.quantity}
                      <span className="product-subtotal">
                        = ${((item.price || item.unit_price || 0) * item.quantity).toFixed(2)}
                      </span>
                    </span>
                  </div>
                  <div className="quantity-controls">
                    <button
                      onClick={() => handleQuantityChange(item.id_key || item.id, item.quantity - 1)}
                      disabled={submitting}
                    >
                      <FaMinus />
                    </button>
                    <span className="quantity-display">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.id_key || item.id, item.quantity + 1)}
                      disabled={submitting}
                    >
                      <FaPlus />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id_key || item.id)}
                      disabled={submitting}
                      className="btn-remove"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right Side - Información de la orden */}
        <div className="order-summary-section">
          <h2><FaTruck /> Confirmar Compra</h2>

          {cartItems.length > 0 && (
            <>
              {/* Información del cliente REAL */}
              <div className="client-info">
                <h3>👤 Información del Cliente</h3>
                <div className="client-details">
                  <p><strong>Nombre:</strong> {client.name || 'Administrador'}</p>
                  <p><strong>Email:</strong> {client.email || 'admin@comercio.com'}</p>
                  <p><strong>ID Cliente:</strong> {client.id}</p>
                  {client.id === 0 && (
                    <div className="admin-warning">
                      <FaExclamationTriangle className="admin-icon" />
                      <span>Estás operando como administrador</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-section">
                <div className="form-group">
                  <label htmlFor="delivery">📦 Método de Entrega *</label>
                  <select
                    id="delivery"
                    value={deliveryMethod}
                    onChange={(e) => setDeliveryMethod(Number(e.target.value))}
                    disabled={submitting}
                    required
                  >
                    <option value={1}>Drive Thru (Recoger en auto)</option>
                    <option value={2}>Recoger en Tienda</option>
                    <option value={3}>Entrega a Domicilio</option>
                  </select>
                  
                  <small className="hint">
                    {deliveryMethod === DeliveryMethod.DRIVE_THRU &&
                      "Para Drive-thru: Estacionamiento lateral del local"}
                    {deliveryMethod === DeliveryMethod.ON_HAND &&
                      "Para recoger en tienda: Mostrador principal"}
                    {deliveryMethod === DeliveryMethod.HOME_DELIVERY &&
                      "Para entrega a domicilio: Ingresa tu dirección completa"}
                  </small>
                </div>

                {deliveryMethod === DeliveryMethod.HOME_DELIVERY && (
                  <div className="form-group">
                    <label htmlFor="address">🏠 Dirección de Entrega *</label>
                    <textarea
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Calle, número, ciudad, código postal..."
                      rows="3"
                      required
                      disabled={submitting}
                    />
                    <small className="hint">La entrega tarda 24-48 horas hábiles</small>
                  </div>
                )}

                {deliveryMethod !== DeliveryMethod.HOME_DELIVERY && (
                  <div className="pickup-info">
                    <h4>📍 Punto de Recogida</h4>
                    <p><strong>Dirección:</strong> Av. Principal #123, Local Comercio</p>
                    <p><strong>Horario:</strong> Lunes a Viernes 9:00-18:00, Sábados 10:00-14:00</p>
                    <p><strong>Instrucciones:</strong> Presentar identificación al recoger</p>
                  </div>
                )}
              </div>

              <div className="summary-section">
                <h3>💰 Resumen de Compra</h3>
                <div className="summary-row">
                  <span>Productos:</span>
                  <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)} unidades</span>
                </div>
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Envío:</span>
                  <span className="free-shipping">Gratis</span>
                </div>
                <div className="summary-total">
                  <span>Total a pagar:</span>
                  <strong>${totalPrice.toFixed(2)}</strong>
                </div>
              </div>

              <div className="actions-section">
                <button
                  className="btn-back"
                  onClick={() => navigate('/products')}
                  disabled={submitting}
                >
                  ← Seguir Comprando
                </button>
                <button
                  className="btn-submit"
                  onClick={handleSubmitOrder}
                  disabled={submitting || cartItems.length === 0}
                >
                  {submitting ? (
                    <>
                      <LoadingSpinner small /> Procesando...
                    </>
                  ) : (
                    '✅ Confirmar Compra'
                  )}
                </button>
              </div>

              <div className="security-note">
                <p>🔒 Compra 100% segura | 📦 Envío garantizado | 🧾 Factura incluida</p>
                <small>Recibirás la factura por email y podrás descargarla desde "Mis Órdenes"</small>
              </div>
            </>
          )}
        </div>
      </div>

      {showBillModal && currentOrder && (
        <BillReceiptModal
          order={currentOrder}
          client={client}
          show={showBillModal}
          onClose={() => {
            setShowBillModal(false);
            navigate('/orders');
          }}
        />
      )}
    </div>
  );
};

export default OrderCreator;
