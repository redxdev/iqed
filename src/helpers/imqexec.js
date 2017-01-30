import imq from '../imq';
import {getConsole} from '../ui/console';
import {findFirstComponent, getLayout} from '../ui';

window.imq = imq;

export function executeString(name, str) {
    return new Promise(function (resolve, reject) {
        console.log('Executing "' + name + '"');
        getConsole().print('Executing "' + name + '"...');

        var vm = new imq.VMachine();

        var browser = findFirstComponent(getLayout(), 'browser');
        var dir = browser.instance._path;
        vm.setWorkingDirectory(dir);

        vm.registerStandardLibrary();
        vm.executeAsync(str, function (result) {
            if (result.success) {
                getConsole().print('success: ' + result.result.asString());
                resolve(result.result);
            }
            else {
                getConsole().print('error: ' + result.result.toString().getString());
                reject(result.result);
            }
        });
    });
}