import React from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageIcon } from '@heroicons/react/24/outline';

function LanguageSelector() {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="language-selector-container">
      <LanguageIcon className="language-selector-icon" />
      <select
        value={i18n.language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="language-selector"
      >
        <option value="fr">{t('language.french')}</option>
        <option value="en">{t('language.english')}</option>
        <option value="de">{t('language.german')}</option>
        <option value="it">{t('language.italian')}</option>
      </select>
    </div>
  );
}

export default LanguageSelector;

