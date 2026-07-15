import _Array$from from "@core-js/pure/actual/array/from";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2;
// the HOST positions a kept proxy root can sit in. the rule is the same everywhere - the assignment stays
// as the root, its redundant proxy hops still drop - but each host reaches the collapse through its own
// emit path, so each has to be pinned separately: a `new` callee, a write target, a logical operand, a
// discarded for-x head, a template hole, and a spread argument. distinct methods / constructors per line.
let n;
export const newCallee = new (n = _globalThis.window).Array(3);
let w;
(w = _globalThis.window, _self).Set = function () {};
let l;
export const logicalOperand = (null == (_ref = l = _globalThis.window) ? void 0 : _flatMapMaybeArray(_ref.Array.prototype)) || {};
let f;
for (const k in (f = _globalThis.window)?.Array.prototype ?? {}) void k;
let t;
export const templateHole = `${null == (_ref2 = t = _globalThis.window) ? void 0 : _includesMaybeArray(_ref2.Array.prototype).call([1], 1)}`;
let s;
export const spreadArg = Math.max(...((s = _globalThis.window)?.Array.from?.([1, 2]) ?? [0]));
let d;
delete (d = _globalThis.window, _self).someUserKey;
export { w };