import os from 'os';
import env from './env';
import imq from './imq';
import ui from './ui';

document.addEventListener('DOMContentLoaded', function () {
    console.log("imq version " + imq.getVersion() + " provided via " + imq.getProvider());
});

window.onEditorReady = function () {
    ui.init();
}