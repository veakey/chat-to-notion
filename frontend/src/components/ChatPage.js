import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function ChatPage({ isConfigured }) {
  const [content, setContent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isConfigured) {
      setMessage({
        type: 'error',
        text: 'Please configure Notion API credentials first in the Configuration tab',
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/chat`, {
        content,
        date,
      });

      setMessage({
        type: 'success',
        text: response.data.message,
      });

      // Clear form
      setContent('');
      setDate(new Date().toISOString().split('T')[0]);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to send chat to Notion',
      });
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

      {message && (
        <div className={`message message-${message.type}`}>{message.text}</div>
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

      <div style={{ marginTop: '30px', padding: '15px', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '10px' }}>
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
