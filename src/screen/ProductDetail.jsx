import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../services/api/productService';
import reviewService from '../services/api/reviewService';
import RatingStars from '../components/common/RatingStars';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useCart } from '../context/CartContext';
import { FaArrowLeft } from "react-icons/fa";
import '../styles/ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [productData, reviewsData] = await Promise.all([
          productService.getById(id),
          reviewService.getProductReviews(id)
        ]);

        console.log('📊 Datos recibidos del backend:');
        console.log('- Producto:', productData);
        console.log('- Reviews:', reviewsData);
        
        // POSIBLE PROBLEMA: La estructura de reviewsData puede ser diferente
        // Revisa lo que realmente devuelve la API
        setProduct(productData);
        
        // INTENTA ESTAS OPCIONES:
        let reviewsArray = [];
        if (Array.isArray(reviewsData)) {
          reviewsArray = reviewsData;
        } else if (reviewsData && Array.isArray(reviewsData.reviews)) {
          reviewsArray = reviewsData.reviews;
        } else if (reviewsData && reviewsData.data) {
          reviewsArray = Array.isArray(reviewsData.data) ? reviewsData.data : [];
        }
        
        setReviews(reviewsArray); // Usa el array limpio
        
        // Para ratingSummary
        let summaryData = reviewsData.summary || reviewsData.rating_summary;
        if (!summaryData && reviewsArray.length > 0) {
          // Calcula el promedio si no viene del backend
          const avg = reviewsArray.reduce((sum, r) => sum + r.rating, 0) / reviewsArray.length;
          summaryData = {
            average_rating: avg,
            review_count: reviewsArray.length,
            rating_distribution: {}
          };
        }
        
        setRatingSummary(summaryData || {
          average_rating: null,
          review_count: 0,
          rating_distribution: {}
        });

      } catch (err) {
        console.error('❌ Error cargando datos:', err);
        setError(err.message || 'Error al cargar el producto');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductData();
    }
  }, [id]);

  const getRatingDistribution = () => {
    if (!ratingSummary?.rating_distribution) {
      return [5, 4, 3, 2, 1].map(star => ({
        star,
        count: 0,
        percentage: 0
      }));
    }

    const total = ratingSummary.review_count;
    return [5, 4, 3, 2, 1].map(star => ({
      star,
      count: ratingSummary.rating_distribution[star] || 0,
      percentage: total > 0 ? ((ratingSummary.rating_distribution[star] || 0) / total) * 100 : 0
    }));
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    addToCart({
      ...product,
      id_key: product.id_key || product.id,
      id: product.id_key || product.id
    }, quantity);

    alert(`✅ Se agregaron ${quantity} unidad(es) de "${product.name}" al carrito`);
  };

  const handleBuyNow = () => {
    if (!product) return;

    addToCart({
      ...product,
      id_key: product.id_key || product.id,
      id: product.id_key || product.id
    }, quantity);

    navigate('/orders/create');
  };

  const handleQuantityChange = (change) => {
    if (!product) return;

    const newQuantity = quantity + change;

    if (newQuantity < 1) return;
    if (newQuantity > product.stock) {
      alert(`⚠️ Solo hay ${product.stock} unidades disponibles`);
      return;
    }

    setQuantity(newQuantity);
  };

  if (loading) {
    return (
      <div className="product-detail-loading">
        <LoadingSpinner text="Cargando producto..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-detail-error">
        <h2>❌ Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className="back-button">
          <FaArrowLeft /> Volver
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-not-found">
        <h2>📭 Producto no encontrado</h2>
        <p>El producto que buscas no existe o fue eliminado.</p>
        <button onClick={() => navigate('/products')} className="back-button">
          <FaArrowLeft /> Volver a Productos
        </button>
      </div>
    );
  }

  const maxQuantity = Math.min(product.stock, 10);

  return (
    <div className="product-detail-container">
      <button onClick={() => navigate(-1)} className="back-button">
        <FaArrowLeft /> Volver
      </button>

      <div className="product-detail-content">
        <div className="product-image-section">
          {product.image_url || product.image ? (
            <img
              src={product.image_url || product.image}
              alt={product.name}
              className="product-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/400x300?text=Imagen+no+disponible';
              }}
            />
          ) : (
            <div className="image-placeholder-large">
              <span>🖼️ Sin imagen</span>
            </div>
          )}

          {product.images && product.images.length > 1 && (
            <div className="product-image-gallery">
              {product.images.slice(0, 4).map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${product.name} - vista ${index + 1}`}
                  className="thumbnail"
                />
              ))}
            </div>
          )}
        </div>

        <div className="product-info-section">
          <h1 className="product-title">{product.name}</h1>

          {product.brand && (
            <div className="product-brand">
              Marca: <strong>{product.brand}</strong>
            </div>
          )}

          <div className="product-rating-summary">
            <h3>Calificación del Producto</h3>
            <div className="rating-overview">
              <div className="average-rating">
                <span className="rating-number-large">
                  {ratingSummary?.average_rating?.toFixed(1) || '0.0'}
                </span>
                <RatingStars
                  rating={ratingSummary?.average_rating}
                  size="large"
                />
                <span className="review-count-large">
                  {ratingSummary?.review_count || 0} reseña{ratingSummary?.review_count !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          <p className="product-description">
            {product.description || 'Este producto no tiene descripción.'}
          </p>

          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="product-specs">
              <h3>Especificaciones:</h3>
              <ul>
                {Object.entries(product.specs).map(([key, value]) => (
                  <li key={key}>
                    <strong>{key.replace('_', ' ')}:</strong> {value}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="product-price-section">
            <div className="product-price">
              {product.price_formatted || `$${product.price?.toFixed(2) || '0.00'}`}
            </div>

            <div className={`product-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
              {product.stock > 0
                ? `✅ ${product.stock} disponibles`
                : '❌ Agotado'}
            </div>
          </div>

          {product.stock > 0 && (
            <div className="purchase-section">
              <div className="quantity-controls">
                <label htmlFor="quantity">Cantidad:</label>
                <div className="quantity-selector">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="quantity-btn"
                  >
                    −
                  </button>

                  <input
                    type="number"
                    id="quantity"
                    min="1"
                    max={maxQuantity}
                    value={quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      setQuantity(Math.max(1, Math.min(value, maxQuantity)));
                    }}
                    className="quantity-input"
                  />

                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= maxQuantity}
                    className="quantity-btn"
                  >
                    +
                  </button>
                </div>

                <div className="quantity-info">
                  Máximo: {maxQuantity} unidades
                </div>
              </div>

              <div className="action-buttons">
                <button
                  onClick={handleAddToCart}
                  className="add-to-cart-btn"
                  disabled={product.stock === 0}
                >
                  🛒 Agregar al Carrito
                </button>

                <button
                  onClick={handleBuyNow}
                  className="buy-now-btn"
                  disabled={product.stock === 0}
                >
                  💳 Comprar Ahora
                </button>
              </div>

              <div className="cart-subtotal">
                Subtotal: <strong>
                  ${((product.price || 0) * quantity).toFixed(2)}
                </strong>
              </div>
            </div>
          )}

          {product.category && (
            <div className="product-category">
              📁 Categoría: <strong>{product.category.name || product.category}</strong>
            </div>
          )}
        </div>
      </div>

      <div className="product-reviews-section">
        <h2>Reseñas de Clientes</h2>

        {reviews.length === 0 ? (
          <div className="no-reviews">
            <p>Este producto aún no tiene reseñas. ¡Sé el primero en opinar!</p>
          </div>
        ) : (
          <>
            <div className="reviews-stats">
              <h4>Distribución de calificaciones</h4>
              <div className="rating-bars">
                {getRatingDistribution().map((item) => (
                  <div key={item.star} className="rating-bar-item">
                    <span className="star-label">{item.star} ★</span>
                    <div className="rating-bar">
                      <div
                        className="rating-fill"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="rating-count">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review.id_key} className="review-card">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <span className="reviewer-name">
                        {review.client_name || `Cliente #${review.client_id}`}
                      </span>
                      <span className="review-date">
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                    <RatingStars
                      rating={review.rating}
                      size="small"
                      showNumber={true}
                    />
                  </div>
                  {review.comment && (
                    <div className="review-comment">
                      <p>{review.comment}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
