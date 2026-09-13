import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// A sole nested instance method over a pure member receiver can eliminate its residual and dispatch
// directly on that receiver. With an outer sibling, capture the complete host first, select the
// nested method, then read the sibling from that same capture in source property order.
const at = _atMaybeArray(Array.prototype);
const _ref = {
  p: Array.prototype,
  q: 1
};
const m = _flatMaybeArray(_ref.p);
const {
  q
} = _ref;
export const r = [typeof at, typeof m, q];
export const effects = [];