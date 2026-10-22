import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// Computed-key effects precede lookup without sealing the optional call from its continuation.
export function read(get, key, argument, value = (() => {
  var _ref;
  return null == (_ref = get()) ? void 0 : (key(), _getIteratorMethod(_ref))?.call(_ref, argument()).toString();
})()) {
  return value;
}