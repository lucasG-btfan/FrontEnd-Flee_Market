import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { clientService, orderService } from '../service/api/optimizedServices';
import {productService} from '../services/api/productService';
import HealthStatus from '../components/common/HealthStatus';
import LoadingSpinner from '../components/common/LoadingSpinner';
import '../styles/Admin.css';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const { data: products, loading: productsLoading } = useApi(() => 
    productService.getAll(0, 5)
  );
  
  const { data: clients, loading: clientsLoading } = useApi(() => 
    clientService.getAll(0, 5)
  );
  
  const { data: orders, loading: ordersLoading } = useApi(() => 
    orderService.getAll(0, 5)
  );

  const stats = [
    { name: 'Total Products', value: products?.length || 0, loading: productsLoading },
    { name: 'Total Clients', value: clients?.length || 0, loading: clientsLoading },
    { name: 'Total Orders', value: orders?.length || 0, loading: ordersLoading },
  ];

  return (
    <div className="admin-page">
      <h1>Admin Dashboard</h1>
      
      <HealthStatus />
      
      <div className="admin-stats">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <h3>{stat.name}</h3>
            {stat.loading ? (
              <LoadingSpinner size="small" text="" />
            ) : (
              <div className="stat-value">{stat.value}</div>
            )}
          </div>
        ))}
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Products
        </button>
        <button 
          className={`tab-button ${activeTab === 'clients' ? 'active' : ''}`}
          onClick={() => setActiveTab('clients')}
        >
          Clients
        </button>
        <button 
          className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
            <h2>Recent Activity</h2>
          </div>
        )}
        
        {activeTab === 'products' && (
          <div className="products-content">
            <h2>Product Management</h2>
          </div>
        )}
        
        {activeTab === 'clients' && (
          <div className="clients-content">
            <h2>Client Management</h2>
          </div>
        )}
        
        {activeTab === 'orders' && (
          <div className="orders-content">
            <h2>Order Management</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;