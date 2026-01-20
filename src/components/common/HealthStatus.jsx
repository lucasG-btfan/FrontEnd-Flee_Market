import React from 'react';
import { useHealth } from '../../hooks/useHealth';
import './HealthStatus.css';
import { FaCheckCircle } from "react-icons/fa";
import { IoIosWarning } from "react-icons/io";
import { TbXboxXFilled } from "react-icons/tb";
import { FaQuestion } from "react-icons/fa";
import { PiCellSignalLowDuotone } from "react-icons/pi";

// HealthStatus.jsx
const HealthStatus = () => {
  const { health, loading, error } = useHealth(60000);
  if (loading) return <div className="health-status loading">Checking system health...</div>;
  if (error) return <div className="health-status error">Health check failed</div>;
  if (!health) return null;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <FaCheckCircle />;
      case 'warning': return <IoIosWarning/>;
      case 'degraded': return <PiCellSignalLowDuotone/>;
      case 'critical': return <TbXboxXFilled/>;
      default: return <FaQuestion/>;
    }
  };

  return (
    <div className={`health-status ${health.status}`}>
      <div className="health-header">
        <span className="status-icon">{getStatusIcon(health.status)}</span>
        <span className="status-text">System: {health.status.toUpperCase()}</span>
      </div>

      <div className="health-details">
        <div className="health-item">
          <strong>Database:</strong>
          <span className={`status ${health.database.status === 'up' ? 'healthy' : 'critical'}`}>
            {health.database.status} ({health.database.latency_ms}ms)
          </span>
        </div>
      </div>
    </div>
  );
};
export default HealthStatus;