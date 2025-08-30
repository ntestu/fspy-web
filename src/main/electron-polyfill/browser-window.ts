import { ipcRenderer } from './ipc'

type EventName =
  | 'ready-to-show'
  | 'close'
  | 'enter-full-screen'
  | 'leave-full-screen'

type Listener = () => void

export class BrowserWindow {
  readonly webContents = ipcRenderer
  private readonly enterFullScreenListeners: Listener[] = []
  private readonly leaveFullScreenListeners: Listener[] = []

  constructor() {
    addEventListener('fullscreenchange', () => {
      const listeners = document.fullscreenElement
        ? this.enterFullScreenListeners
        : this.leaveFullScreenListeners
      for (const listener of listeners) {
        listener()
      }
    })
  }

  on(event: EventName, listener: Listener): void {
    switch (event) {
      case 'ready-to-show':
        listener()
        break
      case 'close':
        // TODO
        break
      case 'enter-full-screen':
        this.enterFullScreenListeners.push(listener)
        break
      case 'leave-full-screen':
        this.leaveFullScreenListeners.push(listener)
        break
      default:
        event satisfies never
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new Error(`Unkown event name '${event}'`)
    }
  }

  isFullScreen(): boolean {
    return document.fullscreenElement !== null
  }

  async setFullScreen(fullscreen: boolean): Promise<void> {
    if (fullscreen !== this.isFullScreen()) {
      if (fullscreen) {
        await document.body.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    }
  }

  setMenuBarVisibility(visible: boolean): void {
    // TODO
  }
}
