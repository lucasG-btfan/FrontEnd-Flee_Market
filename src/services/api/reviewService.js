import api from './base';

const reviewService = {

  createReview: async (reviewData) => {
    try {
      console.log('📤 Enviando datos:', reviewData);
      
      if (!reviewData.rating || !reviewData.product_id || !reviewData.order_id) {
        throw new Error('Faltan campos requeridos');
      }
      
      const response = await api.post('/reviews', reviewData);
      console.log('✅ Respuesta exitosa:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creando review:');
      console.error('- Status:', error.response?.status);
      console.error('- Datos:', error.response?.data);
      console.error('- Request:', error.config?.data);
      
      if (error.response?.status === 422) {
        const errors = error.response?.data?.detail;
        console.error('Errores de validación:', errors);
        
        let errorMessage = 'Error de validación: ';
        if (Array.isArray(errors)) {
          errors.forEach(err => {
            errorMessage += `${err.loc?.join('.')}: ${err.msg} `;
          });
        } else if (typeof errors === 'string') {
          errorMessage += errors;
        }
        
        throw new Error(errorMessage);
      }
      throw error.response?.data || { detail: error.message };
    }
},

  getProductReviews: async (productId) => {
    try {
      const response = await api.get(`/reviews/product/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      if (error.response?.status === 404) {
        return {
          product_id: productId,
          reviews: [],
          summary: {
            average_rating: null,
            review_count: 0,
            rating_distribution: {}
          }
        };
      }
      throw error.response?.data || { detail: error.message };
    }
  },

  getProductRating: async (productId) => {
    try {
      const response = await api.get(`/reviews/product/${productId}/rating`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product rating:', error);
      return {
        average_rating: null,
        review_count: 0,
        rating_distribution: {}
      };
    }
  },


  getMyReviews: async () => {
    try {
      const response = await api.get('/reviews/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching my reviews:', error);
      throw error.response?.data || { detail: error.message };
    }
  },

 
  getReviewsByOrder: async (orderId) => {
    try {
      const response = await api.get(`/reviews/order/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching reviews by order:', error);
      throw error;
    }
  },

  updateReview: async (reviewId, updateData) => {
    try {
      const response = await api.put(`/reviews/${reviewId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating review:', error);
      throw error.response?.data || { detail: error.message };
    }
  },

  deleteReview: async (reviewId) => {
    try {
      await api.delete(`/reviews/${reviewId}`);
      return true;
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error.response?.data || { detail: error.message };
    }
  },

  // Verificar si un producto de una orden puede ser calificado
  canReviewProduct: async (productId, orderId) => {
    try {
      const reviews = await reviewService.getOrderReviews(orderId);
      const existingReview = reviews.find(review => review.product_id === productId);
      return !existingReview;
    } catch (error) {
      console.error('Error checking review eligibility:', error);
      return false;
    }
  }
};

export default reviewService;