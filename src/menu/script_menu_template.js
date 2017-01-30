import {getMainWindow} from '../background';

export var scriptMenuTemplate = {
    label: 'Script',
    submenu: [{
        label: 'Clear Console',
        accelerator: 'CmdOrCtrl+Shift+D',
        click: function () {
            getMainWindow().webContents.send('script.clear-console');
        }
    }]
};