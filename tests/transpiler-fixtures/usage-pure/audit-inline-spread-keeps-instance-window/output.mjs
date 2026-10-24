import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// A flat inline spread preserves the complete argument window for both instance reads.
const result = ((_ref, _unused = void 0) => {
  let [_ref2, _ref3] = _ref;
  let at = _atMaybeArray(_ref2);
  let flat = _flatMaybeArray(_ref3);
  return [at, flat];
})([[1], ...[[2]]]);
export { result };