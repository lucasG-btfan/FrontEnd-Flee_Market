import React, { useState, useEffect } from 'react';
import reviewService from '../../services/api/reviewService';
import RatingStars from '../common/RatingStars';
import './ReviewModal.css'; 

const EditReviewModal = ({ 
  isOpen, 
  onClose, 
  review,
  onUpdate
}) => {
  const [rating, setRating] = useState(review?.rating || 5);
  const [comment, setComment] = useState(review?.comment || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (review && isOpen) {
      setRating(review.rating);
      setComment(review.comment || '');
      setError('');
      setSuccess('');
    }
  }, [review, isOpen]);

  if (!isOpen || !review) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!rating) {
      setError('Por favor selecciona una calificación');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const updateData = {
        rating: Number(rating),
        comment: comment.trim() || null
      };
      
      console.log('📝 Actualizando review:', review.id_key, updateData);
      
      await reviewService.updateReview(review.id_key, updateData);
      
      setSuccess('¡Reseña actualizada exitosamente!');
      
      if (onUpdate) {
        onUpdate();
      }
      
      setTimeout(() => {
        onClose();
      }, 1500);

    } // En el catch del handleSubmit:
catch (err) {
    console.error('❌ Error completo al actualizar review:', err);
    
    let errorMessage = 'Error al actualizar la reseña.';
    
    if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        
        if (Array.isArray(detail)) {
        // Error de validación Pydantic
        errorMessage = 'Errores de validación: ';
        detail.forEach((error, index) => {
            errorMessage += `${error.loc?.join('.') || 'campo'}: ${error.msg}`;
            if (index < detail.length - 1) errorMessage += ', ';
        });
        } else if (typeof detail === 'string') {
        errorMessage = detail;
        }
    } else if (err.message) {
        errorMessage = err.message;
    }
    
    setError(errorMessage);
    setSuccess('');}
    };

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta reseña?')) {
      return;
    }

    setSubmitting(true);
    try {
      await reviewService.deleteReview(review.id_key);
      alert('✅ Reseña eliminada exitosamente');
      onClose();
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error('❌ Error eliminando review:', err);
      alert('Error al eliminar la reseña: ' + (err.detail || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  return (
    <div className="review-modal-overlay" onClick={handleClose}>
      <div className="review-modal-content" onClick={e => e.stopPropagation()}>
        <div className="review-modal-header">
          <h3>Editar Reseña</h3>
          <button className="review-modal-close" onClick={handleClose} disabled={submitting}>
            ×
          </button>
        </div>

        <div className="review-modal-body">
          <div className="review-product-info">
            <h4>Producto ID: {review.product_id}</h4>
            <p className="order-info">Orden #{review.order_id}</p>
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

            {error && <div className="error-message">⚠️ {error}</div>}
            {success && <div className="success-message">✅ {success}</div>}

            <div className="modal-actions">
              <button
                type="button"
                className="btn-delete"
                onClick={handleDelete}
                disabled={submitting}
                style={{ backgroundColor: '#dc3545' }}
              >
                Eliminar
              </button>
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
                {submitting ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditReviewModal;