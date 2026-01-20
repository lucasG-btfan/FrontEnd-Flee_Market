import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentClient, logout } from '../services/api/authService';
import clientService from '../services/api/clientservice';
import orderService from '../services/api/orderService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  FaUser, 
  FaShoppingBag, 
  FaTrash, 
  FaEdit, 
  FaSignOutAlt, 
  FaHistory, 
  FaSave, 
  FaTimes,
  FaCrown,
  FaHome,
  FaShoppingCart,
  FaBox
} from 'react-icons/fa';
import '../styles/Profile.css';
import EditarPerfil from '../components/client/EditarPerfil';

function Profile({ onLogout }) {
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [lastOrder, setLastOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
    loadLastOrder();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentClient = getCurrentClient();
      console.log('👤 Cliente actual:', currentClient);

      if (!currentClient || !currentClient.id) {
        setError('No se pudo cargar tu perfil. Por favor inicia sesión nuevamente.');
        navigate('/login');
        return;
      }

      if (currentClient.id === 0) {
        console.log('👑 Es administrador');
        setClient({
          ...currentClient,
          isAdmin: true,
          name: currentClient.name || 'Administrador'
        });
        setLoading(false);
        return;
      }

      console.log(`📞 Obteniendo detalles del cliente ID: ${currentClient.id}`);
      const clientDetails = await clientService.getMyProfile();

      console.log('✅ Detalles del cliente:', clientDetails);

      setClient({
        ...currentClient,
        ...clientDetails,
        isAdmin: false
      });

    } catch (error) {
      console.error('❌ Error cargando perfil:', error);
      setError(error.message || 'Error al cargar tu perfil');

      const currentClient = getCurrentClient();
      if (currentClient) {
        setClient({
          ...currentClient,
          isAdmin: currentClient.id === 0,
          name: currentClient.name || 'Usuario'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const loadLastOrder = async () => {
    try {
      setOrdersLoading(true);

      const currentClient = getCurrentClient();
      if (!currentClient || currentClient.id === 0) return;

      const orders = await orderService.getMyOrders();

      if (orders && orders.length > 0) {
        const sortedOrders = [...orders].sort((a, b) => {
          const dateA = new Date(a.date || a.created_at || 0);
          const dateB = new Date(b.date || b.created_at || 0);
          return dateB - dateA;
        });

        setLastOrder(sortedOrders[0]);
      }
    } catch (error) {
      console.error('❌ Error cargando última orden:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleEditProfile = () => {
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setEditing(false);
  };

  const handleSaveProfile = async (data) => {
    if (!client || !client.id) return;
    
    try {
      setSaving(true);
      setError(null);
      
      if (!data.client.name || !data.client.name.trim()) {
        setError('El nombre es requerido');
        setSaving(false);
        return;
      }
      
      console.log('📤 Actualizando perfil y direcciones:', data);
      
      const updateData = {
        name: data.client.name.trim(),
        lastname: data.client.lastname?.trim() || '',
        phone: data.client.phone?.trim() || '',
        dni: data.client.dni?.trim() || ''
      };
      
      const updatedClient = await clientService.update(client.id, updateData);
      
      setClient(prev => ({
        ...prev,
        ...updatedClient
      }));
      
      setEditing(false);
      alert('✅ Perfil actualizado exitosamente');
      
    } catch (error) {
      console.error('❌ Error actualizando perfil:', error);
      setError('No se pudo actualizar el perfil: ' + (error.response?.data?.detail || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!client || !client.id) return;

    const confirm = window.confirm(
      '¿Estás seguro de eliminar tu cuenta?\n\n' +
      'Esta acción eliminará todos tus datos permanentemente y no se puede deshacer.\n' +
      'Si tienes órdenes pendientes, se cancelarán automáticamente.'
    );

    if (!confirm) return;

    try {
      setDeleting(true);
      setError(null);

      await clientService.delete(client.id);

      if (onLogout) {
        onLogout();
      } else {
        logout();
      }

      alert('✅ Tu cuenta ha sido eliminada exitosamente.');
      
      window.location.href = '/';

    } catch (error) {
      console.error('❌ Error eliminando cuenta:', error);
      setError('No se pudo eliminar la cuenta: ' + (error.response?.data?.detail || error.message));
      setDeleting(false);
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      logout();
    }
    
    navigate('/');
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatPrice = (price) => {
    if (!price) return '$0.00';
    return `$${parseFloat(price).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <LoadingSpinner />
          <p>Cargando tu perfil...</p>
        </div>
      </div>
    );
  }

  if (error && !client) {
    return (
      <div className="profile-page">
        <div className="profile-error">
          <h3><FaTimes className="error-icon" /> Error</h3>
          <p>{error}</p>
          <button onClick={() => navigate('/login')} className="btn-login">
            Volver a Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header">
        <div className="profile-avatar">
          <FaUser className="avatar-icon" />
        </div>
        <div className="profile-info">
          <h1>{client?.name || 'Usuario'}</h1>
          <p className="profile-email">{client?.email}</p>
          <p className="profile-role">
            {client?.isAdmin ? (
              <>
                <FaCrown className="admin-icon" /> Administrador
              </>
            ) : (
              <>
                <FaUser className="user-icon" /> Cliente
              </>
            )}
          </p>
        </div>
        <div className="profile-actions">
          <button
            onClick={handleLogout}
            className="btn-logout"
            title="Cerrar sesión"
          >
            <FaSignOutAlt /> Cerrar Sesión
          </button>
        </div>
      </div>

      {error && (
        <div className="profile-error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="btn-dismiss">
            ×
          </button>
        </div>
      )}

      {/* Sección de Información Personal */}
      <div className="profile-section">
        <div className="section-header">
          <h2><FaUser className="section-icon" /> Información Personal</h2>
          {!editing && !client?.isAdmin && (
            <button
              onClick={handleEditProfile}
              className="btn-edit-profile"
            >
              <FaEdit /> Editar Perfil
            </button>
          )}
        </div>

        {editing ? (
          <EditarPerfil
            client={client}
            onSave={handleSaveProfile}
            onCancel={handleCancelEdit}
            saving={saving}
          />
        ) : (
          <div className="profile-details">
            <div className="detail-row">
              <span className="detail-label">Nombre:</span>
              <span className="detail-value">{client?.name || 'No especificado'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Apellido:</span>
              <span className="detail-value">{client?.lastname || 'No especificado'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{client?.email}</span>
            </div>
            {client?.phone && (
              <div className="detail-row">
                <span className="detail-label">Teléfono:</span>
                <span className="detail-value">{client.phone}</span>
              </div>
            )}
            {client?.dni && (
              <div className="detail-row">
                <span className="detail-label">DNI:</span>
                <span className="detail-value">{client.dni}</span>
              </div>
            )}
            {client?.address && (
              <div className="detail-row">
                <span className="detail-label">Dirección:</span>
                <span className="detail-value">{client.address}</span>
              </div>
            )}
            {client?.created_at && (
              <div className="detail-row">
                <span className="detail-label">Miembro desde:</span>
                <span className="detail-value">{formatDate(client.created_at)}</span>
              </div>
            )}
          </div>
        )}

        {!editing && (
          <div className="profile-section-actions">
            <button
              onClick={() => navigate('/orders')}
              className="btn-orders"
            >
              <FaHistory /> Ver Mis Órdenes
            </button>
          </div>
        )}
      </div>

      {/* Última Orden (solo para usuarios no admin) */}
      {!client?.isAdmin && !editing && (
        <div className="profile-section">
          <h2><FaShoppingBag className="section-icon" /> Última Compra</h2>

          {ordersLoading ? (
            <div className="order-loading">
              <LoadingSpinner small />
              <p>Cargando última orden...</p>
            </div>
          ) : lastOrder ? (
            <div className="last-order-card">
              <div className="order-header">
                <span className="order-id">Orden #{lastOrder.id_key}</span>
                <span className={`order-status status-${lastOrder.status}`}>
                  {lastOrder.status === 1 ? 'Pendiente' :
                   lastOrder.status === 2 ? 'En Proceso' :
                   lastOrder.status === 3 ? 'Entregado' :
                   lastOrder.status === 4 ? 'Cancelado' : 'Desconocido'}
                </span>
              </div>

              <div className="order-details">
                <div className="detail-row">
                  <span className="detail-label">Fecha:</span>
                  <span className="detail-value">{formatDate(lastOrder.date || lastOrder.created_at)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Total:</span>
                  <span className="detail-value order-total">{formatPrice(lastOrder.total)}</span>
                </div>
                {lastOrder.delivery_method && (
                  <div className="detail-row">
                    <span className="detail-label">Método de entrega:</span>
                    <span className="detail-value">
                      {lastOrder.delivery_method === 1 ? 'Drive Thru' :
                       lastOrder.delivery_method === 2 ? 'Recoger en tienda' :
                       lastOrder.delivery_method === 3 ? 'Entrega a domicilio' : 'No especificado'}
                    </span>
                  </div>
                )}
              </div>

              <div className="order-actions">
                <button
                  onClick={() => navigate(`/orders/${lastOrder.id_key}`)}
                  className="btn-view-details"
                >
                  Ver Detalles Completos
                </button>
              </div>
            </div>
          ) : (
            <div className="no-orders">
              <p>Aún no has realizado ninguna compra</p>
              <button
                onClick={() => navigate('/products')}
                className="btn-shop"
              >
                <FaShoppingBag /> Comprar Ahora
              </button>
            </div>
          )}
        </div>
      )}

      {/* Sección de Administración (solo para admin) */}
      {client?.isAdmin && !editing && (
        <div className="profile-section admin-section">
          <h2><FaCrown className="admin-icon" /> Panel de Administración</h2>
          <div className="admin-actions">
            <button
              onClick={() => navigate('/admin/clients')}
              className="btn-admin"
            >
              Gestionar Clientes
            </button>
            <button
              onClick={() => navigate('/admin/orders')}
              className="btn-admin"
            >
              Gestionar Órdenes
            </button>
            <button
              onClick={() => navigate('/admin/products')}
              className="btn-admin"
            >
              Gestionar Productos
            </button>
          </div>
        </div>
      )}

      {/* Sección de Configuración */}
      {!editing && (
        <div className="profile-section settings-section">
          <h2><FaBox className="section-icon" /> Configuración de Cuenta</h2>
          <div className="settings-options">
            {!client?.isAdmin && (
              <button
                onClick={handleEditProfile}
                className="btn-settings"
              >
                <FaEdit /> Editar Perfil
              </button>
            )}

            {!client?.isAdmin && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="btn-danger"
                disabled={deleting}
              >
                <FaTrash /> {deleting ? 'Eliminando...' : 'Eliminar Mi Cuenta'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar cuenta */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3><FaTrash className="warning-icon" /> Confirmar Eliminación de Cuenta</h3>
            <p>
              ¿Estás seguro de que deseas eliminar tu cuenta permanentemente?
              Esta acción <strong>no se puede deshacer</strong> y se perderán todos tus datos.
            </p>

            <div className="modal-warning">
              <p><strong>Advertencia:</strong></p>
              <ul>
                <li>Tus datos personales serán eliminados</li>
                <li>Tu historial de compras se perderá</li>
                <li>No podrás acceder a facturas anteriores</li>
              </ul>
            </div>

            <div className="modal-actions">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-cancel"
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                className="btn-confirm-delete"
                disabled={deleting}
              >
                {deleting ? 'Eliminando...' : 'Sí, Eliminar Mi Cuenta'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer con enlaces rápidos */}
      {!editing && (
        <div className="profile-footer">
          <div className="quick-links">
            <button onClick={() => navigate('/orders')}>
              <FaHistory /> Mis Órdenes
            </button>
            <button onClick={() => navigate('/cart')}>
              <FaShoppingCart /> Mi Carrito
            </button>
            <button onClick={() => navigate('/products')}>
              <FaShoppingBag /> Productos
            </button>
            <button onClick={() => navigate('/')}>
              <FaHome /> Inicio
            </button>
          </div>
          <p className="profile-footer-note">
            Si necesitas ayuda, contacta a soporte: soporte@comercio.com
          </p>
        </div>
      )}
    </div>
  );
}

export default Profile;