import ffi from 'ffi';
import ref from 'ref';
import finalize from 'finalize';

let cQValue = ref.types.void;
let cQValuePtr = ref.refType(cQValue);
let cQValueType = ref.types.int;

let cQObject = ref.types.void;
let cQObjectPtr = ref.refType(cQObject);

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

export class QValue {
    constructor(raw) {
        this.raw = raw;
        finalize(this, () => {
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
            return "???";
        
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
        if (result)
            return new QValue(result);

        return null;
    }

    toInteger() {
        var result = lib.imqToInteger(this.raw);
        if (result)
            return new QValue(result);

        return null;
    }

    toFloat() {
        var result = lib.imqToFloat(this.raw);
        if (result)
            return new QValue(result);

        return null;
    }

    toString() {
        var result = lib.imqToString(this.raw);
        if (result)
            return new QValue(result);

        return null;
    }
}

export var getVersion = lib.imqGetVersion;

export default {
    type: type,
    QValue: QValue,
    getVersion: getVersion
}