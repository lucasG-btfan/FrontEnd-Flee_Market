// scripts/initDatabase.js
export const initTestData = async () => {
  console.log('🧪 Initializing test data...');
  
  // 1. Crear un cliente de prueba
  const testClient = {
    name: "Test",
    lastname: "User",
    email: "test@example.com",
    telephone: "+541123456789"
  };
  
  // 2. Crear una categoría de prueba
  const testCategory = {
    name: "Electronics"
  };
  
  // 3. Crear un producto de prueba
  const testProduct = {
    name: "Test Product",
    price: 99.99,
    stock: 10,
    category_id: 1 // Asumiendo que la categoría se creó con ID 1
  };
  
  console.log('✅ Test data structure ready');
  return { testClient, testCategory, testProduct };
};