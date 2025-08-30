type IpcListener = (event: any, ...args: any[]) => void

class IpcEventEmitter {
  private readonly listenersByChannel = new Map<string, IpcListener[]>()

  on(channel: string, listener: IpcListener): this {
    let listeners = this.listenersByChannel.get(channel)

    if (listeners === undefined) {
      listeners = []
      this.listenersByChannel.set(channel, listeners)
    }

    listeners.push(listener)
    return this
  }

  send(channel: string, ...args: any[]): void {
    const listeners = this.listenersByChannel.get(channel)

    if (listeners !== undefined) {
      for (const listener of listeners) {
        listener('unused', ...args)
      }
    }
  }
}

const ipcEventEmitter = new IpcEventEmitter()

export const ipcMain = ipcEventEmitter
export const ipcRenderer = ipcEventEmitter
