import _globalThis from "@core-js/pure/actual/global-this";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref2;
// `_ref` is read as an undeclared global (set on globalThis). plugin's ref allocator
// must account for such sloppy globals so its generated ref names don't collide - the
// user's global write must be treated as a reservation even though there's no local
// `_ref` binding declaration
_globalThis._ref = {
  x: 5
};
console.log(_ref.x);
_atMaybeArray(_ref2 = [1, 2, 3]).call(_ref2, 0);