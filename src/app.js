import os from 'os';
import env from './env';
import imq from './imq';

document.addEventListener('DOMContentLoaded', function () {
    console.log("imq version " + imq.getVersion() + " provided via cimq");
    console.log("type of integer is: " + imq.getValueTypeString(imq.type.Integer));
});
