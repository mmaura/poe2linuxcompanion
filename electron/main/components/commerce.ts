import { app, BrowserWindow, ipcMain, screen, webContents } from 'electron';
import { PRELOAD, RENDERER_DIST, VITE_DEV_SERVER_URL } from '../utils';
import path from 'node:path';

import windowStateKeeper from 'electron-window-state';
import { BUYER } from '../../../shared/types';

const WINDOW_WIDTH = 370;

export async function Setup() {
  const WindowSate = windowStateKeeper({
    defaultHeight: screen.getPrimaryDisplay().workAreaSize.height,
  });

  let window = new BrowserWindow({
    webPreferences: {
      preload: PRELOAD,
      //nodeIntegration: true,
      //contextIsolation: false,
    },
    transparent: true,
    frame: false,
    width: WINDOW_WIDTH,
    height: 1,
    x: WindowSate.x,
    y: WindowSate.y,
    resizable: false,
    movable: true,
    center: false,
    show: false,
    alwaysOnTop: true,
    fullscreenable: false,
    skipTaskbar: true,
  });

  // Suivi automatique de l’état
  WindowSate.manage(window);

  window.setMenu(null);

  // Window.once('ready-to-show', () => {
  // });

  window.on('close', () => {
    window = null;
  });

  if (VITE_DEV_SERVER_URL) {
    window.loadURL(`${VITE_DEV_SERVER_URL}src/window-commerce/index.html`);
    window.webContents.openDevTools();
  } else {
    window.loadFile(path.join(RENDERER_DIST, 'src/window-commerce/index.html'));
    window.webContents.openDevTools();
  }
  ipcMain.on('set-window-height', (_, height) => {
    console.log('ajustement');
    window.setResizable(true);
    window.setSize(WINDOW_WIDTH, height);
    window.setResizable(false);
  });

  ipcMain.on('clientlog-newbuyer', (_, buyer: BUYER) => {
    console.log('clientlog-newbuyer');
    console.log(buyer);
    window.showInactive();
    window.webContents.send('commerce-newbuyer', buyer);
    //TODO: playsound
  });

  ipcMain.on(
    'clientlog-updatebuyer',
    (_, playername: string, buyer: Partial<BUYER>) => {
      console.log('clientlog-newbuyer');
      console.log(buyer);
      window.showInactive();
      window.webContents.send('commerce-updatebuyer', playername, buyer);
      //TODO: Play sound
    }
  );

  app.on('will-quit', () => {
    window = null;
  });
}
