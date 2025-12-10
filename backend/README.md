# Chat to Notion - Backend

Python Flask backend for the Chat to Notion application.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the server:
```bash
python app.py
```

The server will run on http://localhost:5000

## API Endpoints

### GET /api/health
Health check endpoint

### POST /api/config
Save Notion API configuration
```json
{
  "apiKey": "your-notion-api-key",
  "databaseId": "your-database-id"
}
```

### GET /api/config
Get current configuration status

### POST /api/chat
Send chat content to Notion
```json
{
  "content": "Your chat content here",
  "date": "2025-12-10"
}
```
