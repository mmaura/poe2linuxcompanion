import { dialog, ipcMain, net } from 'electron';
import { LogProcessor } from '../../../shared/ipc-events';
import { Buyer } from '../../../shared/types';
import AppStorage from './storage';

export async function Setup() {
  ipcMain.on(LogProcessor.NEW_BUYER, (_, buyer: Buyer) => {
    const enabled = AppStorage.get('ntfy_enabled');
    const url: string | '' = AppStorage.get('ntfy_url');
    const bearer = AppStorage.get('ntfy_authorization_bearer');
    //const channel = AppStorage.get('ntfy_channel');

    if (enabled) {
      if (!url || !bearer) {
        dialog.showErrorBox('Erreur de configuration', '');
        return;
      }

      const request = net.request({
        method: 'POST',
        url: url, //'https://api.example.com/data'
        headers: {
          Authorization: `Bearer ${bearer}`,
          Title: `vente`,
          Priority: '5',
          Tags: 'triangular_flag_on_post',
          Firebase: 'no',
        },
      });

      request.on('response', (response) => {
        console.log(`STATUS: ${response.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(response.headers)}`);

        let rawData = '';

        response.on('data', (chunk) => {
          rawData += chunk;
        });

        response.on('end', () => {
          try {
            console.log(`BODY: ${rawData}`);
            // const parsedData = JSON.parse(rawData); // Si la réponse est en JSON
            // console.log('Parsed Data:', parsedData);
          } catch (e: any) {
            console.error(`Error parsing data: ${e.message}`);
          }
        });
      });

      request.on('error', (error) => {
        console.error(`ERROR: ${JSON.stringify(error)}`);
      });

      request.write(
        `${buyer.playername} : ${buyer.objet} , ${buyer.price.quantity} x ${buyer.price.currency}`
      );

      request.end();
    }
  });
}
