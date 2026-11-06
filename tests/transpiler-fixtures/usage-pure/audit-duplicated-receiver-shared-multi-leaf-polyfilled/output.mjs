import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Promise from "@core-js/pure/actual/promise/constructor";
// Two instance methods share a nested array containing a polyfillable constructor. Capture the
// outer object once, preserve the constructor substitution inside it, then select both instance
// methods from the same nested receiver before reading the outer sibling.
const _ref2 = {
    y: [_Promise],
    k: 1
  },
  {
    y: _ref
  } = _ref2,
  a = _atMaybeArray(_ref),
  b = _includesMaybeArray(_ref),
  {
    k
  } = _ref2;
export const r = [a, b, k];