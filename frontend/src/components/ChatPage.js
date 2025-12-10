import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../contexts/ToastContext';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function ChatPage({ isConfigured }) {
  const [content, setContent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [availableProperties, setAvailableProperties] = useState([]);
  const [selectedProperties, setSelectedProperties] = useState({});
  const [propertyValues, setPropertyValues] = useState({});
  const [dynamicFields, setDynamicFields] = useState([]);
  const [missingProperties, setMissingProperties] = useState([]);
  const { success, error, info } = useToast();

  const NOTION_TYPES = [
    { value: 'rich_text', label: 'Texte' },
    { value: 'number', label: 'Nombre' },
    { value: 'select', label: 'Sélection' },
    { value: 'multi_select', label: 'Sélection multiple' },
    { value: 'date', label: 'Date' },
    { value: 'checkbox', label: 'Case à cocher' },
    { value: 'url', label: 'URL' },
    { value: 'email', label: 'Email' },
    { value: 'phone_number', label: 'Téléphone' }
  ];

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

  const addDynamicField = () => {
    if (dynamicFields.length >= 10) {
      error('Maximum 10 champs dynamiques autorisés');
      return;
    }
    setDynamicFields([...dynamicFields, { id: Date.now(), name: '', type: 'rich_text', value: '' }]);
  };

  const removeDynamicField = (id) => {
    setDynamicFields(dynamicFields.filter(field => field.id !== id));
    // Retirer aussi de missingProperties si présent
    const field = dynamicFields.find(f => f.id === id);
    if (field) {
      setMissingProperties(missingProperties.filter(name => name !== field.name));
    }
  };

  const updateDynamicField = (id, field, value) => {
    setDynamicFields(dynamicFields.map(f => f.id === id ? { ...f, [field]: value } : f));
    // Si le nom change, mettre à jour missingProperties
    if (field === 'name') {
      const oldField = dynamicFields.find(f => f.id === id);
      if (oldField) {
        setMissingProperties(missingProperties.filter(name => name !== oldField.name));
      }
    }
  };

  const validateDynamicFields = async () => {
    if (dynamicFields.length === 0) return true;

    const fieldsToValidate = dynamicFields
      .filter(f => f.name && f.name.trim())
      .map(f => ({ name: f.name, type: f.type }));

    if (fieldsToValidate.length === 0) return true;

    try {
      setProgress(30);
      const response = await axios.post(`${API_BASE_URL}/api/config/validate-properties`, {
        properties: fieldsToValidate
      });

      const validation = response.data.validation;
      const missing = [];
      Object.keys(validation).forEach(propName => {
        if (!validation[propName].exists) {
          missing.push(propName);
        }
      });

      setMissingProperties(missing);
      setProgress(50);
      return missing.length === 0;
    } catch (err) {
      console.error('Erreur lors de la validation:', err);
      return true; // Continuer même en cas d'erreur de validation
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isConfigured) {
      error('Veuillez d\'abord configurer les identifiants Notion dans l\'onglet Configuration');
      return;
    }

    setLoading(true);
    setProgress(10);

    try {
      // Valider les champs dynamiques
      const isValid = await validateDynamicFields();
      if (!isValid && missingProperties.length > 0) {
        error(`Les propriétés suivantes n'existent pas dans Notion : ${missingProperties.join(', ')}`);
        setProgress(0);
        setLoading(false);
        return;
      }

      setProgress(40);

      // Filtrer les valeurs des propriétés pour ne garder que celles qui sont remplies
      const filledProperties = {};
      Object.keys(propertyValues).forEach(propName => {
        if (propertyValues[propName] && propertyValues[propName].trim()) {
          filledProperties[propName] = propertyValues[propName];
        }
      });

      // Ajouter les champs dynamiques remplis
      dynamicFields.forEach(field => {
        if (field.name && field.value && field.value.toString().trim()) {
          filledProperties[field.name] = field.value;
        }
      });

      setProgress(60);

      const response = await axios.post(`${API_BASE_URL}/api/chat`, {
        content,
        date,
        additionalProperties: filledProperties,
      });

      setProgress(90);

      // Vérifier s'il y a des propriétés manquantes dans la réponse
      if (response.data.missingProperties && response.data.missingProperties.length > 0) {
        setMissingProperties(response.data.missingProperties);
        error(`Les propriétés suivantes n'existent pas dans Notion : ${response.data.missingProperties.join(', ')}`);
      } else {
        success(response.data.message);
        setMissingProperties([]);
      }

      setProgress(100);

      // Clear form
      setTimeout(() => {
        setContent('');
        setDate(new Date().toISOString().split('T')[0]);
        const resetValues = {};
        Object.keys(propertyValues).forEach(propName => {
          resetValues[propName] = '';
        });
        setPropertyValues(resetValues);
        setDynamicFields([]);
        setProgress(0);
      }, 1000);
    } catch (err) {
      error(err.response?.data?.error || 'Échec de l\'envoi du chat vers Notion');
      setProgress(0);
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

      {missingProperties.length > 0 && (
        <div className="message message-error" style={{ marginBottom: '20px' }}>
          ⚠️ Les propriétés suivantes n'existent pas dans votre base de données Notion : <strong>{missingProperties.join(', ')}</strong>
          <br />
          <small style={{ fontSize: '0.875rem', opacity: 0.8 }}>
            Veuillez créer ces propriétés dans Notion ou supprimer ces champs avant d'envoyer.
          </small>
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
            disabled={loading}
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
            disabled={loading}
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
                      disabled={loading}
                    />
                  ) : prop.type === 'number' ? (
                    <input
                      type="number"
                      className="form-input"
                      value={propertyValues[prop.name] || ''}
                      onChange={(e) => setPropertyValues(prev => ({ ...prev, [prop.name]: e.target.value }))}
                      disabled={loading}
                    />
                  ) : prop.type === 'date' ? (
                    <input
                      type="date"
                      className="form-input"
                      value={propertyValues[prop.name] || ''}
                      onChange={(e) => setPropertyValues(prev => ({ ...prev, [prop.name]: e.target.value }))}
                      disabled={loading}
                    />
                  ) : (
                    <input
                      type="text"
                      className="form-input"
                      placeholder={`Saisissez une valeur pour ${prop.name} (${prop.type})`}
                      value={propertyValues[prop.name] || ''}
                      onChange={(e) => setPropertyValues(prev => ({ ...prev, [prop.name]: e.target.value }))}
                      disabled={loading}
                    />
                  )}
                </div>
              ))}
          </div>
        )}

        {/* Champs dynamiques */}
        <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ color: '#ffffff', fontSize: '1rem', margin: 0 }}>
              Champs dynamiques ({dynamicFields.length}/10)
            </h3>
            <button
              type="button"
              onClick={addDynamicField}
              disabled={loading || dynamicFields.length >= 10}
              className="btn"
              style={{
                padding: '8px 16px',
                fontSize: '0.875rem',
                background: dynamicFields.length >= 10 ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.5)',
                border: '1px solid rgba(196, 181, 253, 0.3)',
                borderRadius: '8px',
                color: '#ffffff',
                cursor: dynamicFields.length >= 10 ? 'not-allowed' : 'pointer'
              }}
            >
              + Ajouter un champ
            </button>
          </div>

          {dynamicFields.map(field => (
            <div key={field.id} style={{ marginBottom: '15px', padding: '10px', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nom de la propriété"
                  value={field.name}
                  onChange={(e) => updateDynamicField(field.id, 'name', e.target.value)}
                  disabled={loading}
                  style={{ flex: 2 }}
                />
                <select
                  className="form-input"
                  value={field.type}
                  onChange={(e) => updateDynamicField(field.id, 'type', e.target.value)}
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  {NOTION_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeDynamicField(field.id)}
                  disabled={loading}
                  style={{
                    padding: '8px 12px',
                    background: 'rgba(239, 68, 68, 0.5)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  ✕
                </button>
              </div>
              {missingProperties.includes(field.name) && (
                <div style={{ color: '#fca5a5', fontSize: '0.875rem', marginBottom: '8px' }}>
                  ⚠️ Cette propriété n'existe pas dans votre base de données Notion
                </div>
              )}
              {field.type === 'checkbox' ? (
                <input
                  type="checkbox"
                  checked={field.value === true || field.value === 'true'}
                  onChange={(e) => updateDynamicField(field.id, 'value', e.target.checked)}
                  disabled={loading}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
              ) : field.type === 'number' ? (
                <input
                  type="number"
                  className="form-input"
                  placeholder="Valeur"
                  value={field.value || ''}
                  onChange={(e) => updateDynamicField(field.id, 'value', e.target.value)}
                  disabled={loading}
                />
              ) : field.type === 'date' ? (
                <input
                  type="date"
                  className="form-input"
                  value={field.value || ''}
                  onChange={(e) => updateDynamicField(field.id, 'value', e.target.value)}
                  disabled={loading}
                />
              ) : (
                <input
                  type="text"
                  className="form-input"
                  placeholder="Valeur"
                  value={field.value || ''}
                  onChange={(e) => updateDynamicField(field.id, 'value', e.target.value)}
                  disabled={loading}
                />
              )}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        {loading && (
          <div style={{ marginBottom: '15px' }}>
            <div style={{ 
              width: '100%', 
              height: '8px', 
              background: 'rgba(255, 255, 255, 0.2)', 
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #8B5CF6, #C4B5FD)',
                transition: 'width 0.3s ease'
              }} />
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', marginTop: '5px', textAlign: 'center' }}>
              {progress < 40 ? 'Validation...' : progress < 60 ? 'Envoi...' : progress < 90 ? 'Création des blocs...' : 'Finalisation...'}
            </div>
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary btn-full"
          disabled={loading || !isConfigured}
        >
          {loading ? 'Envoi en cours...' : 'Envoyer vers Notion'}
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
