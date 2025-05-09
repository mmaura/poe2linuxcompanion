import { ipcMain } from 'electron';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';

const socketPath = path.join('/run/user', os.userInfo().uid.toString(), 'poe2linuxcompanion');
let Server : net.Server = null;

export async function StartSocket(){
    Server = net.createServer((socket)=>{
        socket.on('data', (data)=>{
            console.log('Message recu:%s', data.toString());
        })
    })
    Server.listen(socketPath, () => {
        console.log('***** Serveur en écoute sur le socket Unix:', socketPath);
    });
}

export async function StopSocket(){
    if (Server != null)
        Server.close()
}
