import { app, BrowserWindow, shell, ipcMain, globalShortcut } from 'electron';

import { CreateTray } from './tray';
import {
  AppIconFile,
  PRELOAD,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL,
  __dirname,
  detectDesktopEnvironment,
} from './utils';
import path from 'node:path';
import os from 'node:os';

import { Setup as configSetup } from './components/configuration';
import { Setup as socketSetup } from './components/socket';
import { Setup as clientlogSetup } from './components/clientlog';
import { Setup as commerceSetup } from './components/commerce';
import { Setup as pricecheckSetup } from './components/sidekick';
import { Setup as gamecommandSetup } from './components/gamecommand';

import AppStorage from './components/storage';

console.log("** c'est parti **");
console.log('PID: %s', process.pid);

if (process.platform === 'linux') {
  //console.log('Session Wayland :', process.env.XDG_SESSION_TYPE === 'wayland');

  /*evite l'erreur
  GTK 2/3 symbols detected. Using GTK 2/3 and GTK 4 in the same process is not supported
  */
  app.commandLine.appendSwitch('gtk-version', '3');

  if (process.env.XDG_SESSION_TYPE === 'wayland') {
    // Enable usage of Portal's globalShortcuts. This is essential for cases when
    // the app runs in a Wayland session.
    app.commandLine.appendSwitch('enable-features', 'GlobalShortcutsPortal');

    //Wayland
    app.commandLine.appendSwitch('enable-features', 'UseOzonePlatform');
    app.commandLine.appendSwitch('enable-features', 'WaylandWindowDecorations');
    app.commandLine.appendSwitch('enable-features', 'UseOzonePlatform');
  }
}
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
let MustClose = false;

async function CreateMainWindow() {
  MainWindow = new BrowserWindow({
    title: 'POE2 Linux Companion - Loading',
    icon: AppIconFile,
    webPreferences: {
      preload: PRELOAD,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // nodeIntegration: true,

      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // contextIsolation: false,
    },
    transparent: true,
    frame: false,
    width: 500,
    height: 500,
    resizable: false,
    movable: false,
    center: true,
    alwaysOnTop: true,
    hasShadow: false,
    fullscreenable: false,
    skipTaskbar: true,
    focusable: false,
    show: false,
  });

  MainWindow.setMenu(null);

  // MainWindow.setIgnoreMouseEvents(true, {
  //   forward: true,
  // });

  // Make all links open with the browser, not with the application
  MainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url);
    return { action: 'deny' };
  });

  // win.webContents.on('will-navigate', (event, url) => { }) #344

  MainWindow.on('close', (e) => {
    if (!MustClose) e.preventDefault();
    MainWindow?.hide();
  });

  MainWindow.once('ready-to-show', () => {
    MainWindow?.show();
    setTimeout(() => {
      MainWindow?.hide();
    }, 3000);
  });

  app.on('before-quit', (e) => {
    MustClose = true;
  });

  if (VITE_DEV_SERVER_URL) {
    MainWindow.loadURL(`${VITE_DEV_SERVER_URL}src/window-main/index.html`);
    //MainWindow.webContents.openDevTools();
  } else {
    MainWindow.loadFile(path.join(RENDERER_DIST, 'src/window-main/index.html'));
  }
}

app.whenReady().then(() => {
  const desktopEnvironment = detectDesktopEnvironment();
  if (desktopEnvironment) {
    console.log(`Environnement de bureau détecté : ${desktopEnvironment}`);
  } else {
    console.log('Environnement de bureau non détecté.');
  }
  pricecheckSetup();
  configSetup();
  commerceSetup();
  socketSetup();
  clientlogSetup();
  CreateTray();
  CreateMainWindow();
  //appRegisterShorcuts();
  gamecommandSetup();

  /*   AppStorage.onDidChange('hotkeys', () => {
    appRegisterShorcuts();
  }); */
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

ipcMain.on('show-mainwindows', () => {
  MainWindow?.show();
});

ipcMain.on('hide-mainwindow', () => {
  MainWindow?.hide();
});

/**
 * Malheuresement ne fonctionne pas avec Wayland
 * Utiliser plutot le serveur socket
 */

/*
async function appRegisterShorcuts() {
  globalShortcut.unregisterAll();

  if (
    globalShortcut.register(AppStorage.get('hotkeys.pricecheck'), () => {
      ipcMain.emit('shortcut-pricecheck');
      console.log('pricecheck is pressed');
    })
  ) {
    console.log(`✓ Enregistrement des raccourcis globaux réussi.`);
  } else console.log('⚠️ Enregistrement des raccourcis globaux échoué.');
}
*/
