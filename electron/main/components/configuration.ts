import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import path from 'node:path';
import {
  PRELOAD,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL,
  __dirname,
} from '../utils.js';
import fs from 'node:fs';

import AppStorage from './storage';

let Window: BrowserWindow = null;

export async function Setup() {
  //from renderer
  ipcMain.handle('configuration-show-window', () => {
    ShowConfigWindow();
  });

  ipcMain.handle('configuration-show-poe2logfiledialog', async (event, arg) =>
    ShowPoe2logFileDialog(arg)
  );

  //from main (socket, ...)
  ipcMain.on('configuration-show-window', () => {
    ShowConfigWindow();
  });

  ipcMain.on('configuration-receivePoe2LogFilePath', (event, newPath) => {
    if (newPath && fs.existsSync(newPath)) {
      AppStorage.set('poe2LogFilePath', newPath);
    }
  });

  ipcMain.on('configuration-receiveSidekickURL', (_, url) => {
    AppStorage.set('sidekickURL', url);
  });

  ipcMain.on('configuration-receivePoe2RunAtStart', (_, run) => {
    AppStorage.set('Poe2RunAtStart', run);
  });

  ipcMain.handle('configuration-sendPoe2RunAtStart', () => {
    return AppStorage.get('Poe2RunAtStart');
  });

  ipcMain.handle('configuration-sendPoe2LogFilePath', () => {
    return AppStorage.get('poe2LogFilePath');
  });

  ipcMain.handle('configuration-sendSidekickURL', () => {
    return AppStorage.get('sidekickURL');
  });

  ipcMain.handle('configuration-sendPricecheckShortcut', () => {
    return AppStorage.get('hotkeys.pricecheck');
  });

  ipcMain.on('configuration-save-hotkey', (_, hotkey, feature) => {
    console.log(`hotkeys.${feature} : ${hotkey}`);
    AppStorage.set(`hotkeys.${feature}`, hotkey);
  });
}

async function ShowPoe2logFileDialog(arg: string = null) {
  if (!arg) arg = '';
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Choisissez un fichier',
    defaultPath: arg,
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

async function ShowConfigWindow() {
  if (Window) {
    Window.focus();
    Window.moveTop();
  } else {
    CreateConfigWindow();
  }
}

async function CreateConfigWindow() {
  Window = new BrowserWindow({
    webPreferences: {
      preload: PRELOAD,
      //nodeIntegration: true,
      //contextIsolation: false,
    },
    transparent: false,
    frame: true,
    width: 1200,
    height: 800,
    resizable: true,
    movable: true,
    center: true,
    show: true,
    alwaysOnTop: false,
  });

  Window.on('close', () => {
    Window = null;
  });

  if (VITE_DEV_SERVER_URL) {
    console.log(`===>> ${VITE_DEV_SERVER_URL}src/window-config/index.html`);
    Window.loadURL(`${VITE_DEV_SERVER_URL}src/window-config/index.html`);
  } else {
    Window.loadFile(path.join(RENDERER_DIST, 'src/window-config/index.html'));
    Window.webContents.openDevTools();
  }
}

app.on('will-quit', () => {
  Window = null;
});
