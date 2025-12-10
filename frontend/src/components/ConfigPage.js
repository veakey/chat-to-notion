import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function ConfigPage({ isConfigured, onConfigSaved }) {
  const [apiKey, setApiKey] = useState('');
  const [databaseId, setDatabaseId] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/config`, {
        apiKey,
        databaseId,
      });

      setMessage({
        type: 'success',
        text: response.data.message,
      });

      // Clear sensitive data from state
      setApiKey('');
      setDatabaseId('');

      // Notify parent component
      onConfigSaved();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to save configuration',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card">
      <h2 style={{ color: '#ffffff', marginBottom: '20px' }}>
        Notion Configuration
      </h2>

      <div style={{ marginBottom: '20px' }}>
        <span
          className={`status-badge ${
            isConfigured ? 'status-configured' : 'status-not-configured'
          }`}
        >
          {isConfigured ? '✓ Configured' : '✗ Not Configured'}
        </span>
      </div>

      {message && (
        <div className={`message message-${message.type}`}>{message.text}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Notion API Key</label>
          <input
            type="password"
            className="form-input"
            placeholder="secret_..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            required
          />
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', marginTop: '5px' }}>
            Get your API key from{' '}
            <a
              href="https://www.notion.so/my-integrations"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#60a5fa' }}
            >
              Notion Integrations
            </a>
          </p>
        </div>

        <div className="form-group">
          <label className="form-label">Database ID</label>
          <input
            type="text"
            className="form-input"
            placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            value={databaseId}
            onChange={(e) => setDatabaseId(e.target.value)}
            required
          />
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', marginTop: '5px' }}>
            The database must have "Name" (title) and "Date" (date) properties
          </p>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-full"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Configuration'}
        </button>
      </form>

      <div style={{ marginTop: '30px', padding: '15px', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '10px' }}>
        <h3 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '10px' }}>
          📖 Setup Instructions
        </h3>
        <ol style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.875rem', paddingLeft: '20px' }}>
          <li style={{ marginBottom: '8px' }}>
            Create a new integration at{' '}
            <a
              href="https://www.notion.so/my-integrations"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#60a5fa' }}
            >
              Notion Integrations
            </a>
          </li>
          <li style={{ marginBottom: '8px' }}>
            Copy the "Internal Integration Token" (API Key)
          </li>
          <li style={{ marginBottom: '8px' }}>
            Create or open a database in Notion
          </li>
          <li style={{ marginBottom: '8px' }}>
            Ensure your database has "Name" (title) and "Date" (date) properties
          </li>
          <li style={{ marginBottom: '8px' }}>
            Share the database with your integration (click "..." → "Add connections")
          </li>
          <li style={{ marginBottom: '8px' }}>
            Copy the database ID from the URL: notion.so/[workspace]/[database_id]?v=...
          </li>
        </ol>
      </div>
    </div>
  );
}

export default ConfigPage;
