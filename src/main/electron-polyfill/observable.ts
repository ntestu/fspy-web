type Listener<T> = (newValue: T) => void

export class Observable<T> {
  private value: T
  private readonly listeners = new Set<Listener<T>>()

  constructor(value: T) {
    this.value = value
  }

  get(): T {
    return this.value
  }

  set(newValue: T): void {
    this.value = newValue
    for (const listener of this.listeners) {
      listener(newValue)
    }
  }

  addListener(listener: Listener<T>): void {
    this.listeners.add(listener)
  }

  removeListener(listener: Listener<T>): void {
    this.listeners.delete(listener)
  }

  /**
   * Adds a listener and returns a function that will remove the listener when called, for use with React's `useEffect`.
   */
  useListener(listener: Listener<T>): () => void {
    this.addListener(listener)
    return () => this.removeListener(listener)
  }
}
