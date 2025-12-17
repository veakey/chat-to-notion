/**
 * Page principale pour envoyer des chats vers Notion
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { LightBulbIcon, PaperAirplaneIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useToast } from '../contexts/ToastContext';
import { useChatForm } from '../hooks/useChatForm';
import { useDynamicFields } from '../hooks/useDynamicFields';
import { useChatSubmission } from '../hooks/useChatSubmission';
import ProgressBar from './Chat/ProgressBar';
import DynamicFieldsSection from './Chat/DynamicFieldsSection';
import PropertyFieldsSection from './Chat/PropertyFieldsSection';
import LoadingSpinner from './LoadingSpinner';

function ChatPage({ isConfigured, activeConfig, configs = [], onSelectConfig }) {
  const { t } = useTranslation();
  const { success, error } = useToast();
  
  const {
    content,
    setContent,
    date,
    setDate,
    availableProperties,
    selectedProperties,
    propertyValues,
    initialLoading,
    handlePropertyChange,
    handleAddProperty,
    handleRemoveProperty,
    refreshProperties,
    resetForm
  } = useChatForm(isConfigured, activeConfig?.id);

  const {
    dynamicFields,
    missingProperties,
    setMissingProperties,
    addDynamicField,
    removeDynamicField,
    updateDynamicField,
    resetDynamicFieldsValues
  } = useDynamicFields(isConfigured, activeConfig?.id);

  const {
    loading,
    progress,
    submitChat,
    resetProgress
  } = useChatSubmission();

  const handleAddField = () => {
    if (!addDynamicField()) {
      error(t('chat.dynamicFields.maxReached'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isConfigured) {
      error(t('errors.notConfigured'));
      return;
    }

    const result = await submitChat(
      content,
      date,
      propertyValues,
      dynamicFields,
      availableProperties,
      activeConfig?.id || null
    );

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
        {t('chat.title')}
      </h2>

      {configs.length > 0 && (
        <div className="form-group" style={{ marginBottom: 12 }}>
          <label className="form-label">{t('chat.selectConfig')}</label>
          <select
            className="form-input"
            value={activeConfig?.id || ''}
            onChange={(e) => onSelectConfig && onSelectConfig(Number(e.target.value))}
            disabled={loading}
          >
            {configs.map((cfg) => (
              <option key={cfg.id} value={cfg.id}>
                {cfg.label || cfg.databaseTitle || cfg.databaseId}
              </option>
            ))}
          </select>
          {activeConfig && (
            <small style={{ color: 'rgba(255,255,255,0.8)' }}>
              {t('chat.activeConfig')}: {activeConfig.databaseTitle || activeConfig.databaseId}
            </small>
          )}
        </div>
      )}

      {!isConfigured && (
        <div className="message message-info">
          {t('chat.notConfigured')}
        </div>
      )}

      {missingProperties.length > 0 && (
        <div className="message message-error" style={{ marginBottom: '20px' }}>
          {t('chat.missingProperties')}{' '}
          <strong>{missingProperties.join(', ')}</strong>
          <br />
          <small style={{ fontSize: '0.875rem', opacity: 0.8 }}>
            {t('chat.missingPropertiesNote')}
          </small>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">{t('chat.form.dateLabel')}</label>
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
          <label className="form-label">{t('chat.form.contentLabel')}</label>
          <textarea
            className="form-textarea"
            placeholder={t('chat.form.contentPlaceholder')}
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
          onAddProperty={handleAddProperty}
          onRemoveProperty={handleRemoveProperty}
          onRefreshProperties={refreshProperties}
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
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          {loading ? (
            <>
              <ArrowPathIcon className="icon-md spinning-icon" />
              {t('chat.form.submitLoading')}
            </>
          ) : (
            <>
              <PaperAirplaneIcon className="icon-md" />
              {t('chat.form.submit')}
            </>
          )}
        </button>
      </form>

      <div style={{ marginTop: '30px', padding: '15px', background: 'rgba(139, 92, 246, 0.2)', borderRadius: '10px', border: '1px solid rgba(196, 181, 253, 0.3)' }}>
        <h3 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LightBulbIcon className="icon-md" />
          {t('chat.tips.title')}
        </h3>
        <ul style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.875rem', paddingLeft: '20px' }}>
          <li style={{ marginBottom: '8px' }}>
            {t('chat.tips.tip1')}
          </li>
          <li style={{ marginBottom: '8px' }}>
            {t('chat.tips.tip2')}
          </li>
          <li style={{ marginBottom: '8px' }}>
            {t('chat.tips.tip3')}
          </li>
          <li style={{ marginBottom: '8px' }}>
            {t('chat.tips.tip4')}
          </li>
        </ul>
      </div>
    </div>
  );
}

export default ChatPage;
