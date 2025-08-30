class Clipboard {
  async writeText(text: string): Promise<void> {
    await navigator.clipboard.writeText(text)
  }
}

export const clipboard = new Clipboard()
