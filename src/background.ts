'use strict';

import { app, protocol, BrowserWindow, Menu, dialog, ipcMain, IpcMainInvokeEvent } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer';
import fs from 'fs';
import os from 'os';
import path from 'path';
// import { create } from 'domain';
// import { createPublicKey } from 'crypto';
const isDevelopment = process.env.NODE_ENV !== 'production';

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }]);

let win: BrowserWindow;
let currentFile: string | undefined;

async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1024,
    height: 768,
    minWidth: 1024,
    minHeight: 768,
    icon: './app-icon.png',
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: true, //  process.env.ELECTRON_NODE_INTEGRATION as unknown as boolean,
      contextIsolation: false //!process.env.ELECTRON_NODE_INTEGRATION
    }
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
    if (!process.env.IS_TEST) {
      win.webContents.openDevTools();
    }
  } else {
    createProtocol('app');
    // Load the index.html when not in development
    win.loadURL('app://./index.html');
  }
}

async function saveFileOnCallBack(event: IpcMainInvokeEvent, fileData: string) {
  if (currentFile) {
    await fs.promises.writeFile(currentFile, fileData, { encoding: 'utf8' });
  }
}

async function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New',
          accelerator: process.platform === 'darwin' ? 'Cmd+N' : 'Ctrl+N',
          click() {
            currentFile = undefined;
            console.log('New File...');
          }
        },
        {
          label: 'Open...',
          accelerator: process.platform === 'darwin' ? 'Cmd+O' : 'Ctrl+O',
          async click() {
            const files = await dialog.showOpenDialog(win, { title: 'Open', defaultPath: os.homedir() });
            if (!files.canceled) {
              const fil = files.filePaths[0];
              const fileData = await fs.promises.readFile(fil, { encoding: 'utf8' });
              win.webContents.send('openFile', fileData);
              currentFile = fil;
              win.title = currentFile;
            }
          }
        },
        {
          label: 'Save',
          accelerator: process.platform === 'darwin' ? 'Cmd+S' : 'Ctrl+S',
          async click() {
            if (!currentFile) {
              const newFile = await dialog.showSaveDialog(win, { title: 'Save', defaultPath: os.homedir() });
              if (newFile.canceled) {
                return;
              }
              currentFile = newFile.filePath;
            }
            ipcMain.handleOnce('saveFileCallBack', saveFileOnCallBack);
            win.webContents.send('saveFile', 'saveFileCallBack');
          }
        },
        {
          label: 'Save As...',
          accelerator: process.platform === 'darwin' ? 'Cmd+Alt+S' : 'Ctrl+Alt+S',
          async click() {
            const newFile = await dialog.showSaveDialog(win, { title: 'Save As...', defaultPath: os.homedir() });
            if (newFile.canceled) {
              return;
            }
            currentFile = newFile.filePath;
            ipcMain.handleOnce('saveFileCallBack', saveFileOnCallBack);
            win.webContents.send('saveFile', 'saveFileCallBack');
          }
        },
        { type: 'separator' },
        {
          label: 'Print',
          accelerator: process.platform === 'darwin' ? 'Cmd+P' : 'Ctrl+P',
          async click() {
            //win.webContents.send('printDocument', 'I am printing');
            const pdfData = await win.webContents.printToPDF({});
            const pdfPath = path.join(os.homedir(), 'out.pdf');
            fs.writeFile(pdfPath, pdfData, err => {
              if (err) throw err;
              console.log('wrote pdf file');
            });
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Alt+Q',
          click() {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {
          role: 'undo'
        },
        {
          role: 'redo'
        },
        {
          type: 'separator'
        },
        {
          role: 'Cut'
        },
        {
          role: 'Copy'
        },
        {
          role: 'Paste'
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          async click() {
            dialog.showMessageBox(win, { message: 'Music Writer\n Version 0.1' });
          }
        }
      ]
    }
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS3_DEVTOOLS);
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString());
    }
  }
  createMenu();
  createWindow();
});

ipcMain.on('printed', async (event, args) => {
  console.log(args);
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}
