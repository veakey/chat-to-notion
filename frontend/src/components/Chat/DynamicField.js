/**
 * Composant pour un champ dynamique individuel
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { XMarkIcon } from '@heroicons/react/24/solid';

function DynamicField({ field, onUpdate, onRemove, isMissing, disabled }) {
  const { t } = useTranslation();
  
  const NOTION_TYPES = [
    { value: 'rich_text', label: t('dynamicField.types.rich_text') },
    { value: 'number', label: t('dynamicField.types.number') },
    { value: 'select', label: t('dynamicField.types.select') },
    { value: 'multi_select', label: t('dynamicField.types.multi_select') },
    { value: 'date', label: t('dynamicField.types.date') },
    { value: 'checkbox', label: t('dynamicField.types.checkbox') },
    { value: 'url', label: t('dynamicField.types.url') },
    { value: 'email', label: t('dynamicField.types.email') },
    { value: 'phone_number', label: t('dynamicField.types.phone_number') }
  ];
  
  const handleChange = (fieldName, value) => {
    onUpdate(field.id, fieldName, value);
  };

  const renderInput = () => {
    if (field.type === 'checkbox') {
      return (
        <input
          type="checkbox"
          checked={field.value === true || field.value === 'true'}
          onChange={(e) => handleChange('value', e.target.checked)}
          disabled={disabled}
          style={{ width: '20px', height: '20px', cursor: 'pointer' }}
        />
      );
    }
    
    if (field.type === 'number') {
      return (
        <input
          type="number"
          className="form-input"
          placeholder={t('dynamicField.value')}
          value={field.value || ''}
          onChange={(e) => handleChange('value', e.target.value)}
          disabled={disabled}
        />
      );
    }
    
    if (field.type === 'date') {
      return (
        <input
          type="date"
          className="form-input"
          value={field.value || ''}
          onChange={(e) => handleChange('value', e.target.value)}
          disabled={disabled}
        />
      );
    }
    
    return (
      <input
        type="text"
        className="form-input"
        placeholder={t('dynamicField.value')}
        value={field.value || ''}
        onChange={(e) => handleChange('value', e.target.value)}
        disabled={disabled}
      />
    );
  };

  return (
    <div style={{ marginBottom: '15px', padding: '10px', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '8px' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <input
          type="text"
          className="form-input"
          placeholder={t('dynamicField.propertyName')}
          value={field.name}
          onChange={(e) => handleChange('name', e.target.value)}
          disabled={disabled}
          style={{ flex: 2 }}
        />
        <select
          className="form-input"
          value={field.type}
          onChange={(e) => handleChange('type', e.target.value)}
          disabled={disabled}
          style={{ flex: 1 }}
        >
          {NOTION_TYPES.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => onRemove(field.id)}
          disabled={disabled}
          style={{
            padding: '8px 12px',
            background: 'rgba(239, 68, 68, 0.5)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#ffffff',
            cursor: disabled ? 'not-allowed' : 'pointer'
          }}
        >
          <XMarkIcon className="icon-md" />
        </button>
      </div>
      {isMissing && (
        <div style={{ color: '#fca5a5', fontSize: '0.875rem', marginBottom: '8px' }}>
          {t('dynamicField.missing')}
        </div>
      )}
      {renderInput()}
    </div>
  );
}

export default DynamicField;

