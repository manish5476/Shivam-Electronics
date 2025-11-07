
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Optional: For security
      nodeIntegration: false, // Important for security
      contextIsolation: true, // Important for security
    }
  });
  // const indexPath = path.join(__dirname, 'dist/shivam-electronics/browser/', 'browser', 'index.html');
  // Load the Angular app (dist folder)
  mainWindow.loadFile(path.join(__dirname, 'dist/shivam-electronics/browser/index.html')); // Adjust path

  // Optional: Open DevTools
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});