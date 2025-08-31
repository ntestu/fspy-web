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

import { ActionTypes, AppAction } from '../actions'
import { UIState } from '../types/ui-state'
import { defaultUIState } from '../defaults/ui-state'
import { ipcRenderer } from '../../main/electron-polyfill/ipc'
import { SetDocumentStateMessage } from '../ipc-messages'

export function uiState(state: UIState | undefined, action: AppAction): UIState {
  if (state === undefined) {
    return defaultUIState
  }

  // TODO: move these ipc calls somewhere else?

  switch (action.type) {
    case ActionTypes.SET_PROJECT_HAS_UNSAVED_CHANGES:
      ipcRenderer.send(
        SetDocumentStateMessage.type,
        new SetDocumentStateMessage(true, undefined, undefined)
      )
      return {
        ...state,
        projectHasUnsavedChanges: true
      }
    case ActionTypes.LOAD_DEFAULT_STATE:
      ipcRenderer.send(
        SetDocumentStateMessage.type,
        new SetDocumentStateMessage(false, null, false)
      )
      return {
        ...state,
        projectHasUnsavedChanges: false,
        projectName: null
      }
    case ActionTypes.SET_SIDE_PANEL_VISIBILITY:
      return {
        ...state,
        sidePanelsAreVisible: action.panelsAreVisible
      }
    case ActionTypes.LOAD_STATE:
      ipcRenderer.send(
        SetDocumentStateMessage.type,
        new SetDocumentStateMessage(
          false,
          action.projectName,
          action.isExampleProject
        )
      )
      return {
        ...state,
        projectHasUnsavedChanges: false,
        projectName: action.isExampleProject ? null : action.projectName
      }
    case ActionTypes.SET_IMAGE:
      const projectName = nameWithoutExtension(action.fileName)
      ipcRenderer.send(
        SetDocumentStateMessage.type,
        new SetDocumentStateMessage(undefined, projectName, undefined),
      )
      return {
        ...state,
        projectName: projectName,
      }
  }

  return state
}

function nameWithoutExtension(fileName: string): string {
  const end = fileName.indexOf('.')
  return end < 0 ? fileName : fileName.slice(0, end)
}
