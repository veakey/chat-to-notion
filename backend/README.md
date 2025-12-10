# Chat to Notion - Backend

Python Flask backend for the Chat to Notion application.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. (Optional) Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Run the server:
```bash
python app.py
```

The server will run on http://localhost:5000

## Architecture

```
backend/
├── app.py                    # Flask application entry point
├── db.py                     # Database configuration and utilities
├── routes/                   # API route handlers
│   ├── config_routes.py      # Notion configuration endpoints
│   └── chat_routes.py        # Chat submission endpoints
├── services/                 # Business logic services
│   └── notion_service.py     # Notion API integration
├── parsers/                  # Content parsing modules
│   ├── chat_parser.py        # Chat content parsing
│   ├── content_parser.py     # General content parsing
│   ├── chunk_splitter.py    # Content chunking for large texts
│   └── block_creators.py     # Notion block creation
├── utils/                    # Utility functions
│   └── property_formatter.py # Notion property formatting
└── tests/                    # Test suite
    ├── unit/                 # Unit tests
    └── functional/           # Functional/integration tests
```

## API Endpoints

### Health Check

#### `GET /api/health`
Health check endpoint to verify the server is running.

**Response:**
```json
{
  "status": "healthy"
}
```

### Configuration

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
  "message": "Configuration saved successfully",
  "titleProperty": "Name",
  "dateProperty": "Date"
}
```

**Error Response (400):**
```json
{
  "error": "Le code secret et l'ID de la base de données sont requis"
}
```

#### `GET /api/config`
Get current configuration status.

**Response (200):**
```json
{
  "configured": true,
  "databaseId": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "titleProperty": "Name",
  "dateProperty": "Date",
  "additionalProperties": {},
  "dynamicFields": []
}
```

#### `GET /api/config/properties`
Get all available properties from the Notion database.

**Response (200):**
```json
{
  "properties": [
    {
      "name": "Status",
      "type": "select",
      "id": "property_id"
    }
  ]
}
```

#### `POST /api/config/properties`
Save additional properties configuration.

**Request Body:**
```json
{
  "additionalProperties": {
    "Status": true,
    "Priority": true
  }
}
```

#### `POST /api/config/dynamic-fields`
Save dynamic fields configuration.

**Request Body:**
```json
{
  "dynamicFields": [
    {
      "name": "CustomField",
      "type": "rich_text"
    }
  ]
}
```

#### `POST /api/config/validate-properties`
Validate if properties exist in the Notion database.

**Request Body:**
```json
{
  "properties": [
    {
      "name": "Status",
      "type": "select"
    }
  ]
}
```

**Response (200):**
```json
{
  "validation": {
    "Status": {
      "exists": true,
      "type": "select",
      "matches": true
    }
  }
}
```

### Chat Submission

#### `POST /api/chat`
Send chat content to Notion.

**Request Body:**
```json
{
  "content": "User: What is React?\nAssistant: React is a JavaScript library...",
  "date": "2025-01-15",
  "additionalProperties": {
    "Status": "Done",
    "Priority": "High"
  }
}
```

**Success Response (200):**
```json
{
  "message": "Chat envoyé à Notion avec succès (15 blocs créés) - Date: 2025-01-15",
  "notionPageId": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "dateSent": true,
  "missingProperties": []
}
```

**Error Response (400):**
```json
{
  "error": "Le contenu du chat est requis"
}
```

**Error Response (400):**
```json
{
  "error": "Notion n'est pas configuré. Veuillez configurer les identifiants d'abord."
}
```

## Database

The application uses SQLite for storing configuration. The database file is `notion_config.db` in the backend directory.

### Schema

The configuration is stored with the following structure:
- `api_key`: Notion API key
- `database_id`: Notion database ID
- `title_property`: Name of the title property
- `date_property`: Name of the date property
- `additional_properties`: JSON object of selected additional properties
- `dynamic_fields`: JSON array of dynamic field configurations

## Error Handling

All error messages are returned in JSON format with appropriate HTTP status codes:
- `400`: Bad Request (validation errors, missing parameters)
- `500`: Internal Server Error (unexpected errors)

Error messages are currently in French but can be translated on the frontend using the i18n system.

## Testing

See [tests/README.md](tests/README.md) for detailed testing information.

Run tests:
```bash
pytest
```

With coverage:
```bash
pytest --cov=. --cov-report=html
```

## Production Deployment

⚠️ **Important Security Considerations:**

- Disable Flask debug mode (`debug=False`)
- Use a production WSGI server (Gunicorn, uWSGI)
- Store API keys in environment variables or secrets manager
- Implement proper authentication and authorization
- Use HTTPS for all connections
- Add rate limiting to prevent abuse
- Implement proper logging and monitoring
- Replace SQLite with a production database (PostgreSQL, MySQL)

## Dependencies

See `requirements.txt` for the complete list of Python dependencies.

Main dependencies:
- Flask: Web framework
- Flask-CORS: Cross-origin resource sharing
- notion-client: Notion API SDK
