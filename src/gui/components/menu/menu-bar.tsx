import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  SubMenu,
} from '@szhsin/react-menu'
import React from 'react'
import packageJson from '../../../../package.json' with { type: 'json' }
import {
  Menu as ElectronMenu,
  MenuItem as ElectronMenuItem,
  MenuItemAccelerator,
} from '../../../main/electron-polyfill/menu'
import './menu-bar.css'

export default function MenuBar() {
  return (
    <nav className="menu-bar">
      {ElectronMenu.getApplicationMenu().items.map((baseItem, index) => (
        <Menu
          key={baseItem.id ?? index}
          menuButton={<MenuButton>{baseItem.label}</MenuButton>}
        >
          {baseItem.submenu.map(renderMenuItem)}
        </Menu>
      ))}

      <Menu menuButton={<MenuButton>Help</MenuButton>}>
        <MenuItem href={packageJson.repository.url} target="_blank">
          GitHub
        </MenuItem>
      </Menu>

      <div style={{ flexGrow: 1 }} />

      <div className="version">{packageJson.version}</div>
    </nav>
  )
}

function renderMenuItem(item: ElectronMenuItem, index: number) {
  const id = item.id ?? index

  if (item.type === 'separator') {
    return <MenuDivider key={id} />
  } else if (hasSubMenu(item)) {
    return (
      <SubMenu
        key={id}
        label={renderMenuItemLabel(item)}
        onClick={item.click}
        disabled={!item.enabled}
      >
        {item.submenu.map(renderMenuItem)}
      </SubMenu>
    )
  } else {
    return (
      <MenuItem key={id} onClick={item.click} disabled={!item.enabled}>
        {renderMenuItemLabel(item)}
      </MenuItem>
    )
  }
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
