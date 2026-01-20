import React, { useState, useEffect } from 'react';
import { FaStar, FaCheck, FaTimes, FaExternalLinkAlt } from 'react-icons/fa';
import './Calificacion.css';

const Calificacion = ({
  product,
  order,
  existingReview,
  onCalificar,
  isAdmin = false
}) => {
  const [hasReview, setHasReview] = useState(false);
  const [reviewData, setReviewData] = useState(null);
  const [canReview, setCanReview] = useState(false);

  useEffect(() => {
    if (existingReview) {
      setHasReview(true);
      setReviewData(existingReview);
      setCanReview(false);
    } else {
      setHasReview(false);
      setReviewData(null);

      const isDelivered = order && (
        order.status === 3 ||
        order.status === 'DELIVERED' ||
        order.status === 'delivered'
      );

      setCanReview(isDelivered && !isAdmin);
    }
  }, [product, order, existingReview, onCalificar, isAdmin]);

  const handleCalificarClick = () => {
    if (!canReview || !onCalificar || !product || !order?.id) return;

    const dataToSend = {
      ...product,
      order_id: order.id
    };

    onCalificar(dataToSend);
  };

  const handleVerResena = () => {
    if (product?.product_id) {
      window.open(`/products/${product.product_id}`, '_blank');
    }
  };

  // Si es admin, mostrar información pero no permitir calificar
  if (isAdmin) {
    return (
      <div className="calificacion-admin">
        <div className="calificacion-info">
          <span className="admin-label">🔒 Solo para clientes</span>
          <p className="admin-text">
            Los administradores no pueden calificar productos
          </p>
        </div>
      </div>
    );
  }

  // Si ya tiene reseña
  if (hasReview && reviewData) {
    return (
      <div className="calificacion-completada">
        <div className="calificacion-header">
          <FaCheck className="icon-completada" />
          <span className="title">Ya calificado</span>
        </div>

        <div className="calificacion-rating">
          <div className="stars">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                className={`star ${i < reviewData.rating ? 'filled' : 'empty'}`}
              />
            ))}
          </div>
          <span className="rating-text">
            {reviewData.rating.toFixed(1)} estrellas
          </span>
        </div>

        {reviewData.comment && (
          <div className="calificacion-comentario">
            <p className="comentario-label">Tu comentario:</p>
            <p className="comentario-text">"{reviewData.comment}"</p>
          </div>
        )}

        <div className="calificacion-actions">
          <button
            className="btn-ver-resena"
            onClick={handleVerResena}
            title="Ver reseña en la página del producto"
          >
            <FaExternalLinkAlt /> Ver en producto
          </button>
        </div>
      </div>
    );
  }

  // Si puede calificar
  if (canReview) {
    return (
      <div className="calificacion-disponible">
        <div className="calificacion-header">
          <FaStar className="icon-disponible" />
          <span className="title">Calificar producto</span>
        </div>

        <div className="calificacion-info">
          <p className="description">
            Comparte tu experiencia con este producto
          </p>
          <ul className="benefits">
            <li>✓ Ayudas a otros compradores</li>
            <li>✓ Mejoras nuestro catálogo</li>
            <li>✓ Tu opinión es valiosa</li>
          </ul>
        </div>

        <button
          className="btn-calificar"
          onClick={handleCalificarClick}
          title="Calificar este producto"
        >
          <FaStar /> Calificar Ahora
        </button>

        <div className="calificacion-note">
          <small>
            Puedes calificar del 1 al 5 estrellas y agregar un comentario opcional
          </small>
        </div>
      </div>
    );
  }
  return null;
};

export default Calificacion;
