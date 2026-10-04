import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref, _unused;
// A guarded nested assignment rejects a missing receiver before binding the static.
// Rest copies the original receiver and excludes the claimed key.
let of, rest;
({
  Array: _ref
} = cond && _globalThis), {} = _ref, of = _Array$of, {
  of: _unused,
  ...rest
} = _ref;
use(of, rest);