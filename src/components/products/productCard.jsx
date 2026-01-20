import React, { useState, useEffect } from 'react';
import { FaShoppingCart, FaEye } from 'react-icons/fa';
import RatingStars from '../common/RatingStars';
import reviewService from '../../services/api/reviewService';
import './ProductCard.css';

const ProductCard = ({ product, onClick, onAddToCart, layout = 'grid' }) => {
  const [ratingInfo, setRatingInfo] = useState({
    average_rating: null,
    review_count: 0
  });
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const data = await reviewService.getProductRating(product.id_key || product.id);
        setRatingInfo({
          average_rating: data.average_rating,
          review_count: data.review_count || 0
        });
      } catch (error) {
        console.error('Error fetching rating:', error);
      }
    };

    if (product.id_key || product.id) {
      fetchRating();
    }
  }, [product.id_key, product.id]);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleClick = () => {
    if (onClick) {
      onClick(product);
    }
  };

  const handleAddToCartClick = (e) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  // Obtener iniciales para el placeholder
  const getInitials = () => {
    if (!product.name) return 'P';
    const words = product.name.split(' ');
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  };

  return (
    <div className={`product-card ${layout}`} onClick={handleClick}>
      <div className="product-image-container">
        {product.image_url && !imageError ? (
          <div className="image-wrapper">
            <img 
              src={product.image_url} 
              alt={product.name}
              onError={handleImageError}
              loading="lazy"
            />
          </div>
        ) : (
          <div className="image-placeholder">
            <span className="placeholder-text">{getInitials()}</span>
          </div>
        )}
        
        {/* Botones de acción */}
        <div className="card-actions">
          <button 
            className="action-btn view-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            title="Ver detalles"
          >
            <FaEye />
          </button>
          <button 
            className="action-btn cart-btn"
            onClick={handleAddToCartClick}
            title="Añadir al carrito"
            disabled={product.stock <= 0}
          >
            <FaShoppingCart />
          </button>
        </div>
      </div>

      <div className="product-info">
        <div className="product-header">
          <h3 className="product-name">{product.name}</h3>
          <span className="product-price">
            ${parseFloat(product.price || 0).toFixed(2)}
          </span>
        </div>

        {/* Sección de Rating */}
        <div className="product-rating-section">
          <RatingStars
            rating={ratingInfo.average_rating}
            size="small"
            showNumber={true}
          />
          {ratingInfo.review_count > 0 ? (
            <span className="review-count">
              ({ratingInfo.review_count})
            </span>
          ) : (
            <span className="no-reviews">Sin reseñas</span>
          )}
        </div>

        <div className="product-meta">
          <span className={`product-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
            {product.stock > 0 ? `${product.stock} en stock` : 'Agotado'}
          </span>
          
          {product.category && (
            <span className="product-category">{product.category.name}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;