import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2;
// a KEPT chain-assign root whose erased proxy hop carried the guard, read through a nav that
// SURVIVES the collapse: the guard re-hangs on the leaf the collapse leaves, and the hops above
// it stay inside the same chain - sealing them would throw where the source answers undefined.
// the sealed twin below spells the seal itself and keeps the throw
var q;
var w;
export const nav = _at(_ref = (q = _globalThis.window)?.box.arr).call(_ref, 0);
export const sealed = _at(_ref2 = (w = _globalThis.window).box.arr).call(_ref2, 0);
export const seen = [q, w];