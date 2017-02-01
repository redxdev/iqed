import imq from '../imq';
import {getConsole} from '../ui/console';
import {findFirstComponent, getLayout} from '../ui';

export function buildQValueFromInput(input) {
    let QValue = imq.QValue;

    console.log(input);

    switch (input.type) {
    case 'nil':
        return QValue.Nil();

    case 'bool':
        return QValue.Bool(Boolean(input.value));

    case 'integer':
        return QValue.Integer(parseInt(input.value));

    case 'float':
        return QValue.Float(parseFloat(input.value));

    case 'string':
        return QValue.String(input.value);

    default:
        return null;
    }
}

export function executeString(name, str, inputs) {
    return new Promise(function (resolve, reject) {
        console.log('Executing "' + name + '"');
        getConsole().print('Executing "' + name + '"...');

        var vm = new imq.VMachine();

        var browser = findFirstComponent(getLayout(), 'browser');
        var dir = browser.instance._path;
        var r = vm.setWorkingDirectory(dir);
        if (r === false) {
            getConsole().print('error: unable to set vm working directory to ' + dir);
            reject('unable to set vm working directory to ' + dir);
            return;
        }

        var r = vm.registerStandardLibrary();
        if (r.success === false) {
            getConsole().print('error: ' + r.result.toString().getString());
            reject(result.result);
            return;
        }

        if (inputs !== undefined) {
            var inputSet = {};
            for (var i = 0; i < inputs.length; ++i) {
                var input = inputs[i];
                if (inputSet[input.name] === true) {
                    getConsole().print('warning: input "' + input.name + '" is a duplicate');
                }
                inputSet[input.name] = true;
                var value = buildQValueFromInput(input);
                if (value === null) {
                    getConsole().print('warning: input "' + input.name + '" has invalid type "' + input.type + '"');
                    continue;
                }

                vm.setInput(input.name, value);
            }
        }

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