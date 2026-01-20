import api from './base';
import { extractData, handleApiError } from './base';
import { getCurrentClient } from './authService';

const USD_TO_ARS = 1000;

let backendCache = {
  products: null,
  timestamp: 0,
  ttl: 60000 
};

const baseMockProducts = [
  {
    id_key: 1,
    id: 1,
    name: "Laptop Gaming Razer",
    description: "Laptop para juegos de alta gama con RTX 4070",
    price: 1299.99 * USD_TO_ARS,
    price_usd: 1299.99,
    stock: 8,
    category_id: 1,
    category: { name: "Electrónica" },
    image_url: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop"
    ],
    rating: 4.7,
    brand: "Razer",
    specs: {
      processor: "Intel i7-13700H",
      ram: "16GB",
      storage: "1TB SSD",
      display: '15.6" QHD 165Hz'
    }
  },
  {
    id_key: 2,
    id: 2,
    name: "Mouse Inalámbrico Logitech",
    description: "Mouse ergonómico inalámbrico con 6 botones programables",
    price: 49.99 * USD_TO_ARS,
    price_usd: 49.99,
    stock: 50,
    category_id: 2,
    category: { name: "Accesorios" },
    image_url: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1527814050087-3793815479db?w=800&h=600&fit=crop"
    ],
    rating: 4.2,
    brand: "Logitech",
    specs: {
      dpi: "16000",
      connectivity: "Wireless 2.4GHz",
      battery: "30 horas"
    }
  },
  {
    id_key: 3,
    id: 3,
    name: "Teclado Mecánico RGB",
    description: "Teclado mecánico con retroiluminación RGB personalizable",
    price: 89.99 * USD_TO_ARS,
    price_usd: 89.99,
    stock: 30,
    category_id: 2,
    category: { name: "Accesorios" },
    image_url: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=800&h=600&fit=crop"
    ],
    rating: 4.5,
    brand: "Corsair",
    specs: {
      switches: "Cherry MX Red",
      layout: "US QWERTY",
      backlight: "RGB 16.8M colors"
    }
  }
];

const generateMockProducts = (count = 50) => {
  const products = [];
  const categories = ["Electrónica", "Accesorios", "Hardware", "Periféricos", "Gaming"];
  const brands = ["Razer", "Logitech", "Corsair", "ASUS", "MSI", "HyperX", "SteelSeries"];

  for (let i = 1; i <= count; i++) {
    const categoryId = Math.floor(Math.random() * 3) + 1;
    const priceUSD = (Math.random() * 1000 + 20).toFixed(2);
    const priceARS = priceUSD * USD_TO_ARS;

    products.push({
      id_key: i,
      id: i,
      name: `${brands[Math.floor(Math.random() * brands.length)]} ${[
        "Laptop", "Mouse", "Teclado", "Monitor", "Headset", "Webcam", "Micrófono"
      ][Math.floor(Math.random() * 7)]} ${["Gaming", "Profesional", "RGB", "Inalámbrico", "Ultra"][Math.floor(Math.random() * 5)]}`,
      description: `Producto de alta calidad para ${["gaming", "oficina", "diseño", "streaming"][Math.floor(Math.random() * 4)]} con tecnología avanzada.`,
      price: priceARS,
      price_usd: parseFloat(priceUSD),
      stock: Math.floor(Math.random() * 100) + 1,
      category_id: categoryId,
      category: { name: categories[categoryId - 1] },
      image_url: `https://images.unsplash.com/photo-1556656793-08538906a853?w=400&h=300&fit=crop&random=${i}`,
      images: [
        `https://images.unsplash.com/photo-1556656793-08538906a853?w=800&h=600&fit=crop&random=${i}`,
        `https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop&random=${i}`
      ],
      rating: (Math.random() * 3 + 2).toFixed(1),
      brand: brands[Math.floor(Math.random() * brands.length)],
      specs: {
        processor: ["Intel i7", "Intel i9", "Ryzen 7", "Ryzen 9"][Math.floor(Math.random() * 4)],
        ram: ["8GB", "16GB", "32GB"][Math.floor(Math.random() * 3)],
        storage: ["512GB SSD", "1TB SSD", "2TB HDD"][Math.floor(Math.random() * 3)],
        display: ['15.6" FHD', '17.3" QHD', '27" 4K'][Math.floor(Math.random() * 3)]
      }
    });
  }

  return [...baseMockProducts, ...products];
};

