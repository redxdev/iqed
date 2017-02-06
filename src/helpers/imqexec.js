import imq from '../imq';
import {getConsole} from '../ui/console';
import settings from '../settings';
import editorlib from '../editorlib';

var currentlyExecuting = false;

export function buildQValueFromInput(vm, input) {
    let QValue = imq.QValue;

    switch (input.type) {
    case 'nil':
        return {type: 'input', value: QValue.Nil()};

    case 'bool':
        return {type: 'input', value: QValue.Bool(Boolean(input.value))};

    case 'integer':
        return {type: 'input', value: QValue.Integer(parseInt(input.value))};

    case 'float':
        return {type: 'input', value: QValue.Float(parseFloat(input.value))};

    case 'string':
        return {type: 'input', value: QValue.String(input.value)};

    case 'image':
        return {type: 'input', value: imq.loadQImageFromFile(vm, input.value)};

    case 'image-output':
        return {type: 'output', value: input.value};

    default:
        return null;
    }
}

export function executeString(name, str, ioModel) {
    if (currentlyExecuting) {
        getConsole().print('Already executing a script!');
        return;
    }

    return new Promise(function (resolve, reject) {
        currentlyExecuting = true;

        console.log('Executing "' + name + '"');
        getConsole().print('Executing "' + name + '"...');

        var vm = new imq.VMachine();

        var dir = settings.getSettings().workingDirectory;
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

        r = editorlib(vm);
        if (!r) {
            getConsole().print('error: unable to register editor functions into the imquery vm');
            reject('unable to register editor functions into the imquery vm:', r);
            return;
        }

        var outputs = {};

        if (ioModel !== undefined) {
            var inputSet = {};
            for (var i = 0; i < ioModel.length; ++i) {
                var input = ioModel[i];
                var value = buildQValueFromInput(vm, input);
                if (value === null) {
                    getConsole().print('warning: io "' + input.name + '" has invalid type "' + input.type + '"');
                    continue;
                }

                if (value.value === null) {
                    getConsole().print('warning: io ' + value.type + ' "' + input.name + '" has an invalid value');
                    continue;
                }

                switch (value.type)
                {
                case 'input':
                    if (inputSet[input.name] === true) {
                        getConsole().print('warning: io input "' + input.name + '" is a duplicate');
                    }

                    inputSet[input.name] = true;
                    vm.setInput(input.name, value.value);
                    break;

                case 'output':
                    if (outputs[input.name]) {
                        getConsole().print('warning: io output "' + input.name + '" is a duplicate');
                    }

                    outputs[input.name] = value.value;
                    break;

                default:
                    getConsole().print('warning: buildQValueFromInput returned unknown type "' + value.type + '"');
                    break;
                }
            }
        }

        vm.executeAsync(str, function (result) {
            if (result.success) {
                getConsole().print('success: ' + result.result.asString());

                var printLast = false;
                for (var k in outputs) {
                    if (!outputs.hasOwnProperty(k))
                        continue;

                    printLast = false;
                    var value = vm.getOutput(k);
                    if (!value) {
                        getConsole().print('warning: output "' + k + '" not found');
                        continue;
                    }

                    getConsole().print('Saving output "' + k + '" to "' + outputs[k] + '"...');
                    if (!imq.saveQImageToFile(value, outputs[k])) {
                        getConsole().print('Failed.');
                    }
                    else {
                        printLast = true;
                    }
                }

                if (printLast)
                    getConsole().print('Finished.');

                resolve(result.result);
            }
            else {
                getConsole().print('error: ' + result.result.toString().getString());
                reject(result.result);
            }
        });
    }).then(() => {
        currentlyExecuting = false;
    }, (e) => {
        console.log('Unable to execute:', e);
        getConsole().print('There was a problem executing the script. See the dev console for more information (Ctrl/Cmd+Alt+I)');
        currentlyExecuting = false;
    });
}