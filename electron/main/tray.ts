import { app, ipcMain, Menu, Tray } from 'electron';
import { AppIconFile } from './utils';
import { Config, LogProcessor, Sidekick } from '../../shared/ipc-events';
let AppTray; //= null;

export async function CreateTray() {
  AppTray = new Tray(AppIconFile);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Configuration (partial)',
      click: async () => {
        ipcMain.emit(Config.SHOW_CONFIG_WINDOW);
      },
    },
    {
      label: 'Configuration file (complete)',
      click: async () => {
        ipcMain.emit(Config.SHOW_CONFIG_FILE);
      },
    },
    {
      label: 'Afficher Sidekick',
      click: async () => {
        ipcMain.emit(Sidekick.SHOW);
      },
    },
    {
      label: 'Tests', // <- ici c'est "label", pas "sublabel"
      submenu: [
        {
          label: 'Test 1',
          click: async () => {
            ipcMain.emit(LogProcessor.RUN_TEST1);
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
  AppTray.setToolTip(app.getName());
  AppTray.setContextMenu(contextMenu);

  AppTray.on('click', () => {
    ipcMain.emit(Sidekick.SHOW);
  });
}
