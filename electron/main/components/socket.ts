import { app, ipcMain } from 'electron';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

export async function Setup(
  socketPath: string = path.join(
    '/run/user',
    os.userInfo().uid.toString(),
    'poe2linuxcompanion.socket'
  )
) {
  let server: net.Server = null;

  //remove socket if exist
  if (fs.existsSync(socketPath)) fs.unlinkSync(socketPath);

  server = net.createServer((stream) => {
    stream.on('data', (data) => {
      //TODO: traiter les messages recu sur la socket
      const command = data.toString().split('\n');

      switch (command[0]) {
        case 'show-config':
          ipcMain.emit('configuration-show-window');
          break;
        case 'pricecheck':
          console.log('pricecheck');
          ipcMain.emit('pricecheck-checkitem', ...command);
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
      console.log('✓ Serveur en écoute sur : ', socketPath);
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
