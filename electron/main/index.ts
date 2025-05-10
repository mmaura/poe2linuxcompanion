import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import {StartSocket, StopSocket} from './socket'
import path from 'node:path'
import os from 'node:os'

console.log("** c'est parti **");
console.log('PID: %s', process.pid);

/*evite l'erreur
GTK 2/3 symbols detected. Using GTK 2/3 and GTK 4 in the same process is not supported
*/
app.commandLine.appendSwitch('gtk-version', '3');

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '../..')

export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

const preload = path.join(__dirname, '../preload/index.mjs')
//const preload = path.join(__dirname, '../preload/index.ts')
const MainWinindexHtml = path.join(RENDERER_DIST, 'main/index.html') // a tester en build
//const MainWinindexHtml = path.join(RENDERER_DIST, 'window-main/index.html')

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

/*
Gestion des insctances de l'application
 */
if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

/*
* Main Window
*/
let MainWindow: BrowserWindow | null = null

async function createWindow() {
  MainWindow = new BrowserWindow({
    title: 'POE2 Linux Companion - Loading',
    icon: path.join(process.env.VITE_PUBLIC, 'favicon.ico'),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // nodeIntegration: true,

      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // contextIsolation: false,
    },
    transparent: false,
    frame: true,
    width: 400,
    height: 400,
    resizable: false,
    movable: false,
    center: true,
    show: true,
    alwaysOnTop: true
  })

  if (VITE_DEV_SERVER_URL) { // #298
    console.log(`===>> ${VITE_DEV_SERVER_URL}src/window-main/index.html`)

    MainWindow.loadURL(`${VITE_DEV_SERVER_URL}src/window-main/index.html`)
    // Open devTool if the app is not packaged
    MainWindow.webContents.openDevTools()
  } else {
    MainWindow.loadFile(MainWinindexHtml)
  }

  // Test actively push message to the Electron-Renderer
  MainWindow.webContents.on('did-finish-load', () => {
    MainWindow?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  MainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
  // win.webContents.on('will-navigate', (event, url) => { }) #344

  MainWindow.on('close', ()=>{
    app.quit();
  })
}

app.whenReady().then(()=>{
  StartSocket();
  createWindow();
})

app.on('will-quit', () => {
  console.log('**** will quit');
  StopSocket();
  ConfigWindow = null
  MainWindow = null
  if (process.platform !== 'darwin') app.quit()
})


app.on('second-instance', () => {
  console.log('second');
  if (MainWindow) {
    // Focus on the main window if the user tried to open another
    if (MainWindow.isMinimized()) MainWindow.restore()
    MainWindow.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

/**
 * Config Window
 */
let ConfigWindow :BrowserWindow = null
const ConfigWinindexHtml = path.join(RENDERER_DIST, 'config/index.html')

ipcMain.handle('open-config-window', (_, arg) => {
  console.log("*** main ***")
  console.log(arg);

  if (ConfigWindow) {
    ConfigWindow.focus()
  }
  else{
    createConfigWindow();
  }
});


function createConfigWindow(){
  ConfigWindow = new BrowserWindow({
    webPreferences: {
      preload,
      //nodeIntegration: true,
      //contextIsolation: false,
    },
    transparent: false,
    frame: false,
    width: 400,
    height: 400,
    resizable: true,
    movable: true,
    center: true,
    show: true,
    alwaysOnTop: false
  })


  /**
   * Ne fonctionne pas, affiche le contenue de App.vue à la place de compnents/Config.vue
   */
  if (VITE_DEV_SERVER_URL) {
    console.log(`===>> ${VITE_DEV_SERVER_URL}src/window-config/index.html`)
    ConfigWindow.loadURL(`${VITE_DEV_SERVER_URL}src/window-config/index.html`);
  } else {
    ConfigWindow.loadFile(ConfigWinindexHtml);
    ConfigWindow.webContents.openDevTools()
  }
}