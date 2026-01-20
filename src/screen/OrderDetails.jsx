import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCurrentClient } from '../services/api/authService';
import orderService from '../services/api/orderService';
import reviewService from '../services/api/reviewService';
import ReviewModal from '../components/reviews/ReviewModal';
import EditReviewModal from '../components/reviews/EditReviewModal';
import Calificacion from '../components/reviews/Calificacion';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  FaArrowLeft,
  FaShoppingBag,
  FaCalendarAlt,
  FaCreditCard,
  FaBoxOpen,
  FaExclamationTriangle,
  FaCheckCircle,
  FaEdit,
  FaStar
} from 'react-icons/fa';
import '../styles/OrderDetails.css';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [existingReviews, setExistingReviews] = useState({});
  const [client, setClient] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  useEffect(() => {
    loadOrderDetails();
  }, [id]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      setError('');

      const currentClient = getCurrentClient();
      if (!currentClient) {
        setError('Por favor inicia sesión');
        navigate('/login');
        return;
      }
      
      setClient(currentClient);

      const orderData = await orderService.getOrderDetails(id);
      console.log('📋 Datos de la orden:', orderData);

      setOrder({
        id: orderData.order_id,
        date: orderData.order_date,
        total: orderData.order_total,
        status: orderData.order_status,
        status_code: orderData.order_status === 'DELIVERED' ? 3 : 
                     orderData.order_status === 'PENDING' ? 1 :
                     orderData.order_status === 'PROGRESS' ? 2 : 4
      });

      setOrderDetails(orderData.order_details);

      await loadExistingReviews(orderData.order_id);

    } catch (err) {
      console.error('❌ Error cargando detalles:', err);
      setError(err.message || 'Error al cargar los detalles de la orden');
    } finally {
      setLoading(false);
    }
  };

  const loadExistingReviews = async (orderId) => {
    try {
      const reviews = await reviewService.getReviewsByOrder(orderId);
      console.log('📋 Reviews cargadas:', reviews);
      
      const reviewsMap = {};
      reviews.forEach(review => {
        console.log('🔍 Review individual:', review);
        reviewsMap[review.product_id] = {
          id_key: review.id_key,
          id: review.id_key,
          rating: review.rating,
          comment: review.comment,
          product_id: review.product_id,
          order_id: review.order_id,
          client_id: review.client_id,
          exists: true
        };
      });
      console.log('🗺️ Mapa de reviews:', reviewsMap);
      setExistingReviews(reviewsMap);
    } catch (err) {
      console.error('❌ Error cargando reviews:', err);
    }
  };

  const getStatusText = (status) => {
    if (typeof status === 'number') {
      switch(status) {
        case 1: return 'Pendiente';
        case 2: return 'En Proceso';
        case 3: return 'Entregado';
        case 4: return 'Cancelado';
        default: return `Estado ${status}`;
      }
    }
    
    if (typeof status === 'string') {
      switch(status.toUpperCase()) {
        case 'PENDING': return 'Pendiente';
        case 'PROGRESS': return 'En Proceso';
        case 'DELIVERED': return 'Entregado';
        case 'CANCELED': return 'Cancelado';
        default: return status;
      }
    }
    
    return 'Desconocido';
  };

  const getStatusBadgeClass = (status) => {
    const statusNum = typeof status === 'number' ? status :
                     status === 'PENDING' || status === 'pending' ? 1 :
                     status === 'PROGRESS' || status === 'progress' ? 2 :
                     status === 'DELIVERED' || status === 'delivered' ? 3 : 4;
    
    switch(statusNum) {
      case 1: return 'status-pending';
      case 2: return 'status-progress';
      case 3: return 'status-delivered';
      case 4: return 'status-cancelled';
      default: return 'status-unknown';
    }
  };

  const handleOpenReviewModal = (product) => {
    console.log('🎯 handleOpenReviewModal llamado');
    console.log('📦 Producto recibido:', product);
    console.log('📦 ID de la orden:', order?.id);
    
    if (!product) {
      console.error('❌ Producto es null/undefined');
      return;
    }
    
    if (!order?.id) {
      console.error('❌ Order ID es null/undefined');
      return;
    }
    
    setSelectedProduct({
      ...product,
      order_id: order.id
    });
    setModalOpen(true);
    console.log('✅ Modal abierto correctamente');
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedProduct(null);
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      await reviewService.createReview(reviewData);
      alert('✅ ¡Gracias por tu reseña!');
      handleCloseModal();
      await loadExistingReviews(order.id);
    } catch (err) {
      console.error('❌ Error creando review:', err);
      alert('Error al crear la reseña: ' + err.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  const handleOpenEditModal = (review) => { 
    setSelectedReview(review);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => { 
    setEditModalOpen(false);
    setSelectedReview(null);
  };

  const handleReviewUpdated = () => { 
    loadExistingReviews(order.id);
  };

  const isAdmin = client?.id === 0;

  if (loading) {
    return (
      <div className="order-details-page">
        <div className="order-details-loading">
          <LoadingSpinner />
          <p>Cargando detalles de la orden...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-details-page">
        <div className="order-details-error">
          <h2><FaExclamationTriangle /> Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/orders')} className="btn-back">
            <FaArrowLeft /> Volver a mis órdenes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-details-page">
      {/* Header */}
      <div className="order-details-header">
        <button onClick={() => navigate('/orders')} className="order-details-back-btn">
          <FaArrowLeft /> Volver a mis órdenes
        </button>
        <h1><FaShoppingBag /> Detalles de la Orden #{order?.id}</h1>
      </div>

      {/* Resumen de la orden */}
      <div className="order-summary">
        <div className="order-summary-item">
          <FaCalendarAlt className="order-summary-icon" />
          <div>
            <span className="order-summary-label">Fecha:</span>
            <span className="order-summary-value">{formatDate(order?.date)}</span>
          </div>
        </div>
        
        <div className="order-summary-item">
          <FaCheckCircle className="order-summary-icon" />
          <div>
            <span className="order-summary-label">Estado:</span>
            <span className={`order-status-badge ${getStatusBadgeClass(order?.status)}`}>
              {getStatusText(order?.status)}
            </span>
          </div>
        </div>
        
        <div className="order-summary-item">
          <FaCreditCard className="order-summary-icon" />
          <div>
            <span className="order-summary-label">Total:</span>
            <span className="order-summary-total">${order?.total?.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Lista de productos */}
      <div className="order-products-section">
        <h2><FaBoxOpen /> Productos ({orderDetails.length})</h2>
        
        {orderDetails.length === 0 ? (
          <div className="no-products">
            <p>No hay productos en esta orden</p>
          </div>
        ) : (
          <div className="order-products-list">
            {orderDetails.map((item) => {
              const hasReview = existingReviews[item.product_id];
              
              return (
                <div key={item.id_key} className="order-product-card">
                  <div className="order-product-info">
                    <div className="order-product-main">
                      <h3 className="order-product-name">{item.product_name}</h3>
                      <div className="order-product-details">
                        <span className="order-product-quantity">Cantidad: {item.quantity}</span>
                        <span className="order-product-price">Precio: ${item.price?.toFixed(2)}</span>
                        <span className="order-product-subtotal">Subtotal: ${item.subtotal?.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="order-product-calificacion">
                      <Calificacion
                        product={item}
                        order={order}
                        existingReview={hasReview}
                        onCalificar={handleOpenReviewModal}
                        onEditReview={handleOpenEditModal}
                        isAdmin={isAdmin}
                      />
                    </div>
                  </div>
                  
                  {/* Mostrar review existente si la hay */}
                  {hasReview && (
                    <div className="existing-review">
                      <div className="review-summary">
                        <span className="review-rating">
                          <FaStar className="star-icon" /> {hasReview.rating}/5
                        </span>
                        <span className="review-comment">
                          {hasReview.comment || 'Sin comentario'}
                        </span>
                        <button 
                          className="btn-edit-review"
                          onClick={() => {
                            const fullReview = {
                              ...hasReview,
                              id_key: hasReview.id_key || hasReview.id,
                              product_id: item.product_id,
                              order_id: order.id,
                              product_name: item.product_name
                            };
                            console.log('🎯 Abriendo modal de edición con:', fullReview);
                            handleOpenEditModal(fullReview);
                          }}
                        >
                          <FaEdit /> Editar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal para calificar */}
      {modalOpen && selectedProduct && (
        <ReviewModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          onSubmit={handleReviewSubmit}
          productId={selectedProduct.product_id}
          productName={selectedProduct.product_name}
          orderId={selectedProduct.order_id}
        />
      )}

      {/* Modal para editar review */}
      {editModalOpen && selectedReview && (
        <EditReviewModal
          isOpen={editModalOpen}
          onClose={handleCloseEditModal}
          review={selectedReview}
          onUpdate={handleReviewUpdated}
        />
      )}
    </div>
  );
};

export default OrderDetails;