import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChatBubbleLeftRightIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import './App.css';
import ConfigPage from './components/ConfigPage';
import ChatPage from './components/ChatPage';
import ToastContainer from './components/ToastContainer';
import LanguageSelector from './components/LanguageSelector';
import { ToastProvider } from './contexts/ToastContext';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('chat');
  const [isConfigured, setIsConfigured] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkConfiguration();
  }, []);

  const checkConfiguration = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/config`);
      setIsConfigured(response.data.configured);
    } catch (error) {
      console.error('Error checking configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigSaved = () => {
    setIsConfigured(true);
    setActiveTab('chat');
  };

  return (
    <ToastProvider>
      <div className="app">
        <div className="background"></div>
        <LanguageSelector />
        <ToastContainer />
        <div className="container">
          <h1 className="app-title">{t('app.title')}</h1>
          <p className="app-subtitle">
            {t('app.subtitle')}
          </p>

          {loading ? (
            <div className="glass-card">
              <div className="loading">{t('app.loading')}</div>
            </div>
          ) : (
            <>
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

              {activeTab === 'config' ? (
                <ConfigPage
                  isConfigured={isConfigured}
                  onConfigSaved={handleConfigSaved}
                />
              ) : (
                <ChatPage isConfigured={isConfigured} />
              )}
            </>
          )}
        </div>
      </div>
    </ToastProvider>
  );
}

export default App;
