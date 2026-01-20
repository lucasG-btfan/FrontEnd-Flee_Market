import React, { useState, useEffect } from 'react';
import { FaEye, FaTrashAlt, FaChevronLeft, FaChevronRight, FaUser, FaEnvelope, FaPhone, FaIdCard, FaCalendar, FaMapMarkerAlt } from 'react-icons/fa';
import clientService from '../../services/api/clientservice';
import styles from './ClientsAdmin.module.css';

function ClientsAdmin() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalClients, setTotalClients] = useState(0);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    loadClients();
  }, [currentPage]);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const validPage = Math.max(1, currentPage);
      const result = await clientService.getAll(validPage, itemsPerPage);
      
      setClients(result.items || []);
      setTotalPages(result.pages || 1);
      setTotalClients(result.total || 0);
      
    } catch (error) {
      console.error('❌ [ClientsAdmin] Error cargando clientes:', error);
      setError('Error al cargar los clientes');
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleDelete = async (clientId, clientName) => {
    if (!window.confirm(`¿Estás seguro de eliminar al cliente ${clientName}?`)) {
      return;
    }

    try {
      console.log(`🗑️ Intentando eliminar cliente ID: ${clientId}`);
      await clientService.delete(clientId);
      alert('Cliente eliminado exitosamente');
      loadClients();
    } catch (error) {
      console.error('❌ Error eliminando cliente:', error);
      alert(`Error al eliminar el cliente: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleViewDetails = async (clientId) => {
    try {
      console.log(`👀 Obteniendo detalles del cliente ID: ${clientId}`);
      const clientDetails = await clientService.getById(clientId);
      setSelectedClient(clientDetails);
      setShowDetails(true);
    } catch (error) {
      console.error('❌ Error obteniendo detalles del cliente:', error);
      alert('Error al obtener detalles del cliente');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Cargando clientes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div className={styles.errorMessage}>{error}</div>
          <button onClick={loadClients} className={styles.retryButton}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Gestión de Clientes</h2>
        <div className={styles.stats}>
          <span className={styles.statItem}>Total: {totalClients} clientes</span>
          <span className={styles.statItem}>Página {currentPage} de {totalPages}</span>
        </div>
      </div>

      {clients.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No hay clientes registrados</p>
        </div>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>ID</th>
                  <th className={styles.th}>Nombre</th>
                  <th className={styles.th}>Email</th>
                  <th className={styles.th}>DNI</th>
                  <th className={styles.th}>Estado</th>
                  <th className={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clients.map(client => (
                  <tr key={client.id_key} className={styles.tr}>
                    <td className={styles.td}>{client.id_key}</td>
                    <td className={styles.td}>
                      {client.name} {client.lastname}
                    </td>
                    <td className={styles.td}>{client.email}</td>
                    <td className={styles.td}>{client.phone || 'N/A'}</td>
                    <td className={styles.td}>{client.dni || 'N/A'}</td>
                    <td className={styles.td}>
                      <span className={`${styles.status} ${client.is_active ? styles.active : styles.inactive}`}>
                        {client.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className={styles.td}>
                      <div className={styles.actions}>
                        <button
                          className={styles.viewButton}
                          onClick={() => handleViewDetails(client.id_key)}
                          title="Ver detalles"
                        >
                          <FaEye className={styles.icon} />
                        </button>
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDelete(client.id_key, `${client.name} ${client.lastname}`)}
                          title="Eliminar cliente"
                        >
                          <FaTrashAlt className={styles.icon} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.pagination}>
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={`${styles.paginationButton} ${currentPage === 1 ? styles.disabled : ''}`}
            >
              <FaChevronLeft className={styles.paginationIcon} />
              Anterior
            </button>
            
            <span className={styles.paginationInfo}>
              Página {currentPage} de {totalPages}
            </span>
            
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className={`${styles.paginationButton} ${currentPage >= totalPages ? styles.disabled : ''}`}
            >
              Siguiente
              <FaChevronRight className={styles.paginationIcon} />
            </button>
          </div>
        </>
      )}

      {/* Modal de detalles del cliente */}
      {showDetails && selectedClient && (
        <div className={styles.modalOverlay} onClick={() => setShowDetails(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Detalles del Cliente #{selectedClient.id_key}</h3>
              <button 
                onClick={() => setShowDetails(false)} 
                className={styles.modalClose}
              >
                ×
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.clientInfoGrid}>
                <div className={styles.infoItem}>
                  <FaUser className={styles.infoIcon} />
                  <div>
                    <span className={styles.infoLabel}>Nombre completo:</span>
                    <span className={styles.infoValue}>
                      {selectedClient.name} {selectedClient.lastname}
                    </span>
                  </div>
                </div>
                
                <div className={styles.infoItem}>
                  <FaEnvelope className={styles.infoIcon} />
                  <div>
                    <span className={styles.infoLabel}>Email:</span>
                    <span className={styles.infoValue}>{selectedClient.email}</span>
                  </div>
                </div>
                
                {selectedClient.phone && (
                  <div className={styles.infoItem}>
                    <FaPhone className={styles.infoIcon} />
                    <div>
                      <span className={styles.infoLabel}>Teléfono:</span>
                      <span className={styles.infoValue}>{selectedClient.phone}</span>
                    </div>
                  </div>
                )}
                
                {selectedClient.dni && (
                  <div className={styles.infoItem}>
                    <FaIdCard className={styles.infoIcon} />
                    <div>
                      <span className={styles.infoLabel}>DNI:</span>
                      <span className={styles.infoValue}>{selectedClient.dni}</span>
                    </div>
                  </div>
                )}
                
                {selectedClient.address && (
                  <div className={styles.infoItem}>
                    <FaMapMarkerAlt className={styles.infoIcon} />
                    <div>
                      <span className={styles.infoLabel}>Dirección:</span>
                      <span className={styles.infoValue}>{selectedClient.address}</span>
                    </div>
                  </div>
                )}
                
                <div className={styles.infoItem}>
                  <FaCalendar className={styles.infoIcon} />
                  <div>
                    <span className={styles.infoLabel}>Registrado:</span>
                    <span className={styles.infoValue}>
                      {formatDate(selectedClient.created_at)}
                    </span>
                  </div>
                </div>
                
                <div className={styles.infoItem}>
                  <div>
                    <span className={styles.infoLabel}>Estado:</span>
                    <span className={`${styles.statusBadge} ${selectedClient.is_active ? styles.statusActive : styles.statusInactive}`}>
                      {selectedClient.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className={styles.modalActions}>
                <button
                  onClick={() => {
                    setShowDetails(false);
                    handleDelete(selectedClient.id_key, `${selectedClient.name} ${selectedClient.lastname}`);
                  }}
                  className={styles.modalDeleteBtn}
                >
                  <FaTrashAlt /> Eliminar Cliente
                </button>
                <button
                  onClick={() => setShowDetails(false)}
                  className={styles.modalCloseBtn}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientsAdmin;