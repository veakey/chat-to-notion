/**
 * Section des propriétés configurées avec validation et suggestions
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../contexts/ToastContext';
import axios from 'axios';
import { 
  DocumentTextIcon, 
  HashtagIcon, 
  ListBulletIcon, 
  CalendarIcon, 
  CheckIcon, 
  LinkIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  ChartBarIcon,
  ArrowPathIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { getPropertyTypeHelp, getPropertyTypeExample, validatePropertyValueLocal } from '../../utils/propertyHelpers';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function PropertyFieldsSection({ 
  availableProperties, 
  selectedProperties, 
  propertyValues, 
  onPropertyChange,
  onAddProperty,
  onRemoveProperty,
  onRefreshProperties,
  disabled 
}) {
  const { t } = useTranslation();
  const { success, error: showError } = useToast();
  const [validationErrors, setValidationErrors] = useState({});
  const [validationSummary, setValidationSummary] = useState(null);
  const [showAvailableProperties, setShowAvailableProperties] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const debounceTimer = useRef(null);
  const visibleProperties = availableProperties.filter(prop => selectedProperties[prop.name]);
  const unselectedProperties = availableProperties.filter(prop => !selectedProperties[prop.name] && prop.type !== 'title' && prop.type !== 'date');
  
  // Debounced validation
  const validateProperties = useCallback(async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/config/validate-property-values`, {
        propertyValues: propertyValues
      });
      
      const errors = {};
      const summary = {
        total: 0,
        valid: 0,
        invalid: 0,
        required: 0,
        missing: []
      };
      
      Object.keys(response.data.validation).forEach(propName => {
        const validation = response.data.validation[propName];
        summary.total++;
        
        if (!validation.valid) {
          errors[propName] = validation.error;
          summary.invalid++;
        } else {
          summary.valid++;
        }
        
        // Check for required properties
        const prop = visibleProperties.find(p => p.name === propName);
        if (prop && prop.required && (!propertyValues[propName] || propertyValues[propName] === '')) {
          summary.required++;
          summary.missing.push(propName);
        }
      });
      
      setValidationErrors(errors);
      setValidationSummary(summary);
    } catch (err) {
      // Silently fail validation errors
      console.error('Validation error:', err);
    }
  }, [propertyValues, visibleProperties]);
  
  useEffect(() => {
    // Debounce validation to avoid too many API calls
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    if (Object.keys(propertyValues).length > 0) {
      debounceTimer.current = setTimeout(() => {
        validateProperties();
      }, 500); // 500ms debounce
    }
    
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [propertyValues, validateProperties]);
  
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

  // Calculate validation summary
  const hasErrors = Object.keys(validationErrors).length > 0;
  const hasMissingRequired = validationSummary && validationSummary.missing.length > 0;
  
  const getTypeIcon = (type) => {
    const iconClass = "icon-md";
    const icons = {
      'title': <DocumentTextIcon className={iconClass} />,
      'rich_text': <DocumentTextIcon className={iconClass} />,
      'number': <HashtagIcon className={iconClass} />,
      'select': <ListBulletIcon className={iconClass} />,
      'multi_select': <ListBulletIcon className={iconClass} />,
      'date': <CalendarIcon className={iconClass} />,
      'checkbox': <CheckIcon className={iconClass} />,
      'url': <LinkIcon className={iconClass} />,
      'email': <EnvelopeIcon className={iconClass} />,
      'phone_number': <PhoneIcon className={iconClass} />,
      'relation': <LinkIcon className={iconClass} />,
      'rollup': <ChartBarIcon className={iconClass} />
    };
    return icons[type] || <DocumentTextIcon className={iconClass} />;
  };

  const handleRefreshClick = async () => {
    setLoadingProperties(true);
    try {
      await onRefreshProperties();
      success(t('success.propertiesRefreshed'));
    } catch (err) {
      showError(t('errors.propertiesRefreshFailed'));
    } finally {
      setLoadingProperties(false);
    }
  };

  return (
    <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
        <h3 style={{ color: '#ffffff', fontSize: '1rem', margin: 0 }}>
          {t('chat.propertyFields.title')}
        </h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {validationSummary && (
            <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)' }}>
              {validationSummary.valid}/{validationSummary.total} valid
              {hasErrors && (
                <span style={{ color: '#fca5a5', marginLeft: '8px' }}>
                  • {validationSummary.invalid} error{validationSummary.invalid > 1 ? 's' : ''}
                </span>
              )}
              {hasMissingRequired && (
                <span style={{ color: '#fca5a5', marginLeft: '8px' }}>
                  • {validationSummary.missing.length} required missing
                </span>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={handleRefreshClick}
            disabled={disabled || loadingProperties}
            style={{
              padding: '12px 16px',
              fontSize: '0.875rem',
              background: 'rgba(139, 92, 246, 0.3)',
              border: '1px solid rgba(196, 181, 253, 0.5)',
              borderRadius: '8px',
              color: '#ffffff',
              cursor: disabled || loadingProperties ? 'not-allowed' : 'pointer',
              opacity: disabled || loadingProperties ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              minHeight: '44px'
            }}
            title={t('chat.propertyFields.refreshTooltip')}
          >
            {loadingProperties ? <ClockIcon className="icon-sm" /> : <ArrowPathIcon className="icon-sm" />} {t('chat.propertyFields.refresh')}
          </button>
          {unselectedProperties.length > 0 && (
            <button
              type="button"
              onClick={() => setShowAvailableProperties(!showAvailableProperties)}
              disabled={disabled}
              style={{
                padding: '12px 16px',
                fontSize: '0.875rem',
                background: 'rgba(34, 197, 94, 0.3)',
                border: '1px solid rgba(34, 197, 94, 0.5)',
                borderRadius: '8px',
                color: '#ffffff',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                minHeight: '44px'
              }}
          >
            <PlusIcon className="icon-sm" />
            {t('chat.propertyFields.addFields')} ({unselectedProperties.length})
          </button>
          )}
        </div>
      </div>
      
      {/* Available properties to add */}
      {showAvailableProperties && unselectedProperties.length > 0 && (
        <div style={{
          marginBottom: '15px',
          padding: '12px',
          background: 'rgba(34, 197, 94, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(34, 197, 94, 0.3)'
        }}>
          <div style={{ 
            color: '#ffffff', 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            marginBottom: '10px' 
          }}>
            {t('chat.propertyFields.availableProperties')}:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {unselectedProperties.map(prop => (
              <button
                key={prop.name}
                type="button"
                onClick={() => {
                  onAddProperty(prop.name);
                  setShowAvailableProperties(false);
                  success(t('chat.propertyFields.propertyAdded', { name: prop.name }));
                }}
                disabled={disabled}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  background: 'rgba(34, 197, 94, 0.2)',
                  border: '1px solid rgba(34, 197, 94, 0.4)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{getTypeIcon(prop.type)}</span>
                <span>{prop.name}</span>
                <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                  ({t(`dynamicField.types.${prop.type}`) || prop.type})
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {hasMissingRequired && (
        <div style={{
          padding: '10px',
          background: 'rgba(252, 165, 165, 0.15)',
          borderRadius: '6px',
          border: '1px solid rgba(252, 165, 165, 0.3)',
          marginBottom: '15px',
          fontSize: '0.875rem',
          color: '#fca5a5'
        }}>
          <ExclamationTriangleIcon className="icon-sm icon-inline icon-mr-1" /> Required properties missing: {validationSummary.missing.join(', ')}
        </div>
      )}
      
      {visibleProperties.map(prop => {
        const helpText = getPropertyTypeHelp(prop.type);
        const exampleText = getPropertyTypeExample(prop.type, prop.options);
        const localValidation = validatePropertyValueLocal(prop, propertyValues[prop.name]);
        const hasLocalError = !localValidation.valid && propertyValues[prop.name];
        
        return (
          <div key={prop.name} className="form-group" style={{ marginBottom: '15px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label className="form-label" title={helpText} style={{ flex: 1 }}>
                <span style={{ marginRight: '6px' }}>{getTypeIcon(prop.type)}</span>
                {prop.name}
                {prop.required && (
                  <span style={{ color: '#fca5a5', marginLeft: '6px', fontSize: '0.75rem' }}>
                    *
                  </span>
                )}
                {helpText && (
                  <span style={{ 
                    marginLeft: '8px', 
                    fontSize: '0.7rem', 
                    color: 'rgba(196, 181, 253, 0.7)',
                    cursor: 'help'
                  }} title={helpText}>
                    <InformationCircleIcon className="icon-sm" />
                  </span>
                )}
              </label>
              {onRemoveProperty && (
                <button
                  type="button"
                  onClick={() => {
                    onRemoveProperty(prop.name);
                    success(t('chat.propertyFields.propertyRemoved', { name: prop.name }));
                  }}
                  disabled={disabled}
                  style={{
                    padding: '4px 8px',
                    fontSize: '0.7rem',
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    borderRadius: '4px',
                    color: '#fca5a5',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    marginLeft: '8px'
                  }}
                  title={t('chat.propertyFields.removeProperty')}
                >
                  ✕
                </button>
              )}
            </div>
            {exampleText && !propertyValues[prop.name] && (
              <div style={{ 
                fontSize: '0.7rem', 
                color: 'rgba(255, 255, 255, 0.5)', 
                marginBottom: '4px',
                fontStyle: 'italic'
              }}>
                {exampleText}
              </div>
            )}
            {renderInput(prop)}
            {hasLocalError && !validationErrors[prop.name] && (
              <div style={{ color: '#fca5a5', fontSize: '0.75rem', marginTop: '4px' }}>
                {localValidation.error}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default PropertyFieldsSection;

