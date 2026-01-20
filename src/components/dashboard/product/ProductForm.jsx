import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaImage, FaTag, FaDollarSign, FaBox, FaLayerGroup, FaInfoCircle, FaSpinner } from 'react-icons/fa';
import productService from '../../../services/api/productService';
import categoryService from '../../../services/api/FrontCategoryService';
import './ProductForm.css';

const ProductForm = ({ onProductCreated, onClose, productToEdit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    image_url: '',
    sku: ''
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [imageError, setImageError] = useState(false);

  const defaultCategories = [
    { id_key: 1, name: 'Electrónica' },
    { id_key: 2, name: 'Computación' },
    { id_key: 3, name: 'Hogar' },
    { id_key: 4, name: 'Ropa' },
    { id_key: 5, name: 'Deportes' },
    { id_key: 6, name: 'General' }
  ];

  useEffect(() => {
    console.log('🔄 useEffect ejecutándose con productToEdit:', productToEdit);
    console.log('📋 Datos completos del producto:', JSON.stringify(productToEdit, null, 2));
    
    loadCategories();
    if (productToEdit) {
      setIsEditing(true);
      const formDataToSet = {
        name: productToEdit.name || '',
        description: productToEdit.description || '',
        price: productToEdit.price ? parseFloat(productToEdit.price).toFixed(2) : '',
        stock: productToEdit.stock || '',
        category_id: productToEdit.category_id || '',
        image_url: productToEdit.image_url || '',
        sku: productToEdit.sku || `PRD-${productToEdit.id_key}`
      };
      
      console.log('📝 FormData que se establecerá:', formDataToSet);
      setFormData(formDataToSet);
    } else {
      setFormData(prev => ({
        ...prev,
        sku: `PRD-${Date.now().toString().slice(-6)}`
      }));
    }
  }, [productToEdit]);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const categoriesData = await categoryService.getAll();
      let processedCategories = [];
      if (Array.isArray(categoriesData)) {
        processedCategories = categoriesData;
      } else if (categoriesData?.items) {
        processedCategories = categoriesData.items;
      } else if (categoriesData?.categories) {
        processedCategories = categoriesData.categories;
      }
      if (processedCategories.length === 0) {
        processedCategories = defaultCategories;
      }
      setCategories(processedCategories);
    } catch (error) {
      console.error('Error cargando categorías:', error);
      setCategories(defaultCategories);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'image_url') setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const generateSKU = () => {
    const newSKU = `PRD-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
    setFormData(prev => ({ ...prev, sku: newSKU }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🎯 handleSubmit ejecutado');
    console.log('📋 Estado actual de formData:', formData);
    console.log('✏️ isEditing:', isEditing);
    console.log('🎯 productToEdit:', productToEdit);
    
    setLoading(true);
    setError(null);
    try {
      if (!formData.name.trim()) throw new Error('El nombre del producto es requerido');
      if (!formData.price || parseFloat(formData.price) <= 0) throw new Error('El precio debe ser mayor a 0');
      if (!formData.category_id) throw new Error('Debes seleccionar una categoría');
      
      const stock = parseInt(formData.stock) || 0;
      if (stock < 0) throw new Error('El stock no puede ser negativo');
      
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim() || '',
        price: parseFloat(formData.price),
        stock: stock,
        category_id: parseInt(formData.category_id),
        image_url: formData.image_url.trim() || '',
        sku: formData.sku.trim() || `PRD-${Date.now()}`
      };
      
      console.log('📤 Datos preparados para enviar:', productData);
      
      let result;
      
      if (isEditing && productToEdit) {
        const productId = productToEdit.id_key || productToEdit.id;
        console.log(`✏️ Editando producto ID: ${productId}`);
        
        result = await productService.update(productId, productData);
        console.log('✅ Resultado de la actualización:', result);
        setSuccess(`✅ Producto "${result.name}" actualizado exitosamente`);
      } else {
        console.log('➕ Creando nuevo producto:', productData);
        result = await productService.create(productData);
        setSuccess(`✅ Producto "${result.name}" creado exitosamente`);
      }
      
      if (!isEditing) {
        setFormData({
          name: '',
          description: '',
          price: '',
          stock: '',
          category_id: '',
          image_url: '',
          sku: `PRD-${Date.now().toString().slice(-6)}`
        });
      }
      
      // Notificar al componente padre
      if (onProductCreated) onProductCreated(result, isEditing);
      
      // Cerrar después de éxito
      setTimeout(() => { 
        if (onClose) {
          console.log('🚪 Cerrando modal...');
          onClose();
        }
      }, 1500);
      
    } catch (err) {
      console.error('❌ Error en handleSubmit:', err);
      let errorMessage = err.message || 'Error al guardar el producto';
      
      // Mensajes de error específicos
      if (errorMessage.includes('ForeignK') || errorMessage.includes('category_id')) {
        errorMessage = 'Error: La categoría seleccionada no existe en la base de datos.';
      } else if (errorMessage.includes('authenticated')) {
        errorMessage = 'Error: Debes iniciar sesión como administrador.';
      } else if (errorMessage.includes('Email already registered')) {
        errorMessage = 'Error: El SKU ya está registrado.';
      } else if (errorMessage.includes('404')) {
        errorMessage = 'Error: Producto no encontrado en el servidor.';
      } else if (errorMessage.includes('400')) {
        errorMessage = 'Error: Datos inválidos enviados al servidor.';
      }
      
      console.error('🚨 Error mostrado al usuario:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      category_id: '',
      image_url: '',
      sku: `PRD-${Date.now().toString().slice(-6)}`
    });
    setError(null);
    setSuccess(null);
    setImageError(false);
  };

  return (
    <div className="product-form-modal">
      <div className="form-header">
        <h3>{isEditing ? '✏️ Editar Producto' : '➕ Nuevo Producto'}</h3>
        {onClose && (
          <button onClick={onClose} className="close-btn" title="Cerrar">
            <FaTimes />
          </button>
        )}
      </div>
      {error && (
        <div className="alert error">
          <FaInfoCircle /> <strong>Error:</strong> {error}
        </div>
      )}
      {success && (
        <div className="alert success">
          <strong>Éxito:</strong> {success}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h4><FaTag /> Información Básica</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Nombre del Producto *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Ej: Laptop Gaming Razer Blade 15"
                disabled={loading}
                maxLength="200"
              />
              <small className="form-help">{formData.name.length}/200 caracteres</small>
            </div>
            <div className="form-group">
              <label><FaLayerGroup /> Categoría *</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                required
                disabled={loading || loadingCategories}
                className="category-select"
              >
                <option value="">Seleccionar categoría</option>
                {categories.map(category => (
                  <option key={category.id_key || category.id} value={category.id_key || category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {loadingCategories ? (
                <small className="loading-text">
                  <FaSpinner className="spinner-small" /> Cargando categorías...
                </small>
              ) : (
                <small className="form-help">
                  {categories.length} categorías disponibles
                </small>
              )}
            </div>
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe el producto en detalle..."
              rows="4"
              disabled={loading}
              maxLength="1000"
            />
            <small className="form-help">{formData.description.length}/1000 caracteres</small>
          </div>
        </div>
        <div className="form-section">
          <h4><FaBox /> Precio y Stock</h4>
          <div className="form-row">
            <div className="form-group">
              <label><FaDollarSign /> Precio (ARS) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0.01"
                step="0.01"
                placeholder="Ej: 185000.99"
                disabled={loading}
                className="price-input"
              />
              <small className="form-help">Precio en pesos argentinos (ARS)</small>
            </div>
            <div className="form-group">
              <label><FaBox /> Stock Inicial</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                step="1"
                placeholder="0"
                disabled={loading}
              />
              <small className="form-help">Dejar en 0 si no hay stock disponible</small>
            </div>
          </div>
          <div className="form-group">
            <label>Código SKU</label>
            <div className="sku-input-group">
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="SKU del producto"
                disabled={loading}
                maxLength="50"
              />
              <button type="button" onClick={generateSKU} className="btn-generate" disabled={loading}>
                Generar
              </button>
            </div>
            <small className="form-help">Identificador único del producto</small>
          </div>
        </div>
        <div className="form-section">
          <h4><FaImage /> Imagen del Producto</h4>
          <div className="form-group">
            <label>URL de la Imagen</label>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="https://ejemplo.com/imagen-producto.jpg"
              disabled={loading}
            />
            <div className="image-help">
              <small className="form-help">
                Recomendado: imágenes de <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer">Unsplash</a>
              </small>
              <button type="button" onClick={() => window.open('https://unsplash.com', '_blank')} className="btn-help">
                Buscar imágenes
              </button>
            </div>
          </div>
          {formData.image_url && (
            <div className="image-preview-container">
              <h5>Vista Previa</h5>
              <div className="image-preview">
                {!imageError ? (
                  <img
                    src={formData.image_url}
                    alt="Vista previa del producto"
                    onError={handleImageError}
                    className={imageError ? 'hidden' : ''}
                  />
                ) : (
                  <div className="image-error">
                    <FaImage size={48} />
                    <p>No se puede cargar la imagen</p>
                    <small>Verifica la URL</small>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="form-actions">
          <div className="left-actions">
            <button type="button" onClick={handleReset} className="btn-reset" disabled={loading}>
              Limpiar Formulario
            </button>
          </div>
          <div className="right-actions">
            {onClose && (
              <button type="button" onClick={onClose} className="btn-cancel" disabled={loading}>
                Cancelar
              </button>
            )}
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner"></div>
                  {isEditing ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                <>
                  <FaSave />
                  {isEditing ? 'Actualizar Producto' : 'Crear Producto'}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
