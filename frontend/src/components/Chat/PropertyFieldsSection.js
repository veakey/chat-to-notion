/**
 * Section des propriétés configurées avec validation et suggestions
 */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function PropertyFieldsSection({ 
  availableProperties, 
  selectedProperties, 
  propertyValues, 
  onPropertyChange,
  disabled 
}) {
  const { t } = useTranslation();
  const [validationErrors, setValidationErrors] = useState({});
  const visibleProperties = availableProperties.filter(prop => selectedProperties[prop.name]);
  
  useEffect(() => {
    // Valider les valeurs quand elles changent
    if (Object.keys(propertyValues).length > 0) {
      validateProperties();
    }
  }, [propertyValues, visibleProperties]);
  
  const validateProperties = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/config/validate-property-values`, {
        propertyValues: propertyValues
      });
      
      const errors = {};
      Object.keys(response.data.validation).forEach(propName => {
        const validation = response.data.validation[propName];
        if (!validation.valid) {
          errors[propName] = validation.error;
        }
      });
      setValidationErrors(errors);
    } catch (err) {
      // Silently fail validation errors
      console.error('Validation error:', err);
    }
  };
  
  if (visibleProperties.length === 0) {
    return null;
  }

  const renderInput = (prop) => {
    const hasError = validationErrors[prop.name];
    const inputStyle = {
      ...(hasError ? {
        borderColor: '#fca5a5',
        background: 'rgba(252, 165, 165, 0.1)'
      } : {})
    };

    if (prop.type === 'checkbox') {
      return (
        <input
          type="checkbox"
          checked={propertyValues[prop.name] === 'true' || propertyValues[prop.name] === true}
          onChange={(e) => onPropertyChange(prop.name, e.target.checked)}
          style={{ width: '20px', height: '20px', cursor: 'pointer' }}
          disabled={disabled}
        />
      );
    }
    
    if (prop.type === 'select' && prop.options && prop.options.length > 0) {
      return (
        <div>
          <select
            className="form-input"
            value={propertyValues[prop.name] || ''}
            onChange={(e) => onPropertyChange(prop.name, e.target.value)}
            disabled={disabled}
            style={inputStyle}
          >
            <option value="">-- Select an option --</option>
            {prop.options.map((option, idx) => (
              <option key={idx} value={option}>
                {option}
              </option>
            ))}
          </select>
          {hasError && (
            <div style={{ color: '#fca5a5', fontSize: '0.75rem', marginTop: '4px' }}>
              {validationErrors[prop.name]}
            </div>
          )}
        </div>
      );
    }
    
    if (prop.type === 'multi_select' && prop.options && prop.options.length > 0) {
      const currentValues = Array.isArray(propertyValues[prop.name]) 
        ? propertyValues[prop.name] 
        : propertyValues[prop.name] 
          ? propertyValues[prop.name].split(',').map(v => v.trim())
          : [];
      
      return (
        <div>
          <select
            multiple
            className="form-input"
            value={currentValues}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value);
              onPropertyChange(prop.name, selected);
            }}
            disabled={disabled}
            style={{ ...inputStyle, minHeight: '100px' }}
          >
            {prop.options.map((option, idx) => (
              <option key={idx} value={option}>
                {option}
              </option>
            ))}
          </select>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', marginTop: '4px' }}>
            Hold Ctrl/Cmd to select multiple options
          </div>
          {hasError && (
            <div style={{ color: '#fca5a5', fontSize: '0.75rem', marginTop: '4px' }}>
              {validationErrors[prop.name]}
            </div>
          )}
        </div>
      );
    }
    
    if (prop.type === 'number') {
      return (
        <div>
          <input
            type="number"
            className="form-input"
            value={propertyValues[prop.name] || ''}
            onChange={(e) => onPropertyChange(prop.name, e.target.value)}
            disabled={disabled}
            style={inputStyle}
            step={prop.format === 'percent' ? '0.01' : '1'}
            min={prop.format === 'percent' ? '0' : undefined}
            max={prop.format === 'percent' ? '100' : undefined}
          />
          {hasError && (
            <div style={{ color: '#fca5a5', fontSize: '0.75rem', marginTop: '4px' }}>
              {validationErrors[prop.name]}
            </div>
          )}
        </div>
      );
    }
    
    if (prop.type === 'date') {
      return (
        <div>
          <input
            type="date"
            className="form-input"
            value={propertyValues[prop.name] || ''}
            onChange={(e) => onPropertyChange(prop.name, e.target.value)}
            disabled={disabled}
            style={inputStyle}
          />
          {hasError && (
            <div style={{ color: '#fca5a5', fontSize: '0.75rem', marginTop: '4px' }}>
              {validationErrors[prop.name]}
            </div>
          )}
        </div>
      );
    }
    
    // Default text input
    return (
      <div>
        <input
          type="text"
          className="form-input"
          placeholder={t('chat.propertyFields.placeholder', { name: prop.name, type: prop.type })}
          value={propertyValues[prop.name] || ''}
          onChange={(e) => onPropertyChange(prop.name, e.target.value)}
          disabled={disabled}
          style={inputStyle}
        />
        {hasError && (
          <div style={{ color: '#fca5a5', fontSize: '0.75rem', marginTop: '4px' }}>
            {validationErrors[prop.name]}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '10px' }}>
      <h3 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '15px' }}>
        {t('chat.propertyFields.title')}
      </h3>
      {visibleProperties.map(prop => (
        <div key={prop.name} className="form-group" style={{ marginBottom: '15px' }}>
          <label className="form-label">
            {prop.name}
            {prop.required && (
              <span style={{ color: '#fca5a5', marginLeft: '6px', fontSize: '0.75rem' }}>
                *
              </span>
            )}
          </label>
          {renderInput(prop)}
        </div>
      ))}
    </div>
  );
}

export default PropertyFieldsSection;

