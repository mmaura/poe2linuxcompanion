import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import { PRELOAD, RENDERER_DIST, VITE_DEV_SERVER_URL } from '../utils';
import path from 'node:path';
import chokidar from 'chokidar';
import fs from 'node:fs';
import readline from 'node:readline';
import AppStorage from './storage';

let Window: BrowserWindow = null;

const Map = {
  'fr-fr': {
    lang: 'Francais',
    wispMsg:
      `([0-9]{4}/[0-9]{2}/[0-9]{2} ?[0-9]{2}:[0-9]{2}:[0-9]{2}) ` + // Date/heure
      `[0-9]+ [a-z0-9]+ ` + // ces deux blocs : "311884 3ef23365"
      `\\[INFO Client [0-9]+\\] ` + // tag
      `@(De|À) ` + // "De" ou "À"
      `(?:<(\\S+)> )?` + // pseudo optionnel
      `(\\S+): (.+)`,
    buyMsg:
      `Bonjour, je souhaiterais t'acheter (.+?) pour (.+?) dans la ligue (.+?) ` +
      `\\(onglet de réserve "(.*?)" ; ([0-9]+)e en partant de la gauche, ([0-9]+)e en partant du haut\\)`,
  },
  // 'en-us': {
  //   lang: 'English',
  // },
};

const Lang = app.getLocale().toLowerCase();
const CurrentLangMap = Map[Lang] ?? Map['fr-fr'];
const WispRegExp = new RegExp(CurrentLangMap.wispMsg, 'i');
const BuyRegExp = new RegExp(CurrentLangMap.buyMsg, 'i');

const Test1: string[] = [
  '2025/05/01 16:05:12 311884 3ef23365 [INFO Client 188] @De JohnCraig: Bonjour, je souhaiterais t\'acheter La Sentinelle, Bâton de combat gothique pour 1 alch dans la ligue Dawn of the Hunt (onglet de réserve "V1" ; 3e en partant de la gauche, 1e en partant du haut)',
  '2025/05/01 16:05:33 332799 3ef23365 [INFO Client 188] : JohnCraig a rejoint la zone.',
  '2025/05/01 16:05:52 351965 3ef23365 [INFO Client 188] : Échange annulé.',
  '2025/05/01 16:06:07 366893 3ef23365 [INFO Client 188] : Échange accepté.',
  '2025/05/01 16:06:13 373181 3ef23365 [INFO Client 188] @À JohnCraig: thx',
  '2025/05/01 16:06:20 380448 3ef23365 [INFO Client 188] @À Raiyndra: sold',
  '2025/05/01 16:06:24 384678 3ef23365 [INFO Client 188] : JohnCraig a quitté la zone.',
];

export async function Setup() {
  console.log('Langue détectée:', Lang);
  console.log('dictionnaire choisi: ', CurrentLangMap.lang);

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
    const winMenu = Menu.buildFromTemplate([
      {
        label: 'Configuration',
        click: async () => {
          ipcMain.emit('configuration-show-window');
        },
      },
      {
        label: 'Tests', // <- ici c'est "label", pas "sublabel"
        submenu: [
          {
            label: 'Test 1',
            click: async () => {
              ipcMain.emit('clientlog-test1');
            },
          },
        ],
      },
      {
        label: 'quitter',
        click: async () => {
          app.quit();
        },
      },
    ]);

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
      show: false,
      alwaysOnTop: false,
    });

    Window.setMenu(winMenu);

    Window.once('ready-to-show', () => {
      Window.show();
    });

    Window.on('close', () => {
      Window = null;
    });

    if (VITE_DEV_SERVER_URL) {
      Window.loadURL(`${VITE_DEV_SERVER_URL}src/window-clientlog/index.html`);
      Window.webContents.openDevTools();
    } else {
      Window.loadFile(
        path.join(RENDERER_DIST, 'src/window-clientlog/index.html')
      );
      Window.webContents.openDevTools();
    }
  }
}

app.on('will-quit', () => {
  Window = null;
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
        //Window?.webContents.send('log-line', line); // Envoie vers le renderer
        ipcMain.emit('log-line', {}, line);
      });

      rl.on('close', () => {
        lastSize = stats.size;
      });
    });

  console.log(`🕵️ Surveillance de ${logFilePath} démarrée.`);
}

ipcMain.on('clientlog-test1', async () => {
  console.log('test1');
  for (const value of Test1) {
    //Window?.webContents.send('log-line', value); // Envoie vers le renderer
    ipcMain.emit('log-line', {}, value);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // pause de 1000 ms
  }
});

ipcMain.on('log-line', async (_, msg: string) => {
  console.log('on-line');

  const wispResult = WispRegExp.exec(msg);
  if (wispResult) {
    console.log('wisp');
    const date = wispResult[1];
    const direction = wispResult[2];
    const optionalNick = wispResult[3];
    const username = wispResult[4];
    const message = wispResult[5];

    const buyResult = BuyRegExp.exec(message);

    if (buyResult) {
      console.log('buy');
      const objet = buyResult[1];
      const prix = buyResult[2];
      const league = buyResult[3];
      const coffreName = buyResult[4];
      const xpos = buyResult[5];
      const ypos = buyResult[6];

      console.log(
        `${username} veut acheter "${objet}" au prix  de ${prix} dans le coffre ${coffreName}, ${xpos},${ypos} : league: ${league}`
      );
    }

    //console.log({ date, direction, optionalNick, username, message });
  }
});
