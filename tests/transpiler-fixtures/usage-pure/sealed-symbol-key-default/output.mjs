import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// The computed key short-circuits with its receiver; the sealed call still runs its argument.
// Each default evaluation owns the captured receiver, including a reentrant getter.
export function read(get, key, argument, value = (() => {
  var _ref;
  return ((null == (_ref = get()) ? void 0 : (key(), _getIteratorMethod(_ref))) || 0).call(_ref, argument());
})()) {
  return value;
}