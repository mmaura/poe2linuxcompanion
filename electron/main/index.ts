import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  dialog,
  nativeImage,
  globalShortcut,
} from 'electron';

import { CreateTray } from './tray';
import {
  AppIconFile,
  PRELOAD,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL,
  __dirname,
} from './utils';
import path from 'node:path';
import os from 'node:os';

import { Setup as configSetup } from './components/configuration';
import { Setup as socketSetup } from './components/socket';
import { Setup as clientlogSetup } from './components/clientlog';
import AppStorage from './components/storage';

console.log("** c'est parti **");
console.log('PID: %s', process.pid);

/*evite l'erreur
GTK 2/3 symbols detected. Using GTK 2/3 and GTK 4 in the same process is not supported
*/
app.commandLine.appendSwitch('gtk-version', '3');

// Enable usage of Portal's globalShortcuts. This is essential for cases when
// the app runs in a Wayland session.
app.commandLine.appendSwitch('enable-features', 'GlobalShortcutsPortal');

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName());

/*
Gestion des instances de l'application
 */
if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

/*
 * Main Window
 */
let MainWindow: BrowserWindow | null = null;

async function CreateMainWindow() {
  MainWindow = new BrowserWindow({
    title: 'POE2 Linux Companion - Loading',
    //icon: path.join(process.env.VITE_PUBLIC, 'favicon.ico'),
    //icon: AppIcon,
    icon: AppIconFile,
    webPreferences: {
      preload: PRELOAD,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // nodeIntegration: true,

      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // contextIsolation: false,
    },
    transparent: false,
    frame: true,
    width: 400,
    height: 400,
    resizable: false,
    movable: false,
    center: true,
    show: true,
    alwaysOnTop: true,
  });

  MainWindow.setMenu(null);

  if (VITE_DEV_SERVER_URL) {
    // #298
    console.log(`===>> ${VITE_DEV_SERVER_URL}src/window-main/index.html`);

    MainWindow.loadURL(`${VITE_DEV_SERVER_URL}src/window-main/index.html`);
    //MainWindow.webContents.openDevTools()
  } else {
    MainWindow.loadFile(path.join(RENDERER_DIST, 'src/window-main/index.html'));
    //    MainWindow.loadFile(path.join(__dirname, '../../dist/main/index.html'));
    //console.log(path.join(__dirname, '../../dist/main/index.html'));
  }

  // Test actively push message to the Electron-Renderer
  // MainWindow.webContents.on('did-finish-load', () => {
  //   MainWindow?.webContents.send('main-process-message', new Date().toLocaleString())
  // })

  // Make all links open with the browser, not with the application
  MainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url);
    return { action: 'deny' };
  });
  // win.webContents.on('will-navigate', (event, url) => { }) #344

  MainWindow.on('close', () => {
    app.quit();
  });
}

app.whenReady().then(() => {
  configSetup();
  socketSetup();
  clientlogSetup();
  CreateTray();
  CreateMainWindow();
  appRegisterShorcuts();

  AppStorage.onDidChange('hotkeys', () => {
    appRegisterShorcuts();
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  MainWindow = null;
  if (process.platform !== 'darwin') app.quit();
});

app.on('second-instance', () => {
  console.log('second');
  if (MainWindow) {
    // Focus on the main window if the user tried to open another
    if (MainWindow.isMinimized()) MainWindow.restore();
    MainWindow.focus();
  }
});

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    CreateMainWindow();
  }
});

ipcMain.handle('show-openfile-dialog', OpenFileDialog);

async function OpenFileDialog(event, ...arg: string[]) {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Choisissez un fichier',
    defaultPath: arg[0] ? arg[0] : '',
    filters: [
      { name: 'Poe2 Log file', extensions: ['txt'] },
      { name: 'All Files', extensions: ['.*'] },
    ],
    properties: ['openFile'],
  });
  if (!canceled) {
    return filePaths[0];
  }
}

async function appRegisterShorcuts() {
  globalShortcut.unregisterAll();

  if (
    globalShortcut.register(AppStorage.get('hotkeys.pricecheck'), () => {
      ipcMain.emit('shortcut-pricecheck');
      console.log('pricecheck is pressed');
    })
  ) {
    console.log(`enregistrement réussi`);
  } else console.log('enregistrement échoué');

  // Check si le raccourci est enregistré.
  console.log(globalShortcut.isRegistered('CommandOrControl+X'));
}
