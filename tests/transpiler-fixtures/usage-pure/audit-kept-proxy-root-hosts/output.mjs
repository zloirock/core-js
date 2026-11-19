import _Array$from from "@core-js/pure/actual/array/from";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// the HOST positions a kept proxy root can sit in. the rule is the same everywhere - the assignment stays
// as the root, its redundant proxy hops still drop - but each host reaches the collapse through its own
// emit path, so each is pinned separately: a `new` callee, a write target, a logical operand, a for-x
// head, a template hole and a spread argument. a `delete` names a SLOT: it lands on the run's root
// binding whatever the store holds, and the `?.` over the stored probe decides whether it happens.
let n;
export const newCallee = new (n = _globalThis.window).Array(3);
let w;
(w = _globalThis.window, null == w ? null.self : w).Set = function () {};
let l;
export const logicalOperand = (null == (l = _globalThis.window) ? void 0 : _flatMapMaybeArray(l.Array.prototype)) || {};
let f;
for (const k in (f = _globalThis.window)?.Array.prototype ?? {}) void k;
let t;
export const templateHole = `${null == (t = _globalThis.window) ? void 0 : _includesMaybeArray(t.Array.prototype).call([1], 1)}`;
let s;
export const spreadArg = Math.max(...((null == (s = _globalThis.window) ? void 0 : _Array$from)?.([1, 2]) ?? [0]));
let d;
null == (d = _globalThis.window) ? true : delete _self.someUserKey;
export { w };