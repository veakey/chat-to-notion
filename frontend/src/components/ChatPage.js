import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../contexts/ToastContext';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function ChatPage({ isConfigured }) {
  const [content, setContent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [availableProperties, setAvailableProperties] = useState([]);
  const [selectedProperties, setSelectedProperties] = useState({});
  const [propertyValues, setPropertyValues] = useState({});
  const { success, error, info } = useToast();

  useEffect(() => {
    if (isConfigured) {
      loadProperties();
    }
  }, [isConfigured]);

  const loadProperties = async () => {
    try {
      const [propertiesResponse, configResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/config/properties`),
        axios.get(`${API_BASE_URL}/api/config`)
      ]);
      
      const allProperties = propertiesResponse.data.properties || [];
      const selected = configResponse.data.additionalProperties || {};
      
      setAvailableProperties(allProperties);
      setSelectedProperties(selected);
      
      // Initialiser les valeurs des propriétés sélectionnées
      const initialValues = {};
      allProperties.forEach(prop => {
        if (selected[prop.name]) {
          initialValues[prop.name] = '';
        }
      });
      setPropertyValues(initialValues);
    } catch (err) {
      console.error('Erreur lors du chargement des propriétés:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isConfigured) {
      error('Veuillez d\'abord configurer les identifiants Notion dans l\'onglet Configuration');
      return;
    }

    setLoading(true);

    try {
      // Filtrer les valeurs des propriétés pour ne garder que celles qui sont remplies
      const filledProperties = {};
      Object.keys(propertyValues).forEach(propName => {
        if (propertyValues[propName] && propertyValues[propName].trim()) {
          filledProperties[propName] = propertyValues[propName];
        }
      });

      const response = await axios.post(`${API_BASE_URL}/api/chat`, {
        content,
        date,
        additionalProperties: filledProperties,
      });

      success(response.data.message);

      // Clear form
      setContent('');
      setDate(new Date().toISOString().split('T')[0]);
      // Réinitialiser les valeurs des propriétés
      const resetValues = {};
      Object.keys(propertyValues).forEach(propName => {
        resetValues[propName] = '';
      });
      setPropertyValues(resetValues);
    } catch (err) {
      error(err.response?.data?.error || 'Échec de l\'envoi du chat vers Notion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card">
      <h2 style={{ color: '#ffffff', marginBottom: '20px' }}>
        Envoyer un chat vers Notion
      </h2>

      {!isConfigured && (
        <div className="message message-info">
          ⚠️ Veuillez d'abord configurer vos identifiants Notion dans l'onglet Configuration
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Date du chat</label>
          <input
            type="date"
            className="form-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Contenu du chat</label>
          <textarea
            className="form-textarea"
            placeholder={`Collez votre conversation de chat ici...\n\nExemple :\nUtilisateur : Qu'est-ce que React ?\nAssistant : React est une bibliothèque JavaScript pour créer des interfaces utilisateur...`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>

        {Object.keys(selectedProperties).some(name => selectedProperties[name]) && (
          <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '10px' }}>
            <h3 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '15px' }}>
              Propriétés supplémentaires
            </h3>
            {availableProperties
              .filter(prop => selectedProperties[prop.name])
              .map(prop => (
                <div key={prop.name} className="form-group" style={{ marginBottom: '15px' }}>
                  <label className="form-label">{prop.name}</label>
                  {prop.type === 'checkbox' ? (
                    <input
                      type="checkbox"
                      checked={propertyValues[prop.name] === 'true' || propertyValues[prop.name] === true}
                      onChange={(e) => setPropertyValues(prev => ({ ...prev, [prop.name]: e.target.checked }))}
                      style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                  ) : prop.type === 'number' ? (
                    <input
                      type="number"
                      className="form-input"
                      value={propertyValues[prop.name] || ''}
                      onChange={(e) => setPropertyValues(prev => ({ ...prev, [prop.name]: e.target.value }))}
                    />
                  ) : prop.type === 'date' ? (
                    <input
                      type="date"
                      className="form-input"
                      value={propertyValues[prop.name] || ''}
                      onChange={(e) => setPropertyValues(prev => ({ ...prev, [prop.name]: e.target.value }))}
                    />
                  ) : (
                    <input
                      type="text"
                      className="form-input"
                      placeholder={`Saisissez une valeur pour ${prop.name} (${prop.type})`}
                      value={propertyValues[prop.name] || ''}
                      onChange={(e) => setPropertyValues(prev => ({ ...prev, [prop.name]: e.target.value }))}
                    />
                  )}
                </div>
              ))}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary btn-full"
          disabled={loading || !isConfigured}
        >
          {loading ? 'Envoi...' : 'Envoyer vers Notion'}
        </button>
      </form>

      <div style={{ marginTop: '30px', padding: '15px', background: 'rgba(139, 92, 246, 0.2)', borderRadius: '10px', border: '1px solid rgba(196, 181, 253, 0.3)' }}>
        <h3 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '10px' }}>
          💡 Conseils
        </h3>
        <ul style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.875rem', paddingLeft: '20px' }}>
          <li style={{ marginBottom: '8px' }}>
            Vous pouvez coller des conversations complètes depuis ChatGPT ou d'autres plateformes
          </li>
          <li style={{ marginBottom: '8px' }}>
            La première ligne sera utilisée comme titre dans Notion
          </li>
          <li style={{ marginBottom: '8px' }}>
            Sélectionnez une date pour organiser vos chats chronologiquement
          </li>
          <li style={{ marginBottom: '8px' }}>
            Le chat sera enregistré comme une nouvelle page dans votre base de données Notion configurée
          </li>
        </ul>
      </div>
    </div>
  );
}

export default ChatPage;
