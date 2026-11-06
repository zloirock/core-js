import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// Parameter captures read the actual supplied receiver once for each instance leaf.
// A quiet trailing argument element does not change the order of the at and flat reads.
const result = (_ref => {
  let [_ref2, _ref3] = _ref;
  let at = _atMaybeArray(_ref2);
  let flat = _flatMaybeArray(_ref3);
  return [at, flat];
})([[1], [2], 0]);
export { result };