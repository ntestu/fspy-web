import {
  MenuButton,
  MenuDivider,
  Menu as SzhsinMenu,
  MenuItem as SzhsinMenuItem,
  SubMenu as SzhsinSubMenu,
} from '@szhsin/react-menu'
import React from 'react'
import packageJson from '../../../../package.json' with { type: 'json' }
import {
  MenuItem as ElectronMenuItem,
  Menu,
  MenuItemAccelerator,
} from '../../../main/electron-polyfill/menu'
import { useObservableState } from '../../../main/electron-polyfill/observable-value'
import './menu-bar.css'

export default function MenuBar() {
  const menu = Menu.getApplicationMenu()
  const visible = useObservableState(menu.visible)

  if (!visible) {
    return null
  }

  return (
    <nav className="menu-bar">
      {menu.items.map((baseItem, index) => (
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
  const enabled = useObservableState(item.enabled)
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
  const enabled = useObservableState(item.enabled)
  return (
    <SzhsinMenuItem onClick={item.click} disabled={!enabled}>
      {renderMenuItemLabel(item)}
    </SzhsinMenuItem>
  )
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
