const electron = require('electron')
const url = require('url')
const path = require('path')

// SET ENV
process.env.NODE_ENV = 'production';
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
        icon: './build/lohum-icon.ico',
        title: 'Online Dashboard'
    })

    // load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file',
        slashes: true
    }))

    mainWindow.maximize();


    // quit app when closed
    mainWindow.on('close', () => {
        app.quit()
    })

    // Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // Insert Menu
    Menu.setApplicationMenu(mainMenu);

    mainWindow.setMenuBarVisibility(false)

})

// app.whenReady().then(() => {

//     globalShortcut.register('F11', () => {
//         var fullScreen;

//         fullScreen = !mainWindow.isFullScreen();
//         mainWindow.setFullScreen(fullScreen);
//     })
//     globalShortcut.register('F', () => {
//         var fullScreen;
//         fullScreen = !mainWindow.isFullScreen();
//         mainWindow.setFullScreen(fullScreen);
//     })
// })

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
        width: 780,
        height: 500,
        title: 'Edit Device ID'
    });
    // Load HTML into window
    deleteWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'deleteID.html'),
        protocol: 'file',
        slashes: true
    }));

    deleteWindow.setMenuBarVisibility(false)
}

// Catch pid:add
ipcMain.on('pid:add', function (e, status) {
    createAddWindow();
    // mainWindow.webContents.send('pid:add', status);
});

// Catch pid:edit
ipcMain.on('pid:edit', function (e, status) {
    createDeleteWindow();
    // mainWindow.webContents.send('pid:add', status);
});

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
                label: 'Edit Device ID',
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
            },
            {
                label: 'Toggle &Full Screen',
                accelerator: 'F',
                click: () => {
                    var fullScreen;
                    fullScreen = !mainWindow.isFullScreen();
                    mainWindow.setFullScreen(fullScreen);
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