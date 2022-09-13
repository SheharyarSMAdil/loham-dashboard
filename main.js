const electron = require('electron')
const url = require('url')
const path = require('path')

// SET ENV
process.env.NODE_ENV = 'development';
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = false;

const { app, BrowserWindow, Menu, ipcMain } = electron

let mainWindow, addWindow, deleteWindow

// Listen for app to be ready
app.on('ready', () => {
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        title: 'Online Dashboard'
    })

    // load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file',
        slashes: true
    }))

    // quit app when closed
    mainWindow.on('close', () => {
        app.quit()
    })

    // Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // Insert Menu
    Menu.setApplicationMenu(mainMenu);

})

// Handle create add window
function createAddWindow() {
    // create new window
    addWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        width: 300,
        height: 260,
        title: 'Add Device ID'
    });
    // Load HTML into window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addID.html'),
        protocol: 'file',
        slashes: true
    }));

    addWindow.setMenuBarVisibility(false)
}

// Handle create delete window
function createDeleteWindow() {
    // create new window
    deleteWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        width: 400,
        height: 420,
        title: 'Delete Device ID'
    });
    // Load HTML into window
    deleteWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'deleteID.html'),
        protocol: 'file',
        slashes: true
    }));

    deleteWindow.setMenuBarVisibility(false)
}

// Catch pid:added
ipcMain.on('pid:added', function (e, status) {
    mainWindow.webContents.send('pid:added', status);
    addWindow.close();
});

// Catch pid:deleted
ipcMain.on('pid:deleted', function (e, status) {
    mainWindow.webContents.send('pid:deleted', status);
    // deleteWindow.close();
});

// Create menu template
const mainMenuTemplate = [
    {
        label: 'Options',
        submenu: [
            {
                label: 'Add Device ID',
                click() {
                    createAddWindow();
                }
            },
            {
                label: 'Delete Device ID',
                click() {
                    createDeleteWindow();
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' :
                    'Ctrl+Q',
                click() {
                    app.quit();
                }
            }
        ]
    }
];

// // Add developer tools item if not in production
if (process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+Shift+I' :
                    'Ctrl+Shift+I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    });
}