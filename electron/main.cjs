const { app, BrowserWindow, ipcMain, shell, nativeTheme, session } = require('electron');
const path = require('path');

let win = null;

function createWindow() {
  const isMac = process.platform === 'darwin';

  win = new BrowserWindow({
    width: 1180,
    height: 760,
    minWidth: 700,
    minHeight: 520,
    show: false,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#212121' : '#ffffff',
    // macOS: keep the native frame and put the traffic lights inside the sidebar,
    // exactly like the real ChatGPT desktop app. Windows: fully frameless, we draw
    // our own minimize / maximize / close controls in the renderer.
    frame: isMac,
    titleBarStyle: isMac ? 'hiddenInset' : 'hidden',
    trafficLightPosition: { x: 18, y: 18 },
    ...(process.platform === 'win32' ? { icon: path.join(__dirname, '..', 'build', 'icon.png') } : {}),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false,
    },
  });

  win.once('ready-to-show', () => {
    win.show();
    // Optional self-test hook: XCODE_CAPTURE=<path> saves a window screenshot then exits.
    const capturePath = process.env.XCODE_CAPTURE;
    if (capturePath) {
      setTimeout(async () => {
        const image = await win.webContents.capturePage();
        require('fs').writeFileSync(capturePath, image.toPNG());
        console.log('captured:', capturePath);
        app.exit(0);
      }, 2000);
    }
  });

  win.on('maximize', () => win.webContents.send('window:maximized', true));
  win.on('unmaximize', () => win.webContents.send('window:maximized', false));
  win.on('enter-full-screen', () => win.webContents.send('window:maximized', true));
  win.on('leave-full-screen', () => win.webContents.send('window:maximized', false));

  // Open external links in the default browser instead of a new Electron window.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) {
    win.loadURL(devUrl);
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  win.on('closed', () => {
    win = null;
  });
}

ipcMain.on('window:minimize', () => win?.minimize());
ipcMain.on('window:maximize', () => {
  if (!win) return;
  if (win.isMaximized()) win.unmaximize();
  else win.maximize();
});
ipcMain.on('window:close', () => win?.close());
ipcMain.handle('window:isMaximized', () => !!win?.isMaximized());

nativeTheme.on('updated', () => {
  if (win) {
    win.setBackgroundColor(nativeTheme.shouldUseDarkColors ? '#212121' : '#ffffff');
  }
});

app.whenReady().then(() => {
  // Allow the renderer to talk to model-provider APIs directly (most providers
  // don't send CORS headers for browser-style requests).
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    if (details.url.startsWith('devtools://')) return callback({});
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Access-Control-Allow-Origin': ['*'],
        'Access-Control-Allow-Headers': ['*'],
        'Access-Control-Allow-Methods': ['GET, POST, OPTIONS'],
      },
    });
  });

  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
