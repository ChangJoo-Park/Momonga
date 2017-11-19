'use strict'

import { app, BrowserWindow, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
autoUpdater.logger = require('electron-log')
autoUpdater.logger.transports.file.level = 'info'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    useContentSize: true,
    minWidth: 350,
    minHeight: 500,
    height: 560,
    width: 350
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', () => {
  createWindow()
  if (process.env.NODE_ENV === 'production') {
    autoUpdater.checkForUpdates()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('downloaded', '')
})

autoUpdater.on('update-not-available', (error) => {
  mainWindow.webContents.send('failed', error)
})

autoUpdater.on('update-available', (info) => {
  mainWindow.webContents.send('available', info)
})

autoUpdater.on('download-progress', (progress) => {
  mainWindow.webContents.send('download-progress', progress)
})

autoUpdater.on('error', (error) => {
  mainWindow.webContents.send('error', error)
})

ipcMain.on('quit-and-install', (event, arg) => {
  autoUpdater.quitAndInstall()
})

ipcMain.on('refresh', (event, args) => {
  console.log('refresh')
  mainWindow.reload()
})
