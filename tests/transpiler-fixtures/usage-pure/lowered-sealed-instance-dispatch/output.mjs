import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// A lowered optional keeps its store, prefix and sealed plain read.
// The instance method belongs to the defined receiver after that read.
let held, memo, value;
export const method = (memo = (effect(), ((value = held = _globalThis.window) == null ? void 0 : _self).self, _self)) == null ? void 0 : _atMaybeArray(memo.Array.prototype);