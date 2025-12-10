# Chat to Notion

A fullstack web application that allows users to paste chat conversations (from ChatGPT or other sources) and automatically send them to Notion with organized dates.

## Features

- 🔑 **Notion API Configuration**: Easy setup of Notion API credentials
- 💬 **Chat Submission**: Paste chat conversations with dates
- 🎨 **GlassUI Design**: Beautiful glassmorphism interface
- 🖼️ **Stunning Background**: Eye-catching background image
- 📊 **Notion Integration**: Automatically creates pages in your Notion database
- 🔍 **Smart Parsing**: Extracts titles and content from chat conversations
- 🌍 **Internationalization (i18n)**: Support for multiple languages (French, English, and more)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.8+** (check with `python --version`)
- **Node.js 16+** and npm (check with `node --version` and `npm --version`)
- A **Notion account** with access to create integrations and databases

## Tech Stack

### Backend
- Python 3.x
- Flask (Web Framework)
- Flask-CORS
- notion-client (Notion API SDK)

### Frontend
- React 18
- Axios (HTTP Client)
- GlassUI Design
- React Scripts

## Quick Start

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. (Optional) Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Run the Flask server:
```bash
python app.py
```

The backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. (Optional) Create a `.env` file to configure the API URL:
```bash
REACT_APP_API_URL=http://localhost:5000
```

3. Install Node.js dependencies:
```bash
npm install
```

4. Start the development server:
```bash
npm start
```

The frontend will run on http://localhost:3000 and automatically open in your browser.

## Usage

