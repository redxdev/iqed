import jetpack from 'fs-jetpack';
import {getDefaultContent} from './ui';

const {app} = require('electron').remote;

let userDataDir = jetpack.cwd(app.getPath('userData'));
let settingsStoreFile = 'settings.json';

var currentSettings = userDataDir.read(settingsStoreFile, 'json');
if (currentSettings === undefined) {
    currentSettings = getDefaultSettings();
    console.log('No settings file, using default', currentSettings);
}
else {
    console.log('Settings loaded', currentSettings);
}

export function getDefaultSettings() {
    return {
        layout: getDefaultContent(),
        workingDirectory: jetpack.cwd(),
        inputs: [{
            name: 'test_input',
            type: 'string',
            value: 'Hello World!'
        }]
    };
}

export function getSettings() {
    return currentSettings;
}

export function saveSettings() {
    console.log('Saving settings to ' + settingsStoreFile, currentSettings);
    userDataDir.write(settingsStoreFile, currentSettings);
}

export function saveSettingsAsync() {
    return userDataDir.writeAsync(settingsStoreFile, currentSettings);
}

export default {
    getDefaultSettings: getDefaultSettings,
    getSettings: getSettings,
    saveSettings: saveSettings,
    saveSettingsAsync: saveSettingsAsync
};