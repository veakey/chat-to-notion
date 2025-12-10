import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../contexts/ToastContext';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function ConfigPage({ isConfigured, onConfigSaved }) {
  const [apiKey, setApiKey] = useState('');
  const [databaseId, setDatabaseId] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableProperties, setAvailableProperties] = useState([]);
  const [selectedProperties, setSelectedProperties] = useState({});
  const [loadingProperties, setLoadingProperties] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    if (isConfigured) {
      loadProperties();
      loadSelectedProperties();
    }
  }, [isConfigured]);

  const loadProperties = async () => {
    setLoadingProperties(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/config/properties`);
      setAvailableProperties(response.data.properties || []);
    } catch (err) {
      console.error('Erreur lors du chargement des propriétés:', err);
    } finally {
      setLoadingProperties(false);
    }
  };

  const loadSelectedProperties = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/config`);
      setSelectedProperties(response.data.additionalProperties || {});
    } catch (err) {
      console.error('Erreur lors du chargement de la configuration:', err);
    }
  };

  const handlePropertyToggle = (propName) => {
    setSelectedProperties(prev => ({
      ...prev,
      [propName]: !prev[propName]
    }));
  };

  const handleSaveProperties = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/config/properties`, {
        additionalProperties: selectedProperties
      });
      success('Propriétés supplémentaires enregistrées avec succès');
    } catch (err) {
      error(err.response?.data?.error || 'Erreur lors de l\'enregistrement des propriétés');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/config`, {
        apiKey,
        databaseId,
      });

      success(response.data.message);

      // Clear sensitive data from state
      setApiKey('');
      setDatabaseId('');

      // Notify parent component
      onConfigSaved();
      
      // Charger les propriétés disponibles après la configuration
      setTimeout(() => {
        loadProperties();
      }, 500);
    } catch (err) {
      error(err.response?.data?.error || 'Failed to save configuration');
    } finally {
      setLoading(false);
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


      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Code secret de l'intégration interne</label>
          <input
            type="password"
            className="form-input"
            placeholder="secret_..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            required
          />
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', marginTop: '5px' }}>
            Copiez le code secret depuis votre{' '}
            <a
              href="https://www.notion.so/my-integrations"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#c4b5fd' }}
            >
              intégration Notion
            </a>
            {' '}(bouton "Afficher" ou "Actualiser")
          </p>
        </div>

        <div className="form-group">
          <label className="form-label">ID de la base de données</label>
          <input
            type="text"
            className="form-input"
            placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            value={databaseId}
            onChange={(e) => setDatabaseId(e.target.value)}
            required
          />
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', marginTop: '5px' }}>
            La base de données doit avoir les propriétés "Name" (titre) et "Date" (date)
          </p>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-full"
          disabled={loading}
        >
          {loading ? 'Enregistrement...' : 'Enregistrer la configuration'}
        </button>
      </form>

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

      {isConfigured && (
        <div style={{ marginTop: '30px' }}>
          <h3 style={{ color: '#ffffff', fontSize: '1.1rem', marginBottom: '15px' }}>
            ⚙️ Propriétés supplémentaires
          </h3>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', marginBottom: '15px' }}>
            Sélectionnez les propriétés que vous souhaitez utiliser lors de l'envoi de chats vers Notion
          </p>
          
          {loadingProperties ? (
            <div style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Chargement des propriétés...</div>
          ) : availableProperties.length === 0 ? (
            <div style={{ color: 'rgba(255, 255, 255, 0.7)', padding: '15px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '10px' }}>
              Aucune propriété supplémentaire disponible dans votre base de données.
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '15px' }}>
                {availableProperties.map(prop => (
                  <label
                    key={prop.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px',
                      marginBottom: '8px',
                      background: 'rgba(139, 92, 246, 0.1)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: selectedProperties[prop.name] ? '1px solid #c4b5fd' : '1px solid transparent'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedProperties[prop.name] || false}
                      onChange={() => handlePropertyToggle(prop.name)}
                      style={{ marginRight: '10px', cursor: 'pointer' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#ffffff', fontWeight: '500' }}>{prop.name}</div>
                      <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>
                        Type: {prop.type}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              <button
                type="button"
                className="btn btn-primary btn-full"
                onClick={handleSaveProperties}
              >
                Enregistrer les propriétés sélectionnées
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ConfigPage;
