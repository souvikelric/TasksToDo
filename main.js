const { app, BrowserWindow, Menu, ipcMain } = require("electron");

process.env.NODE_ENV = "production";

let win;
let addWindow;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.loadFile("index.html");

  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

  Menu.setApplicationMenu(mainMenu);

  win.on("closed", () => {
    win = null;
    app.quit();
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on("item:add", (e, task) => {
  win.webContents.send("item:add", task);
  addWindow.close();
  addWindow = null;
});

function createAddWindow() {
  addWindow = new BrowserWindow({
    width: 400,
    height: 300,
    webPreferences: {
      nodeIntegration: true,
    },
    title: "Add Tasks",
    autoHideMenuBar: true,
  });

  addWindow.loadFile("addWindow.html");
}

function clearTasks() {
  win.webContents.send("tasks:clear");
}

const mainMenuTemplate = [
  {
    label: "File",
    submenu: [
      {
        label: "Add task",
        click() {
          createAddWindow();
        },
      },
      {
        label: "Clear Tasks",
        click() {
          clearTasks();
        },
      },
      {
        label: "Quit",
        accelerator: process.platform == "darwin" ? "Command+Q" : "Ctrl+Q",
        click() {
          app.quit();
        },
      },
    ],
  },
];

if (process.platform === "darwin") {
  mainMenuTemplate.unshift({});
}

if (process.env.NODE_ENV !== "production") {
  mainMenuTemplate.push({
    label: "Options",
    submenu: [
      {
        label: "Developer Tools",
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        },
      },
      {
        role: "reload",
      },
    ],
  });
}
