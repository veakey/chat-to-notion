/**
 * Composant de barre de progression
 */
import React from 'react';

function ProgressBar({ progress, loading }) {
  if (!loading) return null;

  const getProgressText = () => {
    if (progress < 40) return 'Validation...';
    if (progress < 60) return 'Envoi...';
    if (progress < 90) return 'Création des blocs...';
    return 'Finalisation...';
  };

  return (
    <div style={{ marginBottom: '15px' }}>
      <div style={{ 
        width: '100%', 
        height: '8px', 
        background: 'rgba(255, 255, 255, 0.2)', 
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #8B5CF6, #C4B5FD)',
          transition: 'width 0.3s ease'
        }} />
      </div>
      <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', marginTop: '5px', textAlign: 'center' }}>
        {getProgressText()}
      </div>
    </div>
  );
}

export default ProgressBar;

