import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    console.log('Guardando en localStorage:', cartItems); 
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);


  const addToCart = (product, quantity = 1) => {
    console.log('Agregando al carrito:', product, quantity);
    setCartItems(prev => {
      // Usar id_key como identificador principal
      const productId = product.id_key || product.id;
      const existing = prev.find(item => 
        (item.id_key === productId) || (item.id === productId)
      );
      
      if (existing) {
        return prev.map(item =>
          (item.id_key === productId || item.id === productId)
            ? { 
                ...item, 
                quantity: item.quantity + quantity,
                id_key: productId, // Asegurar id_key
                id: productId      // Mantener id por compatibilidad
              }
            : item
        );
      }
      
      return [...prev, { 
        ...product, 
        quantity,
        id_key: productId,  // Siempre establecer id_key
        id: productId       // También id para compatibilidad
      }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => 
      item.id_key !== productId && item.id !== productId
    ));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prev =>
      prev.map(item =>
        (item.id_key === productId || item.id === productId)
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
};