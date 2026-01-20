import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import HomeScreen from './screen/HomeScreen';
import Products from './screen/Products';
import ProductDetail from './screen/ProductDetail';
import AdminDashboard from './screen/AdminDashboard';
import Profile from './screen/Profile';
import NotFound from './screen/NotFound';
import LoginScreen from './screen/LoginScreen';
import Cart from './screen/Cart';
import Orders from './screen/Orders';
import BillViewer from './components/BillViewer';
import OrderCreator from './components/orders/OrderCreator';
import OrderDetails from './screen/OrderDetails'; 
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/common/Header';
import { useConnection } from './hooks/useconnection';
import { useAuth } from './hooks/useAuth';
import { CartProvider } from './context/CartContext';
import './App.css';

function AppContent() {
  const { isAuthenticated, user: authUser, loading: authLoading, login: authLogin, logout: authLogout } = useAuth();
  const { isHealthy } = useConnection();
  const navigate = useNavigate();

  const user = authUser;

  const handleLogin = async (userData) => {
    try {
      await authLogin(userData.token, {
        id: userData.id,
        name: userData.name,
        email: userData.email
      });

      // Guardar el token y los datos del usuario en localStorage
      localStorage.setItem('token', userData.token);
      localStorage.setItem('clientId', userData.id);
      localStorage.setItem('clientName', userData.name || 'Usuario');
      localStorage.setItem('clientEmail', userData.email);

      console.log('✅ Login exitoso para:', userData.email);
      navigate('/');
    } catch (error) {
      console.error('❌ Error en login:', error);
    }
  };

  const handleLogout = () => {
    authLogout();
    localStorage.removeItem('token');
    localStorage.removeItem('clientId');
    localStorage.removeItem('clientName');
    localStorage.removeItem('clientEmail');
    console.log('🧹 Sesión cerrada');
    navigate('/login');
  };

  if (authLoading) {
    return <div className="app-loading">Cargando aplicación...</div>;
  }

  return (
    <div className="App">
      <Header user={user} onLogout={handleLogout} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={user ? <HomeScreen /> : <Navigate to="/login" replace />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />

          {/* Ruta pública: Login */}
          <Route
            path="/login"
            element={user ? <Navigate to="/" replace /> : <LoginScreen onLogin={handleLogin} />}
          />

          {/* Rutas protegidas */}
          <Route
            path="/orders/create"
            element={
              <ProtectedRoute user={user}>
                <OrderCreator />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"  // Cambiado de /clients a /profile
            element={
              <ProtectedRoute user={user}>
                <Profile onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute user={user}>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id/details"
            element={
              <ProtectedRoute user={user}>
                <OrderDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute user={user} requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Ruta para visualizar facturas (ejemplo) */}
          <Route path="/bill/:orderId" element={<BillViewer />} />

          {/* Ruta 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <CartProvider>
      <Router>
        <AppContent />
      </Router>
    </CartProvider>
  );
}

export default App;
