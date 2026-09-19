import _at from "@core-js/pure/actual/instance/at";
var _ref;
// `({ x: o[k] } = v)` is an ObjectPattern destructuring WRITE through a dynamic computed key, which
// could touch any field of `o`, so `o.val` widens and `.at` gets the generic polyfill. Contrast the
// object-literal read `{ x: o[k] }`, which keeps `o.val` typed as `number[]`.
const o = {
  val: [1, 2, 3]
};
const k = "p";
let v: any;
({
  x: o[k]
} = v);
_at(_ref = o.val).call(_ref, 0);