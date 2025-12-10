/**
 * Formulaire de configuration Notion
 */
import React from 'react';

function ConfigForm({ apiKey, setApiKey, databaseId, setDatabaseId, onSubmit, loading }) {
  return (
    <form onSubmit={onSubmit}>
      <div className="form-group">
        <label className="form-label">Code secret de l'intégration interne</label>
        <input
          type="password"
          className="form-input"
          placeholder="secret_..."
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          required
          disabled={loading}
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
          disabled={loading}
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
  );
}

export default ConfigForm;

