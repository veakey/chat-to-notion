/**
 * Section pour configurer les propriétés supplémentaires
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import DatabaseStructureView from './DatabaseStructureView';
import PropertyDetails from './PropertyDetails';

function PropertiesSection({ 
  availableProperties, 
  selectedProperties, 
  onPropertyToggle, 
  onSave,
  loadingProperties 
}) {
  const { t } = useTranslation();
  
  const getTypeIcon = (type) => {
    const icons = {
      'title': '📝',
      'rich_text': '📄',
      'number': '🔢',
      'select': '📋',
      'multi_select': '📋',
      'date': '📅',
      'checkbox': '☑️',
      'url': '🔗',
      'email': '📧',
      'phone_number': '📞',
      'relation': '🔗',
      'rollup': '📊'
    };
    return icons[type] || '📌';
  };
  
  return (
    <div style={{ marginTop: '30px' }}>
      <h3 style={{ color: '#ffffff', fontSize: '1.1rem', marginBottom: '15px' }}>
        {t('config.properties.title')}
      </h3>
      <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', marginBottom: '15px' }}>
        {t('config.properties.description')}
      </p>
      
      {/* Database Structure View */}
      <DatabaseStructureView />
      
      {loadingProperties ? (
        <div style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{t('config.properties.loading')}</div>
      ) : availableProperties.length === 0 ? (
        <div style={{ color: 'rgba(255, 255, 255, 0.7)', padding: '15px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '10px' }}>
          {t('config.properties.none')}
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '15px', marginTop: '20px' }}>
            {availableProperties.map(prop => (
              <label
                key={prop.name}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  padding: '12px',
                  marginBottom: '8px',
                  background: 'rgba(139, 92, 246, 0.1)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: selectedProperties[prop.name] ? '1px solid #c4b5fd' : '1px solid transparent',
                  transition: 'all 0.2s'
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedProperties[prop.name] || false}
                  onChange={() => onPropertyToggle(prop.name)}
                  style={{ marginRight: '12px', marginTop: '2px', cursor: 'pointer' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '1rem', marginRight: '6px' }}>
                      {getTypeIcon(prop.type)}
                    </span>
                    <div style={{ color: '#ffffff', fontWeight: '500' }}>{prop.name}</div>
                    {prop.required && (
                      <span style={{ 
                        color: '#fca5a5', 
                        marginLeft: '8px', 
                        fontSize: '0.7rem',
                        padding: '2px 6px',
                        background: 'rgba(252, 165, 165, 0.2)',
                        borderRadius: '4px'
                      }}>
                        Required
                      </span>
                    )}
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>
                    {t('config.properties.type', { type: prop.type })}
                  </div>
                  {prop.options && prop.options.length > 0 && (
                    <div style={{ 
                      marginTop: '6px', 
                      fontSize: '0.75rem', 
                      color: 'rgba(196, 181, 253, 0.8)',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '4px'
                    }}>
                      {prop.options.slice(0, 3).map((opt, idx) => (
                        <span key={idx} style={{
                          padding: '2px 6px',
                          background: 'rgba(196, 181, 253, 0.15)',
                          borderRadius: '4px'
                        }}>
                          {opt}
                        </span>
                      ))}
                      {prop.options.length > 3 && (
                        <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                          +{prop.options.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>
          <button
            type="button"
            className="btn btn-primary btn-full"
            onClick={onSave}
          >
            {t('config.properties.save')}
          </button>
        </>
      )}
    </div>
  );
}

export default PropertiesSection;

