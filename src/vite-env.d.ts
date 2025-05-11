/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

interface Window {
  // expose in the `electron/preload/index.ts`
  ipcRenderer: import('electron').IpcRenderer;

  configuration: {
    ShowPoe2logFileDialog: (path: string) => Promise<string>;
    ShowWindow: () => void;
    sendPoe2LogFilePath: (path: any) => void;
    getPoe2LogFile: () => string;
  };

  clientlog: {
    onNewLine: (callback: (line: string) => void) => void;
  };
}
