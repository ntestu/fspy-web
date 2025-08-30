import { ipcRenderer } from './ipc'

export class BrowserWindow {
  readonly webContents = ipcRenderer
}
