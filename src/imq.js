import ffi from 'ffi';
import ref from 'ref';

let cstr = ref.types.CString;
let lib = ffi.Library('cimq', {
    'imqGetVersion': [ref.types.CString, []]
});

export default {
    getVersion: lib.imqGetVersion
};