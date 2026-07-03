const { contextBridge, ipcRenderer } = require('electron')

console.log("PRELOAD LOADED")

contextBridge.exposeInMainWorld('electron', {
  exit: () => ipcRenderer.send('exit'),

  toggleFullscreen: (value) =>
    ipcRenderer.send('toggle-fullscreen', value),

  saveProject: (doors) =>
        ipcRenderer.invoke("save-project", doors),

    openProject: () =>
        ipcRenderer.invoke("open-project"),

    exportXml: (doors) =>
        ipcRenderer.invoke("export-xml", doors),

    loadDoorConfig: () =>
        ipcRenderer.invoke("load-door-config"),

    opencofe: () => ipcRenderer.invoke("cofe")
})
