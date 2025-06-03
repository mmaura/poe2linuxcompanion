import { app, BrowserWindow, ipcMain, screen, webContents } from 'electron';
import { PRELOAD, RENDERER_DIST, VITE_DEV_SERVER_URL } from '../utils';
import path from 'node:path';

import windowStateKeeper from 'electron-window-state';
import { Buyer, Message } from '../../../shared/types';
import {
  LogProcessor,
  Commerce,
  GameCommands,
} from '../../../shared/ipc-events';

const WINDOW_WIDTH = 400;

export async function Setup() {
  const WindowSate = windowStateKeeper({
    defaultHeight: screen.getPrimaryDisplay().workAreaSize.height,
    file: 'commerce-window-state.json',
  });

  let lastBuyer = '';

  let Buyers: Buyer[] = [];

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
    height: WindowSate.height,
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

  /**
   * Register Events
   *
   * */
  ipcMain.on(Commerce.SET_WINDOW_HEIGHT, (_, height) => {
    window?.setResizable(true);
    window?.setSize(WINDOW_WIDTH, height);
    window?.setResizable(false);
  });

  ipcMain.on(LogProcessor.NEW_BUYER, (_, buyer: Buyer) => {
    const array_lenght = Buyers.push(buyer);
    buyer.id = array_lenght - 1;
    Buyers[array_lenght - 1].id = array_lenght;
    lastBuyer = buyer.playername;

    window?.showInactive();
    window?.webContents.send(Commerce.PUSH_BUYER, buyer);
  });

  ipcMain.on(LogProcessor.PLAYER_ARRIVAL, (_, playername: string) => {
    Buyers.filter((b) => b.playername == playername).forEach((buyer: Buyer) => {
      buyer.playerIsHere = true;
      buyer.currentAction = 'trade';
      window?.webContents.send(Commerce.UPDATE_BUYER, buyer.id, buyer);
    });
  });

  ipcMain.on(LogProcessor.EXCHANGE_ACCEPTED, (_, playername: string) => {
    Buyers.filter((b) => b.playername == playername).forEach((buyer: Buyer) => {
      buyer.currentAction = 'thx';
      window?.webContents.send(Commerce.UPDATE_BUYER, buyer.id, buyer);
    });
  });

  ipcMain.on(LogProcessor.PLAYER_DEPARTURE, (_, playername: string) => {
    Buyers.filter((b) => b.playername == playername).forEach((buyer: Buyer) => {
      buyer.playerIsHere = false;
      buyer.currentAction = 'kick';
      window?.webContents.send(Commerce.UPDATE_BUYER, buyer.id, buyer);
    });
  });

  ipcMain.on(LogProcessor.WISP, (_, playername: string, msg: Message) => {
    let find = false;
    Buyers.filter((b) => b.playername == playername).forEach((buyer: Buyer) => {
      buyer.messages.push(msg);
      window?.webContents.send(Commerce.UPDATE_BUYER, buyer.id, buyer);
    });
    //if (find) lastWisper = playername;
  });

  ipcMain.on(Commerce.LAST_WISPER_WAIT, (_) => {
    ipcMain.emit(GameCommands.SAY_WAIT, lastBuyer);
  });

  ipcMain.on(Commerce.SPLICE_BUYER, (_, buyerId) => {
    const index = Buyers.findIndex((b) => b.id === buyerId);
    if (index !== -1) Buyers.splice(index, 1);
    else console.log("tentative de suppression d'un buyer innexistant");

    //recalcul les index forEach parcourt toujours du premier au dernier (par index)
    Buyers.forEach((buyer, index) => {
      const newId = index + 1;
      if (buyer.id !== newId) {
        const ancienId = buyer.id;
        buyer.id = newId;
        window?.webContents.send(Commerce.UPDATE_BUYER, ancienId, buyer);
      }
    });
  });

  ipcMain.on(Commerce.BUYER_NEXT_ACTION, (_, index: number) => {
    index--;
    switch (Buyers[index].currentAction) {
      case 'invite':
        ipcMain.emit(GameCommands.INVITE, {}, Buyers[index].playername);
        break;
      case 'trade':
        ipcMain.emit(GameCommands.TRADE, {}, Buyers[index].playername);
        break;
      case 'thx':
        ipcMain.emit(GameCommands.SAY_THX, {}, Buyers[index].playername);
        break;
      case 'kick':
        ipcMain.emit(GameCommands.KICK, {}, Buyers[index].playername);
        break;
    }
    ipcMain.emit(Buyers[index].currentAction, Buyers[index]);
  });

  app.on('will-quit', () => {
    window = null;
  });
}
