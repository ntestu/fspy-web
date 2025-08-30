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

import { Buffer } from 'buffer'
import syncFetch from 'sync-fetch'

export function loadImage(
  imageBuffer: Buffer,
  onLoad: (width: number, height: number, url: string) => void,
  onError: () => void
) {
  let blob = new Blob([imageBuffer as any]) // TODO(ntestu): remove cast
  let url = URL.createObjectURL(blob)
  let image = new Image()
  image.src = url
  image.onload = (_: Event) => {
    onLoad(image.width, image.height, url)
  }
  image.onerror = (_) => {
    onError()
  }
}

export function resourceURL(fileName: string): string {
  // Leftover function from the original repo kept to minimize changes
  return resourcePath(fileName)
}

export function resourcePath(fileName: string): string {
  // Leftover function from the original repo kept to minimize changes
  // From https://vite.dev/guide/assets.html#the-public-directory: "Note that you should always reference public assets using root absolute path - for example, public/icon.png should be referenced in source code as /icon.png."
  return '/' + fileName
}

export function fetchBytesSync(url: string): Buffer {
  // TODO(ntestu): use async fetch instead
  return Buffer.from(syncFetch(url).arrayBuffer())
}
