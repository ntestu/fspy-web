import { Menu, MenuItem } from './menu'

export function addListenerForAccelerators(menu: Menu): void {
  const itemsByAcceleratorKey = new Map<string, MenuItem[]>()
  collectItemsByAcceleratorKey(menu.items, itemsByAcceleratorKey)

  addEventListener('keydown', event => {
    if (event.metaKey) {
      return
    }

    const key = normalizeKey(event.key)
    const items = itemsByAcceleratorKey.get(key)

    if (items !== undefined) {
      for (const item of items) {
        const accelerator = item.accelerator!
        if (
          item.enabled.get()
          && item.click
          && accelerator.control === event.ctrlKey
          && accelerator.alt === event.altKey
          && accelerator.shift === event.shiftKey
        ) {
          item.click()
          event.preventDefault()
        }
      }
    }
  })
}

function collectItemsByAcceleratorKey(
  items: readonly MenuItem[],
  itemsByAcceleratorKey: Map<string, MenuItem[]>,
): void {
  for (const item of items) {
    if (item.accelerator) {
      const key = normalizeKey(item.accelerator.key)
      let itemsForKey = itemsByAcceleratorKey.get(key)

      if (itemsForKey === undefined) {
        itemsForKey = []
        itemsByAcceleratorKey.set(key, itemsForKey)
      }

      itemsForKey.push(item)
    }

    collectItemsByAcceleratorKey(item.submenu, itemsByAcceleratorKey)
  }
}

function normalizeKey(key: string): string {
  return key.toLowerCase()
}
