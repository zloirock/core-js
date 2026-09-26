import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Promise from "@core-js/pure/actual/promise/constructor";
// Two instance methods share a nested array containing a polyfillable constructor. Capture the
// outer object once, preserve the constructor substitution inside it, then select both instance
// methods from the same nested receiver before reading the outer sibling.
const _ref = {
  y: [_Promise],
  k: 1
};
const _ref2 = _ref.y;
const a = _atMaybeArray(_ref2);
const b = _includesMaybeArray(_ref2);
const {
  k
} = _ref;
export const r = [a, b, k];