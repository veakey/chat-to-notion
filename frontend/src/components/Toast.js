import React, { useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';

function Toast({ toast, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [toast.duration, onClose]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircleIcon className="toast-icon-svg" />;
      case 'error':
        return <XCircleIcon className="toast-icon-svg" />;
      case 'info':
        return <InformationCircleIcon className="toast-icon-svg" />;
      default:
        return <InformationCircleIcon className="toast-icon-svg" />;
    }
  };

  return (
    <div className={`toast toast-${toast.type}`}>
      <div className="toast-content">
        <span className="toast-icon">{getIcon()}</span>
        <span className="toast-message">{toast.message}</span>
      </div>
      <button className="toast-close" onClick={onClose} aria-label="Close">
        <XMarkIcon className="toast-close-icon" />
      </button>
    </div>
  );
}

export default Toast;

