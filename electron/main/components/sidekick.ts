import { app, BrowserWindow, ipcMain, shell, screen } from 'electron';
import windowStateKeeper from 'electron-window-state';

import { PRELOAD, __dirname } from '../utils.js';

import AppStorage from './storage.js';
import { Sidekick } from '../../../shared/ipc-events.js';

export async function Setup() {
  let window: BrowserWindow | null = null;

  const WindowSate = windowStateKeeper({
    defaultHeight: screen.getPrimaryDisplay().workAreaSize.height,
  });

  window = new BrowserWindow({
    webPreferences: {
      preload: PRELOAD,
      //nodeIntegration: true,
      //contextIsolation: false,
    },
    transparent: false,
    frame: true,
    width: WindowSate.width,
    height: WindowSate.height,
    x: WindowSate.x,
    y: WindowSate.y,
    resizable: true,
    movable: true,
    show: false,
    alwaysOnTop: false,
  });

  window.on('close', () => {
    window = null;
  });

  window.webContents.on('did-finish-load', () => {
    console.log('finished');
    window?.webContents.send('removeLoading');
  });

  // Make all links open with the browser, not with the application
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url);
    return { action: 'deny' };
  });

  // Make all links open with the browser, not with the application
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url);
    return { action: 'deny' };
  });

  app.on('will-quit', () => {
    window = null;
  });

  ipcMain.on(Sidekick.CHECK_ITEM, (_, ...itemLines: string[]) => {
    const url = itemLines.slice(0).join('\n');
    const url64: string = Buffer.from(url).toString('base64');

    console.log(`${AppStorage.get('sidekickURL')}/trade/xurl_${url}`);
    window?.loadURL(`${AppStorage.get('sidekickURL')}/trade/xurl_${url64}`);
    window?.showInactive();
  });

  ipcMain.on(Sidekick.CONFIG, (_, ...itemLines: string[]) => {
    window?.loadURL(`${AppStorage.get('sidekickURL')}/config`);
    window?.showInactive();
  });
}
