# Chat to Notion - Desktop Application

This directory contains the Electron desktop application for Chat to Notion.

## Overview

The desktop application provides a native desktop experience with the following features:

- **Standalone Application**: No need to manually start backend server or run in browser
- **Native Integration**: Better OS integration and user experience
- **Automatic Backend Management**: Flask backend starts automatically with the app
- **Persistent Data**: Database stored in user data directory for persistence across updates
- **Cross-Platform**: Works on Windows, macOS, and Linux

## Architecture

The desktop application consists of three main components:

1. **Electron Main Process** (`electron/main.js`): Manages application lifecycle and backend process
2. **Flask Backend**: Python backend that runs as a child process
3. **React Frontend**: UI rendered in Electron's renderer process

### Database Location

In desktop mode, the SQLite database is stored in the Electron user data directory:

- **Windows**: `%APPDATA%\chat-to-notion\notion_config.db`
- **macOS**: `~/Library/Application Support/chat-to-notion/notion_config.db`
- **Linux**: `~/.config/chat-to-notion/notion_config.db`

## Development

### Prerequisites

- Node.js 16+ and npm
- Python 3.8+
- All backend dependencies installed (`pip install -r backend/requirements.txt`)

### Running in Development Mode

1. **Install dependencies**:
   ```bash
   npm install
   cd frontend && npm install
   ```

2. **Start the development environment**:
   ```bash
   npm run electron:dev
   ```

   This will:
   - Start the Flask backend on port 5000
   - Start the React dev server on port 3000
   - Launch Electron in development mode with DevTools

### Development Scripts

- `npm run electron:dev` - Run the app in development mode
- `npm run backend:dev` - Run only the backend server
- `npm run frontend:dev` - Run only the frontend dev server
- `npm run frontend:build` - Build the frontend for production

## Building for Production

### Prerequisites for Building

Install PyInstaller for bundling the Python backend:

```bash
pip install pyinstaller
```

### Build the Backend

The backend must be built into a standalone executable before building the Electron app.

**On Linux/macOS**:
```bash
./build-backend.sh
```

**On Windows**:
```bash
build-backend.bat
```

This creates a `backend-dist` directory with the bundled backend executable.

### Build the Desktop Application

**Build for all platforms**:
```bash
npm run electron:build
```

**Build for specific platforms**:
```bash
npm run electron:build:win    # Windows
npm run electron:build:mac    # macOS
npm run electron:build:linux  # Linux
```

### Build Output

Built applications are placed in the `dist` directory:

- **Windows**: `dist/Chat to Notion Setup <version>.exe`
- **macOS**: `dist/Chat to Notion-<version>.dmg`
- **Linux**: `dist/chat-to-notion-<version>.AppImage` and `dist/chat-to-notion_<version>_amd64.deb`

## Distribution

### Automated Builds with GitHub Actions

The repository includes GitHub Actions workflows for automated building:

#### Build Workflow (`build-desktop.yml`)

Automatically builds the desktop app for all platforms on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Manual trigger via workflow_dispatch

Artifacts are uploaded for 30 days.

#### Release Workflow (`release-desktop.yml`)

Automatically creates releases when you push a version tag:

```bash
git tag v1.0.0
git push origin v1.0.0
```

This will:
1. Build the app for all platforms
2. Create a GitHub release
3. Attach all built installers to the release

### Manual Distribution

After building, you can manually distribute the installers:

1. **Windows**: Distribute the `.exe` installer
2. **macOS**: Distribute the `.dmg` disk image
3. **Linux**: Distribute the `.AppImage` (universal) or `.deb` (Debian/Ubuntu)

## Configuration

### electron-builder Configuration

The `package.json` contains the electron-builder configuration:

```json
{
  "build": {
    "appId": "com.veakey.chattonotion",
    "productName": "Chat to Notion",
    "files": [...],
    "extraResources": [...],
    "win": {...},
    "mac": {...},
    "linux": {...}
  }
}
```

### PyInstaller Configuration

The `backend.spec` file configures how the Python backend is bundled:

- Includes all necessary Python modules
- Creates a single executable
- Hides console window (can be changed for debugging)

## Troubleshooting

### Backend Won't Start

**Symptom**: Application opens but shows connection errors

**Solutions**:
1. Check that the backend executable was built correctly in `backend-dist/`
2. Look at Electron console logs for backend errors
3. In development, check that Python is installed and accessible
4. Verify port 5000 is not in use

### Build Fails

**PyInstaller Build Fails**:
- Ensure all backend dependencies are installed
- Check that PyInstaller is installed: `pip install pyinstaller`
- Try cleaning and rebuilding: `pyinstaller backend.spec --clean`

**Electron Build Fails**:
- Ensure frontend is built first: `cd frontend && npm run build`
- Check that `backend-dist/` exists with the backend executable
- Verify Node.js dependencies are installed: `npm install`

### Database Issues

**Database Not Persisting**:
- Check that `DB_PATH` environment variable is set correctly
- Verify user data directory permissions
- Check Electron logs for database errors

**Can't Find Database**:
- The database is in Electron's user data directory (see locations above)
- In development, it falls back to `backend/notion_config.db`

## Security Considerations

- **Context Isolation**: Enabled to prevent renderer from accessing Node.js
- **Preload Scripts**: Used for controlled IPC communication
- **No Remote Module**: Remote module is disabled for security
- **Backend Process**: Runs as a child process with controlled lifecycle

## Platform-Specific Notes

### Windows

- Uses NSIS installer
- Allows custom installation directory
- Creates desktop and start menu shortcuts
- Requires Administrator privileges for installation

### macOS

- Uses DMG disk image
- Supports both Intel (x64) and Apple Silicon (arm64)
- Not code-signed by default (requires Apple Developer account)
- Users may need to allow the app in Security & Privacy settings

### Linux

- Provides AppImage (universal, no installation needed)
- Provides DEB package (for Debian/Ubuntu-based systems)
- AppImage may require execution permissions: `chmod +x *.AppImage`

## Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [electron-builder Documentation](https://www.electron.build/)
- [PyInstaller Documentation](https://pyinstaller.org/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## License

Same as the main project - see [LICENSE](../LICENSE) file for details.
