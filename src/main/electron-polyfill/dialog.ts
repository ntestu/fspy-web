import { Buffer } from 'buffer'

type OpenDialogOptions = {
  /**
   * Files to accept as defined by the [`accept` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/accept).
   */
  accept: string
  properties: 'openFile'[]
}

type OpenDialogReturnValue =
  | {
      canceled: true
    }
  | {
      canceled: false
      filePaths: string[]
      buffers: Buffer<ArrayBuffer>[]
    }

type SaveDialogReturnValue =
  | {
      canceled: true
    }
  | {
      canceled: false
      filePath: string
    }

class Dialog {
  showMessageBoxSync(message: string): 0 | 1 {
    return confirm(message) ? 0 : 1
  }

  showOpenDialog(options: OpenDialogOptions): Promise<OpenDialogReturnValue> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = options.accept

      input.addEventListener('change', () => {
        const files = input.files
        if (files) {
          Promise.all(
            Array.from(files, file => file.arrayBuffer().then(Buffer.from)),
          )
            .then(buffers => {
              resolve({
                canceled: false,
                filePaths: Array.from(files, file => file.name),
                buffers,
              })
            })
            .catch(reject)
        } else {
          resolve({ canceled: true })
        }
      })

      input.addEventListener('cancel', () => resolve({ canceled: true }))

      input.click()
    })
  }

  showSaveDialog(options: object): Promise<SaveDialogReturnValue> {
    // TODO(ntestu)
    return Promise.resolve({ canceled: true })
  }
}

export const dialog = new Dialog()
