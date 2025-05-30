import {
  app,
  BrowserWindow,
  ipcMain,
  shell,
  screen,
  dialog,
  webContents,
  Menu,
} from 'electron';
import windowStateKeeper from 'electron-window-state';
import { PRELOAD, __dirname } from '../utils.js';
import AppStorage from './storage.js';
import { Sidekick } from '../../../shared/ipc-events.js';

let ReloadCount = 0;

export async function Setup() {
  let window: BrowserWindow | null = null;

  const WindowSate = windowStateKeeper({
    defaultHeight: 800,
    defaultWidth: 600,
    file: 'priceckeck-window-state.json',
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
    alwaysOnTop: true,
  });

  window.setMenu(contextMenu);

  // Suivi automatique de l’état
  WindowSate.manage(window);

  window.on('close', () => {
    window = null;
  });

  window.webContents.on('did-finish-load', () => {
    window?.webContents.send('removeLoading');
  });

  window.webContents.on(
    'did-fail-load',
    (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
      console.log(`Erreur de chargement pour l'URL: ${validatedURL}`);
      console.log(`Code d'erreur: ${errorCode}`);
      console.log(`Description de l'erreur: ${errorDescription}`);
    }
  );

  window.webContents.on('dom-ready', () => {
    const waitForElement = (
      selector: string,
      timeout: number
    ): Promise<boolean> => {
      return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const interval = setInterval(() => {
          window?.webContents
            .executeJavaScript(`document.querySelector('${selector}')`)
            .then((result: any) => {
              if (result !== null) {
                clearInterval(interval);
                resolve(true);
              } else if (Date.now() - startTime > timeout) {
                clearInterval(interval);
                resolve(false);
              }
            })
            .catch((err) => {
              clearInterval(interval);
              reject(err);
            });
        }, 100); // Vérifier toutes les 100ms
      });
    };

    waitForElement('.items-stretch', 3000) // Attendre jusqu'à 3 secondes
      .then((elementExists: boolean) => {
        if (elementExists) {
          console.log("L'élément existe.");
          // Ici, tu peux effectuer une action appropriée si l'élément existe.
        } else {
          console.log("L'élément n'existe pas après 3 secondes => setup");
          ReloadCount++;
          if (ReloadCount < 5) ipcMain.emit(Sidekick.INIT);
          else ReloadCount = 0;
          // Ici, tu peux effectuer une action appropriée si l'élément n'existe pas.
        }
      })
      .catch((err) => {
        console.error("Erreur lors de l'attente de l'élément:", err);
      });
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
    window?.moveTop();
  });

  ipcMain.on(Sidekick.INIT, (_, ...itemLines: string[]) => {
    window?.loadURL(`${AppStorage.get('sidekickURL')}/update`);
    window?.showInactive();
    window?.moveTop();
  });

  ipcMain.on(Sidekick.CONFIG, (_, ...itemLines: string[]) => {
    window?.loadURL(`${AppStorage.get('sidekickURL')}/settings/general`);
    window?.showInactive();
    window?.moveTop();
  });

  ipcMain.on(Sidekick.SHOW, (_, ...itemLines: string[]) => {
    window?.show();
    window?.moveTop();
  });

  ipcMain.on(Sidekick.DEBUG, (_, ...itemLines: string[]) => {
    window?.webContents.toggleDevTools();
    window?.moveTop();
  });
}

const contextMenu = Menu.buildFromTemplate([
  {
    label: 'Setup',
    click: async () => {
      ipcMain.emit(Sidekick.INIT);
    },
  },
  {
    label: 'Config',
    click: async () => {
      ipcMain.emit(Sidekick.CONFIG);
    },
  },
  {
    label: 'Debug',
    click: async () => {
      ipcMain.emit(Sidekick.DEBUG);
    },
  },
]);
