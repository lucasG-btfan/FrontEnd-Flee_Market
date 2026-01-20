import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/NotFound.css'

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="not-found-icon">❌</div>
        <h1>404 - Página No Encontrada</h1>
        <p>Lo sentimos, la página que estás buscando no existe.</p>
        <div className="not-found-actions">
          <Link to="/" className="btn-primary">
            Volver al Inicio
          </Link>
          <Link to="/products" className="btn-secondary">
            Ver Productos
          </Link>
        </div>
        <div className="not-found-suggestions">
          <h3>¿Quizás querías visitar?</h3>
          <ul>
            <li><Link to="/products">Productos</Link></li>
            <li><Link to="/clients">Profile</Link></li>
            <li><Link to="/orders">Pedidos</Link></li>
            <li><Link to="/admin">Panel de Administración</Link></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotFound;