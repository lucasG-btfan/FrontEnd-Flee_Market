import React from 'react';
import { useConnection } from '../../hooks/useConnection';
import { FaCircle, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaQuestionCircle, FaSyncAlt } from "react-icons/fa";
import './ConnectionStatus.css';

const ConnectionStatus = () => {
  const { isOnline, apiStatus, lastChecked, retryCount, isHealthy, isDegraded, isError } = useConnection();

  const getStatusInfo = () => {
    if (!isOnline) {
      return {
        icon: <FaTimesCircle />,
        message: 'You are offline',
        color: '#ef4444',
        description: 'Please check your internet connection'
      };
    }
    switch (apiStatus) {
      case 'healthy':
        return {
          icon: <FaCheckCircle />,
          message: 'System is healthy',
          color: '#10b981',
          description: 'All services are operating normally'
        };
      case 'degraded':
        return {
          icon: <FaExclamationTriangle />,
          message: 'System is degraded',
          color: '#f59e0b',
          description: 'Some services may be slow or unavailable'
        };
      case 'error':
        return {
          icon: <FaTimesCircle />,
          message: 'Connection error',
          color: '#ef4444',
          description: `Unable to reach server (Retry ${retryCount}/3)`
        };
      case 'checking':
        return {
          icon: <FaSyncAlt />,
          message: 'Checking system status...',
          color: '#6b7280',
          description: 'Verifying connection to server'
        };
      default:
        return {
          icon: <FaQuestionCircle />,
          message: 'Unknown status',
          color: '#6b7280',
          description: 'Unable to determine system status'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="connection-status" style={{ borderLeftColor: statusInfo.color }}>
      <div className="status-icon">{statusInfo.icon}</div>
      <div className="status-content">
        <div className="status-message">{statusInfo.message}</div>
        <div className="status-description">{statusInfo.description}</div>
        {lastChecked && (
          <div className="last-checked">
            Last checked: {lastChecked.toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus;
