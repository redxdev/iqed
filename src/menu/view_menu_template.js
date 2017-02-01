import {getMainWindow} from '../background';

export var viewMenuTemplate = {
    label: 'View',
    submenu: [{
        label: 'Reset Layout',
        click: function () {
            getMainWindow().webContents.send('view.reset-layout');
        }
    }, {
        type: 'separator'
    }, {
        label: 'Browser',
        accelerator: 'CmdOrCtrl+Shift+E',
        click: function () {
            getMainWindow().webContents.send('view.browser.show');
        }
    }, {
        label: 'Console',
        accelerator: 'CmdOrCtrl+Shift+Y',
        click: function () {
            getMainWindow().webContents.send('view.console.show');
        }
    }, {
        label: 'IO Editor',
        accelerator: 'CmdOrCtrl+Shift+I',
        click: function () {
            getMainWindow().webContents.send('view.io-editor.show');
        }
    }]
};