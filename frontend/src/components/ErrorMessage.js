import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import './ErrorMessage.css';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="error-container">
      <div className="error-content">
        <FaExclamationTriangle className="error-icon" />
        <p className="error-message">{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="retry-button">
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage; 