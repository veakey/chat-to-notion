import React, { useState, useEffect } from 'react';
import './App.css';
import ConfigPage from './components/ConfigPage';
import ChatPage from './components/ChatPage';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
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
    <div className="app">
      <div className="background"></div>
      <div className="container">
        <h1 className="app-title">Chat to Notion</h1>
        <p className="app-subtitle">
          Send your chat conversations to Notion with ease
        </p>

        {loading ? (
          <div className="glass-card">
            <div className="loading">Loading...</div>
          </div>
        ) : (
          <>
            <div className="tab-nav">
              <button
                className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
                onClick={() => setActiveTab('chat')}
              >
                📝 Send Chat
              </button>
              <button
                className={`tab-button ${activeTab === 'config' ? 'active' : ''}`}
                onClick={() => setActiveTab('config')}
              >
                ⚙️ Configuration
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
  );
}

export default App;
