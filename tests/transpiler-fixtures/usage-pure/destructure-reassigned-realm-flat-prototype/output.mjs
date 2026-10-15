import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
// The flat prototype read has the same receiver families as the nested pattern.
// Every written realm value yields an array receiver or throws before the method read.
// A null alternative throws in the same way and contributes no string family.
let effects = 0;
let realm = _globalThis;
const rebind = () => {
  realm = {};
};
const at = _atMaybeArray((effects++, realm.Array.prototype));
let nullableRealm = _globalThis;
const clear = () => {
  nullableRealm = null;
};
const includes = _includesMaybeArray(nullableRealm.Array.prototype);