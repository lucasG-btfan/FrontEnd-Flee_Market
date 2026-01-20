import React from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaQuestionCircle, FaSyncAlt, FaDatabase, FaMemory } from "react-icons/fa";
import './SystemMetrics.css';

const SystemMetrics = () => {
  const formatUptime = (seconds) => {
    if (!seconds) return '0s';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'degraded': return '#f97316';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <FaCheckCircle />;
      case 'warning': return <FaExclamationTriangle />;
      case 'degraded': return <FaExclamationTriangle />;
      case 'critical': return <FaTimesCircle />;
      default: return <FaQuestionCircle />;
    }
  };

  // Datos de ejemplo hasta que el health check funcione correctamente
  const mockMetrics = {
    database: { status: 'healthy', response_time: 45 },
    redis: { status: 'healthy', response_time: 2 },
    api: { status: 'healthy', response_time: 120 }
  };

  return (
    <div className="system-metrics">
      <div className="metrics-header">
        <h2>
          <FaSyncAlt className="icon" />
          System Metrics
        </h2>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Database</span>
            <span className="metric-status" style={{ color: getStatusColor(mockMetrics.database.status) }}>
              {getStatusIcon(mockMetrics.database.status)} {mockMetrics.database.status.toUpperCase()}
            </span>
          </div>
          <div className="metric-details">
            <div className="metric-item">
              <span>Response Time:</span>
              <span>{mockMetrics.database.response_time}ms</span>
            </div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Redis Cache</span>
            <span className="metric-status" style={{ color: getStatusColor(mockMetrics.redis.status) }}>
              {getStatusIcon(mockMetrics.redis.status)} {mockMetrics.redis.status.toUpperCase()}
            </span>
          </div>
          <div className="metric-details">
            <div className="metric-item">
              <span>Response Time:</span>
              <span>{mockMetrics.redis.response_time}ms</span>
            </div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">API Response</span>
            <span className="metric-status" style={{ color: getStatusColor(mockMetrics.api.status) }}>
              {getStatusIcon(mockMetrics.api.status)} {mockMetrics.api.status.toUpperCase()}
            </span>
          </div>
          <div className="metric-details">
            <div className="metric-item">
              <span>Response Time:</span>
              <span>{mockMetrics.api.response_time}ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemMetrics;
