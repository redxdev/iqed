import os from 'os';
import env from './env';
import imq from './imq';

document.addEventListener('DOMContentLoaded', function () {
    console.log("imq version " + imq.getVersion() + " provided via cimq");
});
