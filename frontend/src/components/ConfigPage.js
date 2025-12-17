/**
 * Page de configuration Notion (multi-configs)
 */
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../contexts/ToastContext';
import { useConfig } from '../hooks/useConfig';
import PropertiesSection from './Config/PropertiesSection';
import LoadingSpinner from './LoadingSpinner';

function ConfigPage({
  configs = [],
  activeConfigId,
  onSelectConfig,
  onRefreshConfigs,
  onAddConfig,
  onUpdateConfig,
  onDeleteConfig,
  loadingConfigs,
  initialLoading,
}) {
  const { t } = useTranslation();
  const { success, error } = useToast();

  const activeConfig = useMemo(
    () => configs.find((c) => c.id === activeConfigId),
    [configs, activeConfigId]
  );

  // Gestion des propriétés supplémentaires pour la config active
  const {
    availableProperties,
    selectedProperties,
    loadingProperties,
    initialLoading: propsInitialLoading,
    handlePropertyToggle,
    handleSaveProperties,
  } = useConfig(Boolean(activeConfig), activeConfig?.id);

  // Etat du formulaire modal (add / edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [editConfigId, setEditConfigId] = useState(null);
  const [form, setForm] = useState({ apiKey: '', databaseId: '', label: '' });
  const [saving, setSaving] = useState(false);

  const openAddModal = () => {
    setEditConfigId(null);
    setForm({ apiKey: '', databaseId: '', label: '' });
    setModalOpen(true);
  };

  const openEditModal = (cfg) => {
    setEditConfigId(cfg.id);
    setForm({ apiKey: '', databaseId: cfg.databaseId || '', label: cfg.label || '' });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm({ apiKey: '', databaseId: '', label: '' });
    setEditConfigId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitModal = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editConfigId) {
        if (!form.apiKey || !form.databaseId) {
          error(t('errors.requiredFields'));
          setSaving(false);
          return;
        }
        await onUpdateConfig(editConfigId, {
          apiKey: form.apiKey,
          databaseId: form.databaseId,
          label: form.label,
          setActive: true,
        });
        success(t('success.configUpdated'));
      } else {
        if (!form.apiKey || !form.databaseId) {
          error(t('errors.requiredFields'));
          setSaving(false);
          return;
        }
        await onAddConfig({
          apiKey: form.apiKey,
          databaseId: form.databaseId,
          label: form.label,
        });
        success(t('success.configSaved'));
      }
      await onRefreshConfigs();
      closeModal();
    } catch (err) {
      const msg = err?.response?.data?.error || t('errors.generic');
      error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (configId) => {
    try {
      await onDeleteConfig(configId);
      success(t('success.configDeleted'));
      await onRefreshConfigs();
    } catch (err) {
      const msg = err?.response?.data?.error || t('errors.generic');
      error(msg);
    }
  };

  if (initialLoading) {
    return (
      <div className="glass-card">
        <LoadingSpinner message={t('config.properties.loading')} />
      </div>
    );
  }

  return (
    <div className="glass-card">
      <h2 style={{ color: '#ffffff', marginBottom: '12px' }}>
        {t('config.title')}
      </h2>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <span
            className={`status-badge ${
              activeConfig ? 'status-configured' : 'status-not-configured'
            }`}
          >
            {activeConfig ? t('config.status.configured') : t('config.status.notConfigured')}
          </span>
          {activeConfig && (
            <span style={{ marginLeft: 10, color: '#e5e7eb' }}>
              {t('config.active')}: {activeConfig.label || activeConfig.databaseTitle || activeConfig.databaseId}
            </span>
          )}
        </div>
        <button className="btn btn-secondary" onClick={openAddModal}>
          {t('config.add')}
        </button>
      </div>

      <div className="glass-section" style={{ marginBottom: 20 }}>
        <h3 style={{ color: '#fff', marginBottom: 10 }}>{t('config.list')}</h3>
        {configs.length === 0 ? (
          <div className="message message-info">{t('config.noConfig')}</div>
        ) : (
          <div className="config-list">
            {configs.map((cfg) => (
              <div key={cfg.id} className="config-item">
                <div>
                  <div style={{ color: '#fff', fontWeight: 600 }}>
                    {cfg.label || cfg.databaseTitle || cfg.databaseId}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>
                    {cfg.databaseId}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {!cfg.isActive && (
                    <button className="btn btn-secondary" onClick={() => onSelectConfig(cfg.id)} disabled={loadingConfigs}>
                      {t('config.select')}
                    </button>
                  )}
                  <button className="btn btn-tertiary" onClick={() => openEditModal(cfg)} disabled={loadingConfigs}>
                    {t('common.edit')}
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDelete(cfg.id)} disabled={loadingConfigs}>
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {activeConfig && (
        <PropertiesSection
          availableProperties={availableProperties}
          selectedProperties={selectedProperties}
          onPropertyToggle={handlePropertyToggle}
          onSave={handleSaveProperties}
          loadingProperties={loadingProperties || propsInitialLoading}
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

      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3 style={{ color: '#fff', marginBottom: 12 }}>
              {editConfigId ? t('config.editConfig') : t('config.addConfig')}
            </h3>
            <form onSubmit={handleSubmitModal} className="modal-form">
              <label className="form-label">{t('config.apiKey')}</label>
              <input
                name="apiKey"
                type="text"
                className="form-input"
                value={form.apiKey}
                onChange={handleChange}
                required
                placeholder="secret_xxx"
              />

              <label className="form-label" style={{ marginTop: 10 }}>{t('config.databaseId')}</label>
              <input
                name="databaseId"
                type="text"
                className="form-input"
                value={form.databaseId}
                onChange={handleChange}
                required
              />

              <label className="form-label" style={{ marginTop: 10 }}>{t('config.label')}</label>
              <input
                name="label"
                type="text"
                className="form-input"
                value={form.label}
                onChange={handleChange}
                placeholder={t('config.labelPlaceholder')}
              />

              <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-tertiary" onClick={closeModal} disabled={saving}>
                  {t('common.cancel')}
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? t('common.saving') : t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ConfigPage;
