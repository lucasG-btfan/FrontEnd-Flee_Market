import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../styles/Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();
  const navigate = useNavigate();

  const handleRemove = (item) => {
    const itemId = item.id_key || item.id;
    removeFromCart(itemId);
  };

  const handleUpdateQuantity = (item, change) => {
    const itemId = item.id_key || item.id;
    const newQuantity = item.quantity + change;
    if (newQuantity > 0) {
      updateQuantity(itemId, newQuantity);
    } else {
      removeFromCart(itemId);
    }
  };

  // Función para proceder al pago (sin autenticación)
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Tu carrito está vacío. Agrega productos para proceder al pago.');
      return;
    }
    navigate('/orders/create');
  };

  return (
    <div className="cart-container">
      <h2>🛒 Tu Carrito ({cartItems.length} productos)</h2>

      {cartItems.length === 0 ? (
        <p className="empty-cart-message">No hay productos en el carrito.</p>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map(item => {
              const itemId = item.id_key || item.id;
              return (
                <div key={itemId} className="cart-item">
                  <img src={item.image_url || 'https://via.placeholder.com/100'} alt={item.name} />
                  <div className="item-info">
                    <h3>{item.name}</h3>
                    <p className="item-price">${item.price?.toFixed(2) || '0.00'} c/u</p>
                    <p className="item-stock">Stock: {item.stock || 'Disponible'}</p>
                  </div>
                  <div className="item-quantity">
                    <button onClick={() => handleUpdateQuantity(item, -1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => handleUpdateQuantity(item, 1)}>+</button>
                  </div>
                  <div className="item-subtotal">
                    ${(item.price * item.quantity)?.toFixed(2) || '0.00'}
                  </div>
                  <button onClick={() => handleRemove(item)} className="btn-remove">🗑️</button>
                </div>
              );
            })}
          </div>

          <div className="cart-summary">
            <div className="cart-total">
              <span>Total:</span>
              <strong>${totalPrice?.toFixed(2) || '0.00'}</strong>
            </div>
            <div className="cart-actions">
              <button onClick={clearCart} className="btn-clear">Vaciar Carrito</button>
              <button onClick={handleCheckout} className="btn-checkout">Proceder al Pago</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
