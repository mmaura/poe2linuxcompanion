import Store from 'electron-store';
import type { Schema } from 'electron-store';
import path from 'node:path';
import os from 'node:os';
import { ipcMain, shell } from 'electron';
import { Config } from '../../../shared/ipc-events';
import { exec } from 'node:child_process';

type ConfigSchema = {
  poe2LogFilePath: string;
  sidekickURL: string;
  poe2CmdLine: string;
  Poe2RunAtStart: boolean;
  hotkeys: {
    type: 'object';
    properties: {
      pricecheck: { type: 'string'; default: 'Ctrl+Alt+D' };
      reload_logs: { type: 'string'; default: 'Ctrl+Alt+R' };
    };
    default: {
      pricecheck: 'Ctrl+Alt+D';
      reload_logs: 'Ctrl+Alt+R';
    };
  };
  ntfy_enabled: boolean;
  ntfy_url: string;
  ntfy_authorization_bearer: string;
};

const configSchema: Schema<ConfigSchema> = {
  poe2LogFilePath: {
    type: 'string',
    default: path.join(
      os.homedir(),
      'Games',
      'path-of-exile-2',
      'drive_c',
      'Program Files (x86)',
      'Grinding Gear Games',
      'Path of Exile 2',
      'logs',
      'Client.txt'
    ),
  },
  poe2CmdLine: {
    type: 'string',
    default: 'env LUTRIS_SKIP_INIT=1 lutris lutris:rungameid/6',
  },
  Poe2RunAtStart: {
    type: 'boolean',
    default: false,
  },
  sidekickURL: {
    type: 'string',
    default: 'http://127.0.0.1:5000',
  },
  ntfy_enabled: {
    type: 'boolean',
    default: false,
  },
  ntfy_url: {
    type: 'string',
    default: 'https://ntfy.sh/mytopic',
  },
  ntfy_authorization_bearer: {
    type: 'string',
    default: '123456789....',
  },
  hotkeys: {
    type: 'object',
    properties: {
      pricecheck: {
        type: 'string',
        default: 'Control+Alt+d',
      },
    },
  },
};

const AppStorage = new Store<ConfigSchema>({
  schema: configSchema,
});

export default AppStorage;

ipcMain.on(Config.SHOW_CONFIG_FILE, async () => {
  await AppStorage.openInEditor();
  //shell.openPath(AppStorage.path);
});
