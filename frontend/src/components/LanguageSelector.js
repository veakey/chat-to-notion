import React from 'react';
import { useTranslation } from 'react-i18next';

function LanguageSelector() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div style={{ 
      position: 'absolute', 
      top: '20px', 
      right: '20px',
      zIndex: 1000
    }}>
      <select
        value={i18n.language}
        onChange={(e) => changeLanguage(e.target.value)}
        style={{
          padding: '8px 12px',
          background: 'rgba(139, 92, 246, 0.3)',
          border: '1px solid rgba(196, 181, 253, 0.5)',
          borderRadius: '8px',
          color: '#ffffff',
          fontSize: '0.875rem',
          cursor: 'pointer',
          outline: 'none'
        }}
      >
        <option value="fr">🇫🇷 Français</option>
        <option value="en">🇬🇧 English</option>
        <option value="de">🇩🇪 Deutsch</option>
        <option value="it">🇮🇹 Italiano</option>
      </select>
    </div>
  );
}

export default LanguageSelector;

