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

// TODO: move everything somewhere else
import { dialog } from 'electron'
import { OpenProjectMessage, OpenImageMessage, SaveProjectMessage, SaveProjectAsMessage, NewProjectMessage, ExportMessage, ExportType, SetSidePanelVisibilityMessage } from './ipc-messages'

import { SpecifyProjectPathMessage, SpecifyExportPathMessage, SetDocumentStateMessage, OpenDroppedProjectMessage } from '../gui/ipc-messages'
import { basename } from 'path'
import AppMenuManager from './app-menu-manager'
import ProjectFile from '../gui/io/project-file'
import { openSync, writeSync, closeSync } from 'fs'
import { BrowserWindow } from './electron-polyfill/browser-window'
import { ipcMain } from './electron-polyfill/ipc'

let mainWindow: BrowserWindow | null = null

export interface DocumentState {
  hasUnsavedChanges: boolean
  filePath: string | null,
  isExampleProject: boolean
}

let documentState: DocumentState | null = null

let initialOpenMessage: OpenProjectMessage | null = null

function openProject(path: string, window: BrowserWindow) {
  window.webContents.send(
    OpenProjectMessage.type,
    new OpenProjectMessage(path, false)
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
            if (mainWindow) {
              dialog.showOpenDialog(
                mainWindow,
                {
                  filters: [
                    { name: 'fSpy project files', extensions: ['fspy'] }
                  ],
                  properties: ['openFile']
                }
              ).then((result) => {
                if (!result.canceled) {
                  openProject(result.filePaths[0], window)
                }
              }).catch((_) => {
                //
              })
            } else {
              dialog.showOpenDialog(
                {
                  filters: [
                    { name: 'fSpy project files', extensions: ['fspy'] }
                  ],
                  properties: ['openFile']
                }
              ).then((result) => {
                if (!result.canceled) {
                  initialOpenMessage = new OpenProjectMessage(result.filePaths[0], false)
                  createWindow()
                }
              }).catch((_) => {
                //
              })
            }
          }
        })
      },
      onSaveProject: () => {
        window.webContents.send(
          SaveProjectMessage.type,
          new SaveProjectMessage()
        )
      },
      onSaveProjectAs: () => {
        dialog.showSaveDialog(
          window,
          {}
        ).then((result) => {
          if (!result.canceled && result.filePath !== undefined) {
            window.webContents.send(
              SaveProjectAsMessage.type,
              new SaveProjectAsMessage(result.filePath)
            )
          }
        }).catch((_) => {
          //
        })
      },
      onOpenImage: () => {
        dialog.showOpenDialog(
          window,
          {
            properties: ['openFile']
          }
        ).then((result) => {
          if (!result.canceled) {
            window.webContents.send(
              OpenImageMessage.type,
              new OpenImageMessage(result.filePaths[0])
            )
          }
        }).catch((_) => {
          //
        })
      },
      onOpenExampleProject: () => {
        showDiscardChangesDialogIfNeeded((didCancel: boolean) => {
          if (!didCancel) {
            let projectPath = ProjectFile.exampleProjectPath
            if (mainWindow) {
              window.webContents.send(
                OpenProjectMessage.type,
                new OpenProjectMessage(projectPath, true)
              )
            } else {
              initialOpenMessage = new OpenProjectMessage(projectPath, true)
              createWindow()
            }
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
        window.webContents.send(
          SetSidePanelVisibilityMessage.type,
          new SetSidePanelVisibilityMessage(false)
        )
        window.setFullScreen(true)
      },
      onExitFullScreenMode: () => {
        window.webContents.send(
          SetSidePanelVisibilityMessage.type,
          new SetSidePanelVisibilityMessage(true)
        )
        window.setFullScreen(false)
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

    if (initialOpenMessage) {
      window.webContents.send(
        OpenProjectMessage.type,
        new OpenProjectMessage(initialOpenMessage.filePath, false)
      )
    }
  })

  Menu.setApplicationMenu(appMenuManager.menu)
  appMenuManager.setExitFullScreenItemEnabled(false)

  window.on('close', (event: Event) => {
    showDiscardChangesDialogIfNeeded((didCancel: boolean) => {
      if (didCancel) {
        event.preventDefault()
      }
    })
  })

  window.on('enter-full-screen', (_: Event) => {
    appMenuManager.setEnterFullScreenItemEnabled(false)
    appMenuManager.setExitFullScreenItemEnabled(true)
    window.setMenuBarVisibility(false)
  })

  window.on('leave-full-screen', (_: Event) => {
    window.webContents.send(
      SetSidePanelVisibilityMessage.type,
      new SetSidePanelVisibilityMessage(true)
    )
    appMenuManager.setEnterFullScreenItemEnabled(true)
    appMenuManager.setExitFullScreenItemEnabled(false)
    window.setMenuBarVisibility(true)
  })

  ipcMain.on(SpecifyProjectPathMessage.type, (_: any, __: SpecifyProjectPathMessage) => {
    // TODO: DRY
    dialog.showSaveDialog(
      window,
      {}
    ).then((result) => {
      if (!result.canceled && result.filePath) {
        window.webContents.send(
          SaveProjectAsMessage.type,
          new SaveProjectAsMessage(result.filePath)
        )
      }
    }).catch((_) => {
      //
    })
  })

  ipcMain.on(SpecifyExportPathMessage.type, (_: any, message: SpecifyExportPathMessage) => {
    // TODO: DRY
    dialog.showSaveDialog(
      window,
      {}
    ).then((result) => {
      if (!result.canceled && result.filePath) {
        let file = openSync(result.filePath, 'w')
        writeSync(file, message.data)
        closeSync(file)
      }
    }).catch((_) => {
      //
    })
  })

  ipcMain.on(OpenDroppedProjectMessage.type, (_: any, message: OpenDroppedProjectMessage) => {
    showDiscardChangesDialogIfNeeded((didCancel: boolean) => {
      if (!didCancel) {
        openProject(message.filePath, window)
      }
    })
  })

  function refreshTitle() {
    let title = 'Untitled'

    if (documentState !== null) {
      if (documentState.isExampleProject) {
        title = 'Example project'
      } else if (documentState.filePath !== null) {
        title = basename(documentState.filePath)
      }

      if (documentState.hasUnsavedChanges) {
        title += ' (modified)'
      }
    }

    title += ' - fSpy'
    document.title = title
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
    // TODO
    callback(false)
    // let result = dialog.showMessageBoxSync(
    //   window!,
    //   {
    //     type: 'question',
    //     buttons: ['Discard', 'Cancel'],
    //     title: 'Proceed?',
    //     message: 'Do you want to discard unsaved changes?'
    //   }
    // )
    // callback(result != 0)
  } else {
    callback(false)
  }
}
