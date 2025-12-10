/**
 * Section des champs dynamiques
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { PlusIcon } from '@heroicons/react/24/outline';
import DynamicField from './DynamicField';

function DynamicFieldsSection({ 
  dynamicFields, 
  onAddField, 
  onUpdateField, 
  onRemoveField, 
  missingProperties,
  disabled 
}) {
  const { t } = useTranslation();
  
  return (
    <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ color: '#ffffff', fontSize: '1rem', margin: 0 }}>
          {t('chat.dynamicFields.title', { count: dynamicFields.length })}
        </h3>
        <button
          type="button"
          onClick={onAddField}
          disabled={disabled || dynamicFields.length >= 10}
          className="btn"
          style={{
            padding: '12px 16px',
            fontSize: '0.875rem',
            background: dynamicFields.length >= 10 ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.5)',
            border: '1px solid rgba(196, 181, 253, 0.3)',
            borderRadius: '8px',
            color: '#ffffff',
            cursor: dynamicFields.length >= 10 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            minHeight: '44px'
          }}
        >
          <PlusIcon className="icon-sm" />
          {t('chat.dynamicFields.add')}
        </button>
      </div>

      {dynamicFields.map(field => (
        <DynamicField
          key={field.id}
          field={field}
          onUpdate={onUpdateField}
          onRemove={onRemoveField}
          isMissing={missingProperties.includes(field.name)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

export default DynamicFieldsSection;

