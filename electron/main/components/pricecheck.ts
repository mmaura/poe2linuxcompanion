import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron';
import path from 'node:path';
import { PRELOAD, __dirname } from '../utils.js';

import AppStorage from './storage';

let Window: BrowserWindow | null = null;

export async function Setup() {
  ipcMain.on('pricecheck-checkitem', (_, ...itemLines: string[]) => {
    console.log('pricecheck');
    console.log(itemLines);

    if (!Window) {
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

      Window.webContents.on('did-finish-load', () => {
        console.log('finished');
        Window?.webContents.send('removeLoading');
      });

      // Make all links open with the browser, not with the application
      Window.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('https:')) shell.openExternal(url);
        return { action: 'deny' };
      });
    }

    const url = itemLines.slice(0).join('\n');
    const url64: string = Buffer.from(url).toString('base64');

    console.log(`${AppStorage.get('sidekickURL')}/trade/xurl_${url}`);
    Window.loadURL(`${AppStorage.get('sidekickURL')}/trade/xurl_${url64}`);
  });
}

app.on('will-quit', () => {
  //Window = null;
});
