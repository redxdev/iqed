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
    }]
};