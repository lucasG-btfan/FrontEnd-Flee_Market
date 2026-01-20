// debugLogin.js - Script para probar el login directamente
async function debugLogin() {
  const email = 'admin@example.com';
  const password = 'admin123'; // Usa la contraseña correcta
  
  console.log('🔍 Probando login directo...');
  
  try {
    // Intentar con JSON
    const response1 = await fetch('https://comercio-digital.onrender.com/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });
    
    console.log('JSON Response status:', response1.status);
    const data1 = await response1.json();
    console.log('JSON Response data:', data1);
    
    // Intentar con form-urlencoded
    const params = new URLSearchParams();
    params.append('email', email);
    params.append('password', password);
    
    const response2 = await fetch('https://comercio-digital.onrender.com/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params
    });
    
    console.log('Form Response status:', response2.status);
    const data2 = await response2.json();
    console.log('Form Response data:', data2);
    
  } catch (error) {
    console.error('Error en debug:', error);
  }
}

// Ejecutar en la consola del navegador
debugLogin();