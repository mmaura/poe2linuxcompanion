import { app } from 'electron';
import path from 'path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
export const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, '../..');

export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

export const AppIconFile = getAbsPackagedPath('logo.png');

export const PRELOAD = path.join(__dirname, '../preload/index.mjs');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST;

export const Lang = app.getLocaleCountryCode().toLowerCase();

/**
 *
 * @returns the base absolute path of the packaged assets files
 */
export function getAbsPackagedPath(...arg): string {
  return app.isPackaged
    ? path.resolve(path.join(process.resourcesPath, 'dist', ...arg))
    : path.resolve(path.join(app.getAppPath(), 'dist', ...arg));
}
