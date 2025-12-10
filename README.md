# Chat to Notion

A fullstack application that allows users to paste chat conversations (from ChatGPT or other sources) and automatically send them to Notion with organized dates.

**Available as both a web application and a native desktop app!**

## Features

- 🔑 **Notion API Configuration**: Easy setup of Notion API credentials
- 💬 **Chat Submission**: Paste chat conversations with dates
- 🎨 **GlassUI Design**: Beautiful glassmorphism interface
- 🖼️ **Stunning Background**: Eye-catching background image
- 📊 **Notion Integration**: Automatically creates pages in your Notion database
- 🔍 **Smart Parsing**: Extracts titles and content from chat conversations
- 🌍 **Internationalization (i18n)**: Support for multiple languages (French, English, German, Italian)
- 🖥️ **Desktop App**: Native desktop application for Windows, macOS, and Linux

## Installation Options

### Option 1: Desktop Application (Recommended)

Download the native desktop app for your platform from the [Releases](https://github.com/veakey/chat-to-notion/releases) page:

- **Windows**: Download and run the `.exe` installer
- **macOS**: Download and open the `.dmg` file
- **Linux**: Download the `.AppImage` or `.deb` package

The desktop app provides a native experience with automatic backend management - no manual setup required!

For more information about the desktop app, see [ELECTRON.md](ELECTRON.md).

### Option 2: Web Application (Development)

Run the application in development mode with separate backend and frontend servers.

## Prerequisites (Web Application)

Before you begin, ensure you have the following installed:

- **Python 3.8+** (check with `python --version`)
- **Node.js 16+** and npm (check with `node --version` and `npm --version`)
- A **Notion account** with access to create integrations and databases

## Quick Start (Web Application)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd chat-to-notion
```

### 2. Start the Backend

Open a terminal and navigate to the backend directory:

```bash
cd backend
```

(Optional) Create and activate a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

Install dependencies and start the server:

```bash
pip install -r requirements.txt
python app.py
```

The backend will run on **http://localhost:5000**

### 3. Start the Frontend

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies and start the development server:

```bash
npm install
npm start
```

The frontend will run on **http://localhost:3000** and automatically open in your browser.

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
   - Select a date for organization (format: YYYY-MM-DD)
   - Paste your chat conversation
   - Click "Send to Notion"
   - Your chat will be created as a new page in your Notion database

## Internationalization

The application supports multiple languages with automatic browser language detection:

- 🇫🇷 **French** (default)
- 🇬🇧 **English**
- 🇩🇪 **German** (Deutsch)
- 🇮🇹 **Italian** (Italiano)

You can change the language using the language selector in the top-right corner of the interface. Your language preference is saved in localStorage.

## Project Structure

```
chat-to-notion/
├── backend/              # Python Flask backend
│   ├── app.py           # Flask application entry point
│   ├── routes/          # API route handlers
│   ├── services/        # Business logic services
│   ├── parsers/         # Content parsing modules
│   └── README.md        # Backend documentation
├── frontend/            # React frontend
│   ├── src/             # React source code
│   ├── public/          # Static assets
│   └── README.md        # Frontend documentation
└── README.md            # This file
```

## Documentation

For more detailed information, see:

- **[Backend Documentation](backend/README.md)** - API endpoints, architecture, and backend setup
- **[Frontend Documentation](frontend/README.md)** - Component structure, build process, and frontend setup
- **[i18n Guide](frontend/src/i18n/README.md)** - How to add new languages

## Troubleshooting

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

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Resources

- [Notion API Documentation](https://developers.notion.com/) - Official Notion API reference
- [Notion Integrations](https://www.notion.so/my-integrations) - Create and manage Notion integrations

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