const processProducts = (products) => {
  if (!Array.isArray(products)) return [];
  return products.map(product => {
    const priceInARS = product.price || (product.price_usd ? product.price_usd * USD_TO_ARS : 0);
    const defaultImage = `https://images.unsplash.com/photo-1556656793-08538906a853?w=400&h=300&fit=crop&random=${product.id_key || product.id}`;

    return {
      ...product,
      id_key: product.id_key || product.id,
      price: priceInARS,
      price_formatted: formatPriceARS(priceInARS),
      image: product.image || product.image_url || defaultImage,
      images: product.images || [product.image_url || defaultImage],
      stock: product.stock || 0,
      category_id: product.category_id || 1,
      rating: product.rating || 4.0,
      brand: product.brand || "Generic",
      specs: product.specs || {}
    };
  });
};

const formatPriceARS = (price) => {
  return `$${price.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
};

const createTimeoutPromise = (timeout = 6000) => {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error('backend_timeout')), timeout)
  );
};

export const productService = {
  getAll: async (skip = 0, limit = 12, forceRefresh = false) => {
    try {
      console.log('📦 Conectando al backend...');
      
      const response = await api.get('/products', {
        params: { skip, limit }
      });

      console.log('✅ Respuesta del backend:', response.data);
      
      let products = [];
      if (Array.isArray(response.data)) {
        products = response.data;
      } else if (response.data.products) {
        products = response.data.products;
      } else if (response.data.items) {
        products = response.data.items;
      } else if (response.data.data) {
        products = response.data.data;
      }

      return {
        products: processProducts(products),
        total: products.length,
        skip,
        limit
      };

    } catch (error) {
      console.error('❌ Error conectando al backend:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      console.log(`🔍 Intentando obtener producto ${id} del backend...`);

      const timeoutPromise = createTimeoutPromise();
      const apiPromise = api.get(`/products/${id}`);
      const response = await Promise.race([apiPromise, timeoutPromise]);

      let productData = response.data.data || response.data.product || response.data;
      return processProducts([productData])[0];

    } catch (error) {
      console.error(`❌ Error obteniendo producto ${id}:`, error.message);
      console.log(`📦 Usando mock para producto ${id}`);

      if (backendCache.products) {
        const cachedProduct = backendCache.products.find(p => p.id_key == id || p.id == id);
        if (cachedProduct) {
          return processProducts([cachedProduct])[0];
        }
      }

      const mockProduct = generateMockProducts(1)[0];
      mockProduct.id_key = id;
      mockProduct.id = id;
      return processProducts([mockProduct])[0];
    }
  },

  search: async (query, skip = 0, limit = 12) => {
    try {
      console.log(`🔍 Buscando: "${query}"`);
      const response = await api.get('/products/search', {
        params: { q: query, skip, limit }
      });

      const backendData = response.data;
      let products = [];
      if (Array.isArray(backendData)) {
        products = backendData;
      } else if (backendData.products) {
        products = backendData.products;
      } else if (backendData.items) {
        products = backendData.items;
      }

      return {
        products: processProducts(products),
        query,
        count: backendData.count || products.length
      };

    } catch (error) {
      console.error(`❌ Error buscando productos:`, error.message);

      const allMocks = backendCache.products || generateMockProducts(50);
      const filteredMock = allMocks.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
      );

      return {
        products: processProducts(filteredMock.slice(skip, skip + limit)),
        query,
        count: filteredMock.length
      };
    }
  },

  getByCategory: async (categoryId, skip = 0, limit = 8) => {
    try {
      console.log(`📦 Fetching products for category: ${categoryId}`);
      const response = await api.get('/products/category', {
        params: { category_id: categoryId, skip, limit }
      });
      let products = extractData(response.data);
      products = processProducts(products);

      backendCache = {
        products: products,
        timestamp: Date.now(),
        ttl: 120000
      };

      return { products, categoryId, count: products.length };
    } catch (error) {
      console.error(`Error fetching products for category ${categoryId}:`, error.message);

      const allMocks = backendCache.products || generateMockProducts(50);
      const filteredMock = allMocks.filter(p => p.category_id === parseInt(categoryId));

      return {
        products: processProducts(filteredMock.slice(skip, skip + limit)),
        categoryId,
        count: filteredMock.length
      };
    }
  },
  
  create: async (productData) => {
    try {
      const client = getCurrentClient();
      
      if (!client || client.id === undefined) {
        throw new Error('Usuario no autenticado');
      }

      const categoryId = parseInt(productData.category_id) || 1;
      const productToSend = {
        name: productData.name,
        description: productData.description || "",
        price: parseFloat(productData.price), 
        stock: parseInt(productData.stock) || 0,
        category_id: categoryId,
        image_url: productData.image_url || "",
        sku: productData.sku || `SKU-${Date.now()}`,
        client_id: parseInt(client.id)
      };

      console.log('📤 Creando producto (precio en ARS):', productToSend);
      const response = await api.post('/products', productToSend);

      backendCache.products = null;

      const createdProduct = response.data;
      return processProducts([createdProduct])[0];
    } catch (error) {
      console.error('❌ Error creando producto:', error);
      throw error;
    }
  },

  update: async (id, productData) => {
    try {
      console.log(`📦 Actualizando producto ${id}...`);
      
      const productDataToSend = { ...productData };
      
      if (productData.price !== undefined) {
        productDataToSend.price = parseFloat(productData.price);
      }
      
      if (productData.stock !== undefined) {
        productDataToSend.stock = parseInt(productData.stock);
      }
      
      if (productData.category_id !== undefined) {
        productDataToSend.category_id = parseInt(productData.category_id);
      }
      
      console.log('📤 Datos a enviar (precio en ARS):', productDataToSend);
      const response = await api.put(`/products/${id}`, productDataToSend);
      console.log('✅ Respuesta del servidor:', response.data);      
      backendCache.products = null;
      
      let updatedProduct = response.data;
      
      if (updatedProduct && updatedProduct.data) {
        updatedProduct = updatedProduct.data;
      } else if (updatedProduct && updatedProduct.product) {
        updatedProduct = updatedProduct.product;
      }
      
      console.log('✅ Producto procesado:', updatedProduct);
      return processProducts([updatedProduct])[0];
      
    } catch (error) {
      console.error(`❌ Error actualizando producto ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      console.log(`🗑️ Deleting product ${id}`);
      const response = await api.delete(`/products/${id}`);

      // Invalidate cache
      backendCache.products = null;

      return response.data;
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error.message);
      throw error;
    }
  },

  getFeatured: async () => {
    try {
      const response = await api.get('/products/featured');
      let products = extractData(response.data);
      products = processProducts(products);

      // Actualizar caché
      backendCache = {
        products: products,
        timestamp: Date.now(),
        ttl: 120000
      };

      return products;
    } catch (error) {
      console.error('Error getting featured products:', error.message);

      const allMocks = backendCache.products || generateMockProducts(50);
      const featuredMocks = allMocks.sort(() => 0.5 - Math.random()).slice(0, 4);

      return processProducts(featuredMocks);
    }
  },

  formatPrice: formatPriceARS,

  USD_TO_ARS: USD_TO_ARS,

  createOrderWithProducts: async (products) => {
    try {
      const client = getCurrentClient();
      if (!client?.id) {
        throw new Error('Usuario no autenticado');
      }

      const orderData = {
        client_id: parseInt(client.id),
        order_date: new Date().toISOString(),
        status: 'pending',
        total: products.reduce((sum, p) => sum + (p.price * p.quantity), 0),
        order_details: products.map(p => ({
          product_id: p.id_key,
          quantity: p.quantity,
          unit_price: p.price
        }))
      };

      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error.message);
      throw error;
    }
  },

  clearCache: () => {
    backendCache = {
      products: null,
      timestamp: 0,
      ttl: 60000
    };
    console.log('🧹 Cache limpiada');
  },

  update: async (id, productData) => {
    try {
      console.log(`📦 INICIANDO ACTUALIZACIÓN - Producto ID: ${id}`);
      console.log(`📦 Datos recibidos:`, JSON.stringify(productData, null, 2));
      
      const productDataToSend = { ...productData };
      
      if (productData.stock !== undefined && productData.stock !== null) {
        productDataToSend.stock = parseInt(productData.stock);
      }
      
      if (productData.category_id !== undefined && productData.category_id !== null) {
        productDataToSend.category_id = parseInt(productData.category_id);
      }
      
      console.log('📤 Enviando PUT a:', `/products/${id}`);
      console.log('📤 Datos a enviar:', productDataToSend);
      
      const response = await api.put(`/products/${id}`, productDataToSend);
      
      console.log('✅ Respuesta del servidor - Status:', response.status);
      console.log('✅ Respuesta del servidor - Data:', response.data);
      
      backendCache.products = null;
      
      let updatedProduct = response.data;
      
      if (updatedProduct && updatedProduct.data) {
        updatedProduct = updatedProduct.data;
      } else if (updatedProduct && updatedProduct.product) {
        updatedProduct = updatedProduct.product;
      }
      
      console.log('✅ Producto procesado después de actualizar:', updatedProduct);
      
      const processedProduct = processProducts([updatedProduct])[0];
      console.log('✅ Producto procesado final:', processedProduct);
      
      return processedProduct;
      
    } catch (error) {
      console.error(`❌ ERROR en actualización del producto ${id}:`, error);
      
      if (error.response) {
        console.error('📋 Detalles del error del servidor:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          url: error.response.config?.url,
          method: error.response.config?.method,
          headers: error.response.config?.headers
        });
        
        const status = error.response.status;
        const errorData = error.response.data;
        
        if (status === 404) {
          throw new Error(`Producto con ID ${id} no encontrado en el servidor`);
        } else if (status === 400) {
          throw new Error(`Datos inválidos: ${errorData.detail || errorData.message || JSON.stringify(errorData)}`);
        } else if (status === 401 || status === 403) {
          throw new Error('No tienes permisos para actualizar productos');
        } else if (status === 500) {
          throw new Error(`Error interno del servidor: ${errorData.detail || 'Contacta al administrador'}`);
        } else {
          throw new Error(`Error del servidor (${status}): ${errorData.detail || errorData.message || 'Error desconocido'}`);
        }
      } else if (error.request) {
        console.error('❌ No se recibió respuesta del servidor:', error.request);
        throw new Error('No se pudo conectar con el servidor. Verifica tu conexión.');
      } else {
        console.error('❌ Error al configurar la petición:', error.message);
        throw error;
      }
    }
  },

  batchUpdateStock: async (productsStock) => {
    try {
      console.log('📦 Actualizando stock en batch:', productsStock);
      
      const results = [];
      const errors = [];
      
      for (const item of productsStock) {
        try {
          const result = await productService.updateStock(
            item.product_id, 
            -item.quantity 
          );
          results.push(result);
        } catch (error) {
          errors.push({
            product_id: item.product_id,
            error: error.message
          });
          console.error(`❌ Error actualizando producto ${item.product_id}:`, error);
        }
      }
      
      return {
        success: errors.length === 0,
        results,
        errors,
        totalUpdated: results.length,
        totalErrors: errors.length
      };
      
    } catch (error) {
      console.error('❌ Error en batchUpdateStock:', error);
      throw error;
    }
  },
  
  verifyStock: async (items) => {
    try {
      console.log('🔍 Verificando stock para:', items);
      
      const stockPromises = items.map(async (item) => {
        const product = await productService.getById(item.product_id || item.id_key || item.id);
        
        if (!product) {
          return {
            productId: item.product_id || item.id_key || item.id,
            name: item.name,
            success: false,
            message: 'Producto no encontrado'
          };
        }
        
        const requestedQuantity = item.quantity || 1;
        if (product.stock < requestedQuantity) {
          return {
            productId: product.id_key,
            name: product.name,
            success: false,
            message: `Stock insuficiente: ${product.stock} disponible, ${requestedQuantity} solicitado`
          };
        }
        
        return {
          productId: product.id_key,
          name: product.name,
          success: true,
          stock: product.stock,
          requested: requestedQuantity
        };
      });
      
      const results = await Promise.all(stockPromises);
      const failures = results.filter(r => !r.success);
      
      if (failures.length > 0) {
        return {
          success: false,
          message: `Stock insuficiente para: ${failures.map(f => f.name).join(', ')}`,
          details: failures
        };
      }
      
      return {
        success: true,
        message: 'Stock verificado correctamente',
        details: results
      };
      
    } catch (error) {
      console.error('❌ Error verificando stock:', error);
      return {
        success: false,
        message: 'Error al verificar stock. Intenta nuevamente.'
      };
    }
  },

  // Esta función ya existe como batchUpdateStock
  updateProductsStock: async (items) => {
      return productService.batchUpdateStock(items);
    }
};

export default productService;
