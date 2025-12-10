/**
 * Utilitaires pour les propriétés Notion
 */

/**
 * Obtient une description/aide pour un type de propriété
 */
export const getPropertyTypeHelp = (type) => {
  const help = {
    'title': 'The main title of the page (automatically set from chat content)',
    'rich_text': 'Plain text or formatted text content',
    'number': 'Numeric value (can be integer or decimal)',
    'select': 'Choose one option from a predefined list',
    'multi_select': 'Choose multiple options from a predefined list',
    'date': 'Date value (format: YYYY-MM-DD)',
    'checkbox': 'Boolean value (true/false)',
    'url': 'Web URL (e.g., https://example.com)',
    'email': 'Email address (e.g., user@example.com)',
    'phone_number': 'Phone number (any format)',
    'relation': 'Link to another database',
    'rollup': 'Calculated value from related database'
  };
  
  return help[type] || 'Property value';
};

/**
 * Obtient un exemple de valeur pour un type de propriété
 */
export const getPropertyTypeExample = (type, options = []) => {
  if (type === 'select' && options.length > 0) {
    return `Example: ${options[0]}`;
  }
  if (type === 'multi_select' && options.length > 0) {
    return `Examples: ${options.slice(0, 2).join(', ')}`;
  }
  if (type === 'number') {
    return 'Example: 42 or 3.14';
  }
  if (type === 'date') {
    return 'Example: 2025-01-15';
  }
  if (type === 'email') {
    return 'Example: user@example.com';
  }
  if (type === 'url') {
    return 'Example: https://example.com';
  }
  if (type === 'phone_number') {
    return 'Example: +33 1 23 45 67 89';
  }
  if (type === 'checkbox') {
    return 'Check to set to true';
  }
  return '';
};

/**
 * Valide une valeur localement avant d'envoyer au serveur
 */
export const validatePropertyValueLocal = (property, value) => {
  if (!value && property.required) {
    return { valid: false, error: 'This field is required' };
  }
  
  if (!value) {
    return { valid: true };
  }
  
  switch (property.type) {
    case 'select':
      if (property.options && property.options.length > 0) {
        if (!property.options.includes(value)) {
          return { 
            valid: false, 
            error: `Invalid option. Valid options: ${property.options.join(', ')}` 
          };
        }
      }
      break;
    case 'multi_select':
      if (property.options && property.options.length > 0) {
        const values = Array.isArray(value) ? value : value.split(',').map(v => v.trim());
        const invalid = values.filter(v => !property.options.includes(v));
        if (invalid.length > 0) {
          return { 
            valid: false, 
            error: `Invalid options: ${invalid.join(', ')}` 
          };
        }
      }
      break;
    case 'number':
      if (isNaN(Number(value))) {
        return { valid: false, error: 'Must be a valid number' };
      }
      if (property.format === 'percent') {
        const num = Number(value);
        if (num < 0 || num > 100) {
          return { valid: false, error: 'Percentage must be between 0 and 100' };
        }
      }
      break;
    case 'date':
      if (!/^\d{4}-\d{2}-\d{2}/.test(value)) {
        return { valid: false, error: 'Date must be in YYYY-MM-DD format' };
      }
      break;
    case 'email':
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return { valid: false, error: 'Must be a valid email address' };
      }
      break;
    case 'url':
      if (!value.startsWith('http://') && !value.startsWith('https://') && !value.startsWith('ftp://')) {
        if (!value.includes('.') || value.length < 4) {
          return { valid: false, error: 'Must be a valid URL' };
        }
      }
      break;
  }
  
  return { valid: true };
};

