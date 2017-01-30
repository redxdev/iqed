import os from 'os';
import $ from 'jquery';
import env from './env';
import imq from './imq';
import ui from './ui';
import language from './language';
import settings from './settings';
import {getConsole} from './ui/console';

require('devtron').install();

document.addEventListener('DOMContentLoaded', function () {
    console.log("imq version " + imq.getVersion() + " provided via " + imq.getProvider());
});

window.onEditorReady = function () {
    language.init();
    ui.init();

    getConsole().print('imquery ' + imq.getVersion() + ' provided by ' + imq.getProvider());
    getConsole().print(imq.getCopyright());
}

$(window).on('beforeunload', function () {
    settings.getSettings().layout = ui.getLayout().toConfig().content;
    settings.saveSettings();
});