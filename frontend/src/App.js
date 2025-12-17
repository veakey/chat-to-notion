import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChatBubbleLeftRightIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import './App.css';
import ConfigPage from './components/ConfigPage';
import ChatPage from './components/ChatPage';
import ToastContainer from './components/ToastContainer';
import LanguageSelector from './components/LanguageSelector';
import LoadingSpinner from './components/LoadingSpinner';
import { ToastProvider } from './contexts/ToastContext';
import { useConfigs } from './hooks/useConfigs';

function App() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('chat');

  const {
    configs,
    activeConfigId,
    activeConfig,
    loading,
    initialLoading,
    fetchConfigs,
    addConfig,
    updateConfig,
    deleteConfig,
    selectConfig,
  } = useConfigs();

  const isConfigured = Boolean(activeConfig);

  useEffect(() => {
    if (!isConfigured) {
      setActiveTab('config');
    }
  }, [isConfigured]);

  return (
    <ToastProvider>
      <div className="app">
        <div className="background"></div>
        <LanguageSelector />
        <ToastContainer />
        <div className="container">
          <div className="container-header">
            <h1 className="app-title">{t('app.title')}</h1>
            <p className="app-subtitle">
              {t('app.subtitle')}
            </p>

            {!loading && (
              <div className="tab-nav">
                <button
                  className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
                  onClick={() => setActiveTab('chat')}
                >
                  <ChatBubbleLeftRightIcon className="tab-icon" />
                  {t('app.tabs.chat')}
                </button>
                <button
                  className={`tab-button ${activeTab === 'config' ? 'active' : ''}`}
                  onClick={() => setActiveTab('config')}
                >
                  <Cog6ToothIcon className="tab-icon" />
                  {t('app.tabs.config')}
                </button>
              </div>
            )}
          </div>

          {initialLoading ? (
            <div className="glass-card">
              <LoadingSpinner message={t('app.loading')} />
            </div>
          ) : (
            <>
              {activeTab === 'config' ? (
                <ConfigPage
                  configs={configs}
                  activeConfigId={activeConfigId}
                  onSelectConfig={selectConfig}
                  onRefreshConfigs={fetchConfigs}
                  onAddConfig={addConfig}
                  onUpdateConfig={updateConfig}
                  onDeleteConfig={deleteConfig}
                  loadingConfigs={loading}
                  initialLoading={initialLoading}
                />
              ) : (
                <ChatPage
                  isConfigured={isConfigured}
                  activeConfig={activeConfig}
                  configs={configs}
                  onSelectConfig={selectConfig}
                />
              )}
            </>
          )}
        </div>
      </div>
    </ToastProvider>
  );
}

export default App;
