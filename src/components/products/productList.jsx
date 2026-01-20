import React from 'react';
import ProductCard from './productCard';
import LoadingSpinner from '../common/LoadingSpinner';
import './productList.css';

const ProductList = ({ products, loading, error, onProductClick, addToCart, layout = 'grid' }) => {
  console.log("🔄 ProductList recibió:", products, "Layout:", layout);

  let safeProducts = [];

  
  if (products) {
    if (Array.isArray(products)) {
      safeProducts = products;
    } else if (products.products && Array.isArray(products.products)) {
      safeProducts = products.products;
    } else if (products.items && Array.isArray(products.items)) {
      safeProducts = products.items;
    }
  }

  console.log("🔄 Productos seguros:", safeProducts.length);

  if (loading) {
    return <LoadingSpinner text="Cargando productos..." />;
  }

  if (error) {
    return (
      <div className="error-message">
        <h3>Error al cargar productos</h3>
        <p>{error.message || "Ocurrió un error inesperado"}</p>
      </div>
    );
  }

  if (!safeProducts || safeProducts.length === 0) {
    return (
      <div className="empty-state">
        <h3>No se encontraron productos</h3>
        <p>Intenta ajustar los filtros de búsqueda</p>
      </div>
    );
  }

  const handleAddToCart = (product) => {
    if (addToCart) {
      addToCart({
        ...product,
        id_key: product.id_key || product.id,
        id: product.id_key || product.id 
      }, 1);
    }
  };

  return (
    <div className={`product-list ${layout}`}>
      {safeProducts.map((product) => (
        <ProductCard
          key={product.id || product.id_key}
          product={product}
          onClick={() => onProductClick && onProductClick(product)}
          onAddToCart={() => handleAddToCart(product)}
          layout={layout}
        />
      ))}
    </div>
  );
};

export default ProductList;