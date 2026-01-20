import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { useApi } from '../hooks/useApi';
import { productService } from '../services/api/productService';
import ProductList from '../components/products/productList';
import '../styles/HomeScreen.css';

const HomeScreen = () => {
  const { data: products, loading, error } = useApi(() =>
    productService.getAll(0, 8)
  );
  const navigate = useNavigate();

  console.log("📦 Productos en HomeScreen:", products);

  const handleProductClick = (product) => {
    console.log("📦 Producto clickeado:", product); 
    if (!product.id && !product.id_key) {
      console.error("❌ Producto sin ID:", product);
      return;
    }
    const productId = product.id_key || product.id;
    navigate(`/products/${productId}`);
  };
  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Bienvenido a nuestra tienda</h1>
          <p>Descubre los mejores productos con precios increíbles</p>
          <Link to="/products" className="cta-button">
            Ver todos los productos
          </Link>
        </div>
      </section>

      <section className="featured-products">
        <h2>Productos Destacados</h2>
        <ProductList
          products={products}
          loading={loading}
          error={error}
          onProductClick={handleProductClick} 
        />
      </section>
    </div>
  );
};

export default HomeScreen;
