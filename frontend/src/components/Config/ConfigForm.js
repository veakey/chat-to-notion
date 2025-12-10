/**
 * Formulaire de configuration Notion
 */
import React from 'react';
import { useTranslation, Trans } from 'react-i18next';

function ConfigForm({ apiKey, setApiKey, databaseId, setDatabaseId, onSubmit, loading }) {
  const { t } = useTranslation();
  
  return (
    <form onSubmit={onSubmit}>
      <div className="form-group">
        <label className="form-label">{t('config.form.apiKeyLabel')}</label>
        <input
          type="password"
          className="form-input"
          placeholder={t('config.form.apiKeyPlaceholder')}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          required
          disabled={loading}
        />
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', marginTop: '5px' }}>
          <Trans
            i18nKey="config.form.apiKeyHelp"
            components={{
              /* eslint-disable-next-line jsx-a11y/anchor-has-content */
              link: <a
                href="https://www.notion.so/my-integrations"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#c4b5fd' }}
              />
            }}
          />
        </p>
      </div>

      <div className="form-group">
        <label className="form-label">{t('config.form.databaseIdLabel')}</label>
        <input
          type="text"
          className="form-input"
          placeholder={t('config.form.databaseIdPlaceholder')}
          value={databaseId}
          onChange={(e) => setDatabaseId(e.target.value)}
          required
          disabled={loading}
        />
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', marginTop: '5px' }}>
          {t('config.form.databaseIdHelp')}
        </p>
      </div>

      <button
        type="submit"
        className="btn btn-primary btn-full"
        disabled={loading}
      >
        {loading ? t('config.form.submitLoading') : t('config.form.submit')}
      </button>
    </form>
  );
}

export default ConfigForm;

