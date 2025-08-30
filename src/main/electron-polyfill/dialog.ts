type OpenDialogOptions = {
  filters?: {
    name: string
    extensions: string[]
  }[]
  properties: 'openFile'[]
}

type OpenDialogReturnValue = {
  canceled: boolean
  filePaths: string[]
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
    // TODO
    return Promise.resolve({
      canceled: true,
      filePaths: [],
    })
  }

  showSaveDialog(options: object): Promise<SaveDialogReturnValue> {
    // TODO
    return Promise.resolve({ canceled: true })
  }
}

export const dialog = new Dialog()