1. **Configure Notion**:
   - Go to the Configuration tab
   - Create a Notion integration at https://www.notion.so/my-integrations
   - Copy your API key
   - Create a database in Notion with "Name" (title) and "Date" (date) properties
   - Share the database with your integration
   - Enter your API key and database ID
   - 📚 For more details, see the [Notion API Documentation](https://developers.notion.com/)

2. **Send Chats**:
   - Go to the Send Chat tab
   - Select a date for organization (format: YYYY-MM-DD)
   - Paste your chat conversation (see examples below)
   - Click "Send to Notion"
   - Your chat will be created as a new page in your Notion database

### Example Chat Format

The application can parse various chat formats. Here are some examples:

**Simple format:**
```
User: What is React?
Assistant: React is a JavaScript library for building user interfaces...
```

**With timestamps:**
```
[2025-01-15 10:30] User: Hello
[2025-01-15 10:31] Assistant: Hi! How can I help you?
```

**ChatGPT format:**
```
ChatGPT: React is a popular JavaScript library...
User: Can you explain hooks?
ChatGPT: React Hooks are functions that let you use state...
```

The first line (after removing common prefixes like "User:", "Assistant:", "ChatGPT:") will be used as the page title in Notion.

## Project Structure

```
chat-to-notion/
├── backend/
│   ├── app.py              # Flask application and API endpoints
│   ├── requirements.txt    # Python dependencies
│   └── README.md           # Backend-specific documentation
├── frontend/
│   ├── public/
│   │   └── index.html      # HTML template
│   ├── src/
│   │   ├── components/
│   │   │   ├── ConfigPage.js    # Notion configuration component
│   │   │   └── ChatPage.js      # Chat submission component
│   │   ├── App.js          # Main application component
│   │   ├── App.css         # Application styles
│   │   ├── index.js        # React entry point
│   │   └── index.css       # Global styles
│   ├── package.json        # Node.js dependencies
│   └── README.md           # Frontend-specific documentation
├── prompts/                # Project planning and documentation
│   ├── intentions.md       # Project goals and objectives
│   ├── actions_tracking.md # Action tracking log
│   ├── past_interactions.md # Interaction history
│   ├── brainstorming_prompt_improved.md # Development guidelines
│   └── ameliorations.md    # Improvement ideas
├── LICENSE                 # MIT License
└── README.md               # This file
```

## API Endpoints

### Backend API

#### `GET /api/health`
Health check endpoint to verify the server is running.

**Response:**
```json
{
  "status": "healthy"
}
```

#### `POST /api/config`
Save Notion API configuration.

**Request Body:**
```json
{
  "apiKey": "secret_xxxxxxxxxxxxxxxxxxxxxxxx",
  "databaseId": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

**Success Response (200):**
```json
{
  "message": "Configuration saved successfully"
}
```

**Error Response (400):**
```json
{
  "error": "API key and database ID are required"
}
```

#### `GET /api/config`
Get current configuration status.

**Response (200):**
```json
{
  "configured": true,
  "databaseId": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

#### `POST /api/chat`
Send chat content to Notion.

**Request Body:**
```json
{
  "content": "User: What is React?\nAssistant: React is a JavaScript library...",
  "date": "2025-01-15"
}
```

**Success Response (200):**
```json
{
  "message": "Chat sent to Notion successfully",
  "notionPageId": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

**Error Response (400):**
```json
{
  "error": "Chat content is required"
}
```

**Error Response (400):**
```json
{
  "error": "Notion not configured. Please configure API credentials first."
}
```

## Troubleshooting

### Common Issues

**Backend won't start:**
- Ensure Python 3.8+ is installed
- Check that all dependencies are installed: `pip install -r requirements.txt`
- Verify port 5000 is not already in use

**Frontend can't connect to backend:**
- Ensure the backend is running on http://localhost:5000
- Check the `REACT_APP_API_URL` environment variable in `.env`
- Verify CORS is enabled in the Flask backend

**Notion API errors:**
- Verify your API key is correct (starts with `secret_`)
- Ensure the database ID is correct (32 characters, no dashes)
- Check that the database is shared with your integration
- Verify the database has "Name" (title) and "Date" (date) properties

**Chat not appearing in Notion:**
- Check the browser console for errors
- Verify the Notion database permissions
- Ensure the date format is correct (YYYY-MM-DD)
- Check that the chat content is not empty

## Production Deployment Notes

⚠️ **Important Security Considerations:**

### Backend
- Disable Flask debug mode (`debug=False`)
- Use a production WSGI server (Gunicorn, uWSGI)
- Store API keys in environment variables or secrets manager
- Implement proper authentication and authorization
- Use HTTPS for all connections
- Add rate limiting to prevent abuse
- Implement proper logging and monitoring

### Frontend
- Replace URL shortener with direct image URL or local image
- Build for production (`npm run build`)
- Serve static files through a web server (nginx, Apache)
- Configure proper CORS policies
- Add input validation and sanitization

### Database
- Replace in-memory storage with a proper database
- Encrypt sensitive data at rest
- Implement backup strategies
- Use connection pooling

## Internationalization

The application supports multiple languages with automatic browser language detection:

- 🇫🇷 **French** (default)
- 🇬🇧 **English**
- 🇩🇪 **German** (Deutsch)
- 🇮🇹 **Italian** (Italiano)

You can change the language using the language selector in the top-right corner of the interface. Your language preference is saved in localStorage.

### Adding a New Language

See [frontend/src/i18n/README.md](frontend/src/i18n/README.md) for detailed instructions on adding support for additional languages.

## Future Enhancements

Planned features for future releases:

- 📄 **Multi-format Support**: JSON, XML, CSV, PDF file parsing
- 📎 **File Upload**: Drag and drop file support
- 🔄 **Auto-detection**: Automatic format detection and parsing
- 📊 **Advanced Parsing**: Intelligent content extraction from various formats
- 🎯 **Custom Mapping**: Configurable field mapping for structured data
- 🌍 **More Languages**: Spanish and other languages based on community demand

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Resources

- [Notion API Documentation](https://developers.notion.com/) - Official Notion API reference
- [Notion Integrations](https://www.notion.so/my-integrations) - Create and manage Notion integrations

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
