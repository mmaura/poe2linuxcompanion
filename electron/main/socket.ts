import { ipcMain } from 'electron';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

const socketPath = path.join('/run/user', os.userInfo().uid.toString(), 'poe2linuxcompanion.socket');
let Server : net.Server = null;

export async function StartSocket() {
    checkFileSocketExist() ;

    Server = net.createServer((stream)=>{
        // stream.on('end', function() {
        //     console.log('Client disconnected.');
        // });

        stream.on('data', (data)=>{
            //TODO: traiter les messages recu sur la socket
            console.log('*****Message recu:%s', data.toString());
        })
    })

    Server.listen(socketPath, () => {
        console.log('***** Serveur en écoute sur le socket Unix:', socketPath);
    });

    // Server.on('connection', function(socket){
    //     console.log('*****Client connected.');
    //     console.log('*****Sending boop.');
    //     socket.write('__boop');
    // })
}

export function StopSocket(){
    Server.close()
}

function checkFileSocketExist() {
    fs.stat(socketPath, function (err, stats) {
        // console.log(err);
        // console.log(stats);
        if (err == null) {
            console.log('******Removing leftover socket.')
            fs.unlink(socketPath, function(err){
                if(err){
                    // This should never happen.
                    console.error('*****',err); 
                    //process.exit(0);
                    return false;
                }
            });
        }
        return true;  
    });
}