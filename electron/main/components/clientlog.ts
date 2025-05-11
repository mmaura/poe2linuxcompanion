import { app, BrowserWindow, ipcMain } from 'electron';
import { PRELOAD, RENDERER_DIST, VITE_DEV_SERVER_URL } from '../utils';
import path from 'node:path';
import chokidar from 'chokidar';
import fs from 'node:fs';
import readline from 'node:readline';
import AppStorage from './storage';

let Window: BrowserWindow = null;

export async function Setup() {
  //from renderer
  ipcMain.handle('clientlog-show-window', () => {
    ShowWindow();
  });

  //from main (socket, ...)
  ipcMain.on('clientlog-show-window', () => {
    ShowWindow();
  });

  StartWatchingLogFile();
}

function ShowWindow() {
  if (Window) {
    Window.focus();
    Window.moveTop();
  } else {
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
      console.log(
        `===>> ${VITE_DEV_SERVER_URL}src/window-clientlog/index.html`
      );
      Window.loadURL(`${VITE_DEV_SERVER_URL}src/window-clientlog/index.html`);
    } else {
      Window.loadFile(path.join(RENDERER_DIST, 'clientlog/index.html'));
      Window.webContents.openDevTools();
    }
  }
}

app.on('will-quit', () => {
  Window = null;
});

app.whenReady().then(() => {
  Setup();
});

let lastSize = 0;

function StartWatchingLogFile() {
  const logFilePath = AppStorage.get('poe2LogFilePath');
  if (!logFilePath || !fs.existsSync(logFilePath)) {
    console.warn('⚠️ Fichier log introuvable :', logFilePath);
    return;
  }

  chokidar
    .watch(logFilePath, { persistent: true, awaitWriteFinish: true })
    .on('change', () => {
      const stats = fs.statSync(logFilePath);
      if (stats.size < lastSize) {
        // log file rotated
        lastSize = 0;
      }

      const stream = fs.createReadStream(logFilePath, {
        start: lastSize,
        end: stats.size,
        encoding: 'utf-8',
      });

      const rl = readline.createInterface({ input: stream });

      rl.on('line', (line) => {
        Window?.webContents.send('log-line', line); // Envoie vers le renderer
      });

      rl.on('close', () => {
        lastSize = stats.size;
      });
    });

  console.log(`🕵️ Surveillance de ${logFilePath} démarrée.`);
}
