import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref, _ref2, _ref3;
// A nested computed method assignment reads its receiver once before the key effect.
// The polyfill is assigned at that slot, without a second read after the pattern.
let m;
_ref = {
  y: _ref2
} = {
  y: arr
}, _ref3 = _ref2, null == _ref3 ? _ref3[""] : (eff(), m = _flatMaybeArray(_ref3)), _ref3, _ref;