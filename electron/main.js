import { app, BrowserWindow, dialog, shell, ipcMain } from "electron";
import fs from "fs";
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let win

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (!app.isPackaged) {
    win.loadURL('http://localhost:5173')
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(createWindow)

// IPC
ipcMain.on('exit', () => {
  app.quit()
})

ipcMain.on('toggle-fullscreen', (_, value) => {
  const win = BrowserWindow.getFocusedWindow()
  if (win) win.setFullScreen(value)
})


ipcMain.handle("save-project", async (_, doors) => {

    const result = await dialog.showSaveDialog({
        filters: [
            {
                name: "FM Door Audio",
                extensions: ["ftda"]
            }
        ]
    });

    if (result.canceled)
        return false;

    fs.writeFileSync(
        result.filePath,
        JSON.stringify(doors, null, 4)
    );

    return true;

});

ipcMain.handle("load-door-config", async () => {
  const file = path.join(process.resourcesPath, "door.json");

  console.log("DIR:", __dirname);
  console.log("FILE:", file);
  console.log("EXISTS:", fs.existsSync(file));

  if (!fs.existsSync(file)) {
    return { availableDoorSound: [] };
  }

  return JSON.parse(fs.readFileSync(file, "utf8"));
});

ipcMain.handle("open-project", async () => {

    const result = await dialog.showOpenDialog({
        properties: ["openFile"],
        filters: [
            {
                name: "FM Door Audio",
                extensions: ["ftda"]
            }
        ]
    });

    if (result.canceled)
        return null;

    return JSON.parse(
        fs.readFileSync(result.filePaths[0], "utf8")
    );

});

ipcMain.handle("cofe", async () => {
    await shell.openExternal("https://ko-fi.com/fintools");
});

ipcMain.handle("export-xml", async (_, doors) => {
  const crypto = await import("crypto");

  function joaat(str) {
    let hash = 0;

    for (let i = 0; i < str.length; i++) {
      hash += str.toLowerCase().charCodeAt(i);
      hash += hash << 10;
      hash ^= hash >> 6;
    }

    hash += hash << 3;
    hash ^= hash >> 11;
    hash += hash << 15;

    return (hash >>> 0).toString(16);
  }

  let xml = "";

  xml += `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<Dat151>\n`;
  xml += `  <Version value="9458585" />\n`;
  xml += `  <Items>\n`;

  for (const door of doors) {

    const hash = joaat(door.DoorName);

    xml += `    <Item type="DoorAudioSettings" ntOffset="0">\n`;
    xml += `      <Name>d_${door.DoorName}</Name>\n`;
    xml += `      <Sounds>${door.SoundSet}</Sounds>\n`;
    xml += `      <TuningParams>${door.Params}</TuningParams>\n`;
    xml += `      <MaxOcclusion value="${String(door.value).replace(".", ",")}" />\n`;
    xml += `    </Item>\n`;

    xml += `      <Door>d_${door.DoorName}</Door>\n`;

    xml += `    <Item type="DoorAudioSettingsLink" ntOffset="0">\n`;
    xml += `      <Name>dasl_${hash}</Name>\n`;
    xml += `      <Door>d_${door.DoorName}</Door>\n`;
    xml += `    </Item>\n`;
  }

  xml += `  </Items>\n`;
  xml += `</Dat151>`;

  const result = await dialog.showSaveDialog({
    defaultPath: "NewAudio.dat151.rel.xml",
    filters: [
      {
        name: "XML",
        extensions: ["xml"]
      }
    ]
  });

  if (result.canceled) return false;

  fs.writeFileSync(result.filePath, xml);

  return true;
});