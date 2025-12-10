# Building Chat to Notion Desktop Application

This guide provides step-by-step instructions for building the Chat to Notion desktop application for Windows, macOS, and Linux.

## Prerequisites

### All Platforms

- **Node.js 18+** and npm
- **Python 3.8+**
- **Git**

### Platform-Specific Requirements

**Windows**:
- Visual Studio Build Tools (for native modules)
- Python should be added to PATH

**macOS**:
- Xcode Command Line Tools: `xcode-select --install`
- For distribution: Apple Developer account (optional, for code signing)

**Linux (Ubuntu/Debian)**:
```bash
sudo apt-get install -y libgtk-3-0 libnotify4 libnss3 libxss1 libasound2
```

**Linux (Fedora/RHEL)**:
```bash
sudo dnf install -y gtk3 libnotify nss libXScrnSaver alsa-lib
```

## Quick Build Guide

### 1. Clone and Setup

```bash
git clone https://github.com/veakey/chat-to-notion.git
cd chat-to-notion
npm install
```

### 2. Build Backend

The Python backend must be compiled into a standalone executable using PyInstaller.

**Install PyInstaller**:
```bash
pip install pyinstaller
```

**Build the backend**:

On **Linux/macOS**:
```bash
./build-backend.sh
```

On **Windows**:
```bash
build-backend.bat
```

This creates `backend-dist/` with the bundled backend executable.

### 3. Build Desktop Application

**For your current platform**:
```bash
npm run electron:build
```

**For specific platforms**:
```bash
npm run electron:build:win      # Windows (must run on Windows)
npm run electron:build:mac      # macOS (must run on macOS)
npm run electron:build:linux    # Linux (must run on Linux)
```

### 4. Find Your Build

Built applications are in the `dist/` directory:

- **Windows**: `Chat to Notion Setup <version>.exe`
- **macOS**: `Chat to Notion-<version>.dmg`
- **Linux**: `chat-to-notion-<version>.AppImage` and `chat-to-notion_<version>_amd64.deb`

## Detailed Build Process

### Frontend Build

The frontend is automatically built when running `npm run electron:build`, but you can build it separately:

```bash
cd frontend
npm install
npm run build
```

This creates `frontend/build/` with the production React app.

### Backend Build

The backend is compiled using PyInstaller:

```bash
# Install dependencies
cd backend
pip install -r requirements.txt
pip install pyinstaller

# Build
cd ..
./build-backend.sh  # or build-backend.bat on Windows
```

**PyInstaller Configuration** (`backend.spec`):
- Creates a single-file executable
- Includes all Python dependencies
- Console window is hidden for cleaner user experience
- For debugging, use `backend-debug.spec` which shows console output

### Electron Build

electron-builder packages everything together:

```bash
npm run electron:build
```

**What it does**:
1. Builds the React frontend (if not already built)
2. Packages the Electron app
3. Includes the backend executable from `backend-dist/`
4. Creates platform-specific installers

**electron-builder Configuration** (in `package.json`):
- AppId: `com.veakey.chattonotion`
- Includes: Electron files, frontend build, backend executable
- Platform-specific targets and icons

## Platform-Specific Guides

### Windows Build

**System Requirements**:
- Windows 10 or later
- Visual Studio Build Tools or Visual Studio

**Build Steps**:
```bash
# 1. Install dependencies
npm install
pip install pyinstaller

# 2. Build backend
build-backend.bat

# 3. Build Electron app
npm run electron:build:win
```

**Output**:
- `dist/Chat to Notion Setup <version>.exe` - NSIS installer
- Allows custom installation directory
- Creates desktop and start menu shortcuts

**Testing**:
```bash
# Run the installer
./dist/"Chat to Notion Setup 1.0.0.exe"
```

### macOS Build

**System Requirements**:
- macOS 10.13 or later
- Xcode Command Line Tools

**Build Steps**:
```bash
# 1. Install dependencies
npm install
pip3 install pyinstaller

# 2. Build backend
./build-backend.sh

# 3. Build Electron app
npm run electron:build:mac
```

**Output**:
- `dist/Chat to Notion-<version>.dmg` - Disk image
- `dist/Chat to Notion-<version>-arm64.dmg` - For Apple Silicon
- `dist/Chat to Notion-<version>-x64.dmg` - For Intel Macs

**Code Signing** (Optional):
```bash
# For distribution outside Mac App Store
export CSC_LINK=path/to/certificate.p12
export CSC_KEY_PASSWORD=your_password
npm run electron:build:mac
```

**Testing**:
```bash
# Open the DMG and drag to Applications
open dist/"Chat to Notion-1.0.0.dmg"
```

### Linux Build

**System Requirements**:
- Ubuntu 18.04+ / Debian 10+ or equivalent
- Required libraries (see Prerequisites)

**Build Steps**:
```bash
# 1. Install dependencies
npm install
pip3 install pyinstaller

# 2. Build backend
./build-backend.sh

# 3. Build Electron app
npm run electron:build:linux
```

**Output**:
- `dist/chat-to-notion-<version>.AppImage` - Universal, no installation needed
- `dist/chat-to-notion_<version>_amd64.deb` - For Debian/Ubuntu

