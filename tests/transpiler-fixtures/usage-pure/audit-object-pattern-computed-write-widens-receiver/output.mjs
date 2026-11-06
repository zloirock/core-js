import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// A destructuring write through a constant computed key names a different field.
// The array receiver stays narrow; an unknown key would keep the generic fallback.
const o = {
  val: [1, 2, 3]
};
const k = "p";
let v: any;
({
  x: o[k]
} = v);
_atMaybeArray(_ref = o.val).call(_ref, 0);