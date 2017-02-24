import ffi from 'ffi';
import ref from 'ref';
import ArrayType from 'ref-array';
import Struct from 'ref-struct';
import finalize from 'finalize';

let cQValue = ref.types.void;
let cQValuePtr = ref.refType(cQValue);
let cQValuePtrArr = ArrayType(cQValuePtr);
let cQValueType = ref.types.int;

let cQObject = ref.types.void;
let cQObjectPtr = ref.refType(cQObject);

let cVMachine = ref.types.void;
let cVMachinePtr = ref.refType(cVMachine);

let cFunctionResult = Struct({
    'bError': ref.types.bool,
    'result': cQValuePtr
});

var lib = ffi.Library('cimq', {
    // platform
    'imqGetVersion': [ref.types.CString, []],

    // value
    'imqDestroyValue': [ref.types.void, [cQValuePtr]],
    'imqCopyValue': [cQValuePtr, [cQValuePtr]],

    'imqNilValue': [cQValuePtr, []],
    'imqBoolValue': [cQValuePtr, [ref.types.bool]],
    'imqIntegerValue': [cQValuePtr, [ref.types.int]],
    'imqFloatValue': [cQValuePtr, [ref.types.float]],
    'imqStringValue': [cQValuePtr, [ref.types.CString]],
    'imqObjectValue': [cQValuePtr, [cQObjectPtr]],

    'imqCreateFunction': [cQValuePtr, [cVMachinePtr, ref.refType(ref.types.void)]],

    'imqGetValueType': [cQValueType, [cQValuePtr]],
    'imqGetValueTypeString': [cQValuePtr, [ref.types.int]],

    'imqValueAsString': [cQValuePtr, [cQValuePtr]],

    'imqGetBool': [ref.types.bool, [cQValuePtr, ref.refType(ref.types.bool)]],
    'imqGetInteger': [ref.types.bool, [cQValuePtr, ref.refType(ref.types.int)]],
    'imqGetFloat': [ref.types.bool, [cQValuePtr, ref.refType(ref.types.float)]],
    'imqGetNumberAsInteger': [ref.types.bool, [cQValuePtr, ref.refType(ref.types.int)]],
    'imqGetNumberAsFloat': [ref.types.bool, [cQValuePtr, ref.refType(ref.types.float)]],
    'imqGetString': [ref.types.bool, [cQValuePtr, ref.refType(ref.types.CString)]],

    'imqToBool': [cQValuePtr, [cQValuePtr]],
    'imqToInteger': [cQValuePtr, [cQValuePtr]],
    'imqToFloat': [cQValuePtr, [cQValuePtr]],
    'imqToString': [cQValuePtr, [cQValuePtr]],

    'imqValueEquals': [ref.types.bool, [cQValuePtr, cQValuePtr]],

    'imqNewVMachine': [cVMachinePtr, []],
    'imqDestroyVMachine': [ref.types.void, [cVMachinePtr]],

    'imqSetWorkingDirectory': [ref.types.bool, [cVMachinePtr, ref.types.CString]],
    'imqVMAddSearchPath': [ref.types.void, [cVMachinePtr, ref.types.CString]],

    'imqGCSetDebugMode': [ref.types.void, [cVMachinePtr, ref.types.bool]],
    'imqGCGetCollectionMode': [ref.types.int, [cVMachinePtr]],
    'imqGCSetCollectionMode': [ref.types.void, [cVMachinePtr, ref.types.int]],
    'imqGCGetManagedCount': [ref.types.uint, [cVMachinePtr]],
    'imqGCGetTrackedMemory': [ref.types.uint, [cVMachinePtr]],
    'imqGCGetCollectionBarrier': [ref.types.uint, [cVMachinePtr]],
    'imqGCCollect': [ref.types.bool, [cVMachinePtr, ref.types.bool]],

    'imqExecuteString': [ref.types.bool, [cVMachinePtr, ref.types.CString, ref.refType(cQValuePtr)]],

    'imqRegisterStandardLibrary': [ref.types.bool, [cVMachinePtr, ref.refType(cQValuePtr)]],

    'imqSetInput': [ref.types.void, [cVMachinePtr, ref.types.CString, cQValuePtr]],
    'imqGetInput': [cQValuePtr, [cVMachinePtr, ref.types.CString]],
    'imqGetOutput': [cQValuePtr, [cVMachinePtr, ref.types.CString]],

    'imqSetValue': [ref.types.bool, [cVMachinePtr, ref.types.CString, cQValuePtr]],
    'imqGetValue': [cQValuePtr, [cVMachinePtr, ref.types.CString]],

    'imqLoadImageFromFile': [cQValuePtr, [cVMachinePtr, ref.types.CString]],
    'imqSaveImageToFile': [ref.types.bool, [cQValuePtr, ref.types.CString]],
});

