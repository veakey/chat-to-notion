# Electron Main Process

This directory contains the Electron main process files for the Chat to Notion desktop application.

## Files

### main.js
The main process entry point that:
- Manages application lifecycle
- Creates browser windows
- Starts and stops the Flask backend as a child process
- Handles IPC communication with the renderer process
- Manages database path configuration

### preload.js
Preload script that:
- Runs before the renderer process loads
- Exposes safe APIs to the renderer process via `contextBridge`
- Implements the security boundary between main and renderer processes

## Key Features

### Backend Process Management
- **Development Mode**: Spawns Python directly from source code
- **Production Mode**: Spawns compiled backend executable from resources
- **Health Checks**: Waits for backend to be ready before showing the window
- **Lifecycle**: Automatically starts with app and stops when app closes

### Security
- **Context Isolation**: Enabled to prevent renderer from accessing Node.js
- **Preload Scripts**: Used for controlled IPC communication
- **No Remote Module**: Disabled for security
- **Sandboxed Renderer**: Renderer process cannot access Node.js directly

### Database Configuration
- Uses Electron's `app.getPath('userData')` for database location
- Passes `DB_PATH` environment variable to backend
- Ensures database persists across app updates

## Environment Detection

The app detects the environment using `electron-is-dev`:

- **Development** (`isDev = true`):
  - Backend runs from source: `backend/app.py`
  - Frontend loads from dev server: `http://localhost:3000`
  - DevTools open automatically

- **Production** (`isDev = false`):
  - Backend runs from bundled executable: `resources/backend/backend`
  - Frontend loads from build: `frontend/build/index.html`
  - No DevTools

## IPC Communication

Current IPC handlers:
- `get-user-data-path`: Returns Electron user data directory path

Add new handlers in `main.js` as needed.

## Debugging

### Main Process
- Logs appear in the terminal where you ran `electron .`
- Use `console.log()` for debugging
- Electron DevTools Extension can help

### Backend Process
- Backend stdout/stderr are piped to main process console
- Check backend logs in terminal output

### Common Issues

**Backend won't start**:
- Check that Python is installed (dev mode)
- Check that backend executable exists in `resources/backend/` (production)
- Verify port 5000 is not in use

**Window won't load**:
- In dev: Ensure React dev server is running on port 3000
- In prod: Ensure frontend build exists in `frontend/build/`

## Modification Guide

### Change Backend Port
Edit `BACKEND_PORT` constant in `main.js` (line 8)

### Add IPC Handlers
Add new handlers with `ipcMain.handle()` in `main.js`

Expose them in `preload.js` via `contextBridge.exposeInMainWorld()`

### Modify Window Settings
Edit the `BrowserWindow` configuration in `createWindow()` function

### Change Backend Startup
Modify the `startBackend()` function for custom backend launch logic

## Resources

- [Electron Documentation](https://www.electronjs.org/docs/latest/)
- [Context Isolation](https://www.electronjs.org/docs/latest/tutorial/context-isolation)
- [IPC Communication](https://www.electronjs.org/docs/latest/tutorial/ipc)
- [Preload Scripts](https://www.electronjs.org/docs/latest/tutorial/tutorial-preload)
