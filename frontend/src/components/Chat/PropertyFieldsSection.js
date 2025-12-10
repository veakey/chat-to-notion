/**
 * Section des propriétés configurées
 */
import React from 'react';

function PropertyFieldsSection({ 
  availableProperties, 
  selectedProperties, 
  propertyValues, 
  onPropertyChange,
  disabled 
}) {
  const visibleProperties = availableProperties.filter(prop => selectedProperties[prop.name]);
  
  if (visibleProperties.length === 0) {
    return null;
  }

  return (
    <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '10px' }}>
      <h3 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '15px' }}>
        Propriétés supplémentaires
      </h3>
      {visibleProperties.map(prop => (
        <div key={prop.name} className="form-group" style={{ marginBottom: '15px' }}>
          <label className="form-label">{prop.name}</label>
          {prop.type === 'checkbox' ? (
            <input
              type="checkbox"
              checked={propertyValues[prop.name] === 'true' || propertyValues[prop.name] === true}
              onChange={(e) => onPropertyChange(prop.name, e.target.checked)}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              disabled={disabled}
            />
          ) : prop.type === 'number' ? (
            <input
              type="number"
              className="form-input"
              value={propertyValues[prop.name] || ''}
              onChange={(e) => onPropertyChange(prop.name, e.target.value)}
              disabled={disabled}
            />
          ) : prop.type === 'date' ? (
            <input
              type="date"
              className="form-input"
              value={propertyValues[prop.name] || ''}
              onChange={(e) => onPropertyChange(prop.name, e.target.value)}
              disabled={disabled}
            />
          ) : (
            <input
              type="text"
              className="form-input"
              placeholder={`Saisissez une valeur pour ${prop.name} (${prop.type})`}
              value={propertyValues[prop.name] || ''}
              onChange={(e) => onPropertyChange(prop.name, e.target.value)}
              disabled={disabled}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default PropertyFieldsSection;