export var type = {
    Nil: 0,
    Bool: 1,
    Integer: 2,
    Float: 3,
    String: 4,
    Function: 5,
    Object: 6
};

export var CollectionMode = {
    NoBarriers: 0,
    Barriers: 1,
    Always: 2
};

export var getVersion = lib.imqGetVersion;
export function getProvider() {
    return 'cimq';
}

export function getCopyright() {
    return 'Copyright (c) 2017 Sam Bloomberg'
}

export class QValue {
    constructor(raw, extra) {
        if (raw.isNull())
            throw new ReferenceError("Cannot construct QValue from null reference.");

        this.raw = raw;
        this.extra = extra;
        finalize(this, () => {
            if (!this.raw.isNull())
                lib.imqDestroyValue(this.raw);
        });
    }

    static Nil() {
        return new QValue(lib.imqNilValue());
    }

    static Bool(val) {
        return new QValue(lib.imqBoolValue(val));
    }

    static Integer(val) {
        return new QValue(lib.imqIntegerValue(val));
    }

    static Float(val) {
        return new QValue(lib.imqFloatValue(val));
    }

    static String(val) {
        return new QValue(lib.imqStringValue(val));
    }

    // You must keep a reference to the QValue returned by this in order to prevent garbage collection
    // of the function.
    static Function(vm, func) {
        var cb = ffi.Callback(cFunctionResult, [cVMachinePtr, ref.types.int, cQValuePtrArr], function (vmPtr, argCount, rawArgs) {
            rawArgs.length = argCount;
            var args = [];
            for (var i = 0; i < argCount; ++i) {
                args.push(new QValue(rawArgs[i]));
            }

            var result = null;
            try {
                result = func(args);
            }
            catch (e) {
                console.error('Error while calling js QFunction', e);
                var r = new cFunctionResult();
                r.bError = true;
                r.result = lib.imqStringValue(e.toString());
                return r;
            }

            var r = new cFunctionResult();
            r.bError = false;
            if (result === null || result === undefined) {
                r.result = lib.imqNilValue();
            }
            else if (result.raw === undefined) {
                r.bError = true;
                var err = 'Return value from js QFunction was not a QValue';
                r.result = lib.imqStringValue(err);
                console.error(err);
            }
            else {
                r.result = result.raw;
            }

            return r;
        });

        return new QValue(lib.imqCreateFunction(vm.raw, cb), cb);
    }

    static getTypeString(t) {
        var obj = new QValue(lib.imqGetValueTypeString(t));
        var result = obj.getString();

        if (result == null)
            return "NULL?";

        return result;
    }

    getType() {
        return lib.imqGetValueType(this.raw);
    }

    asString() {
        var obj = new QValue(lib.imqValueAsString(this.raw));
        var result = obj.getString();

        if (result == null)
            return "<???>";
        
        return result;
    }

    copy() {
        return new QValue(lib.imqCopyValue(this.raw));
    }

    getBool() {
        var result = ref.alloc(ref.types.bool);
        if (lib.imqGetBool(this.raw, result)) {
            return result.deref();
        }

        return null;
    }

    getInteger() {
        var result = ref.alloc(ref.types.int);
        if (lib.imqGetInteger(this.raw, result)) {
            return result.deref();
        }

        return null;
    }

    getFloat() {
        var result = ref.alloc(ref.types.float);
        if (lib.imqGetFloat(this.raw, result)) {
            return result.deref();
        }

        return null;
    }

    getNumber() {
        var result = ref.alloc(ref.types.float);
        if (lib.imqGetNumberAsFloat(this.raw, result)) {
            return result.deref();
        }

        return null;
    }

    getString() {
        var result = ref.alloc(ref.types.CString);
        if (lib.imqGetString(this.raw, result)) {
            return result.deref();
        }

        return null;
    }

