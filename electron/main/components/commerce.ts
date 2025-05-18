import { app, BrowserWindow, ipcMain, screen, webContents } from 'electron';
import { PRELOAD, RENDERER_DIST, VITE_DEV_SERVER_URL } from '../utils';
import path from 'node:path';

import windowStateKeeper from 'electron-window-state';
import { BUYER } from '../../../shared/types';

const WINDOW_WIDTH = 400;

export async function Setup() {
  const WindowSate = windowStateKeeper({
    defaultHeight: screen.getPrimaryDisplay().workAreaSize.height,
  });

  let lastBuyerName = '';
  //let curentBuyerIndex = 0;

  let Buyers: BUYER[] = [];

  let window: BrowserWindow | null = null;
  window = new BrowserWindow({
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
    skipTaskbar: false,
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
    window?.setResizable(true);
    window?.setSize(WINDOW_WIDTH, height);
    window?.setResizable(false);
  });

  //nouveau buyer détecté dans le log
  ipcMain.on('clientlog-newbuyer', (_, buyer: BUYER) => {
    console.log('clientlog-newbuyer');
    const index = Buyers.push(buyer);
    buyer.customIndex = index;
    Buyers[index - 1].customIndex = index;
    //console.log(buyer);
    lastBuyerName = buyer.playername;
    window?.showInactive();
    window?.webContents.send('commerce-newbuyer', buyer);
  });

  ipcMain.on(
    'clientlog-updatebuyer',
    (_, playername: string, buyer: Partial<BUYER>) => {
      console.log('clientlog-updatebuyer');
      console.log(buyer);
      window?.showInactive();
      window?.webContents.send('commerce-updatebuyer', playername, buyer);
    }
  );

  ipcMain.on('commerce-buyer', (_, buyerNum) => {
    console.log('commerce-buyer: ', buyerNum);
  });

  //Renderer: remove buyer
  ipcMain.on('commerce-remove-buyer', (_, buyerId) => {
    console.log('commerce-remove-buyer: ', buyerId);
    const index = Buyers.findIndex((buyer) => buyer.id === buyerId);
    if (index !== -1) Buyers.splice(index, 1);

    //recalcul les index
    Buyers.forEach((buyer, index) => {
      if (buyer.customIndex !== index + 1) {
        window?.webContents.send('commerce-updatebuyer-id', buyer.id, {
          customIndex: index + 1,
        });
      }
    });
  });

  ipcMain.on('commerce-buyer-wait', (_) => {
    console.log(`commerce-buyer say wait to : ${lastBuyerName}`);
    ipcMain.emit('saywait-player', {}, lastBuyerName);
  });

  //  ipcMain.on('', (_,)=>{})

  app.on('will-quit', () => {
    window = null;
  });
}
