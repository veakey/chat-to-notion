/**
 * Page de configuration Notion
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../contexts/ToastContext';
import { useConfig } from '../hooks/useConfig';
import ConfigForm from './Config/ConfigForm';
import PropertiesSection from './Config/PropertiesSection';
import LoadingSpinner from './LoadingSpinner';

function ConfigPage({ isConfigured, onConfigSaved }) {
  const { t } = useTranslation();
  const { success, error } = useToast();
  
  const {
    apiKey,
    setApiKey,
    databaseId,
    setDatabaseId,
    loading,
    availableProperties,
    selectedProperties,
    loadingProperties,
    initialLoading,
    handlePropertyToggle,
    handleSaveProperties,
    handleSubmit
  } = useConfig(isConfigured);

  const onSubmit = async (e) => {
    e.preventDefault();
    const result = await handleSubmit();
    
    if (result.success) {
      success(result.message);
      onConfigSaved();
    } else {
      error(result.error);
    }
  };

  const onSaveProperties = async () => {
    const result = await handleSaveProperties();
    
    if (result.success) {
      success(result.message);
    } else {
      error(result.error);
    }
  };

  if (isConfigured && initialLoading) {
    return (
      <div className="glass-card">
        <LoadingSpinner message={t('config.properties.loading')} />
      </div>
    );
  }

  return (
    <div className="glass-card">
      <h2 style={{ color: '#ffffff', marginBottom: '20px' }}>
        {t('config.title')}
      </h2>

      <div style={{ marginBottom: '20px' }}>
        <span
          className={`status-badge ${
            isConfigured ? 'status-configured' : 'status-not-configured'
          }`}
        >
          {isConfigured ? t('config.status.configured') : t('config.status.notConfigured')}
        </span>
      </div>

      <ConfigForm
        apiKey={apiKey}
        setApiKey={setApiKey}
        databaseId={databaseId}
        setDatabaseId={setDatabaseId}
        onSubmit={onSubmit}
        loading={loading}
      />

      {isConfigured && (
        <PropertiesSection
          availableProperties={availableProperties}
          selectedProperties={selectedProperties}
          onPropertyToggle={handlePropertyToggle}
          onSave={onSaveProperties}
          loadingProperties={loadingProperties}
        />
      )}

      <div style={{ marginTop: '30px', padding: '15px', background: 'rgba(139, 92, 246, 0.2)', borderRadius: '10px', border: '1px solid rgba(196, 181, 253, 0.3)' }}>
        <h3 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '10px' }}>
          {t('config.instructions.title')}
        </h3>
        <ol style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.875rem', paddingLeft: '20px' }}>
          <li style={{ marginBottom: '8px' }}>
            {t('config.instructions.step1')}{' '}
            <a
              href="https://www.notion.so/my-integrations"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#c4b5fd' }}
            >
              Notion Integrations
            </a>
          </li>
          <li style={{ marginBottom: '8px' }}>
            {t('config.instructions.step2')}
          </li>
          <li style={{ marginBottom: '8px' }}>
            {t('config.instructions.step3')}
          </li>
          <li style={{ marginBottom: '8px' }}>
            {t('config.instructions.step4')}
          </li>
          <li style={{ marginBottom: '8px' }}>
            {t('config.instructions.step5')}
          </li>
          <li style={{ marginBottom: '8px' }}>
            {t('config.instructions.step6')}
            <br />
            <small style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              {t('config.instructions.step6Note')}
            </small>
          </li>
        </ol>
      </div>
    </div>
  );
}

export default ConfigPage;
