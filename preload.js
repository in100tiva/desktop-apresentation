const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Enviar eventos para o main process
    setIgnoreMouse: (ignore) => ipcRenderer.send('set-ignore-mouse', ignore),
    minimizeToTray: () => ipcRenderer.send('minimize-to-tray'),
    toggleDrawingMode: () => ipcRenderer.send('toggle-drawing-mode'),

    // Receber eventos do main process
    onClearCanvas: (callback) => ipcRenderer.on('clear-canvas', callback),
    onUndo: (callback) => ipcRenderer.on('undo', callback),
    onRedo: (callback) => ipcRenderer.on('redo', callback),
    onSetTool: (callback) => ipcRenderer.on('set-tool', (event, tool) => callback(tool)),
    onToggleSpotlight: (callback) => ipcRenderer.on('toggle-spotlight', callback),
    onDrawingModeChanged: (callback) => ipcRenderer.on('drawing-mode-changed', (event, isDrawing) => callback(isDrawing))
});
