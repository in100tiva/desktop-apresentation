import { app, BrowserWindow, globalShortcut, ipcMain, screen, Tray, Menu, nativeImage } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import fs from 'fs'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let isDrawingMode = true

// Config path for shortcuts
const configPath = join(app.getPath('userData'), 'shortcuts.json')

// Load saved shortcuts
function loadShortcuts(): Record<string, unknown> {
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8')
      return JSON.parse(data)
    }
  } catch (e) {
    console.error('Error loading shortcuts:', e)
  }
  return {}
}

// Save shortcuts
function saveShortcuts(shortcuts: Record<string, unknown>): void {
  try {
    fs.writeFileSync(configPath, JSON.stringify(shortcuts, null, 2))
  } catch (e) {
    console.error('Error saving shortcuts:', e)
  }
}

function createWindow(): void {
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize

  mainWindow = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: false,
    resizable: false,
    fullscreen: false,
    hasShadow: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  mainWindow.setIgnoreMouseEvents(false)

  // Hide instead of close
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault()
      mainWindow?.hide()
    }
  })

  // HMR for renderer base on electron-vite cli
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  createTray()
  registerGlobalShortcuts()
}

function createTray(): void {
  // Create tray icon
  const icon = nativeImage.createFromDataURL(
    `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAA7AAAAOwBeShxvQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAKkSURBVFiF7ZdLiFVRGMd/35kxHZsyK6eHDyhrISHRpk1QJBRJi8hFUNQiooVB7aJNq2oZtYkgqE0PchFBD6hFhEW0CNq0qJQeZpY5znhnzjm3xZk7c++ce+/MnYlW/eHAcL7v/L//d757LvwP/6nwT0O+BPXJ4K5JY7Fpl6j+o+nfAvwM7Ik0bk+L2QD8CDBExL0MPQc4ImL2VLZBMa8MXQX8ArwDHAfm5NLnkf+zWkj1x+AwcBDYDUhD8yJwDLgFeD0zfy9wLK3fDPQBl4BXRV1gMvAIcDlwGMCyNH4E+ABYYyZwCNgNrAF+z8w/BzwLPAm0lGhYAjyE8iLwdlr/CjAy2P8icANwO/BbZn5fxBGRC4CNwD0ot6bmfwVoA74FfjKzrAXWRuKtNO1y0vdK1F6hupuazEtl5l8A/gKcS4CXXBX1M/NfAi4DThvWJifwfmBjTvVfA78D7xJwLXB/TnYJMBnlS5Q3IuASlMdJHkR5L0LZBZyN8h6wA/gLZTtwTZayR2A8eFXm/5fABeCfTNoI4AjKN8DRKM+RvBixH5gAnA/sAHpQ9qOcA1yG8g7wdUR8lxh7IHZFyqeA80hOg3XA6cC3hFyYU+0VqifxXj5B+T1KN8oY4FhgM3AVcCXKN8DTwCkZ1RYBpxPwAMpU4CRgOXA88CtwdAR8AngTuBS4AeVZlBuBq4DLUb4l4H6Up0jORY0D1gBHAz+T/PdEYBJwNuH/t8Ai4EiSnxUnAecAe1B+R+pB+BOYR8APwBfALuD6dPtYB/QAl6LsJnkHVPcAJ6PsQ3kR+DGj2lyS/y1JAT4GRqfGfxN8gPJsRtYLnAH8RHIqbkK5DuXrjOrDKJMjdD/KvSgLgSU53T4AzgL+BC4EFuRk/2sI/u3yVvvtmLsAAAAASUVORK5CYII=`
  )

  tray = new Tray(icon)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Mostrar/Ocultar',
      click: (): void => {
        if (mainWindow?.isVisible()) {
          mainWindow.hide()
        } else {
          mainWindow?.show()
        }
      },
    },
    {
      label: 'Modo Desenho',
      type: 'checkbox',
      checked: isDrawingMode,
      click: (menuItem): void => {
        toggleDrawingMode()
        menuItem.checked = isDrawingMode
      },
    },
    {
      label: 'Limpar Tela',
      click: (): void => {
        mainWindow?.webContents.send('clear-canvas')
      },
    },
    { type: 'separator' },
    {
      label: 'Configurar Atalhos',
      click: (): void => {
        mainWindow?.show()
        mainWindow?.webContents.send('open-settings')
      },
    },
    { type: 'separator' },
    {
      label: 'Sair',
      click: (): void => {
        app.isQuitting = true
        app.quit()
      },
    },
  ])

  tray.setToolTip('Screen Annotator')
  tray.setContextMenu(contextMenu)

  tray.on('double-click', (): void => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow?.show()
    }
  })
}

function registerGlobalShortcuts(): void {
  // Toggle drawing mode
  globalShortcut.register('CommandOrControl+Shift+D', () => {
    toggleDrawingMode()
  })

  // Show/hide window
  globalShortcut.register('CommandOrControl+Shift+A', () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow?.show()
    }
  })
}

function toggleDrawingMode(): void {
  isDrawingMode = !isDrawingMode
  mainWindow?.setIgnoreMouseEvents(!isDrawingMode, { forward: true })
  mainWindow?.webContents.send('drawing-mode-changed', isDrawingMode)
}

// IPC Handlers
ipcMain.on('set-ignore-mouse', (_event, ignore: boolean) => {
  mainWindow?.setIgnoreMouseEvents(ignore, { forward: true })
})

ipcMain.on('minimize-to-tray', () => {
  mainWindow?.hide()
})

ipcMain.on('toggle-drawing-mode', () => {
  toggleDrawingMode()
})

ipcMain.on('update-shortcuts', (_event, shortcuts: Record<string, unknown>) => {
  saveShortcuts(shortcuts)
})

// App lifecycle
app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.screenannotator.app')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  loadShortcuts()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

// Extend app type
declare module 'electron' {
  interface App {
    isQuitting?: boolean
  }
}
