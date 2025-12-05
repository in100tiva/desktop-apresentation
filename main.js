const { app, BrowserWindow, globalShortcut, ipcMain, screen, Tray, Menu, nativeImage } = require('electron');
const path = require('path');

let mainWindow = null;
let tray = null;
let isDrawingMode = true;

function createWindow() {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;

    mainWindow = new BrowserWindow({
        width: width,
        height: height,
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
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    // Permite que cliques passem através da janela quando não estiver desenhando
    mainWindow.setIgnoreMouseEvents(false);

    mainWindow.loadFile('index.html');

    // Esconder em vez de fechar
    mainWindow.on('close', (event) => {
        if (!app.isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
    });

    // Criar tray icon
    createTray();

    // Registrar atalhos globais
    registerShortcuts();
}

function createTray() {
    // Criar um ícone simples para o tray
    const iconPath = path.join(__dirname, 'assets', 'tray-icon.png');

    // Criar ícone programaticamente se não existir
    const icon = nativeImage.createFromDataURL(`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAA7AAAAOwBeShxvQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAKkSURBVFiF7ZdLiFVRGMd/35kxHZsyK6eHDyhrISHRpk1QJBRJi8hFUNQiooVB7aJNq2oZtYkgqE0PchFBD6hFhEW0CNq0qJQeZpY5znhnzjm3xZk7c++ce+/MnYlW/eHAcL7v/L//d757LvwP/6nwT0O+BPXJ4K5JY7Fpl6j+o+nfAvwM7Ik0bk+L2QD8CDBExL0MPQc4ImL2VLZBMa8MXQX8ArwDHAfm5NLnkf+zWkj1x+AwcBDYDUhD8yJwDLgFeD0zfy9wLK3fDPQBl4BXRV1gMvAIcDlwGMCyNH4E+ABYYyZwCNgNrAF+z8w/BzwLPAm0lGhYAjyE8iLwdlr/CjAy2P8icANwO/BbZn5fxBGRC4CNwD0ot6bmfwVoA74FfjKzrAXWRuKtNO1y0vdK1F6hupuazEtl5l8A/gKcS4CXXBX1M/NfAi4DThvWJifwfmBjTvVfA78D7xJwLXB/TnYJMBnlS5Q3IuASlMdJHkR5L0LZBZyN8h6wA/gLZTtwTZayR2A8eFXm/5fABeCfTNoI4AjKN8DRKM+RvBixH5gAnA/sAHpQ9qOcA1yG8g7wdUR8lxh7IHZFyqeA80hOg3XA6cC3hFyYU+0VqifxXj5B+T1KN8oY4FhgM3AVcCXKN8DTwCkZ1RYBpxPwAMpU4CRgOXA88CtwdAR8AngTuBS4AeVZlBuBq4DLUb4l4H6Up0jORY0D1gBHAz+T/PdEYBJwNuH/t8Ai4EiSnxUnAecAe1B+R+pB+BOYR8APwBfALuD6dPtYB/QAl6LsJnkHVPcAJ6PsQ3kR+DGj2lyS/y1JAT4GRqfGfxN8gPJsRtYLnAH8RHIqbkK5DuXrjOrDKJMjdD/KvSgLgSU53T4AzgL+BC4EFuRk/2sI/u3yVvvtmLsAAAAASUVORK5CYII=`);

    tray = new Tray(icon);

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Mostrar/Ocultar',
            click: () => {
                if (mainWindow.isVisible()) {
                    mainWindow.hide();
                } else {
                    mainWindow.show();
                }
            }
        },
        {
            label: 'Modo Desenho (Ctrl+Shift+D)',
            type: 'checkbox',
            checked: isDrawingMode,
            click: (menuItem) => {
                toggleDrawingMode();
                menuItem.checked = isDrawingMode;
            }
        },
        {
            label: 'Limpar Tela (Ctrl+Shift+C)',
            click: () => {
                mainWindow.webContents.send('clear-canvas');
            }
        },
        { type: 'separator' },
        {
            label: 'Sair',
            click: () => {
                app.isQuitting = true;
                app.quit();
            }
        }
    ]);

    tray.setToolTip('Screen Annotator');
    tray.setContextMenu(contextMenu);

    tray.on('double-click', () => {
        if (mainWindow.isVisible()) {
            mainWindow.hide();
        } else {
            mainWindow.show();
        }
    });
}

function registerShortcuts() {
    // Toggle modo desenho
    globalShortcut.register('CommandOrControl+Shift+D', () => {
        toggleDrawingMode();
    });

    // Limpar canvas
    globalShortcut.register('CommandOrControl+Shift+C', () => {
        mainWindow.webContents.send('clear-canvas');
    });

    // Mostrar/ocultar janela
    globalShortcut.register('CommandOrControl+Shift+A', () => {
        if (mainWindow.isVisible()) {
            mainWindow.hide();
        } else {
            mainWindow.show();
        }
    });

    // Desfazer
    globalShortcut.register('CommandOrControl+Z', () => {
        if (mainWindow.isVisible() && isDrawingMode) {
            mainWindow.webContents.send('undo');
        }
    });

    // Refazer
    globalShortcut.register('CommandOrControl+Y', () => {
        if (mainWindow.isVisible() && isDrawingMode) {
            mainWindow.webContents.send('redo');
        }
    });

    // Ferramenta caneta
    globalShortcut.register('CommandOrControl+1', () => {
        mainWindow.webContents.send('set-tool', 'pen');
    });

    // Ferramenta marcador
    globalShortcut.register('CommandOrControl+2', () => {
        mainWindow.webContents.send('set-tool', 'highlighter');
    });

    // Ferramenta retângulo
    globalShortcut.register('CommandOrControl+3', () => {
        mainWindow.webContents.send('set-tool', 'rectangle');
    });

    // Ferramenta círculo
    globalShortcut.register('CommandOrControl+4', () => {
        mainWindow.webContents.send('set-tool', 'circle');
    });

    // Ferramenta seta
    globalShortcut.register('CommandOrControl+5', () => {
        mainWindow.webContents.send('set-tool', 'arrow');
    });

    // Ferramenta linha
    globalShortcut.register('CommandOrControl+6', () => {
        mainWindow.webContents.send('set-tool', 'line');
    });

    // Borracha
    globalShortcut.register('CommandOrControl+E', () => {
        mainWindow.webContents.send('set-tool', 'eraser');
    });

    // Spotlight
    globalShortcut.register('CommandOrControl+Shift+S', () => {
        mainWindow.webContents.send('toggle-spotlight');
    });
}

function toggleDrawingMode() {
    isDrawingMode = !isDrawingMode;
    mainWindow.setIgnoreMouseEvents(!isDrawingMode, { forward: true });
    mainWindow.webContents.send('drawing-mode-changed', isDrawingMode);
}

// IPC handlers
ipcMain.on('set-ignore-mouse', (event, ignore) => {
    mainWindow.setIgnoreMouseEvents(ignore, { forward: true });
});

ipcMain.on('minimize-to-tray', () => {
    mainWindow.hide();
});

ipcMain.on('toggle-drawing-mode', () => {
    toggleDrawingMode();
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});
