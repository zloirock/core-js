import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// An optional symbol call keeps receiver capture and computed-key effects in the same frame.
export function read(get, key, argument, value = (() => {
  var _ref;
  return null == (_ref = get()) ? void 0 : (key(), _getIteratorMethod(_ref)?.call(_ref, argument()));
})()) {
  return value;
}