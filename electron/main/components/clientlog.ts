import { app, ipcMain } from 'electron';
import chokidar from 'chokidar';
import fs from 'node:fs';
import readline from 'node:readline';
import AppStorage from './storage';

import { createLogProcessors } from './logprocessor';
import { ClientLog } from '../../../shared/ipc-events';

export async function Setup() {
  const lang = app.getLocale().toLowerCase();
  console.log('Langue détectée:', lang);

  let initialScanComplete: boolean = false;

  const logProcessors = createLogProcessors(lang);

  const logFilePath = AppStorage.get('poe2LogFilePath');
  if (!logFilePath || !fs.existsSync(logFilePath)) {
    console.warn('⚠️ Fichier log introuvable :', logFilePath);
    return;
  }

  const stats: fs.Stats = fs.statSync(logFilePath);
  let lastSize: number = stats.size;

  chokidar
    .watch(logFilePath, {
      persistent: true,
      awaitWriteFinish: true,
      ignoreInitial: true,
    })
    /*    .on('add', () => {
      // Do nothing on initial add
    })
      */
    .on('change', () => {
      try {
        const stats: fs.Stats = fs.statSync(logFilePath);

        if (stats.size < lastSize) {
          // Log file rotated
          lastSize = 0;
        }

        if (stats.size > lastSize && initialScanComplete) {
          const stream: fs.ReadStream = fs.createReadStream(logFilePath, {
            start: lastSize,
            end: stats.size,
            encoding: 'utf-8',
          });

          const rl: readline.Interface = readline.createInterface({
            input: stream,
          });

          rl.on('line', (line: string) => {
            ipcMain.emit(ClientLog.NEW_LOG_LINE, {}, line);
          });

          rl.on('close', () => {
            lastSize = stats.size;
          });
        } else {
          lastSize = stats.size; // Update lastSize even if no new lines are processed
        }
      } catch (error: any) {
        console.error('Error processing log file:', error);
      }
    })
    .on('ready', () => {
      initialScanComplete = true;
      console.log('Initial scan complete. Ready for changes.');
    });

  console.log(`✅ Surveillance du client log :\n${logFilePath}`);

  ipcMain.on(ClientLog.NEW_LOG_LINE, async (_, line: string) => {
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
