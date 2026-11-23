import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// expose installs the array as window in the test realm.
export function first(expose, fallback) {
  var _ref, _ref2;
  expose([3]);
  let method;
  const rows = (_ref = window, null == _ref ? _ref[""] : (expose([9]), method = (_ref2 = _getIteratorMethod(_ref)) === void 0 ? fallback() : _ref2), _ref);
  return method.call(rows).next().value;
}