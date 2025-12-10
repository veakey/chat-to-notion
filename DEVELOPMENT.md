# Development Guide for Desktop Application

This guide covers development workflows for the Chat to Notion desktop application.

## Development Setup

### Initial Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/veakey/chat-to-notion.git
   cd chat-to-notion
   ```

2. **Install root dependencies**:
   ```bash
   npm install
   ```

3. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Install backend dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   cd ..
   ```

## Running in Development Mode

### Option 1: Integrated Development Mode (Recommended)

Run everything together with one command:

```bash
npm run electron:dev
```

This will:
- Start the Flask backend on port 5000
- Start the React dev server on port 3000
- Wait for both to be ready
- Launch Electron with hot-reload support

### Option 2: Separate Processes

For more control or debugging, run each component separately:

**Terminal 1 - Backend**:
```bash
npm run backend:dev
# or
cd backend && python app.py
```

**Terminal 2 - Frontend**:
```bash
npm run frontend:dev
# or
cd frontend && npm start
```

**Terminal 3 - Electron**:
```bash
electron .
```

## Development Features

### Hot Reload

In development mode:
- Frontend has hot reload via React dev server
- Backend changes require manual restart
- Electron main process changes require app restart
- Electron opens with DevTools for debugging

### Database Location

In development mode, the database is created in:
- `backend/notion_config.db` (fallback location)

Or if DB_PATH is set, it uses the Electron user data directory.

### Environment Variables

The app respects these environment variables:

- `DB_PATH` - Custom database location
- `REACT_APP_API_URL` - Custom API URL (defaults to http://localhost:5000)
- `FLASK_ENV` - Flask environment (development/production)

## Building for Production

### Complete Build Process

1. **Build the backend**:
   ```bash
   # Linux/macOS
   ./build-backend.sh
   
   # Windows
   build-backend.bat
   ```

2. **Build the desktop app**:
   ```bash
   # All platforms (if on that OS)
   npm run electron:build
   
   # Specific platforms
   npm run electron:build:win    # Windows only
   npm run electron:build:mac    # macOS only
   npm run electron:build:linux  # Linux only
   ```

### Platform-Specific Build Requirements

**Windows**:
- Must build on Windows
- Requires Python 3.8+
- Requires Node.js 16+

**macOS**:
- Must build on macOS
- Requires Python 3.8+
- Requires Node.js 16+
- For distribution: Apple Developer account for code signing

**Linux**:
- Can build on Linux
- Requires Python 3.8+
- Requires Node.js 16+
- May need additional packages: `libgtk-3-0`, `libnotify4`, etc.

## Project Structure

```
chat-to-notion/
├── electron/                 # Electron main process
│   ├── main.js              # Main process entry point
│   └── preload.js           # Preload script for IPC
├── frontend/                 # React frontend
│   ├── src/                 # Source code
│   ├── public/              # Static assets
│   └── package.json         # Frontend dependencies
├── backend/                  # Flask backend
│   ├── app.py               # Backend entry point
│   ├── db.py                # Database configuration
│   └── requirements.txt     # Python dependencies
├── .github/workflows/        # CI/CD workflows
│   ├── build-desktop.yml    # Build workflow
│   └── release-desktop.yml  # Release workflow
├── package.json             # Root package.json for Electron
├── backend.spec             # PyInstaller configuration
└── build-backend.sh         # Backend build script
```

## Debugging

### Debugging Electron Main Process

In `electron/main.js`, add console.log statements. They will appear in the terminal where you ran `electron .`.

### Debugging Renderer Process

In development mode, Electron opens with DevTools. Use it like Chrome DevTools:
- Console for logs
- Network tab for API calls
- React DevTools (install extension)

### Debugging Backend

Backend logs appear in:
- Terminal when running `npm run backend:dev`
- Electron console when running in integrated mode

Common issues:
- Check port 5000 is not in use: `lsof -i :5000` (Unix) or `netstat -ano | findstr :5000` (Windows)
- Verify Python dependencies: `pip list`
- Check database path and permissions

## Testing

### Backend Tests

```bash
cd backend
pytest
```

### Frontend Tests

```bash
cd frontend
npm test
```

## Code Quality

### Linting

**Frontend**:
```bash
cd frontend
npm run lint
```

**Backend**:
```bash
cd backend
flake8 .
# or
pylint *.py
```

## Common Development Tasks

### Update Dependencies

**Frontend**:
```bash
cd frontend
npm update
```

**Backend**:
```bash
cd backend
pip install -r requirements.txt --upgrade
```

### Clean Build Artifacts

```bash
# Clean Electron build
rm -rf dist/ backend-dist/

# Clean frontend build
rm -rf frontend/build/

# Clean Python cache
find . -type d -name "__pycache__" -exec rm -rf {} +
find . -type f -name "*.pyc" -delete
```

### Reset Database

In development:
```bash
rm backend/notion_config.db
```

In production (Electron user data directory):
- **Windows**: Delete `%APPDATA%\chat-to-notion\notion_config.db`
- **macOS**: Delete `~/Library/Application Support/chat-to-notion/notion_config.db`
- **Linux**: Delete `~/.config/chat-to-notion/notion_config.db`

## Troubleshooting

### Backend Won't Start

1. Check Python is installed: `python --version` or `python3 --version`
2. Check dependencies: `pip list | grep -E "(Flask|notion-client)"`
3. Check port 5000: `lsof -i :5000` or `netstat -ano | findstr :5000`
4. Try running backend directly: `cd backend && python app.py`

### Frontend Won't Start

1. Check Node.js: `node --version` (should be 16+)
2. Check dependencies: `cd frontend && npm list`
3. Try cleaning: `cd frontend && rm -rf node_modules package-lock.json && npm install`

### Electron Won't Start

1. Check electron is installed: `npm list electron`
2. Try reinstalling: `rm -rf node_modules && npm install`
3. Check both backend and frontend are running (in dev mode)

### Build Fails

**Backend build fails**:
1. Ensure PyInstaller is installed: `pip install pyinstaller`
2. Check all backend dependencies are installed
3. Try: `pyinstaller backend.spec --clean`

**Electron build fails**:
1. Ensure frontend is built: `ls frontend/build/`
2. Ensure backend is built: `ls backend-dist/`
3. Check electron-builder logs in `dist/` directory

## Contributing

When contributing to the desktop app:

1. Test in development mode first
2. Build and test the production app
3. Ensure all platforms are considered (don't break other platforms)
4. Update documentation if needed
5. Test CI/CD workflows if modifying build process

## Resources

- [Electron DevTools](https://www.electronjs.org/docs/latest/tutorial/devtools-extension)
- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [PyInstaller Manual](https://pyinstaller.readthedocs.io/)
