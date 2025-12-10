/**
 * Page de configuration Notion
 */
import React from 'react';
import { useToast } from '../contexts/ToastContext';
import { useConfig } from '../hooks/useConfig';
import ConfigForm from './Config/ConfigForm';
import PropertiesSection from './Config/PropertiesSection';

function ConfigPage({ isConfigured, onConfigSaved }) {
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

  return (
    <div className="glass-card">
      <h2 style={{ color: '#ffffff', marginBottom: '20px' }}>
        Configuration Notion
      </h2>

      <div style={{ marginBottom: '20px' }}>
        <span
          className={`status-badge ${
            isConfigured ? 'status-configured' : 'status-not-configured'
          }`}
        >
          {isConfigured ? '✓ Configuré' : '✗ Non configuré'}
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
          📖 Instructions de configuration
        </h3>
        <ol style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.875rem', paddingLeft: '20px' }}>
          <li style={{ marginBottom: '8px' }}>
            Créez une nouvelle intégration sur{' '}
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
            Copiez le <strong>"Code secret de l'intégration interne"</strong> (cliquez sur "Afficher" pour le voir)
          </li>
          <li style={{ marginBottom: '8px' }}>
            Créez ou ouvrez une base de données dans Notion
          </li>
          <li style={{ marginBottom: '8px' }}>
            Assurez-vous que votre base de données a les propriétés "Name" (titre) et "Date" (date)
          </li>
          <li style={{ marginBottom: '8px' }}>
            Partagez la base de données avec votre intégration (cliquez sur "..." → "Ajouter des connexions")
          </li>
          <li style={{ marginBottom: '8px' }}>
            Copiez l'ID de la base de données depuis l'URL : notion.so/[workspace]/[database_id]?v=...
            <br />
            <small style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              L'ID est la partie entre le dernier "/" et le "?" dans l'URL
            </small>
          </li>
        </ol>
      </div>
    </div>
  );
}

export default ConfigPage;
