import os from 'os';
import env from './env';
import imq from './imq';
import ui from './ui';
import {getConsole} from './ui/console';

document.addEventListener('DOMContentLoaded', function () {
    console.log("imq version " + imq.getVersion() + " provided via " + imq.getProvider());
});

window.onEditorReady = function () {
    ui.init();

    getConsole().print('imquery ' + imq.getVersion() + ' provided by ' + imq.getProvider());
    getConsole().print(imq.getCopyright());
}