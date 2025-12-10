/**
 * Section pour configurer les propriétés supplémentaires
 */
import React from 'react';

function PropertiesSection({ 
  availableProperties, 
  selectedProperties, 
  onPropertyToggle, 
  onSave,
  loadingProperties 
}) {
  return (
    <div style={{ marginTop: '30px' }}>
      <h3 style={{ color: '#ffffff', fontSize: '1.1rem', marginBottom: '15px' }}>
        ⚙️ Propriétés supplémentaires
      </h3>
      <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', marginBottom: '15px' }}>
        Sélectionnez les propriétés que vous souhaitez utiliser lors de l'envoi de chats vers Notion
      </p>
      
      {loadingProperties ? (
        <div style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Chargement des propriétés...</div>
      ) : availableProperties.length === 0 ? (
        <div style={{ color: 'rgba(255, 255, 255, 0.7)', padding: '15px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '10px' }}>
          Aucune propriété supplémentaire disponible dans votre base de données.
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '15px' }}>
            {availableProperties.map(prop => (
              <label
                key={prop.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px',
                  marginBottom: '8px',
                  background: 'rgba(139, 92, 246, 0.1)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: selectedProperties[prop.name] ? '1px solid #c4b5fd' : '1px solid transparent'
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedProperties[prop.name] || false}
                  onChange={() => onPropertyToggle(prop.name)}
                  style={{ marginRight: '10px', cursor: 'pointer' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#ffffff', fontWeight: '500' }}>{prop.name}</div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>
                    Type: {prop.type}
                  </div>
                </div>
              </label>
            ))}
          </div>
          <button
            type="button"
            className="btn btn-primary btn-full"
            onClick={onSave}
          >
            Enregistrer les propriétés sélectionnées
          </button>
        </>
      )}
    </div>
  );
}

export default PropertiesSection;

