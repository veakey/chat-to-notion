/**
 * Composant pour visualiser la structure complète de la base de données Notion
 */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import PropertyDetails from './PropertyDetails';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function DatabaseStructureView() {
  const { t } = useTranslation();
  const [structure, setStructure] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    loadStructure();
  }, []);

  const loadStructure = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/config/database-structure`);
      setStructure(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load database structure');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ color: 'rgba(255, 255, 255, 0.7)', padding: '15px' }}>
        {t('config.properties.loading')}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        color: '#fca5a5',
        padding: '15px',
        background: 'rgba(239, 68, 68, 0.1)',
        borderRadius: '8px',
        border: '1px solid rgba(239, 68, 68, 0.3)'
      }}>
        ⚠️ {error}
      </div>
    );
  }

  if (!structure) {
    return null;
  }

  const requiredProperties = structure.properties.filter(p => p.required);
  const optionalProperties = structure.properties.filter(p => !p.required);

  return (
    <div style={{ marginTop: '20px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px',
          cursor: 'pointer',
          padding: '10px',
          background: 'rgba(139, 92, 246, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(196, 181, 253, 0.3)'
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <h3 style={{ color: '#ffffff', fontSize: '1rem', margin: 0 }}>
          📊 Database Structure
        </h3>
        <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
          {expanded ? '▼' : '▶'}
        </span>
      </div>

      {expanded && (
        <div style={{
          padding: '15px',
          background: 'rgba(139, 92, 246, 0.05)',
          borderRadius: '8px',
          border: '1px solid rgba(196, 181, 253, 0.2)'
        }}>
          {/* Database Info */}
          {structure.database_info && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ color: '#ffffff', fontWeight: '600', marginBottom: '8px' }}>
                {structure.database_info.title || 'Database'}
              </div>
              {structure.database_info.description && (
                <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
                  {structure.database_info.description}
                </div>
              )}
            </div>
          )}

          {/* Required Properties */}
          {requiredProperties.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                color: '#fca5a5',
                fontSize: '0.875rem',
                fontWeight: '600',
                marginBottom: '10px',
                paddingBottom: '6px',
                borderBottom: '1px solid rgba(252, 165, 165, 0.3)'
              }}>
                Required Properties ({requiredProperties.length})
              </div>
              {requiredProperties.map((prop, idx) => (
                <PropertyDetails key={idx} property={prop} />
              ))}
            </div>
          )}

          {/* Optional Properties */}
          {optionalProperties.length > 0 && (
            <div>
              <div style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.875rem',
                fontWeight: '600',
                marginBottom: '10px',
                paddingBottom: '6px',
                borderBottom: '1px solid rgba(196, 181, 253, 0.3)'
              }}>
                Optional Properties ({optionalProperties.length})
              </div>
              {optionalProperties.map((prop, idx) => (
                <PropertyDetails key={idx} property={prop} />
              ))}
            </div>
          )}

          {/* Summary */}
          <div style={{
            marginTop: '20px',
            padding: '10px',
            background: 'rgba(139, 92, 246, 0.1)',
            borderRadius: '6px',
            fontSize: '0.8rem',
            color: 'rgba(255, 255, 255, 0.7)'
          }}>
            Total: {structure.properties.length} properties
            {requiredProperties.length > 0 && ` (${requiredProperties.length} required)`}
          </div>
        </div>
      )}
    </div>
  );
}

export default DatabaseStructureView;

