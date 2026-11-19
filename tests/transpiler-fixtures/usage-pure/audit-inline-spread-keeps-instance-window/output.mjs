import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// An inline array spread supplies the parameter captures with their actual element values.
// The at and flat leaves each read that captured receiver once.
const result = (_ref => {
  let [_ref2, _ref3] = _ref;
  let at = _atMaybeArray(_ref2);
  let flat = _flatMaybeArray(_ref3);
  return [at, flat];
})([[1], ...[[2]]]);
export { result };