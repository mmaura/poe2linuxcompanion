import fs from 'fs';
import { ipcMain, BrowserWindow } from 'electron';

let POE2logPath = '';

export function watchLogFile(path: string, win: BrowserWindow) {
  POE2logPath = path;

  fs.watchFile(path, { interval: 1000 }, (curr, prev) => {
    if (curr.mtime !== prev.mtime) {
      const lastLine = fs.readFileSync(path, 'utf8').split('\n').slice(-2, -1)[0];
      win.webContents.send('log-updated', lastLine);
    }
  });
}

// pour permettre la config dynamique depuis le frontend
ipcMain.handle('set-log-path', async (event, path) => {
  watchLogFile(path, BrowserWindow.getAllWindows()[0]);
});