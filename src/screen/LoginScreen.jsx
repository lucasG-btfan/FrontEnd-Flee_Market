import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/api/authService';
import addressService from '../services/api/addressService';
import { ARGENTINIAN_PROVINCES } from '../constants/argentinianProvinces';
import { useAuth } from '../hooks/useAuth';
import '../styles/LoginScreen.css';

const LoginScreen = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    lastname: '',
    phone: '',
    street: '',
    city: '',
    state: 'CABA',
    zip_code: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login: authLogin } = useAuth(); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;

      if (isLogin) {
        console.log('🔐 Intentando login con:', formData.email);
        response = await login(formData.email, formData.password);

        console.log('✅ Login exitoso:', response);

        // Llamar a onLogin para actualizar el estado de autenticación
        if (onLogin) {
          onLogin({
            token: response.access_token,
            id: response.client.id,
            name: response.client.name,
            email: response.client.email
          });
        }
      } else {
        console.log('📝 Intentando registro completo...');

        const registerData = {
          email: formData.email,
          password: formData.password,
          confirm_password: formData.confirmPassword,
          name: formData.name,
          lastname: formData.lastname,
          phone: formData.phone || ''
        };

        console.log('📦 Registrando cliente:', registerData);
        const clientResponse = await register(registerData);
        console.log('✅ Cliente registrado:', clientResponse);

        if (clientResponse.client_id && formData.street && formData.city) {
          const addressData = {
            client_id_key: clientResponse.client_id,
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zip_code || ''
          };

          console.log('🏠 Creando dirección:', addressData);

          try {
            const addressResponse = await addressService.create(addressData);
            console.log('✅ Dirección creada:', addressResponse);
          } catch (addressError) {
            console.warn('⚠️ Error creando dirección (puede continuar):', addressError);
          }
        } else {
          console.log('ℹ️ No se creó dirección (datos insuficientes o usuario decidió omitir)');
        }

        alert('¡Registro exitoso! Por favor inicia sesión.');
        setIsLogin(true);

        // Limpiar formulario
        setFormData({
          email: formData.email,
          password: '',
          confirmPassword: '',
          name: '',
          lastname: '',
          phone: '',
          street: '',
          city: '',
          state: 'CABA',
          zip_code: ''
        });
      }
    } catch (err) {
      console.error('❌ Error completo:', err);

      if (err.message.includes('Invalid credentials') || err.message.includes('Invalid')) {
        setError('Email o contraseña incorrectos');
      } else if (err.message.includes('already registered')) {
        setError('Este email ya está registrado');
      } else if (err.message.includes('Passwords do not match')) {
        setError('Las contraseñas no coinciden');
      } else if (err.message.includes('timeout') || err.message.includes('Network Error')) {
        setError('Error de conexión. Verifica tu internet o intenta más tarde.');
      } else if (err.message.includes('422')) {
        setError('Datos inválidos. Verifica que todos los campos sean correctos.');
      } else {
        setError(err.message || 'Error de autenticación');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              {/* Sección de datos personales */}
              <div className="form-section">
                <h3>👤 Datos Personales</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Nombre *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Juan"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Apellido *</label>
                    <input
                      type="text"
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleChange}
                      required
                      placeholder="Pérez"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="11 1234-5678"
                  />
                </div>
              </div>
              
              {/* Sección de dirección SIMPLIFICADA */}
              <div className="form-section">
                <h3>🏠 Dirección de Entrega</h3>
                <p className="form-hint">(Opcional - puedes agregarla después)</p>
                
                <div className="form-group">
                  <label>Calle</label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    placeholder="Av. Corrientes"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Ciudad</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Buenos Aires"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Provincia</label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                    >
                      {ARGENTINIAN_PROVINCES.map(province => (
                        <option key={province.value} value={province.value}>
                          {province.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Código Postal</label>
                  <input
                    type="text"
                    name="zip_code"
                    value={formData.zip_code}
                    onChange={handleChange}
                    placeholder="C1043"
                    maxLength="10"
                  />
                </div>
              </div>
            </>
          )}

          {/* Sección de credenciales */}
          <div className="form-section">
            <h3>🔐 Credenciales</h3>
            
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="tu@email.com"
              />
            </div>

            <div className="form-group">
              <label>Contraseña *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                minLength="6"
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label>Confirmar Contraseña *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  minLength="6"
                />
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? (
              <span className="loading-spinner">⏳</span>
            ) : (
              isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'
            )}
          </button>
        </form>

        <div className="switch-form">
          <p>
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="switch-btn"
            >
              {isLogin ? 'Regístrate aquí' : 'Inicia sesión aquí'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;