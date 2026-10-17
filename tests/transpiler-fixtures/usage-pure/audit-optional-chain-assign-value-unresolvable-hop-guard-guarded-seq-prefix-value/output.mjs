import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Map from "@core-js/pure/actual/map";
import _self from "@core-js/pure/actual/self";
// an SE-bearing sequence prefix inside the kept assignment rides the guard TEST with its own
// polyfills alive, and the value collapses by the shared rule (deepest ponyfillable hop, raw
// tail read) exactly like the unguarded twin
const arr = [1];
let p;
export const guardedSeqPrefixValue = null == (p = (_atMaybeArray(arr).call(arr, 0), _self).window) ? void 0 : _Map;