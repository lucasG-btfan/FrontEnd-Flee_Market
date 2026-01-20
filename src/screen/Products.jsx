import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { productService } from '../services/api/productService';
import ProductList from '../components/products/productList';
import LoadingSpinner from '../components/common/LoadingSpinner';
import '../styles/Products.css';
import { useNavigate } from 'react-router-dom';

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [skip, setSkip] = useState(0);
  const limit = 12;
  const [useMock, setUseMock] = useState(false);
  const navigate = useNavigate();


  // Datos mock del frontend 
  const mockProducts = [
    {
      id: 1,
      id_key: 1,
      name: "iPhone 15 Pro Max",
      description: "Smartphone Apple con Dynamic Island",
      price: 1199990,
      stock: 15,
      image_url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=300&fit=crop",
      category: { name: "Smartphones" }
    },
    {
      id: 2,
      id_key: 2,
      name: "MacBook Air M3",
      description: "Laptop ultradelgada con chip Apple M3",
      price: 1099990,
      stock: 10,
      image_url: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400&h=300&fit=crop",
      category: { name: "Laptops" }
    },
  ];

  // Usar el hook useApi para obtener los productos del backend
  const { data, loading, error, refetch } = useApi(() =>
    searchTerm.trim() === ''
      ? productService.getAll(skip, limit)
      : productService.search(searchTerm, skip, limit)
  );

  // Normalización de datos del backend
  const normalizeBackendData = (backendData) => {
    if (!backendData) return [];
    // El backend devuelve un objeto con la clave "products"
    if (backendData.products && Array.isArray(backendData.products)) {
      return backendData.products;
    }
    return [];
  };

  // Efecto para manejar errores o datos vacíos
  useEffect(() => {
    if (error) {
      console.error("Error al cargar productos del backend:", error);
      setUseMock(true);
    } else if (data && normalizeBackendData(data).length === 0) {
      console.warn("El backend devolvió una lista vacía. Usando mocks.");
      setUseMock(true);
    }
  }, [data, error]);

  // Datos a mostrar: prioriza backend, usa mocks si falla o está vacío
  const productsToShow = useMock ? mockProducts : normalizeBackendData(data);

  // Depuración
  useEffect(() => {
    console.log("📦 Datos del backend:", data);
    console.log("📦 Productos normalizados:", productsToShow);
    console.log("📦 Usando mocks:", useMock);
  }, [data, useMock]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSkip(0);
    refetch();
  };

  const handleLoadMore = () => {
    setSkip(prev => prev + limit);
  };

  return (
    <div className="products-page">
      <div className="products-header">
        <h1>Nuestros Productos</h1>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">Buscar</button>
        </form>
      </div>
      {loading && !useMock && <LoadingSpinner />}
      {useMock && (
        <div className="warning-message">
          Mostrando productos de ejemplo. El backend no devolvió datos válidos.
        </div>
      )}
        <ProductList
          products={productsToShow}
          loading={loading && !useMock}
          error={null}
          onProductClick={(product) => {
            navigate(`/products/${product.id_key || product.id}`);
          }}
        />
      {!useMock && data && productsToShow.length >= limit && !searchTerm && (
        <div className="load-more">
          <button onClick={handleLoadMore} disabled={loading}>
            {loading ? 'Cargando...' : 'Cargar más'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Products;
