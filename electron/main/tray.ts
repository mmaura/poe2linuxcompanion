import { app, ipcMain, Menu, Tray } from 'electron';
import { AppIconFile } from './utils';
let AppTray = null;

export async function CreateTray() {
  AppTray = new Tray(AppIconFile);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Configuration',
      click: async () => {
        ipcMain.emit('configuration-show-window');
      },
    },
    {
      label: 'ClientLog',
      click: async () => {
        ipcMain.emit('clientlog-show-window');
      },
    },
    {
      label: 'quitter',
      click: async () => {
        app.quit();
      },
    },
  ]);
  AppTray.setToolTip(app.getName());
  AppTray.setContextMenu(contextMenu);

  AppTray.on('click', () => {
    ipcMain.emit('show-mainwindows');
  });
}
