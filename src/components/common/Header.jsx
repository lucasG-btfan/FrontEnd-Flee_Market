import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { getCurrentClient } from '../../services/api/authService';
import './Header.css';

const Header = ({ user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout(); 
    }
    setCurrentUser(null); 
    navigate('/');
    setTimeout(() => {
      window.location.reload(); 
    }, 100);
  };

  // Verificar si el usuario es admin (id_key == 0)
  const isAdmin = currentUser?.id_key === 0 || currentUser?.id === 0;

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <Link to="/" className="logo-link">
            <h1>🛒 Flee Market </h1>
          </Link>
        </div>

        <nav className="navigation">
          <Link to="/" className={`nav-link ${isActive('/')}`}>
            Home
          </Link>
          <Link to="/products" className={`nav-link ${isActive('/products')}`}>
            Products
          </Link>
          {currentUser ? (
            <>
              <Link to="/profile" className={`nav-link ${isActive('/profile')}`}>
                Mi Perfil
              </Link>
              <Link to="/orders" className={`nav-link ${isActive('/orders')}`}>
                Mis Órdenes
              </Link>
            </>
          ) : (
            <Link to="/login" className={`nav-link ${isActive('/login')}`}>
              Login
            </Link>
          )}
          {/* Mostrar Admin SOLO si es admin */}
          {isAdmin && (
            <Link to="/admin" className={`nav-link ${isActive('/admin')}`}>
              Admin
            </Link>
          )}
        </nav>

        <div className="header-actions">
          <span className="online-status">✅ Online</span>
          <Link to="/cart" className="cart-icon">
            🛒
            {totalItems > 0 && (
              <span className="cart-count">{totalItems}</span>
            )}
          </Link>
          {currentUser ? (
            <div className="user-section">
              <span className="user-greeting">
                Hola, {currentUser.name?.split(' ')[0] || 'Usuario'}
              </span>
              <button onClick={handleLogout} className="logout-button">
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <Link to="/login" className="login-link">
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;