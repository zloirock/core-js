import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2;
// a body that returns only after a conditional `break` out of a label around it can fall off its end,
// so the call may yield undefined and the `||` keeps its right operand. a conditional `return` in the
// same place is an exit like the one after it, so that call always yields an array. distinct method
// per line
function mayFallOff(c) {
  l: {
    if (c) break l;
    return [1];
  }
}
export const a = _at(_ref = mayFallOff(x) || 'ab').call(_ref, 0);
function returnsEarly(c) {
  l: {
    if (c) return [2];
    return [1];
  }
}
export const b = _includesMaybeArray(_ref2 = returnsEarly(x) || 'ab').call(_ref2, 1);