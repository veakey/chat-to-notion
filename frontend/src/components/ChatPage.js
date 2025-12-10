import React, { useState } from 'react';
import axios from 'axios';
import { useToast } from '../contexts/ToastContext';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function ChatPage({ isConfigured }) {
  const [content, setContent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const { success, error, info } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isConfigured) {
      error('Please configure Notion API credentials first in the Configuration tab');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/chat`, {
        content,
        date,
      });

      success(response.data.message);

      // Clear form
      setContent('');
      setDate(new Date().toISOString().split('T')[0]);
    } catch (err) {
      error(err.response?.data?.error || 'Failed to send chat to Notion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card">
      <h2 style={{ color: '#ffffff', marginBottom: '20px' }}>
        Send Chat to Notion
      </h2>

      {!isConfigured && (
        <div className="message message-info">
          ⚠️ Please configure your Notion API credentials in the Configuration tab first
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Chat Date</label>
          <input
            type="date"
            className="form-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Chat Content</label>
          <textarea
            className="form-textarea"
            placeholder={`Paste your chat conversation here...\n\nExample:\nUser: What is React?\nAssistant: React is a JavaScript library for building user interfaces...`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-full"
          disabled={loading || !isConfigured}
        >
          {loading ? 'Sending...' : 'Send to Notion'}
        </button>
      </form>

      <div style={{ marginTop: '30px', padding: '15px', background: 'rgba(139, 92, 246, 0.2)', borderRadius: '10px', border: '1px solid rgba(196, 181, 253, 0.3)' }}>
        <h3 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '10px' }}>
          💡 Tips
        </h3>
        <ul style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.875rem', paddingLeft: '20px' }}>
          <li style={{ marginBottom: '8px' }}>
            You can paste entire chat conversations from ChatGPT or other platforms
          </li>
          <li style={{ marginBottom: '8px' }}>
            The first line will be used as the title in Notion
          </li>
          <li style={{ marginBottom: '8px' }}>
            Select a date to organize your chats chronologically
          </li>
          <li style={{ marginBottom: '8px' }}>
            The chat will be saved as a new page in your configured Notion database
          </li>
        </ul>
      </div>
    </div>
  );
}

export default ChatPage;
