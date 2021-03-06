import {dialog, app, BrowserWindow} from 'electron';
import {getMainWindow} from '../background';

export var fileMenuTemplate = {
    label: 'File',
    submenu: [{
        label: 'New',
        accelerator: 'CmdOrCtrl+N',
        click: function () {
            getMainWindow().webContents.send('file.new');
        }
    }, {
        label: 'Open File',
        accelerator: 'CmdOrCtrl+O',
        click: function () {
            var file = dialog.showOpenDialog(getMainWindow(), {
                title: 'Open File',
                properties: ['openFile'],
                filters: [
                    {name: 'All Files', extensions: ['*']}
                ]
            });

            if (file === undefined || file.length === 0)
                return;

            file = file[0];
            getMainWindow().webContents.send('file.open-file', file);
        }
    }, {
        label: 'Open Directory',
        click: function () {
            var dir = dialog.showOpenDialog(getMainWindow(), {
                title: 'Open Directory',
                properties: ['openDirectory'],
            });

            if (dir === undefined || dir.length === 0)
                return;
            
            dir = dir[0];
            getMainWindow().webContents.send('file.open-directory', dir);
        }
    }, {
        label: 'Save All',
        accelerator: 'CmdOrCtrl+Shift+S',
        click: function () {
            getMainWindow().webContents.send('file.save-all');
        }
    }, {
        type: 'separator'
    }, {
        label: 'Developer',
        submenu: [{
            label: 'Toggle DevTools',
            accelerator: 'Alt+CmdOrCtrl+I',
            click: function () {
                BrowserWindow.getFocusedWindow().toggleDevTools();
            }
        }]
    }, {
        type: 'separator'
    }, {
        label: 'Quit',
        accelerator: 'CmdOrCtrl+Q',
        click: function () {
            app.quit();
        }
    }]
}