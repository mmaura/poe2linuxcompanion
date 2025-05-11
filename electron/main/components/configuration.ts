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
      console.log('Fichier de log POE2 mis à jour :', newPath);
      AppStorage.set('poe2LogFilePath', newPath);
    }
  });

  ipcMain.handle('configuration-sendPoe2LogFilePath', () => {
    console.log('get: ', AppStorage.get('poe2LogFilePath'));
    return AppStorage.get('poe2LogFilePath');
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
    width: 400,
    height: 400,
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
    Window.loadFile(path.join(RENDERER_DIST, 'config/index.html'));
    Window.webContents.openDevTools();
  }
}

app.on('will-quit', () => {
  Window = null;
});
