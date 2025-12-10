# Release Notes Template

## Chat to Notion v1.0.0 - Desktop Application

### 🎉 Major Features

#### Desktop Application Support
- **Native Desktop App**: Chat to Notion is now available as a standalone desktop application for Windows, macOS, and Linux
- **No Manual Setup**: Backend server starts automatically - no need to open terminal or run commands
- **Persistent Data**: Configuration and data are stored in the system's user data directory
- **Cross-Platform**: Works on Windows 10+, macOS 10.13+, and modern Linux distributions

### 📦 Downloads

Choose your platform:

#### Windows
- **[Chat to Notion Setup.exe](link)** - Windows 10/11 (x64)
  - Size: ~70 MB
  - Installer with desktop and start menu shortcuts
  
#### macOS
- **[Chat to Notion.dmg](link)** - macOS 10.13+ (Universal)
  - Size: ~80 MB
  - Supports both Intel and Apple Silicon Macs
  
#### Linux
- **[chat-to-notion.AppImage](link)** - Universal Linux (x64)
  - Size: ~75 MB
  - No installation required, just make executable and run
- **[chat-to-notion.deb](link)** - Debian/Ubuntu (x64)
  - Size: ~75 MB
  - For Debian and Ubuntu-based distributions

### 🚀 What's New

#### Desktop Application
- Electron-based desktop application with native look and feel
- Automatic backend server management
- Persistent configuration across app updates
- System tray integration (future enhancement)
- Auto-update support (future enhancement)

#### Backend Improvements
- **Configurable Database Path**: Database now uses system user data directory
- **Environment Variable Support**: `DB_PATH` can be set to custom location
- **Backward Compatible**: Web application mode still works as before

#### Build System
- **Automated Builds**: GitHub Actions workflows for all platforms
- **PyInstaller Integration**: Python backend compiled into standalone executable
- **electron-builder Configuration**: Optimized for cross-platform distribution
- **Release Automation**: Automatic release creation on version tags

### 📖 Documentation

Comprehensive documentation added:
- **[ELECTRON.md](ELECTRON.md)** - Desktop application guide and architecture
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Development workflow and debugging
- **[BUILD.md](BUILD.md)** - Building for all platforms
- Updated **[README.md](README.md)** with desktop app information

### 🔧 Technical Details

#### Architecture
- **Main Process**: Electron (Node.js 18)
- **Backend**: Flask (Python 3.8+) compiled with PyInstaller
- **Frontend**: React 18 with Create React App
- **Database**: SQLite with configurable path

#### Security
- Context isolation enabled
- No remote module
- Sandboxed renderer process
- Controlled IPC communication

#### Database Location
- **Windows**: `%APPDATA%\chat-to-notion\notion_config.db`
- **macOS**: `~/Library/Application Support/chat-to-notion/notion_config.db`
- **Linux**: `~/.config/chat-to-notion/notion_config.db`

### 🐛 Bug Fixes

- Fixed ESLint error in ConfigForm.js for Trans component
- Corrected database path configuration for cross-platform support

### ⚠️ Breaking Changes

None - Web application mode continues to work as before

### 🔄 Migration Guide

#### From Web Application to Desktop

1. **Install Desktop App**: Download and install for your platform
2. **First Launch**: The app will create a new database
3. **Reconfigure**: Enter your Notion API key and database ID
4. **Optional**: Keep web application for development or alternative access

#### Database Migration (Optional)

To migrate your existing configuration:

1. **Locate Old Database**: `backend/notion_config.db`
2. **Find New Location**: See "Database Location" above
3. **Copy File**: Copy old database to new location
4. **Restart App**: Configuration should be preserved

### 📋 System Requirements

#### Windows
- Windows 10 or later (64-bit)
- 200 MB free disk space
- Internet connection for Notion API

#### macOS
- macOS 10.13 (High Sierra) or later
- 200 MB free disk space
- Internet connection for Notion API

#### Linux
- 64-bit Linux distribution (Ubuntu 18.04+, Debian 10+, or equivalent)
- GLIBC 2.28 or later
- 200 MB free disk space
- Internet connection for Notion API

### 🙏 Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- Packaged with [electron-builder](https://www.electron.build/)
- Backend compiled with [PyInstaller](https://pyinstaller.org/)

### 📝 Known Issues

#### macOS
- First launch may show "unidentified developer" warning
  - Solution: Right-click app > Open > Confirm

#### Linux AppImage
- May need to make executable: `chmod +x chat-to-notion-*.AppImage`
- May need to install FUSE: `sudo apt install libfuse2`

#### All Platforms
- Port 5000 must be available for backend server
- Antivirus software may flag the executable (false positive)

### 🔮 Future Enhancements

- [ ] System tray integration
- [ ] Auto-update support
- [ ] Keyboard shortcuts
- [ ] Multi-language support expansion
- [ ] Dark/Light theme toggle
- [ ] Offline queue for Notion submissions
- [ ] Batch import from CSV/JSON
- [ ] Chat history management

### 🐛 Reporting Issues

Found a bug? Please report it:
1. Check [existing issues](https://github.com/veakey/chat-to-notion/issues)
2. Create a new issue with:
   - Platform and version
   - Steps to reproduce
   - Expected vs actual behavior
   - Logs (if available)

### 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### 📄 License

MIT License - see [LICENSE](LICENSE) for details

---

**Full Changelog**: [v0.9.0...v1.0.0](https://github.com/veakey/chat-to-notion/compare/v0.9.0...v1.0.0)
