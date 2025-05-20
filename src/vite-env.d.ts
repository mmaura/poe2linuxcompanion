/// <reference types="vite/client" />
//import { Buyer } from '../shared/types';

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

interface Window {
  // expose in the `electron/preload/index.ts`
  ipcRenderer: import('electron').IpcRenderer;

  app: {
    GetLocale: () => string;
  };

  configuration: {
    ShowPoe2logFileDialog: (path: string) => Promise<string>;
    ShowWindow: () => void;

    saveHotkey: (hotkey: string, feature: string) => void;
    sendPoe2LogFilePath: (path: string) => void;
    sendSidekickURL: (url: string) => void;
    sendPoe2RunAtStart: (run: boolean) => void;

    getPoe2RunAtStart: () => boolean;
    getPoe2LogFile: () => string;
    getSidekickURL: () => string;
    getPricecheckShortcut: () => string;
  };

  commerce: {
    onPushBuyer: (callback: (buyer: Buyer) => void) => void;
    onUpdateBuyer: (
      callback: (id: number, updates: Partial<Buyer>) => void
    ) => void;
  };
}
