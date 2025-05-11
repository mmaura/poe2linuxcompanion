import Store from 'electron-store';
import type { Schema } from 'electron-store';
import path from 'node:path';
import os from 'node:os';

type ConfigSchema = {
  poe2LogFilePath: string;
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
};

const AppStorage = new Store<ConfigSchema>({
  schema: configSchema,
});

export default AppStorage;
