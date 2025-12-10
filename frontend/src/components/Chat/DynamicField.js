/**
 * Composant pour un champ dynamique individuel
 */
import React from 'react';

const NOTION_TYPES = [
  { value: 'rich_text', label: 'Texte' },
  { value: 'number', label: 'Nombre' },
  { value: 'select', label: 'Sélection' },
  { value: 'multi_select', label: 'Sélection multiple' },
  { value: 'date', label: 'Date' },
  { value: 'checkbox', label: 'Case à cocher' },
  { value: 'url', label: 'URL' },
  { value: 'email', label: 'Email' },
  { value: 'phone_number', label: 'Téléphone' }
];

function DynamicField({ field, onUpdate, onRemove, isMissing, disabled }) {
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
          placeholder="Valeur"
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
        placeholder="Valeur"
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
          placeholder="Nom de la propriété"
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
          ✕
        </button>
      </div>
      {isMissing && (
        <div style={{ color: '#fca5a5', fontSize: '0.875rem', marginBottom: '8px' }}>
          ⚠️ Cette propriété n'existe pas dans votre base de données Notion
        </div>
      )}
      {renderInput()}
    </div>
  );
}

export default DynamicField;

