import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref, _ref2, _ref3, _unused;
// A guarded nested assignment rejects a missing receiver before binding the static.
// Rest copies the original receiver and excludes the claimed key.
let of, rest;
_ref = {
  Array: _ref2
} = cond && _globalThis, _ref3 = _ref2, {} = _ref3, of = _Array$of, {
  of: _unused,
  ...rest
} = _ref3, _ref3, _ref;
use(of, rest);