import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref;
// A nested computed method assignment reads its receiver once before the key effect.
// The polyfill is assigned at that slot, without a second read after the pattern.
let m;
({
  y: _ref
} = {
  y: arr
}), null == _ref ? _ref[""] : (eff(), m = _flatMaybeArray(_ref));