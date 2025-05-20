import { ipcMain } from 'electron';
import { Buyer, Message } from '../../../shared/types';
import { ClientLog, LogProcessor } from '../../../shared/ipc-events';

const Map = {
  fr: {
    lang: 'Francais',
    from: 'De',
    buyerMsg:
      `([0-9]{4}/[0-9]{2}/[0-9]{2} ?[0-9]{2}:[0-9]{2}:[0-9]{2}) ` + // Date/heure
      `[0-9]+ [a-z0-9]+ ` + // ces deux blocs : "311884 3ef23365"
      `\\[INFO Client [0-9]+\\] ` + // tag
      `@(De|À) ` + // "De" ou "À"
      `(?:<(\\S+)> )?` + // pseudo optionnel
      `(\\S+): ` +
      `Bonjour, je souhaiterais t'acheter (.+?) pour ([0-9]+) (.+?) dans la ligue (.+?) ` +
      `\\(onglet de réserve "(.*?)" ; ([0-9]+)e en partant de la gauche, ([0-9]+)e en partant du haut\\)`,
    WispMsg:
      `([0-9]{4}/[0-9]{2}/[0-9]{2} ?[0-9]{2}:[0-9]{2}:[0-9]{2}) ` + // Date/heure
      `[0-9]+ [a-z0-9]+ ` + // ces deux blocs : "311884 3ef23365"
      `\\[INFO Client [0-9]+\\] ` + // tag
      `@(De|À) ` + // "De" ou "À"
      `(?:<(\\S+)> )?` + // pseudo optionnel
      `(\\S+): (.*)`,
    playerArrival:
      `([0-9]{4}/[0-9]{2}/[0-9]{2} ?[0-9]{2}:[0-9]{2}:[0-9]{2}) ` + // Date/heure
      `[0-9]+ [a-z0-9]+ ` +
      `\\[INFO Client [0-9]+\\] ` +
      `: (.*) a rejoint la zone.`, //playername
    playerDeparture:
      `([0-9]{4}/[0-9]{2}/[0-9]{2} ?[0-9]{2}:[0-9]{2}:[0-9]{2}) ` + // Date/heure
      `[0-9]+ [a-z0-9]+ ` +
      `\\[INFO Client [0-9]+\\] ` +
      `: (.*) a quitté la zone.`, //playername
  },
  // 'en': {
  //   lang: 'English',
  // },
};

export const createLogProcessors = (lang: string) => {
  const currentLangMap = Map[lang] ?? Map['fr'];

  ipcMain.on(LogProcessor.RUN_TEST1, async () => {
    for (const value of Test1[lang]) {
      ipcMain.emit(ClientLog.NEW_LOG_LINE, {}, value); // ipcMain.emit('channel', event, ...args)
      await new Promise((resolve) => setTimeout(resolve, 1000)); // pause de 1000 ms
    }
  });

  const wispRegExp = new RegExp(currentLangMap.wispMsg, 'i');
  const buyerRegExp = new RegExp(currentLangMap.buyerMsg, 'i');
  const playerArrivalRegExp = new RegExp(currentLangMap.playerArrival, 'i');
  const playerDepartureRegExp = new RegExp(currentLangMap.playerDeparture, 'i');

  return [
    {
      //demande d'achat
      regex: buyerRegExp,
      process: (line: string) => {
        console.log('buyer');
        const buyerResult = buyerRegExp.exec(line);
        if (buyerResult) {
          const [
            ,
            date,
            direction,
            optionalNick,
            playername,
            objet,
            prixQ,
            prixC,
            league,
            tab,
            xpos,
            ypos,
          ] = buyerResult;

          const buyer: Buyer = {
            currentAction: 'invite',
            date: new Date(date),
            direction: 'sell',
            playername: playername,
            playerIsHere: false,
            price: {
              currency: prixC,
              quantity: Number(prixQ),
            },
            objet: objet,
            league: league,
            tab: tab,
            xpos: Number(xpos),
            ypos: Number(ypos),
            messages: [
              /* {
                date: new Date(date),
                direction: direction == currentLangMap.from ? 'from' : 'to',
                message: msg,
              },
             */
            ],
          };
          ipcMain.emit(LogProcessor.NEW_BUYER, {}, buyer); // ipcMain.emit('channel', event, ...args)
        }
      },
    },
    {
      //Wisp
      regex: wispRegExp,
      process: (line: string) => {
        const wispResult = wispRegExp.exec(line);
        if (wispResult) {
          const [, date, direction, optionalNick, playername, msg] = wispResult;
          let message: Message = {
            date: new Date(date),
            direction: direction == currentLangMap.from ? 'from' : 'to',
            message: msg,
          };
          ipcMain.emit(LogProcessor.WISP, {}, playername, message);
        }
      },
    },
    {
      //Player Arrive
      regex: playerArrivalRegExp,
      process: (line: string) => {
        const arrivalResult = playerArrivalRegExp.exec(line);
        //Player arrive
        if (arrivalResult) {
          const [, date, playername] = arrivalResult;
          ipcMain.emit(LogProcessor.PLAYER_ARRIVAL, {}, playername, date); // ipcMain.emit('channel', event, ...args)
        }
      },
    },
    {
      //Player repart
      regex: playerDepartureRegExp,
      process: (line: string) => {
        const departureResult = playerDepartureRegExp.exec(line);
        //Player part
        if (departureResult) {
          const [, date, playername] = departureResult;
          ipcMain.emit(LogProcessor.PLAYER_DEPARTURE, {}, playername, date);
        }
      },
    },
  ];
};

const Test1 = {
  fr: [
    '2025/05/01 16:05:12 311884 3ef23365 [INFO Client 188] @De Player1: Bonjour, je souhaiterais t\'acheter La Sentinelle, Bâton de combat gothique pour 1 alch dans la ligue Dawn of the Hunt (onglet de réserve "V1" ; 3e en partant de la gauche, 1e en partant du haut)',
    '2025/05/01 16:05:33 332799 3ef23365 [INFO Client 188] : Player1 a rejoint la zone.',
    '2025/05/01 16:05:52 351965 3ef23365 [INFO Client 188] : Échange annulé.',
    '2025/05/01 16:06:07 366893 3ef23365 [INFO Client 188] : Échange accepté.',
    '2025/05/01 16:06:13 373181 3ef23365 [INFO Client 188] @À Player1: thx',
    '2025/05/01 16:06:20 380448 3ef23365 [INFO Client 188] @À Player2: sold',
    '2025/05/01 16:05:12 311884 3ef23365 [INFO Client 188] @De Player3: Bonjour, je souhaiterais t\'acheter La Sentinelle, Bâton de combat gothique pour 1 alch dans la ligue Dawn of the Hunt (onglet de réserve "V1" ; 3e en partant de la gauche, 1e en partant du haut)',
    '2025/05/01 16:05:33 332799 3ef23365 [INFO Client 188] : Player3 a rejoint la zone.',
    '2025/05/01 16:05:52 351965 3ef23365 [INFO Client 188] : Échange annulé.',
    '2025/05/01 16:06:07 366893 3ef23365 [INFO Client 188] : Échange accepté.',
    '2025/05/01 16:06:24 384678 3ef23365 [INFO Client 188] : Player1 a quitté la zone.',
    '2025/05/01 16:06:24 384678 3ef23365 [INFO Client 188] : Player2 a quitté la zone.',
  ],
  en: [],
};
