import React, { useState, useEffect } from 'react';
import SystemMetrics from '../components/dashboard/SystemMetrics';
import ProductForm from '../components/dashboard/product/ProductForm';
import ProductList from '../components/products/productList';
import { productService } from '../services/api/productService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ClientsAdmin from '../components/dashboard/ClientsAdmin';
import OrdersAdmin from '../components/dashboard/OrdersAdmin'; 
import '../styles/AdminDashboard.css';

const ProductsAdmin = ({ onProductCreated }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const productsData = await productService.getAll();
      setProducts(productsData.items || productsData.products || productsData || []);
    } catch (err) {
      console.error('Error loading products:', err);
      setError(err.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await productService.delete(productId);
        loadProducts();
      } catch (err) {
        console.error('Error deleting product:', err);
        alert('Error al eliminar producto');
      }
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div className="products-admin">
      <h2>📦 Gestión de Productos</h2>

      <div className="product-form-section">
        <ProductForm onProductCreated={onProductCreated} />
      </div>

      <div className="product-list-section">
        <h3>📋 Lista de Productos ({products.length})</h3>

        {loading ? (
          <LoadingSpinner text="Cargando productos..." />
        ) : error ? (
          <div className="error-message">
            <p>Error: {error}</p>
            <button onClick={loadProducts}>Reintentar</button>
          </div>
        ) : products.length === 0 ? (
          <p>No hay productos. Crea uno nuevo.</p>
        ) : (
          <div className="products-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Precio</th>
                  <th>Categoría</th>
                  <th>Stock</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const categoryNames = {
                    1: "General",
                    2: "Electrónica",
                    3: "Computación",
                    4: "Hogar",
                    5: "Ropa",
                    6: "Deportes",
                  };
                  const categoryName = categoryNames[product.category_id] || "Desconocida";

                  return (
                    <tr key={product.id_key || product.id}>
                      <td>{product.id_key || product.id}</td>
                      <td>{product.name}</td>
                      <td>${product.price?.toFixed(2)}</td>
                      <td>{categoryName}</td>
                      <td>
                        <span className={`stock ${product.stock <= 5 ? 'critical' : product.stock <= 10 ? 'low' : product.stock <= 20 ? 'medium' : 'high'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="product-actions">
                        <button
                          className="btn-edit"
                          onClick={() => alert(`Editar producto ${product.name} (ID: ${product.id_key || product.id})`)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteProduct(product.id_key || product.id)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');

  const tabs = [
    { id: 'products', label: '📦 Productos' },
    { id: 'orders', label: '📋 Órdenes' },
    { id: 'clients', label: '👥 Clientes' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'products':
        return <ProductsAdmin onProductCreated={() => {}} />;
      case 'orders':
        return <OrdersAdmin />; 
      case 'clients':
        return <ClientsAdmin />;
      default:
        return <ProductsAdmin onProductCreated={() => {}} />;
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>🔧 Panel de Administración</h1>

      <SystemMetrics />

      <div className="admin-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;