import { exec } from 'child_process';
import { ipcMain } from 'electron';
import { promisify } from 'util';
import { GameCommands } from '../../../shared/ipc-events';

const execAsync = promisify(exec);

export async function Setup() {
  /**
   * Register Events
   *
   * */
  ipcMain.on(GameCommands.INVITE, (_, playername) => {
    TypePoe2Message(`/invite ${playername}`);
  });
  ipcMain.on(GameCommands.TRADE, (_, playername) => {
    TypePoe2Message(`/tradewith ${playername}`);
  });

  ipcMain.on('saythx-player', (_, playername) => {
    TypePoe2Message(`@${playername} Thx glhf !`);
  });
  ipcMain.on('ungroup-player', (_, playername) => {
    TypePoe2Message(`/kick ${playername}`);
  });
  ipcMain.on('saywait-player', (_, playername) => {
    TypePoe2Message(`@${playername} Plz wait 2 minutes.`);
  });
  ipcMain.on('gotohideout-player', (_, playername) => {
    TypePoe2Message(`/hideout ${playername}`);
  });
  ipcMain.on('returnhideout-player', (_) => {
    TypePoe2Message(`/hideout`);
  });
}

/**
 * Recherche la fenêtre par nom et retourne son ID.
 * @param {string} windowName - Le nom de la fenêtre à rechercher.
 * @returns {Promise<string>} - L'ID de la fenêtre.
 */
async function findWindowId(windowName: string): Promise<string> {
  try {
    const { stdout, stderr } = await execAsync(
      `xdotool search --name "${windowName}"`
    );

    if (stderr) {
      console.error(`stderr : ${stderr}`);
      throw new Error(stderr);
    }

    const windowId = stdout.trim();
    if (!windowId) {
      throw new Error(`Fenêtre "${windowName}" non trouvée.`);
    }

    return windowId;
  } catch (error: any) {
    console.error(`Erreur lors de la recherche de la fenêtre : ${error}`);
    throw error;
  }
}

/**
 * Active une fenêtre en utilisant son ID.
 * @param {string} windowId - L'ID de la fenêtre à activer.
 * @returns {Promise<void>}
 */
async function activateWindow(windowId: string): Promise<void> {
  try {
    const { stdout, stderr } = await execAsync(
      `xdotool windowactivate ${windowId}`
    );

    if (stderr) {
      console.error(`stderr : ${stderr}`);
      throw new Error(stderr);
    }

    // console.log(`Fenêtre activée avec succès : ${stdout.trim()}`);
  } catch (error: any) {
    console.error(`Erreur lors de l'activation de la fenêtre : ${error}`);
    throw error;
  }
}

/**
 * Simule la frappe d'une chaîne de caractères.
 * @param {string} text - Le texte à simuler.
 */

// async function typeText(text: string): Promise<void> {
//   try {
//     let cmd: string[] = [];
//     cmd.push('/usr/bin/ydotool key -d 40 96:1 96:0'); // RETURN
//     switch (text.at(0)) {
//       case '/':
//         cmd.push('/usr/bin/ydotool key -d 40 98:1 98:0'); // SLASH
//         break;
//       case '@':
//         cmd.push('/usr/bin/ydotool key -d  100:1 11:1 11:0 100:0'); // SLASH
//         break;
//     }

//     cmd.push(`/usr/bin/ydotool type -d 40 ${text.substring(1)}`);
//     cmd.push('/usr/bin/ydotool key -d 40 96:1 96:0'); // RETURN
//     console.log(cmd.join(' && sleep 0.1 && '));
//     await execcmd(cmd.join(' && sleep 0.1 && '));
//   } catch (error: any) {
//     console.error(`Erreur lors de la simulation de la frappe : ${error}`);
//     throw error;
//   }
// }

async function typeText(text: string): Promise<void> {
  try {
    let cmd: string[] = [];
    cmd.push('/usr/bin/ydotool key -d 40 96:1 96:0'); // RETURN

    //ydotool is evil with internationalisation clipboard do the job
    const escapedText = text.replace(/["'`\\$]/g, '\\$&'); // Échapper les caractères spéciaux
    cmd.push(`printf "%s" "${escapedText}" | wl-copy`);

    cmd.push(`/usr/bin/ydotool key -d 60 29:1 47:1 47:0 29:0`); // CTLR + V

    cmd.push('/usr/bin/ydotool key -d 40 96:1 96:0'); // RETURN
    console.log(cmd.join(' && sleep 0.1 && '));
    await execcmd(cmd.join(' && sleep 0.1 && '));
  } catch (error: any) {
    console.error(`Erreur lors de la simulation de la frappe : ${error}`);
    throw error;
  }
}

async function execcmd(cmd) {
  const { stdout, stderr } = await execAsync(cmd);

  if (stderr) {
    console.error(`stderr : ${stderr}`);
    throw new Error(stderr);
  }
}

async function TypePoe2Message(line: string) {
  try {
    const poe2 = await findWindowId('Path of Exile 2');
    await activateWindow(poe2);
    setTimeout(() => {
      typeText(line);
    }, 120);
  } catch (error) {
    console.error('Erreur dans TypePoe2Message :', error);
  }
}
