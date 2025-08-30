class Dialog {
  showErrorBox(title: string, content: string): void {
    alert(`❗ ${title}\n${content}`)
  }
}

class Remote {
  readonly dialog = new Dialog()
}

export const remote = new Remote()
