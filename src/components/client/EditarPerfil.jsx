import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import { ARGENTINIAN_PROVINCES } from '../../constants/argentinianProvinces';
import './EditarPerfil.css';

const EditarPerfil = ({ client, onSave, onCancel, saving }) => {
  const [editForm, setEditForm] = useState({
    name: client?.name || '',
    lastname: client?.lastname || '',
    phone: client?.phone || '',
    dni: client?.dni || ''
  });

  const [addresses, setAddresses] = useState([]);
  const [editingAddress, setEditingAddress] = useState(null);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: 'CABA',
    zip_code: ''
  });

  useEffect(() => {
    if (client) {
      setEditForm({
        name: client.name || '',
        lastname: client.lastname || '',
        phone: client.phone || '',
        dni: client.dni || ''
      });

      // Si el cliente tiene direcciones, cargarlas
      if (client.addresses && Array.isArray(client.addresses)) {
        setAddresses(client.addresses);
      }
    }
  }, [client]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddAddress = () => {
    if (!newAddress.street.trim() || !newAddress.city.trim()) {
      alert('Por favor completa calle y ciudad');
      return;
    }

    const addressToAdd = {
      ...newAddress,
      id_key: Date.now(), // Temporal ID
      isNew: true
    };

    setAddresses(prev => [...prev, addressToAdd]);
    setNewAddress({
      street: '',
      city: '',
      state: 'CABA',
      zip_code: ''
    });
  };

  const handleEditAddress = (index) => {
    const address = addresses[index];
    setEditingAddress({ index, ...address });
    setNewAddress({
      street: address.street,
      city: address.city,
      state: address.state || 'CABA',
      zip_code: address.zip_code || ''
    });
  };

  const handleUpdateAddress = () => {
    if (!newAddress.street.trim() || !newAddress.city.trim()) {
      alert('Por favor completa calle y ciudad');
      return;
    }

    setAddresses(prev => 
      prev.map((addr, idx) => 
        idx === editingAddress.index 
          ? { ...addr, ...newAddress, isUpdated: true }
          : addr
      )
    );

    setEditingAddress(null);
    setNewAddress({
      street: '',
      city: '',
      state: 'CABA',
      zip_code: ''
    });
  };

  const handleDeleteAddress = (index) => {
    if (!window.confirm('¿Eliminar esta dirección?')) return;
    
    setAddresses(prev => 
      prev.filter((_, idx) => idx !== index)
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validar datos básicos
    if (!editForm.name.trim()) {
      alert('El nombre es obligatorio');
      return;
    }

    // Preparar datos para enviar
    const dataToSend = {
      client: editForm,
      addresses: addresses.map(addr => {
        const { id_key, isNew, isUpdated, ...cleanAddress } = addr;
        return cleanAddress;
      })
    };

    onSave(dataToSend);
  };

  return (
    <div className="edit-profile-container">
      <form onSubmit={handleSubmit} className="edit-profile-form">
        <div className="profile-section">
          <h3>Información Personal</h3>
          
          <div className="form-group">
            <label htmlFor="name">Nombre *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={editForm.name}
              onChange={handleInputChange}
              placeholder="Tu nombre"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastname">Apellido</label>
            <input
              type="text"
              id="lastname"
              name="lastname"
              value={editForm.lastname}
              onChange={handleInputChange}
              placeholder="Tu apellido"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Teléfono</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={editForm.phone}
              onChange={handleInputChange}
              placeholder="+54 9 11 1234-5678"
            />
          </div>

          <div className="form-group">
            <label htmlFor="dni">DNI</label>
            <input
              type="text"
              id="dni"
              name="dni"
              value={editForm.dni}
              onChange={handleInputChange}
              placeholder="12345678"
            />
          </div>
        </div>

        <div className="profile-section">
          <h3>Direcciones</h3>
          <p className="section-description">
            Puedes agregar múltiples direcciones para envíos
          </p>

          {/* Lista de direcciones existentes */}
          {addresses.length > 0 && (
            <div className="addresses-list">
              <h4>Direcciones guardadas:</h4>
              {addresses.map((address, index) => (
                <div key={address.id_key || index} className="address-card">
                  <div className="address-info">
                    <strong>{address.street}</strong>
                    <p>{address.city}, {address.state} {address.zip_code}</p>
                  </div>
                  <div className="address-actions">
                    <button
                      type="button"
                      onClick={() => handleEditAddress(index)}
                      className="btn-edit-small"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(index)}
                      className="btn-delete-small"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Formulario para agregar/editar dirección */}
          <div className="address-form">
            <h4>
              {editingAddress ? 'Editar Dirección' : 'Agregar Nueva Dirección'}
            </h4>
            
            <div className="form-group">
              <label htmlFor="street">Calle y número *</label>
              <input
                type="text"
                id="street"
                name="street"
                value={newAddress.street}
                onChange={handleAddressChange}
                placeholder="Av. Principal #123"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="city">Ciudad *</label>
              <input
                type="text"
                id="city"
                name="city"
                value={newAddress.city}
                onChange={handleAddressChange}
                placeholder="Buenos Aires"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="state">Provincia</label>
              <select
                id="state"
                name="state"
                value={newAddress.state}
                onChange={handleAddressChange}
                className="province-select"
              >
                {ARGENTINIAN_PROVINCES.map(province => (
                  <option key={province.value} value={province.value}>
                    {province.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="zip_code">Código Postal</label>
              <input
                type="text"
                id="zip_code"
                name="zip_code"
                value={newAddress.zip_code}
                onChange={handleAddressChange}
                placeholder="C1001"
              />
            </div>

            <div className="address-form-actions">
              {editingAddress ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAddress(null);
                      setNewAddress({
                        street: '',
                        city: '',
                        state: 'CABA',
                        zip_code: ''
                      });
                    }}
                    className="btn-cancel-small"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdateAddress}
                    className="btn-save-small"
                  >
                    <FaSave /> Actualizar
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleAddAddress}
                  className="btn-add-address"
                >
                  <FaPlus /> Agregar Dirección
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn-cancel"
            disabled={saving}
          >
            <FaTimes /> Cancelar
          </button>
          <button
            type="submit"
            className="btn-save"
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner"></span> Guardando...
              </>
            ) : (
              <>
                <FaSave /> Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditarPerfil;