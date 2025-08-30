import {
  MenuButton,
  MenuDivider,
  Menu as SzhsinMenu,
  MenuItem as SzhsinMenuItem,
  SubMenu as SzhsinSubMenu,
} from '@szhsin/react-menu'
import React, { useEffect, useState } from 'react'
import packageJson from '../../../../package.json' with { type: 'json' }
import {
  MenuItem as ElectronMenuItem,
  Menu,
  MenuItemAccelerator,
} from '../../../main/electron-polyfill/menu'
import './menu-bar.css'

export default function MenuBar() {
  return (
    <nav className="menu-bar">
      {Menu.getApplicationMenu().items.map((baseItem, index) => (
        <SzhsinMenu
          key={baseItem.id ?? index}
          menuButton={<MenuButton>{baseItem.label}</MenuButton>}
        >
          {baseItem.submenu.map(renderMenuItem)}
        </SzhsinMenu>
      ))}

      <SzhsinMenu menuButton={<MenuButton>Help</MenuButton>}>
        <SzhsinMenuItem href={packageJson.repository.url} target="_blank">
          GitHub
        </SzhsinMenuItem>
      </SzhsinMenu>

      <div style={{ flexGrow: 1 }} />

      <div className="version">{packageJson.version}</div>
    </nav>
  )
}

function renderMenuItem(item: ElectronMenuItem, index: number) {
  const key = item.id ?? index

  if (item.type === 'separator') {
    return <MenuDivider key={key} />
  } else if (hasSubMenu(item)) {
    return <SubMenu key={key} item={item} />
  } else {
    return <MenuItem key={key} item={item} />
  }
}

function SubMenu({ item }: { item: ElectronMenuItem }) {
  const enabled = useEnabledState(item)
  return (
    <SzhsinSubMenu
      label={renderMenuItemLabel(item)}
      onClick={item.click}
      disabled={!enabled}
    >
      {item.submenu.map(renderMenuItem)}
    </SzhsinSubMenu>
  )
}

function MenuItem({ item }: { item: ElectronMenuItem }) {
  const enabled = useEnabledState(item)
  return (
    <SzhsinMenuItem onClick={item.click} disabled={!enabled}>
      {renderMenuItemLabel(item)}
    </SzhsinMenuItem>
  )
}

function useEnabledState(item: ElectronMenuItem): boolean {
  const [enabled, setEnabled] = useState(item.enabled.get())
  useEffect(() => item.enabled.useListener(setEnabled), [item.enabled])
  return enabled
}

function renderMenuItemLabel(item: ElectronMenuItem) {
  let indicator: string | undefined

  if (hasSubMenu(item)) {
    indicator = '▸'
  } else if (item.accelerator) {
    indicator = formatAccelerator(item.accelerator)
  }

  if (indicator) {
    return (
      <>
        {item.label} <div className="menu-indicator">{indicator}</div>
      </>
    )
  } else {
    return item.label
  }
}

function hasSubMenu(item: ElectronMenuItem) {
  return item.submenu.length > 0
}

function formatAccelerator(accelerator: MenuItemAccelerator): string {
  const parts: string[] = []

  if (accelerator.control) {
    parts.push('Ctrl')
  }

  if (accelerator.shift) {
    parts.push('Shift')
  }

  parts.push(accelerator.key)
  return parts.join('+')
}
