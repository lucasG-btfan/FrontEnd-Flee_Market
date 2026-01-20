const HARDCODED_CATEGORIES = [
  { id_key: 1, id: 1, name: 'Electrónica', description: 'Productos electrónicos' },
  { id_key: 2, id: 2, name: 'Computación', description: 'Equipos de computación' },
  { id_key: 3, id: 3, name: 'Hogar', description: 'Artículos para el hogar' },
  { id_key: 4, id: 4, name: 'Ropa', description: 'Vestimenta y accesorios' },
  { id_key: 5, id: 5, name: 'Deportes', description: 'Artículos deportivos' },
  { id_key: 6, id: 6, name: 'General', description: 'Categoría general' }
];

let categoriesCache = null;

export const categoryService = {
  getAll: async (skip = 0, limit = 100) => {
    try {
      console.log('📞 [categoryService] Obteniendo categorías desde cache/memoria');
      
      if (categoriesCache) {
        console.log('✅ [categoryService] Usando categorías en caché');
        return categoriesCache;
      }
      
      try {
        const productService = await import('./productService');
        const products = await productService.productService.getAll(0, 100);
        
        if (products && products.products && products.products.length > 0) {
          // Extraer categorías únicas de los productos
          const uniqueCategories = new Map();
          
          products.products.forEach(product => {
            if (product.category_id && product.category) {
              const categoryId = product.category_id;
              if (!uniqueCategories.has(categoryId)) {
                uniqueCategories.set(categoryId, {
                  id_key: categoryId,
                  id: categoryId,
                  name: product.category.name || `Categoría ${categoryId}`,
                  description: product.category.description || ''
                });
              }
            }
          });
          
          if (uniqueCategories.size > 0) {
            const categoriesArray = Array.from(uniqueCategories.values());
            categoriesCache = categoriesArray;
            console.log('✅ [categoryService] Categorías extraídas de productos:', categoriesArray.length);
            return categoriesArray;
          }
        }
      } catch (productError) {
        console.log('⚠️ [categoryService] No se pudieron extraer categorías de productos:', productError.message);
      }
      
      console.log('🔄 [categoryService] Usando categorías predefinidas');
      categoriesCache = HARDCODED_CATEGORIES;
      return HARDCODED_CATEGORIES;
      
    } catch (error) {
      console.error('❌ [categoryService] Error obteniendo categorías:', error);
      return HARDCODED_CATEGORIES;
    }
  },

  getById: async (id) => {
    try {
      console.log(`📞 [categoryService] Obteniendo categoría ID: ${id}`);
      
      const allCategories = await categoryService.getAll();
      const category = allCategories.find(cat => cat.id_key == id || cat.id == id);
      
      if (category) {
        console.log(`✅ [categoryService] Categoría encontrada: ${category.name}`);
        return category;
      }
      
      console.log(`⚠️ [categoryService] Categoría ${id} no encontrada, creando genérica`);
      return {
        id_key: id,
        id: id,
        name: `Categoría ${id}`,
        description: 'Categoría del producto'
      };
      
    } catch (error) {
      console.error(`❌ [categoryService] Error obteniendo categoría ${id}:`, error);
      return {
        id_key: id,
        id: id,
        name: `Categoría ${id}`,
        description: 'Categoría del producto'
      };
    }
  },

  create: async (categoryData) => {
    try {
      console.log('📞 [categoryService] Creando categoría (simulado):', categoryData);
      
      const newCategory = {
        ...categoryData,
        id_key: Date.now(),
        id: Date.now(),
        created_at: new Date().toISOString()
      };
      
      if (categoriesCache) {
        categoriesCache.push(newCategory);
      }
      
      console.log('✅ [categoryService] Categoría creada (simulada):', newCategory);
      return newCategory;
      
    } catch (error) {
      console.error('❌ [categoryService] Error creando categoría:', error);
      throw error;
    }
  },

  update: async (id, categoryData) => {
    try {
      console.log(`📞 [categoryService] Actualizando categoría ${id} (simulado):`, categoryData);
      
      const updatedCategory = {
        ...categoryData,
        id_key: id,
        id: id,
        updated_at: new Date().toISOString()
      };
      
      if (categoriesCache) {
        const index = categoriesCache.findIndex(cat => cat.id_key == id || cat.id == id);
        if (index !== -1) {
          categoriesCache[index] = { ...categoriesCache[index], ...updatedCategory };
        }
      }
      
      console.log('✅ [categoryService] Categoría actualizada (simulada):', updatedCategory);
      return updatedCategory;
      
    } catch (error) {
      console.error(`❌ [categoryService] Error actualizando categoría ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      console.log(`🗑️ [categoryService] Eliminando categoría ${id} (simulado)`);
      
      // Simular eliminación en cache
      if (categoriesCache) {
        categoriesCache = categoriesCache.filter(cat => cat.id_key != id && cat.id != id);
      }
      
      console.log(`✅ [categoryService] Categoría ${id} eliminada (simulada)`);
      return { success: true, message: `Categoría ${id} eliminada` };
      
    } catch (error) {
      console.error(`❌ [categoryService] Error eliminando categoría ${id}:`, error);
      throw error;
    }
  },

  // Método para obtener categorías sincrónicamente (útil para selects)
  getCategoriesSync: () => {
    return categoriesCache || HARDCODED_CATEGORIES;
  },

  // Método para limpiar cache
  clearCache: () => {
    categoriesCache = null;
    console.log('🧹 [categoryService] Cache de categorías limpiado');
  }
};

export default categoryService;