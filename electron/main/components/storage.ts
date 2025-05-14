import Store from 'electron-store';
import type { Schema } from 'electron-store';
import path from 'node:path';
import os from 'node:os';

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
