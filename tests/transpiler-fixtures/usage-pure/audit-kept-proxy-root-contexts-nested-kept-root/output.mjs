import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// Kept proxy stores retain the value and nullish guard observed by their consumers.
// These hosts exercise nested stores, defaults, class members, async bodies and
// computed keys. A stored terminal probe must not become an always-defined realm
// value merely because another proxy hop follows the store.
let n;
export const nestedKeptRoot = null == (n = null == _globalThis.window ? void 0 : _self.window) ? void 0 : _flatMaybeArray(n.Array.prototype).call([1, [2]]);