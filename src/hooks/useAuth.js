import { useState, useEffect } from 'react';
import { getCurrentClient as getClientFromService } from '../services/api/authService';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const clientData = localStorage.getItem('client');

      if (token && clientData) {
        const client = JSON.parse(clientData);
        setUser(client);
        console.log('✅ Usuario cargado desde localStorage:', client);
      } else {
        console.log('❌ No hay token o datos de usuario en localStorage');
        setUser(null);
      }
    } catch (error) {
      console.error('Error cargando usuario:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('client', JSON.stringify(userData));
    setUser(userData);
    console.log('🔐 Usuario autenticado:', userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('client');
    setUser(null);
    console.log('🧹 Sesión cerrada');
  };

  return {
    user,
    loading,
    login,
    logout,
    refresh: loadUser
  };
};
