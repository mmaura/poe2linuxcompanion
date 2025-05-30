import { app, ipcMain } from 'electron';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import { Commerce, Sidekick } from '../../../shared/ipc-events';

export async function Setup(
  socketPath: string = path.join(
    '/run/user',
    os.userInfo().uid.toString(),
    'poe2linuxcompanion.socket'
  )
) {
  let server: net.Server;

  //remove socket if exist
  if (fs.existsSync(socketPath)) fs.unlinkSync(socketPath);

  server = net.createServer((stream) => {
    stream.on('data', (data) => {
      const command = data.toString().split('\n');

      switch (command[0]) {
        case 'show-config':
          ipcMain.emit('configuration-show-window', {}); // channel, event
          break;
        //check price
        case 'pricecheck':
          ipcMain.emit(Sidekick.CHECK_ITEM, ...command);
          break;
        //do the next action for buyer x (invite => trade => kick)
        case 'buyer-next-command':
          console.log('next command');
          ipcMain.emit(Commerce.BUYER_NEXT_ACTION, {}, command[1]);
          break;
        //say wait to the last buyer
        case 'buyer-wait':
          ipcMain.emit(Commerce.LAST_WISPER_WAIT, {});
          break;
        default:
          console.log('commande inconnue');
      }
    });

    // stream.on('end', function() {
    //     console.log('Client disconnected.');
    // });
  });

  if (server == undefined) {
    console.log('⚠️ échec de creation : ', socketPath);
  } else {
    server.listen(socketPath, () => {
      console.log('✅ Serveur en écoute sur : ', socketPath);
    });

    // Server.on('connection', function(socket){
    //     console.log('*****Client connected.');
    //     console.log('*****Sending boop.');
    //     socket.write('__boop');
    // })

    //clean on exit
    app.on('will-quit', () => {
      server.close();
    });
  }
}