    toBool() {
        var result = lib.imqToBool(this.raw);
        if (!result.isNull())
            return new QValue(result);

        return null;
    }

    toInteger() {
        var result = lib.imqToInteger(this.raw);
        if (!result.isNull())
            return new QValue(result);

        return null;
    }

    toFloat() {
        var result = lib.imqToFloat(this.raw);
        if (!result.isNull())
            return new QValue(result);

        return null;
    }

    toString() {
        var result = lib.imqToString(this.raw);
        if (!result.isNull())
            return new QValue(result);

        return null;
    }

    equals(other) {
        return lib.imqValueEquals(this.raw, other.raw);
    }
}

export class VMachine {
    constructor() {
        this.raw = lib.imqNewVMachine();
        this.functions = [];
        finalize(this, () => {
            if (!this.raw.isNull())
                lib.imqDestroyVMachine(this.raw);
        });
    }

    setWorkingDirectory(path) {
        return lib.imqSetWorkingDirectory(this.raw, path);
    }

    addSearchPath(path) {
        lib.imqVMAddSearchPath(this.raw, path);
    }

    setGCDebugMode(mode) {
        lib.imqGCSetDebugMode(this.raw, mode);
    }

    getGCCollectionMode(mode) {
        return lib.imqGCGetCollectionMode(this.raw);
    }

    setGCCollectionMode(mode) {
        lib.imqGCSetCollectionMode(this.raw, mode);
    }

    getGCManagedCount() {
        return lib.imqGCGetManagedCount(this.raw);
    }

    getGCTrackedMemory() {
        return lib.imqGCGetTrackedMemory(this.raw);
    }

    getGCCollectionBarrier() {
        return lib.imqGCGetCollectionBarrier(this.raw);
    }

    gcCollect(force) {
        if (force === undefined)
            force = false;
        
        return lib.imqGCCollect(this.raw, force);
    }

    execute(data) {
        var result = ref.alloc(cQValuePtr);
        var success = lib.imqExecuteString(this.raw, data, result);
        return {
            success: success,
            result: new QValue(result.deref())
        }
    }

    executeAsync(data, cb) {
        var result = ref.alloc(cQValuePtr);
        lib.imqExecuteString.async(this.raw, data, result, function (err, success) {
            if (err) {
                throw err;
            }
            else {
                cb({
                    success: success,
                    result: new QValue(result.deref())
                });
            }
        });
    }

    registerStandardLibrary() {
        var result = ref.alloc(cQValuePtr);
        var success = lib.imqRegisterStandardLibrary(this.raw, result);
        return {
            success: success,
            result: new QValue(result.deref())
        };
    }

    setInput(key, value) {
        lib.imqSetInput(this.raw, key, value.raw);
    }

    getInput(key) {
        var result = lib.imqGetInput(this.raw, key);
        if (result.isNull())
            return null;

        return new QValue(result);
    }

    getOutput(key) {
        var result = lib.imqGetOutput(this.raw, key);
        if (result.isNull())
            return null;

        return new QValue(result);
    }

    setValue(key, value) {
        return lib.imqSetValue(this.raw, key, value.raw);
    }

    getValue(key) {
        var result = lib.imqGetValue(this.raw, key);
        if (result.isNull()) {
            return null;
        }

        return new QValue(result);
    }

    registerFunction(name, func) {
        var val = QValue.Function(this, func);
        this.functions.push(val);
        return this.setValue(name, val);
    }

    registerFunctions(list) {
        for (var i = 0; i < list.length; ++i) {
            var def = list[i];
            if (!this.registerFunction(def.name, def.func)) {
                console.warn('Unable to register function "' + def.name + '"');
                return false;
            }
        }

        return true;
    }
}

export function loadQImageFromFile(vm, path) {
    var result = lib.imqLoadImageFromFile(vm.raw, path);
    if (result.isNull())
        return null;

    return new QValue(result);
}

export function saveQImageToFile(value, path) {
    return lib.imqSaveImageToFile(value.raw, path);
}

export default {
    type: type,
    CollectionMode: CollectionMode,
    getVersion: getVersion,
    getProvider: getProvider,
    getCopyright: getCopyright,
    QValue: QValue,
    VMachine: VMachine,
    loadQImageFromFile: loadQImageFromFile,
    saveQImageToFile: saveQImageToFile,
}