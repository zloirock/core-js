import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2;
// a function-valued object DATA prop is reassignable like any data prop: an observed
// write to the slot invalidates the init function's call/return narrowing (the runtime
// value may be a foreign-family function - ie:11 throw on its string return)
const written = {
  fn: () => [1, 2]
};
written.fn = () => 'string';
export const viaWritten = _at(_ref = written.fn()).call(_ref, 0);

// a write-free slot keeps the call/return narrow
const untouched = {
  fn: () => [3, 4]
};
export const viaUntouched = _includesMaybeArray(_ref2 = untouched.fn()).call(_ref2, 3);