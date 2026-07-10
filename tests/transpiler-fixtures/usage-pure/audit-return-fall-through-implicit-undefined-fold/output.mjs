import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2;
// a body that can FALL OFF THE END returns implicit undefined - the same nullish arm as
// an explicit bare `return`, just without a ReturnStatement to collect. the `??` may
// yield its string fallback at runtime, so the fold survivor must not truthy-fold to an
// array-specific Maybe (ie:11 throw on the string)
declare const c: boolean;
function f(cond: boolean) {
  if (cond) return [1, 2];
}
export const viaFallThrough = _at(_ref = f(c) ?? 'fallback').call(_ref, 0);

// an always-exiting body keeps the Array narrow - every return arm is an array
function g(cond: boolean) {
  if (cond) return [1];
  return [2, 3];
}
export const viaAlwaysExits = _includesMaybeArray(_ref2 = g(c) ?? 'fallback').call(_ref2, 1);