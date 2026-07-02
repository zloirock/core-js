import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// `o[k]` inside an object literal is a computed READ, not a destructuring write to `o`. Treating
// it as a read keeps `o.val` typed as `number[]`, so `.at` gets the array-specific polyfill. A
// destructuring write like `({ x: o[k] } = ...)` would instead widen `o` and bail to generic.
const o = {
  val: [1, 2, 3]
};
const k = "p";
const wrapper = {
  x: o[k]
};
_atMaybeArray(_ref = o.val).call(_ref, 0);