/**
 * Page principale pour envoyer des chats vers Notion
 */
import React from 'react';
import { useToast } from '../contexts/ToastContext';
import { useChatForm } from '../hooks/useChatForm';
import { useDynamicFields } from '../hooks/useDynamicFields';
import { useChatSubmission } from '../hooks/useChatSubmission';
import ProgressBar from './Chat/ProgressBar';
import DynamicFieldsSection from './Chat/DynamicFieldsSection';
import PropertyFieldsSection from './Chat/PropertyFieldsSection';

function ChatPage({ isConfigured }) {
  const { success, error } = useToast();
  
  const {
    content,
    setContent,
    date,
    setDate,
    availableProperties,
    selectedProperties,
    propertyValues,
    handlePropertyChange,
    resetForm
  } = useChatForm(isConfigured);

  const {
    dynamicFields,
    missingProperties,
    setMissingProperties,
    addDynamicField,
    removeDynamicField,
    updateDynamicField,
    resetDynamicFieldsValues
  } = useDynamicFields(isConfigured);

  const {
    loading,
    progress,
    submitChat,
    resetProgress
  } = useChatSubmission();

  const handleAddField = () => {
    if (!addDynamicField()) {
      error('Maximum 10 champs dynamiques autorisés');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isConfigured) {
      error('Veuillez d\'abord configurer les identifiants Notion dans l\'onglet Configuration');
      return;
    }

    const result = await submitChat(content, date, propertyValues, dynamicFields);

    if (result.success) {
      success(result.message);
      setMissingProperties(result.missingProperties);
      resetForm();
      resetDynamicFieldsValues();
      setTimeout(() => {
        resetProgress();
      }, 1000);
    } else {
      error(result.error);
      if (result.missingProperties) {
        setMissingProperties(result.missingProperties);
      }
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
          ⚠️ Les propriétés suivantes n'existent pas dans votre base de données Notion :{' '}
          <strong>{missingProperties.join(', ')}</strong>
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

        <PropertyFieldsSection
          availableProperties={availableProperties}
          selectedProperties={selectedProperties}
          propertyValues={propertyValues}
          onPropertyChange={handlePropertyChange}
          disabled={loading}
        />

        <DynamicFieldsSection
          dynamicFields={dynamicFields}
          onAddField={handleAddField}
          onUpdateField={updateDynamicField}
          onRemoveField={removeDynamicField}
          missingProperties={missingProperties}
          disabled={loading}
        />

        <ProgressBar progress={progress} loading={loading} />

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
