/**
 * Spinner circulaire avec style Glass UI
 */
import React from 'react';
import './LoadingSpinner.css';

function LoadingSpinner({ message }) {
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      {message && <div className="loading-spinner-message">{message}</div>}
    </div>
  );
}

export default LoadingSpinner;

