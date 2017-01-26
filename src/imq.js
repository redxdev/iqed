import ffi from 'ffi';
import ref from 'ref';

let QValue = ref.types.void;
let QValuePtr = ref.refType(QValue);
let QValueType = ref.types.int;

let QObject = ref.types.void;
let QObjectPtr = ref.refType(QObject);

var lib = ffi.Library('cimq', {
    // platform
    'imqGetVersion': [ref.types.CString, []],

    // value
    'imqDestroyValue': [ref.types.void, [QValuePtr]],

    'imqNilValue': [QValuePtr, []],
    'imqBoolValue': [QValuePtr, [ref.types.bool]],
    'imqIntegerValue': [QValuePtr, [ref.types.int]],
    'imqFloatValue': [QValuePtr, [ref.types.float]],
    'imqStringValue': [QValuePtr, [ref.types.CString]],
    'imqObjectValue': [QValuePtr, [QObjectPtr]],

    'imqGetValueType': [QValueType, [QValuePtr]],
    'imqGetValueTypeString': [QValuePtr, [ref.types.int]],

    'imqValueAsString': [QValuePtr, [QValuePtr]],

    'imqGetBool': [ref.types.bool, [QValuePtr, ref.refType(ref.types.bool)]],
    'imqGetInteger': [ref.types.bool, [QValuePtr, ref.refType(ref.types.int)]],
    'imqGetFloat': [ref.types.bool, [QValuePtr, ref.refType(ref.types.float)]],
    'imqGetNumberAsInteger': [ref.types.bool, [QValuePtr, ref.refType(ref.types.int)]],
    'imqGetNumberAsFloat': [ref.types.bool, [QValuePtr, ref.refType(ref.types.float)]],
    'imqGetString': [ref.types.bool, [QValuePtr, ref.refType(ref.types.CString)]]
});

function vGetBool(v) {
    var result = ref.alloc(ref.types.bool);
    if (lib.imqGetBool(v, result)) {
        return result.deref();
    }

    return null;
}

function vGetInteger(v) {
    var result = ref.alloc(ref.types.int);
    if (lib.imqGetInteger(v, result)) {
        return result.deref();
    }

    return null;
}

function vGetFloat(v) {
    var result = ref.alloc(ref.types.float);
    if (lib.imqGetFloat(v, result)) {
        return result.deref();
    }

    return null;
}

function vGetNumberAsInteger(v) {
    var result = ref.alloc(ref.types.int);
    if (lib.imqGetNumberAsInteger(v, result)) {
        return result.deref();
    }

    return null;
}

function vGetNumberAsFloat(v) {
    var result = ref.alloc(ref.types.float);
    if (lib.imqGetNumberAsFloat(v, result)) {
        return result.deref();
    }

    return null;
}

function vGetString(v) {
    var result = ref.alloc(ref.types.CString);
    if (lib.imqGetString(v, result)) {
        return result.deref();
    }

    return null;
}

export var type = {
    Nil: 0,
    Bool: 1,
    Integer: 2,
    Float: 3,
    String: 4,
    Function: 5,
    Object: 6
};

export var getVersion = lib.imqGetVersion;

export function getValueTypeString(t) {
    var obj = lib.imqGetValueTypeString(t);
    var result = vGetString(obj);
    lib.imqDestroyValue(obj);

    if (result == null)
        return "NULL?";

    return result;
}

export default {
    type: type,
    getVersion: getVersion,
    getValueTypeString: getValueTypeString
}