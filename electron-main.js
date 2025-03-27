// // // const { app, BrowserWindow } = require('electron');
// // // const path = require('path');

// // // app.whenReady().then(() => {
// // //   let mainWindow = new BrowserWindow({
// // //     width: 1200,
// // //     height: 800,
// // //     webPreferences: {
// // //       nodeIntegration: true,
// // //       contextIsolation: false
// // //     }
// // //   });

// // //   // Ensure the correct path
// // //   const indexPath = `file://${path.resolve(__dirname, 'dist', 'shivam-electronics', 'index.html')}`;
  

// // //   mainWindow.loadURL(indexPath);
// // // });

// // const { app, BrowserWindow } = require('electron');
// // const path = require('path');

// // app.whenReady().then(() => {
// //   let mainWindow = new BrowserWindow({
// //     width: 1200,
// //     height: 800,
// //     webPreferences: {
// //       nodeIntegration: true,
// //       contextIsolation: false
// //     }
// //   });

// //   const indexPath = `file://${path.resolve(__dirname, 'dist', 'shivam-electronics', 'index.html')}`;
  

// //   mainWindow.loadURL(indexPath);
// // });
// const { app, BrowserWindow } = require('electron');
// const path = require('path');

// app.whenReady().then(() => {
//   let mainWindow = new BrowserWindow({
//     width: 1200,
//     height: 800,
//     webPreferences: {
//       nodeIntegration: true,
//       contextIsolation: false
//     }
//   });

//   // Open DevTools for debugging
//   mainWindow.webContents.openDevTools();

//   // C:\Shivam Electronics Project\shivam_Electronics\src\index.html
//   // Load the correct path
//   // const indexPath = `file://${path.resolve(__dirname, 'dist', 'shivam-electronics', 'index.html')}`;


//   // mainWindow.loadURL(indexPath);
//   const indexPath = path.join(__dirname, 'dist/shivam-electronics/browser/', 'browser', 'index.html');
//   mainWindow.loadFile(indexPath);
  
//   // Handle errors
//   mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
//     console.error(`Failed to load: ${errorDescription} (Code: ${errorCode})`);
//   });
// });

// main.js
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