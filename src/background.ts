'use strict';

import { app, protocol, BrowserWindow, Menu, dialog, ipcMain, IpcMainInvokeEvent } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer';
import fs from 'fs';
import os from 'os';
import { ApplicationState } from './ApplicationState';
// import { createPublicKey } from 'crypto';
const isDevelopment = process.env.NODE_ENV !== 'production';

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }]);

let win: BrowserWindow;
const ApplicationName = 'Music Writer';
const SaveFileCallBackHandler = 'saveFileCallBack';
const appState: ApplicationState = new ApplicationState();

//#region ***** Watchers for Application variables *****
appState.Watch('CurrentFile', param => {
  const fileName = param !== '' ? param : 'Untitled';
  win.title = `${ApplicationName} - ${fileName}`;
});
//#endregion

//#region **** Electron APP INIT ****
async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1024,
    height: 768,
    minWidth: 1024,
    minHeight: 768,
    icon: './src/assets/icons/app-icon.png',
    title: `${ApplicationName} - Untitled`,
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
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
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
  createWindow();
  createMenu();
});

//#endregion

//#region ***** Handlers and CallBacks from Vue *****
function CreateNewDocument() {
  appState.CurrentFile = '';
}
ipcMain.on('CreateNewDocument', CreateNewDocument);

async function OpenDocument() {
  const files = await dialog.showOpenDialog(win, { title: 'Open', defaultPath: os.homedir() });
  if (!files.canceled) {
    const fil = files.filePaths[0];
    const fileData = await fs.promises.readFile(fil, { encoding: 'utf8' });
    win.webContents.send('setDocumentData', fileData);
    appState.CurrentFile = fil;
  }
}
ipcMain.on('OpenDocument', OpenDocument);

//region **** Save File ****
async function GetFileFromSaveDialog(title: string): Promise<boolean> {
  const newFile = await dialog.showSaveDialog(win, { title: title, defaultPath: os.homedir() });
  if (newFile.canceled) {
    return false;
  }
  appState.CurrentFile = newFile.filePath + '';
  return true;
}

async function saveFileCallBack(event: IpcMainInvokeEvent, fileContents: string) {
  if (appState.CurrentFile !== '') {
    await fs.promises.writeFile(appState.CurrentFile, fileContents, { encoding: 'utf8' });
  }
}
ipcMain.handle(SaveFileCallBackHandler, saveFileCallBack);

ipcMain.handle('SaveFileHandler', async () => {
  if (appState.CurrentFile === '') {
    const fileNameSelected = await GetFileFromSaveDialog('Save');
    if (!fileNameSelected) {
      return null;
    }
  }
  return SaveFileCallBackHandler;
});

//#endregion

ipcMain.on('printDocumentCompleted', async (event, args) => {
  console.log(args);
});
//#endregion

//#region ***** Main Menu
async function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        //New
        {
          label: 'New',
          accelerator: process.platform === 'darwin' ? 'Cmd+N' : 'Ctrl+N',
          click() {
            CreateNewDocument();
          }
        },

        //Open
        {
          label: 'Open...',
          accelerator: process.platform === 'darwin' ? 'Cmd+O' : 'Ctrl+O',
          async click() {
            await OpenDocument();
          }
        },

        //Save
        {
          label: 'Save',
          accelerator: process.platform === 'darwin' ? 'Cmd+S' : 'Ctrl+S',
          async click() {
            if (appState.CurrentFile === '') {
              const fileNameSelected = await GetFileFromSaveDialog('Save');
              if (!fileNameSelected) {
                return;
              }
            }

            // SaveFileCallBackHandler argument being passed here will be called by the Vue component
            win.webContents.send('getDocumentData', SaveFileCallBackHandler);
          }
        },

        //Save As...
        {
          label: 'Save As...',
          accelerator: process.platform === 'darwin' ? 'Cmd+Alt+S' : 'Ctrl+Alt+S',
          async click() {
            const newFile = await GetFileFromSaveDialog('Save As...');
            if (newFile) {
              // SaveFileCallBackHandler argument being passed here will be called by the Vue component
              win.webContents.send('getDocumentData', SaveFileCallBackHandler);
            }
          }
        },

        { type: 'separator' },

        //Export as PDF
        {
          label: 'Export as PDF',
          // accelerator: process.platform === 'darwin' ? 'Cmd+P' : 'Ctrl+P',
          async click() {
            const userSpecifiedFile = await dialog.showSaveDialog(win, {
              title: 'Export as PDF',
              defaultPath: os.homedir()
            });
            if (userSpecifiedFile.canceled) {
              return;
            }
            const pdfData = await win.webContents.printToPDF({});
            // const pdfPath = path.join(os.homedir(), 'out.pdf');
            fs.writeFile(userSpecifiedFile.filePath + '', pdfData, err => {
              if (err) throw err;
              dialog.showErrorBox('Error Exporting', 'Export as PDF failed');
            });
          }
        },

        //Print
        {
          label: 'Print',
          accelerator: process.platform === 'darwin' ? 'Cmd+P' : 'Ctrl+P',
          async click() {
            await win.webContents.send('printDocument', 'I am printing');
            // THis code below wont work due to an electron bug.
            // If no default printer is setup, it wont show the print dialog.
            // win.webContents.print({ silent: false }, (succ, reason) => {
            //   if (!succ) {
            //     console.log(reason);
            //   }
            // });
          }
        },

        { type: 'separator' },

        //Exit
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
//#endregion

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
