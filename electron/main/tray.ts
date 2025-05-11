import { app, ipcMain, Menu, Tray } from 'electron';
import path from 'node:path';
import { AppIconFile, getAbsPackagedPath } from './utils';
let AppTray = null;

function getAssetPath(...paths: string[]) {
  return process.env.NODE_ENV === 'development'
    ? path.resolve(__dirname, '..', ...paths)
    : path.resolve(process.resourcesPath, 'assets', ...paths);
}

export async function CreateTray() {
  const iconPath = getAbsPackagedPath('logo.svg');
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
    { role: 'quit' },
  ]);
  AppTray.setToolTip('This is my application.');
  AppTray.setContextMenu(contextMenu);
}
