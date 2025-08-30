import { Observable } from './observable'

type MenuItemType = 'separator'

export type MenuItemConstructorOptions = {
  type?: MenuItemType
  label?: string
  id?: string
  accelerator?: {
    control?: boolean
    shift?: boolean
    key: string
  }
  click?: () => void
  submenu?: MenuItemConstructorOptions[]
}

export class Menu {
  private static applicationMenu = new Menu([])

  readonly items: readonly MenuItem[]
  private readonly itemsById = new Map<string, MenuItem>()

  private constructor(items: MenuItem[]) {
    this.items = items
    this.indexItems(this.items)
  }

  private indexItems(items: readonly MenuItem[]): void {
    for (const item of items) {
      if (item.id) {
        this.itemsById.set(item.id, item)
      }

      this.indexItems(item.submenu)
    }
  }

  static buildFromTemplate(template: MenuItemConstructorOptions[]): Menu {
    return new Menu(template.map(item => new MenuItem(item)))
  }

  static setApplicationMenu(menu: Menu): void {
    Menu.applicationMenu = menu
  }

  static getApplicationMenu(): Menu {
    return Menu.applicationMenu
  }

  getMenuItemById(id: string): MenuItem {
    const item = this.itemsById.get(id)
    if (item) {
      return item
    } else {
      throw new Error(`No menu item with ID '${id}' found`)
    }
  }
}

export class MenuItem {
  readonly type?: MenuItemType
  readonly label?: string
  readonly id?: string
  readonly accelerator?: MenuItemAccelerator
  readonly click?: () => void
  readonly submenu: readonly MenuItem[]
  readonly enabled = new Observable(true)

  constructor(options: MenuItemConstructorOptions) {
    this.type = options.type
    this.label = options.label
    this.id = options.id
    this.accelerator = options.accelerator
      ? {
          control: options.accelerator.control ?? false,
          shift: options.accelerator.shift ?? false,
          key: options.accelerator.key,
        }
      : undefined
    this.click = options.click
    this.submenu =
      options.submenu?.map(subOptions => new MenuItem(subOptions)) ?? []
  }
}

export type MenuItemAccelerator = {
  control: boolean
  shift: boolean
  key: string
}
