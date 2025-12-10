const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const isDev = require('electron-is-dev');

let mainWindow;
let backendProcess;
const BACKEND_PORT = 5000;
const BACKEND_STARTUP_MAX_RETRIES = 30;
const BACKEND_STARTUP_RETRY_INTERVAL = 1000; // ms

// Get the user data directory for the database
function getUserDataPath() {
  return app.getPath('userData');
}

// Start the Flask backend
function startBackend() {
  return new Promise((resolve, reject) => {
    const userDataPath = getUserDataPath();
    
    // Ensure the user data directory exists
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }

    let backendPath;
    let pythonExecutable;

    if (isDev) {
      // Development mode: use the Python source
      backendPath = path.join(__dirname, '..', 'backend');
      
      // Try to find Python executable - check common names
      const pythonCommands = process.platform === 'win32' 
        ? ['python', 'python3', 'py']
        : ['python3', 'python'];
      
      pythonExecutable = pythonCommands[0]; // Default to first option
      
      console.log('Starting backend in development mode...');
      console.log('Backend path:', backendPath);
      console.log('Python executable:', pythonExecutable);
      console.log('User data path:', userDataPath);
      
      backendProcess = spawn(pythonExecutable, ['app.py'], {
        cwd: backendPath,
        env: {
          ...process.env,
          FLASK_ENV: 'development',
          DB_PATH: path.join(userDataPath, 'notion_config.db')
        }
      });
    } else {
      // Production mode: use the bundled executable
      const backendExeName = process.platform === 'win32' ? 'backend.exe' : 'backend';
      backendPath = path.join(process.resourcesPath, 'backend', backendExeName);
      
      console.log('Starting backend in production mode...');
      console.log('Backend executable:', backendPath);
      console.log('User data path:', userDataPath);
      
      backendProcess = spawn(backendPath, [], {
        env: {
          ...process.env,
          DB_PATH: path.join(userDataPath, 'notion_config.db')
        }
      });
    }

    backendProcess.stdout.on('data', (data) => {
      console.log(`Backend: ${data}`);
    });

    backendProcess.stderr.on('data', (data) => {
      console.error(`Backend Error: ${data}`);
    });

    backendProcess.on('error', (error) => {
      console.error('Failed to start backend:', error);
      reject(error);
    });

    backendProcess.on('exit', (code) => {
      console.log(`Backend process exited with code ${code}`);
    });

    // Wait for backend to be ready
    const maxRetries = BACKEND_STARTUP_MAX_RETRIES;
    let retries = 0;
    
    const checkBackend = setInterval(() => {
      const http = require('http');
      const options = {
        hostname: 'localhost',
        port: BACKEND_PORT,
        path: '/api/health',
        method: 'GET',
        timeout: 1000
      };

      const req = http.request(options, (res) => {
        if (res.statusCode === 200) {
          console.log('Backend is ready!');
          clearInterval(checkBackend);
          resolve();
        }
      });

      req.on('error', () => {
        retries++;
        if (retries >= maxRetries) {
          clearInterval(checkBackend);
          reject(new Error('Backend failed to start within timeout'));
        }
      });

      req.end();
    }, BACKEND_STARTUP_RETRY_INTERVAL);
  });
}

// Stop the backend process
function stopBackend() {
  if (backendProcess) {
    console.log('Stopping backend...');
    backendProcess.kill();
    backendProcess = null;
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    },
    icon: path.join(__dirname, '..', 'logo.png')
  });

  // Load the app
  if (isDev) {
    // In development, load from the React dev server
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built React app
    mainWindow.loadFile(path.join(__dirname, '..', 'frontend', 'build', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Handle IPC requests for user data path
ipcMain.handle('get-user-data-path', () => {
  return getUserDataPath();
});

// App lifecycle
app.on('ready', async () => {
  try {
    await startBackend();
    createWindow();
  } catch (error) {
    console.error('Failed to start application:', error);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  stopBackend();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('before-quit', () => {
  stopBackend();
});

// Handle app quit
app.on('will-quit', () => {
  stopBackend();
});
