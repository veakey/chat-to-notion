# Chat to Notion

A fullstack web application that allows users to paste chat conversations (from ChatGPT or other sources) and automatically send them to Notion with organized dates.

## Features

- 🔑 **Notion API Configuration**: Easy setup of Notion API credentials
- 💬 **Chat Submission**: Paste chat conversations with dates
- 🎨 **GlassUI Design**: Beautiful glassmorphism interface
- 🖼️ **Stunning Background**: Eye-catching background image
- 📊 **Notion Integration**: Automatically creates pages in your Notion database
- 🔍 **Smart Parsing**: Extracts titles and content from chat conversations

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

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Run the Flask server:
```bash
python app.py
```

The backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on http://localhost:3000

## Usage

1. **Configure Notion**:
   - Go to the Configuration tab
   - Create a Notion integration at https://www.notion.so/my-integrations
   - Copy your API key
   - Create a database in Notion with "Name" (title) and "Date" (date) properties
   - Share the database with your integration
   - Enter your API key and database ID

2. **Send Chats**:
   - Go to the Send Chat tab
   - Select a date for organization
   - Paste your chat conversation
   - Click "Send to Notion"
   - Your chat will be created as a new page in your Notion database

## Project Structure

```
chat-to-notion/
├── backend/
│   ├── app.py              # Flask application
│   ├── requirements.txt    # Python dependencies
│   └── README.md
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ConfigPage.js    # Notion configuration
│   │   │   └── ChatPage.js      # Chat submission
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── README.md
└── README.md
```

## API Endpoints

### Backend API

- `GET /api/health` - Health check
- `POST /api/config` - Save Notion configuration
- `GET /api/config` - Get configuration status
- `POST /api/chat` - Send chat to Notion

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

## License

See LICENSE file for details.
