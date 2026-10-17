import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// A middle exported declarator keeps its two native array iterations.
// Instance bindings are exported while receiver captures remain private.
const before = effect(),
  [[_ref]] = [[[1, [2]]]],
  at = _atMaybeArray(_ref),
  flat = _flatMaybeArray(_ref),
  after = effect();
export { before, at, flat, after };