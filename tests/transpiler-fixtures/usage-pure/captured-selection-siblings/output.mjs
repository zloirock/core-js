import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// Each claimed sibling dispatches separately; custom undefined slots retain their defaults.
export function read(shim) {
  var _ref, _ref2;
  let from, of;
  const host = (_ref = shim || Array, from = _ref === Array ? _Array$from : _ref["from"], of = (_ref2 = _ref === Array ? _Array$of : _ref["of"]) === void 0 ? fallback() : _ref2, _ref);
  return [host, from, of];
}