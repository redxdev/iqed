import {getConsole} from './ui/console';

function print(args) {
    var str = '';
    for (var i = 0; i < args.length; ++i) {
        str += args[i].toString().getString();
    }

    getConsole().print(str);
}

export default function (vm) {
    return vm.registerFunctions([
        {name: 'print', func: print}
    ]);
}