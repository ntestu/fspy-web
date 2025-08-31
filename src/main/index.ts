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

import { OpenProjectMessage, OpenImageMessage, SaveProjectMessage, SaveProjectAsMessage, NewProjectMessage, ExportMessage, ExportType, SetSidePanelVisibilityMessage } from './ipc-messages'

import { SpecifyProjectPathMessage, SpecifyExportPathMessage, SetDocumentStateMessage, OpenDroppedProjectMessage } from '../gui/ipc-messages'
import AppMenuManager from './app-menu-manager'
import ProjectFile from '../gui/io/project-file'
// TODO(ntestu)
// import { openSync, writeSync, closeSync } from 'fs'
import { BrowserWindow } from './electron-polyfill/browser-window'
import { dialog } from './electron-polyfill/dialog'
import { ipcMain } from './electron-polyfill/ipc'
import { Menu } from './electron-polyfill/menu'
import { fetchBytesSync } from '../gui/io/util'
import type { Buffer } from 'buffer'

export interface DocumentState {
  hasUnsavedChanges: boolean
  filePath: string | null,
  isExampleProject: boolean
}

let documentState: DocumentState | null = null

createWindow()

function openProject(path: string, buffer: Buffer, window: BrowserWindow) {
  window.webContents.send(
    OpenProjectMessage.type,
    new OpenProjectMessage(path, buffer, false)
  )
}

function createWindow() {
  let window = new BrowserWindow();

  let appMenuManager = new AppMenuManager(
    {
      onNewProject: () => {
        showDiscardChangesDialogIfNeeded((didCancel: boolean) => {
          if (!didCancel) {
            window.webContents.send(
              NewProjectMessage.type,
              new NewProjectMessage()
            )
          }
        })
      },
      onOpenProject: () => {
        showDiscardChangesDialogIfNeeded((didCancel: boolean) => {
          if (!didCancel) {
            dialog.showOpenDialog(
              {
                accept: '.fspy',
                properties: ['openFile']
              }
            ).then((result) => {
              if (!result.canceled) {
                openProject(result.filePaths[0], result.buffers[0], window)
              }
            }).catch((error: unknown) => {
              console.error('Failed to open project', error)
            })
          }
        })
      },
      onSaveProject: () => {
        window.webContents.send(
          SaveProjectMessage.type,
          new SaveProjectMessage()
        )
      },
      onOpenImage: () => {
        dialog.showOpenDialog(
          {
            accept: 'image/*',
            properties: ['openFile']
          }
        ).then((result) => {
          if (!result.canceled) {
            window.webContents.send(
              OpenImageMessage.type,
              new OpenImageMessage(result.buffers[0])
            )
          }
        }).catch((error: unknown) => {
          console.error('Failed to open image', error)
        })
      },
      onOpenExampleProject: () => {
        showDiscardChangesDialogIfNeeded((didCancel: boolean) => {
          if (!didCancel) {
            let projectPath = ProjectFile.exampleProjectPath
            window.webContents.send(
              OpenProjectMessage.type,
              new OpenProjectMessage(projectPath, fetchBytesSync(projectPath), true)
            )
          }
        })
      },
      onExportJSON: () => {
        window.webContents.send(
          ExportMessage.type,
          new ExportMessage(ExportType.CameraParametersJSON)
        )
      },
      onExportProjectImage: () => {
        window.webContents.send(
          ExportMessage.type,
          new ExportMessage(ExportType.ProjectImage)
        )
      },
      onEnterFullScreenMode: () => {
        window.setFullScreen(true)
          .catch((error: unknown) => console.error('Failed to enter full screen:', error))
      },
      onExitFullScreenMode: () => {
        window.setFullScreen(false)
          .catch((error: unknown) => console.error('Failed to exit full screen:', error))
      }
    }
  )

  window.on('ready-to-show', () => {
    refreshTitle()

    documentState = {
      hasUnsavedChanges: false,
      filePath: null,
      isExampleProject: false
    }
  })

  Menu.setApplicationMenu(appMenuManager.menu)
  appMenuManager.setExitFullScreenItemEnabled(false)

  window.on('close', () => {
    showDiscardChangesDialogIfNeeded((didCancel: boolean) => {
      if (didCancel) {
        // TODO(ntestu)
        // event.preventDefault()
      }
    })
  })

  window.on('enter-full-screen', () => {
    window.webContents.send(
      SetSidePanelVisibilityMessage.type,
      new SetSidePanelVisibilityMessage(false)
    )
    appMenuManager.setEnterFullScreenItemEnabled(false)
    appMenuManager.setExitFullScreenItemEnabled(true)
    window.setMenuBarVisibility(false)
  })

  window.on('leave-full-screen', () => {
    window.webContents.send(
      SetSidePanelVisibilityMessage.type,
      new SetSidePanelVisibilityMessage(true)
    )
    appMenuManager.setEnterFullScreenItemEnabled(true)
    appMenuManager.setExitFullScreenItemEnabled(false)
    window.setMenuBarVisibility(true)
  })

  ipcMain.on(SpecifyProjectPathMessage.type, (_: any, __: SpecifyProjectPathMessage) => {
    dialog.showSaveDialog(
      {}
    ).then((result) => {
      if (!result.canceled && result.filePath) {
        window.webContents.send(
          SaveProjectAsMessage.type,
          new SaveProjectAsMessage(result.filePath)
        )
      }
    }).catch((error: unknown) => {
      console.error('Failed to save project:', error)
    })
  })

  ipcMain.on(SpecifyExportPathMessage.type, (_: any, message: SpecifyExportPathMessage) => {
    dialog.showSaveDialog(
      {}
    ).then((result) => {
      if (!result.canceled && result.filePath) {
        // TODO(ntestu)
        // let file = openSync(result.filePath, 'w')
        // writeSync(file, message.data)
        // closeSync(file)
      }
    }).catch((error: unknown) => {
      console.error('Failed to export data:', error)
    })
  })

  ipcMain.on(OpenDroppedProjectMessage.type, (_: any, message: OpenDroppedProjectMessage) => {
    showDiscardChangesDialogIfNeeded((didCancel: boolean) => {
      if (!didCancel) {
        openProject(message.filePath, message.buffer, window)
      }
    })
  })

  function refreshTitle() {
    document.title = generateTitle()
  }

  function generateTitle() {
    if (documentState === null) {
      return 'fSpy'
    } else {
      let title: string

      if (documentState.isExampleProject) {
        title = 'Example project'
      } else if (documentState.filePath !== null) {
        title = documentState.filePath
      } else {
        title = 'Untitled'
      }

      if (documentState.hasUnsavedChanges) {
        title += ' (modified)'
      }

      title += ' - fSpy'
      return title
    }
  }

  ipcMain.on(SetDocumentStateMessage.type, (_: any, message: SetDocumentStateMessage) => {
    if (documentState !== null) {
      if (message.filePath !== undefined) {
        documentState.filePath = message.filePath
      }
      if (message.hasUnsavedChanges !== undefined) {
        documentState.hasUnsavedChanges = message.hasUnsavedChanges
      }

      if (message.isExampleProject !== undefined) {
        documentState.isExampleProject = message.isExampleProject
        appMenuManager.setSaveItemEnabled(!message.isExampleProject)
      }
    }
    refreshTitle()
  })
}

function showDiscardChangesDialogIfNeeded(callback: (didCancel: boolean) => void) {
  if (documentState === null) {
    callback(false)
    return
  }

  if (documentState.hasUnsavedChanges) {
    let result = dialog.showMessageBoxSync('Do you want to discard unsaved changes?')
    callback(result != 0)
  } else {
    callback(false)
  }
}
