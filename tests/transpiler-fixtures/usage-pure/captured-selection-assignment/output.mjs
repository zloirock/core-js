import _Array$of from "@core-js/pure/actual/array/of";
// Capturing into an existing binding preserves the receiver and the static polyfill.
export function read(shim) {
  var _ref;
  let of, host;
  host = (_ref = shim ?? Array, of = _ref === Array ? _Array$of : _ref.of, _ref);
  return [host, of];
}