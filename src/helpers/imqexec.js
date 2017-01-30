import imq from '../imq';
import {getConsole} from '../ui/console';

window.imq = imq;

export function executeString(name, str) {
    return new Promise(function (resolve, reject) {
        console.log('Executing "' + name + '"');
        getConsole().print('Executing "' + name + '"...');

        var vm = new imq.VMachine();
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