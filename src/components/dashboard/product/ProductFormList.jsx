import React, { useState, useEffect } from 'react';
import { FaEdit, FaBoxOpen, FaPlus, FaTrashAlt, FaEye, FaSyncAlt } from 'react-icons/fa';
import productService from '../../../services/api/productService';
import ProductForm from './ProductForm'; 
import StockUpdateForm from './StockUpdateForm';
import './ProductFormList.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showStockForm, setShowStockForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formType, setFormType] = useState('create');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadProducts();
  }, [currentPage]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await productService.getAll((currentPage - 1) * itemsPerPage, itemsPerPage);
      setProducts(result.products || []);
      setTotalPages(Math.ceil(result.total / itemsPerPage) || 1);
    } catch (err) {
      console.error('Error cargando productos:', err);
      setError('Error al cargar los productos: ' + (err.message || 'Desconocido'));
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = () => {
    setFormType('create');
    setSelectedProduct(null);
    setShowProductForm(true);
  };

  const handleEditProduct = (product) => {
    console.log('🖊️ Editando producto:', {
      id: product.id_key || product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      category_id: product.category_id,
      fullData: product
    });
    
    setFormType('edit');
    setSelectedProduct(product);
    setShowProductForm(true);
  };

  const handleUpdateStock = (product) => {
    setSelectedProduct(product);
    setShowStockForm(true);
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(`¿Estás seguro de eliminar el producto "${productName}"?`)) return;
    try {
      await productService.delete(productId);
      alert('Producto eliminado exitosamente');
      loadProducts();
    } catch (err) {
      console.error('Error eliminando producto:', err);
      alert('Error al eliminar el producto: ' + (err.message || 'Desconocido'));
    }
  };

  const handleProductCreated = (product, isEditing) => {
    console.log(`${isEditing ? 'Actualizado' : 'Creado'}:`, product);
    loadProducts();
    setShowProductForm(false);
  };

  const handleStockUpdated = (product, change, newStock) => {
    console.log(`Stock actualizado: ${product.name} +${change} = ${newStock}`);
    loadProducts();
    setShowStockForm(false);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  return (
    <div className="products-admin">
      <div className="admin-header">
        <h2>📦 Gestión de Productos ({products.length})</h2>
        <div className="admin-header-actions">
          <button onClick={handleCreateProduct} className="btn-primary">
            <FaPlus /> Nuevo Producto
          </button>
          <button onClick={loadProducts} className="btn-refresh">
            <FaSyncAlt /> Actualizar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Cargando productos...</div>
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>
          <button onClick={loadProducts} className="btn-retry">Reintentar</button>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <p>No hay productos registrados</p>
          <button onClick={handleCreateProduct} className="btn-primary">
            <FaPlus /> Crear primer producto
          </button>
        </div>
      ) : (
        <>
          <div className="products-table-container">
            <table className="products-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Categoría</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id_key || product.id}>
                    <td className="product-id">#{product.id_key || product.id}</td>
                    <td className="product-name">
                      {product.name}
                      {product.sku && <small className="product-sku">SKU: {product.sku}</small>}
                    </td>
                    <td className="product-price">${parseFloat(product.price || 0).toFixed(2)}</td>
                    <td className="product-stock">
                      <span className={`stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                        {product.stock || 0} unidades
                      </span>
                    </td>
                    <td className="product-category">
                      {product.category?.name || 'General'}
                    </td>
                    <td className="product-status">
                      <span className={`status-badge ${product.stock > 0 ? 'active' : 'inactive'}`}>
                        {product.stock > 0 ? 'Disponible' : 'Agotado'}
                      </span>
                    </td>
                    <td className="product-actions">
                      <div className="action-buttons">
                        <button className="btn-view" onClick={() => window.open(`/products/${product.id_key || product.id}`, '_blank')} title="Ver detalles">
                          <FaEye />
                        </button>
                        <button 
                            className="btn-edit" 
                            onClick={() => handleEditProduct(product)} 
                            title="Editar producto"
                          >
                            <FaEdit />
                          </button>
                        <button className="btn-stock" onClick={() => handleUpdateStock(product)} title="Actualizar stock">
                          <FaBoxOpen />
                        </button>
                        <button className="btn-delete" onClick={() => handleDeleteProduct(product.id_key || product.id, product.name)} title="Eliminar producto">
                          <FaTrashAlt />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button onClick={handlePreviousPage} disabled={currentPage === 1} className="pagination-btn prev">
              ← Anterior
            </button>
            <span className="pagination-info">Página {currentPage} de {totalPages}</span>
            <button onClick={handleNextPage} disabled={currentPage >= totalPages} className="pagination-btn next">
              Siguiente →
            </button>
          </div>
        </>
      )}

      {showProductForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <ProductForm
              productToEdit={formType === 'edit' ? selectedProduct : null}
              onProductCreated={handleProductCreated}
              onClose={() => setShowProductForm(false)}
            />
          </div>
        </div>
      )}

      {showStockForm && selectedProduct && (
        <div className="modal-overlay">
          <div className="modal-content">
            <StockUpdateForm
              product={selectedProduct}
              onStockUpdated={handleStockUpdated}
              onClose={() => setShowStockForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
