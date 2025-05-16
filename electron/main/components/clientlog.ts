import { app, ipcMain } from 'electron';
import chokidar from 'chokidar';
import fs from 'node:fs';
import readline from 'node:readline';
import AppStorage from './storage';

import { createLogProcessors } from './logprocessor';

export async function Setup() {
  const lang = app.getLocale().toLowerCase();
  console.log('Langue détectée:', lang);

  let lastSize = 0;

  const logProcessors = createLogProcessors(lang);

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
        ipcMain.emit('log-line', {}, line);
      });

      rl.on('close', () => {
        lastSize = stats.size;
      });
    });

  console.log(`🕵️ Surveillance de ${logFilePath} démarrée.`);

  ipcMain.on('log-line', async (_, line: string) => {
    //    console.log('on-line');

    try {
      for (const processor of logProcessors) {
        if (processor.regex.test(line)) {
          processor.process(line);
        }
      }
    } catch (error) {
      console.error('Error processing log line:', error);
    }
  });
}
