const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');

let mainWindow;

app.setLoginItemSettings({
  openAtLogin: true,
  path: app.getPath('exe')
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 440,
    height: 620,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// IPC Handler untuk minimize to widget
ipcMain.on('minimize-to-widget', () => {
  if (mainWindow) {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    // Shrink window and move to bottom right
    mainWindow.setBounds({ width: 100, height: 100, x: width - 120, y: height - 120 });
    mainWindow.setAlwaysOnTop(true);
  }
});

// IPC Handler untuk restore dari widget
ipcMain.on('restore-from-widget', () => {
  if (mainWindow) {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    // Restore window size and position it roughly centered or slightly off-center
    mainWindow.setBounds({ width: 440, height: 620, x: Math.round(width / 2 - 220), y: Math.round(height / 2 - 310) });
    mainWindow.setAlwaysOnTop(false);
  }
});

// IPC Handler untuk close
ipcMain.on('close-app', () => {
  app.quit();
});