**Testing AppImage**:
```bash
chmod +x dist/chat-to-notion-*.AppImage
./dist/chat-to-notion-*.AppImage
```

**Testing DEB**:
```bash
sudo dpkg -i dist/chat-to-notion_*.deb
chat-to-notion
```

## Cross-Platform Considerations

### Can't Cross-Compile

You **cannot** build for other platforms:
- Must build Windows app on Windows
- Must build macOS app on macOS
- Must build Linux app on Linux

Use CI/CD (GitHub Actions) for multi-platform builds.

### Icon Files

The app uses `logo.png` for all platforms. For best results:
- Windows: Provide `logo.ico` (256x256)
- macOS: Provide `logo.icns` (512x512)
- Linux: `logo.png` is sufficient (512x512)

## Troubleshooting

### Backend Build Fails

**"PyInstaller not found"**:
```bash
pip install pyinstaller
# or
pip3 install pyinstaller
```

**"Module not found" errors**:
```bash
cd backend
pip install -r requirements.txt
```

**"Permission denied" (Linux/macOS)**:
```bash
chmod +x build-backend.sh
```

**Debug backend build issues**:
```bash
# Use debug spec to see console output
pyinstaller backend-debug.spec --distpath backend-dist --clean
# Then test the backend directly
./backend-dist/backend  # Linux/macOS
backend-dist\backend.exe  # Windows
```

### Electron Build Fails

**"Backend not found"**:
```bash
# Ensure backend-dist/ exists
ls backend-dist/
# If not, build it first
./build-backend.sh
```

**"Frontend not built"**:
```bash
cd frontend
npm run build
cd ..
```

**"electron-builder failed"**:
```bash
# Clear cache and rebuild
rm -rf dist/ node_modules/
npm install
npm run electron:build
```

### Application Won't Start

**Backend port 5000 in use**:
- Close other applications using port 5000
- Or modify `BACKEND_PORT` in `electron/main.js`

**Database permission errors**:
- Ensure user data directory is writable
- Check Electron logs for specific path

**"Backend failed to start"**:
- Run backend manually to debug: `./backend-dist/backend`
- Check Python dependencies are included in PyInstaller build

## Clean Build

To start fresh:

```bash
# Clean all build artifacts
rm -rf dist/ backend-dist/ build/ frontend/build/ node_modules/ frontend/node_modules/

# Reinstall and rebuild
npm install
cd frontend && npm install && cd ..
./build-backend.sh
npm run electron:build
```

## Build Size Optimization

Current approximate sizes:
- **Windows**: ~60-80 MB
- **macOS**: ~70-90 MB
- **Linux AppImage**: ~70-90 MB

**To reduce size**:

1. **Frontend**: Already optimized with production build
2. **Backend**: PyInstaller includes Python runtime (~30-40 MB base)
3. **Electron**: Electron runtime (~50-60 MB base)

**Optimization options**:
- Use UPX compression (already enabled in PyInstaller)
- Exclude unused Python modules in `backend.spec`
- Consider Electron alternatives for smaller footprint (not recommended)

## Automated Builds with GitHub Actions

The repository includes workflows for automated builds:

### Build Workflow

Triggers on:
- Push to `main` or `develop`
- Pull requests
- Manual trigger

Builds for all platforms and uploads artifacts.

### Release Workflow

Triggers on:
- Version tags (e.g., `v1.0.0`)

Creates a GitHub release with all installers attached.

**Creating a release**:
```bash
git tag v1.0.0
git push origin v1.0.0
```

See `.github/workflows/` for workflow details.

## Distribution

### Windows

- Distribute the `.exe` installer
- Users run the installer
- Installs to Program Files by default
- Creates shortcuts automatically

### macOS

- Distribute the `.dmg` disk image
- Users open and drag to Applications
- First run may require right-click > Open (if not signed)

### Linux

**AppImage** (recommended):
- Universal, works on most distributions
- No installation needed
- User must make executable: `chmod +x`

**DEB Package**:
- For Debian/Ubuntu-based systems
- Install with: `sudo dpkg -i <package>.deb`

## Signing and Notarization

### Windows Code Signing

Requires a code signing certificate:
```bash
export CSC_LINK=path/to/certificate.pfx
export CSC_KEY_PASSWORD=your_password
npm run electron:build:win
```

### macOS Signing and Notarization

Requires Apple Developer account:
```bash
export CSC_LINK=path/to/certificate.p12
export CSC_KEY_PASSWORD=your_password
export APPLE_ID=your@email.com
export APPLE_ID_PASSWORD=app-specific-password
npm run electron:build:mac
```

### Linux

No signing required, but you can sign DEB packages with `dpkg-sig`.

## Resources

- [Electron Builder Documentation](https://www.electron.build/)
- [PyInstaller Documentation](https://pyinstaller.readthedocs.io/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## Support

For build issues:
1. Check this guide
2. Review [DEVELOPMENT.md](DEVELOPMENT.md) for development setup
3. Check GitHub Issues
4. Check electron-builder and PyInstaller documentation

## License

Same as main project - see [LICENSE](LICENSE) for details.
