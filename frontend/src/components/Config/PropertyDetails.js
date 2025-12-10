/**
 * Composant pour afficher les détails d'une propriété Notion
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  DocumentTextIcon, 
  HashtagIcon, 
  ListBulletIcon, 
  CalendarIcon, 
  CheckIcon, 
  LinkIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

function PropertyDetails({ property }) {
  const { t } = useTranslation();
  
  if (!property) return null;
  
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
  
  const getTypeLabel = (type) => {
    return t(`dynamicField.types.${type}`) || type;
  };
  
  return (
    <div style={{
      padding: '12px',
      background: 'rgba(139, 92, 246, 0.15)',
      borderRadius: '8px',
      marginBottom: '8px',
      border: '1px solid rgba(196, 181, 253, 0.3)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>
          {getTypeIcon(property.type)}
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#ffffff', fontWeight: '600', fontSize: '0.95rem' }}>
            {property.name}
            {property.required && (
              <span style={{ color: '#fca5a5', marginLeft: '6px', fontSize: '0.75rem' }}>
                (Required)
              </span>
            )}
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem', marginTop: '2px' }}>
            {getTypeLabel(property.type)}
          </div>
        </div>
      </div>
      
      {/* Options pour select/multi_select */}
      {property.options && property.options.length > 0 && (
        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(196, 181, 253, 0.2)' }}>
          <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.75rem', marginBottom: '4px', fontWeight: '500' }}>
            Available options:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {property.options.map((option, idx) => (
              <span
                key={idx}
                style={{
                  padding: '4px 8px',
                  background: 'rgba(196, 181, 253, 0.2)',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  color: '#c4b5fd'
                }}
              >
                {option}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Format pour number */}
      {property.format && (
        <div style={{ marginTop: '6px', color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem' }}>
          Format: {property.format}
        </div>
      )}
    </div>
  );
}

export default PropertyDetails;

