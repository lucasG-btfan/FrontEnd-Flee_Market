import React, { useState, useEffect } from 'react';
import reviewService from '../../services/api/reviewService';
import RatingStars from '../common/RatingStars';
import './ReviewModal.css';

const ReviewModal = ({ 
  isOpen, 
  onClose, 
  product,           
  productId,         
  productName,
  orderId,
  onSubmit,
  onReviewSubmitted
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Determinar los valores finales (manejar ambas formas de pasar props)
  const finalProductId = productId || product?.product_id || product?.id_key || product?.id;
  const finalProductName = productName || product?.product_name || product?.name || 'Producto';
  const finalOrderId = orderId || product?.order_id;

  console.log('🎯 ReviewModal - Props recibidas:', {
    isOpen,
    product,
    productId,
    productName,
    orderId,
    finalProductId,
    finalProductName,
    finalOrderId,
    hasOnSubmit: !!onSubmit,
    hasOnReviewSubmitted: !!onReviewSubmitted
  });

  useEffect(() => {
    if (isOpen) {
      console.log('🔄 ReviewModal - Modal abierto, reseteando estado');
      setRating(5);
      setComment('');
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

  if (!isOpen || !finalProductId) {
    console.log('🚫 ReviewModal - No renderizando:', {
      isOpen,
      finalProductId,
      reason: !isOpen ? 'Modal cerrado' : 'Sin productId'
    });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('📤 ReviewModal - Enviando reseña');
    
    if (!rating) {
        setError('Por favor selecciona una calificación');
        return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
        // CREAR EL OBJETO reviewData (esto falta)
        const reviewData = {
        rating: Number(rating),
        comment: comment.trim() || null,
        product_id: finalProductId,
        order_id: finalOrderId
        };
        
        console.log('📦 Datos de la reseña:', reviewData);
        console.log('📤 Datos enviados al backend:', reviewData);

        await reviewService.createReview(reviewData);

        console.log('✅ Reseña enviada exitosamente');
        setSuccess('¡Reseña enviada exitosamente!');
        
        // Llamar a los callbacks apropiados
        if (onSubmit) {
        onSubmit();
        }
        
        if (onReviewSubmitted) {
        onReviewSubmitted();
        }
        
        setTimeout(() => {
        onClose();
        }, 1500);

    } catch (err) {
        console.error('❌ Error submitting review:', err);
        setError(err.detail || 'Error al enviar la reseña. Intenta nuevamente.');
    } finally {
        setSubmitting(false);
    }
    };

  const handleClose = () => {
    console.log('✋ ReviewModal - Cerrando modal');
    if (!submitting) {
      onClose();
    }
  };

  return (
    <div className="review-modal-overlay" onClick={handleClose}>
      <div className="review-modal-content" onClick={e => e.stopPropagation()}>
        <div className="review-modal-header">
          <h3>Calificar Producto</h3>
          <button 
            className="review-modal-close" 
            onClick={handleClose}
            disabled={submitting}
          >
            ×
          </button>
        </div>

        <div className="review-modal-body">
          <div className="review-product-info">
            <h4>{finalProductName}</h4>
            <p className="order-info">Orden #{finalOrderId}</p>
            <div className="debug-info" style={{ fontSize: '10px', color: '#666', marginTop: '5px' }}>
              Product ID: {finalProductId} | Order ID: {finalOrderId}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="rating-section">
              <label className="rating-label">Tu calificación:</label>
              <div className="rating-stars-container">
                <RatingStars
                  rating={rating}
                  size="large"
                  readOnly={false}
                  interactive={true}
                  onChange={setRating}
                />
                <span className="rating-value-display">
                  {rating.toFixed(1)} estrellas
                </span>
              </div>
            </div>

            <div className="comment-section">
              <label htmlFor="comment" className="comment-label">
                Comentario (opcional):
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Comparte tu experiencia con este producto..."
                rows={4}
                maxLength={500}
                disabled={submitting}
              />
              <div className="char-counter">
                {comment.length}/500 caracteres
              </div>
            </div>

            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}

            {success && (
              <div className="success-message">
                ✅ {success}
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={handleClose}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner"></span>
                    Enviando...
                  </>
                ) : (
                  'Enviar Reseña'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;