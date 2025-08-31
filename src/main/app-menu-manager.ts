/**
 * fSpy
 * Copyright (c) 2020 - Per Gantelius
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { Menu, MenuItemConstructorOptions } from './electron-polyfill/menu'

export interface AppMenuCallbacks {
  onNewProject(): void
  onOpenProject(): void
  onSaveProject(): void
  onOpenImage(): void
  onOpenExampleProject(): void
  onExportJSON(): void
  onExportProjectImage(): void
  onEnterFullScreenMode(): void
  onExitFullScreenMode(): void
}

export default class AppMenuManager {
  readonly menu: Menu
  readonly callbacks: AppMenuCallbacks

  constructor(callbacks: AppMenuCallbacks) {
    this.callbacks = callbacks

    let newItem: MenuItemConstructorOptions = {
      label: 'New',
      // accelerator: { control: true, key: 'N' }, // (Can't override Ctrl+N in Chrome/Firefox)
      click: () => {
        this.callbacks.onNewProject()
      },
    }

    let openItem: MenuItemConstructorOptions = {
      label: 'Open',
      accelerator: { control: true, key: 'O' },
      click: () => {
        this.callbacks.onOpenProject()
      },
    }

    let saveItem: MenuItemConstructorOptions = {
      label: 'Save',
      id: 'save',
      accelerator: { control: true, key: 'S' },
      click: () => {
        this.callbacks.onSaveProject()
      },
    }

    let openExampleProjectItem: MenuItemConstructorOptions = {
      label: 'Open example project',
      id: 'open-example-project',
      click: () => {
        this.callbacks.onOpenExampleProject()
      },
    }

    let openImageItem: MenuItemConstructorOptions = {
      label: 'Open image',
      id: 'open-image',
      accelerator: { control: true, shift: true, key: 'O' },
      click: () => {
        this.callbacks.onOpenImage()
      },
    }

    let fileMenuItems: MenuItemConstructorOptions[] = [
      newItem,
      openItem,
      { type: 'separator' },
      openExampleProjectItem,
      openImageItem,
      { type: 'separator' },
      saveItem,
      { type: 'separator' },
      {
        label: 'Export',
        submenu: [
          {
            label: 'Camera parameters as JSON',
            click: () => {
              this.callbacks.onExportJSON()
            },
          },
          {
            label: 'Project image',
            click: () => {
              this.callbacks.onExportProjectImage()
            },
          },
        ],
      },
    ]

    let fileMenu: MenuItemConstructorOptions = {
      label: 'File',
      submenu: fileMenuItems,
    }

    let menus = [fileMenu]

    if (document.fullscreenEnabled) {
      let viewMenu: MenuItemConstructorOptions = {
        label: 'View',
        submenu: [
          {
            label: 'Enter full screen mode',
            id: 'enter-full-screen',
            accelerator: { alt: true, key: 'Enter' },
            click: () => {
              this.callbacks.onEnterFullScreenMode()
            },
          },
          {
            label: 'Exit full screen mode',
            id: 'exit-full-screen',
            accelerator: { key: 'Escape' },
            click: () => {
              this.callbacks.onExitFullScreenMode()
            },
          },
        ],
      }
      menus.push(viewMenu)
    }

    this.menu = Menu.buildFromTemplate(menus)
  }

  setOpenImageItemEnabled(enabled: boolean) {
    this.menu.getMenuItemById('open-image').enabled.set(enabled)
  }

  setSaveItemEnabled(enabled: boolean) {
    this.menu.getMenuItemById('save').enabled.set(enabled)
  }

  setSaveAsItemEnabled(enabled: boolean) {
    this.menu.getMenuItemById('save-as').enabled.set(enabled)
  }

  setEnterFullScreenItemEnabled(enabled: boolean) {
    this.menu.getMenuItemById('enter-full-screen').enabled.set(enabled)
  }

  setExitFullScreenItemEnabled(enabled: boolean) {
    this.menu.getMenuItemById('exit-full-screen').enabled.set(enabled)
  }
}
