import { useEffect, useState } from 'react'

type Listener<T> = (newValue: T) => void

export class ObservableValue<T> {
  private value: T
  private readonly listeners = new Set<Listener<T>>()

  constructor(value: T) {
    this.value = value
  }

  get(): T {
    return this.value
  }

  set(newValue: T): void {
    if (this.value !== newValue) {
      this.value = newValue
      for (const listener of this.listeners) {
        listener(newValue)
      }
    }
  }

  addListener(listener: Listener<T>): void {
    this.listeners.add(listener)
  }

  removeListener(listener: Listener<T>): void {
    this.listeners.delete(listener)
  }
}

/**
 * React hook to register the current value in the component's state and update the state when the value changes.
 */
export function useObservableState<T>(ovservableValue: ObservableValue<T>): T {
    const [value, setValue] = useState(ovservableValue.get())
    useEffect(() => {
      ovservableValue.addListener(setValue)
      return () => ovservableValue.removeListener(setValue)
    }, [ovservableValue])
    return value
}
