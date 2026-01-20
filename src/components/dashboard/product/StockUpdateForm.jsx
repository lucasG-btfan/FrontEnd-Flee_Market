import React, { useState } from 'react';
import { FaBoxOpen, FaPlus, FaMinus, FaSave, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import productService from '../../../services/api/productService';
import './ProductForm.css';

const StockUpdateForm = ({ product, onClose, onStockUpdated }) => {
  const [stockChange, setStockChange] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const currentStock = product.stock || 0;
  const newStock = currentStock + stockChange;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (stockChange === 0) {
      setError('Debes especificar un cambio en el stock');
      return;
    }

    if (newStock < 0) {
      setError('El stock resultante no puede ser negativo');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const productId = product.id_key || product.id;
      
      const result = await productService.update(productId, {
        stock: newStock
      });
      
      console.log('✅ Stock actualizado:', result);
      setSuccess(`✅ Stock actualizado exitosamente. Nuevo stock: ${newStock}`);
      
      if (onStockUpdated) {
        onStockUpdated(result, stockChange, newStock);
      }
      
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
      
    } catch (err) {
      console.error('❌ Error actualizando stock:', err);
      
      let errorMessage = err.message || 'Error al actualizar el stock';
      if (errorMessage.includes('authenticated')) {
        errorMessage = 'Error: Debes iniciar sesión como administrador.';
      } else if (errorMessage.includes('404')) {
        errorMessage = 'Error: Producto no encontrado.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSet = (value) => {
    setStockChange(prev => prev + value);
  };

  const handleReset = () => {
    setStockChange(0);
    setComment('');
    setError(null);
    setSuccess(null);
  };

  const willBeNegative = newStock < 0;
  const willBeZero = newStock === 0;
  const isIncrease = stockChange > 0;
  const isDecrease = stockChange < 0;

  return (
    <div className="stock-update-form">
      <div className="form-header">
        <h3><FaBoxOpen /> Actualizar Stock</h3>
        <button onClick={onClose} className="close-btn" title="Cerrar">
          <FaTimes />
        </button>
      </div>
      
      <div className="product-info">
        <div className="product-header">
          <h4>{product.name}</h4>
          <span className="product-sku">SKU: {product.sku || `PRD-${product.id_key || product.id}`}</span>
        </div>
        <div className="current-stock-info">
          <div className="stock-badge">
            <span className="stock-label">Stock actual:</span>
            <span className="stock-value">{currentStock} unidades</span>
          </div>
          {product.category && (
            <div className="category-badge">
              {product.category.name}
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="alert error">
          <FaExclamationTriangle /> {error}
        </div>
      )}
      
      {success && (
        <div className="alert success">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Cambio en Stock</label>
          <div className="stock-controls">
            <div className="quick-buttons">
              <div className="quick-buttons-row">
                <button 
                  type="button"
                  onClick={() => handleQuickSet(-10)}
                  className="btn-quick negative"
                  disabled={loading || currentStock < 10}
                >
                  <FaMinus /> -10
                </button>
                <button 
                  type="button"
                  onClick={() => handleQuickSet(-5)}
                  className="btn-quick negative"
                  disabled={loading || currentStock < 5}
                >
                  <FaMinus /> -5
                </button>
                <button 
                  type="button"
                  onClick={() => handleQuickSet(-1)}
                  className="btn-quick negative"
                  disabled={loading || currentStock < 1}
                >
                  <FaMinus /> -1
                </button>
              </div>
              
              <div className="stock-input-wrapper">
                <div className="input-group">
                  <button 
                    type="button"
                    onClick={() => handleQuickSet(-1)}
                    className="input-btn left"
                    disabled={loading || newStock <= 0}
                  >
                    <FaMinus />
                  </button>
                  <input
                    type="number"
                    value={stockChange}
                    onChange={(e) => setStockChange(parseInt(e.target.value) || 0)}
                    className="stock-input"
                    placeholder="0"
                    disabled={loading}
                  />
                  <button 
                    type="button"
                    onClick={() => handleQuickSet(1)}
                    className="input-btn right"
                    disabled={loading}
                  >
                    <FaPlus />
                  </button>
                </div>
                <span className={`stock-change-label ${isIncrease ? 'positive' : isDecrease ? 'negative' : ''}`}>
                  {stockChange > 0 ? '↑ Aumentar' : stockChange < 0 ? '↓ Disminuir' : 'Sin cambio'}
                </span>
              </div>
              
              <div className="quick-buttons-row">
                <button 
                  type="button"
                  onClick={() => handleQuickSet(1)}
                  className="btn-quick positive"
                  disabled={loading}
                >
                  <FaPlus /> +1
                </button>
                <button 
                  type="button"
                  onClick={() => handleQuickSet(5)}
                  className="btn-quick positive"
                  disabled={loading}
                >
                  <FaPlus /> +5
                </button>
                <button 
                  type="button"
                  onClick={() => handleQuickSet(10)}
                  className="btn-quick positive"
                  disabled={loading}
                >
                  <FaPlus /> +10
                </button>
              </div>
            </div>
            
            <div className="stock-preview">
              <h5>Resumen del Cambio</h5>
              <div className="preview-grid">
                <div className="preview-item">
                  <span className="preview-label">Stock actual:</span>
                  <span className="preview-value current">{currentStock}</span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Cambio:</span>
                  <span className={`preview-value ${isIncrease ? 'positive' : isDecrease ? 'negative' : 'neutral'}`}>
                    {stockChange > 0 ? '+' : ''}{stockChange}
                  </span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Nuevo stock:</span>
                  <span className={`preview-value result ${willBeNegative ? 'danger' : willBeZero ? 'warning' : ''}`}>
                    {newStock}
                  </span>
                </div>
              </div>
              
              {willBeNegative && (
                <div className="preview-warning danger">
                  <FaExclamationTriangle /> ¡El stock será negativo! No se puede guardar.
                </div>
              )}
              
              {willBeZero && (
                <div className="preview-warning warning">
                  <FaExclamationTriangle /> El stock quedará en cero
                </div>
              )}
              
              {isIncrease && (
                <div className="preview-note info">
                  Se agregarán {stockChange} unidades al inventario
                </div>
              )}
              
              {isDecrease && !willBeNegative && (
                <div className="preview-note">
                  Se descontarán {Math.abs(stockChange)} unidades del inventario
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="form-group">
          <label>Motivo del Cambio (opcional)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Ej: Reposición de inventario, venta directa, ajuste de inventario, devolución..."
            rows="2"
            disabled={loading}
          />
          <small className="form-help">
            Este comentario será registrado para auditoría
          </small>
        </div>
        
        <div className="form-actions">
          <div className="left-actions">
            <button 
              type="button" 
              onClick={handleReset}
              className="btn-reset"
              disabled={loading || (stockChange === 0 && !comment)}
            >
              Limpiar
            </button>
          </div>
          
          <div className="right-actions">
            <button 
              type="button" 
              onClick={onClose}
              className="btn-cancel"
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className={`btn-submit ${willBeNegative ? 'btn-danger' : ''}`}
              disabled={loading || stockChange === 0 || willBeNegative}
            >
              {loading ? (
                <>
                  <div className="spinner"></div> Actualizando...
                </>
              ) : (
                <>
                  <FaSave /> Actualizar Stock
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default StockUpdateForm;