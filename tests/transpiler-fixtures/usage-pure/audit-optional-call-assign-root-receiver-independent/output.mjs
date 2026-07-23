import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2;
// an optional proxy chain whose root is a chain-assign storing a CALL value that inline-resolves to
// globalThis (`(w = f())?.self.Array.of(...)`, `f = () => globalThis`). the call is as always-defined as
// a bare `globalThis`, and the receiver collapse already roots through it, so the dead `?.` guard erases
// and the assign SE folds ONCE into the collapsed static - not a kept guard leaving babel a raw `.Array
// .of` (missed polyfill) and unplugin a re-run of the call in the body. named-arrow + inline-IIFE call
// shapes; distinct static + trailing instance per line; both converge (no sidecar).
let w, v;
const f = () => _globalThis;
export const arrowVal = _at(_ref = (w = f(), _Array$of)(5)).call(_ref, 0);
export const iifeVal = _includes(_ref2 = (v = (() => _globalThis)(), _Array$from)([1])).call(_ref2, 1);