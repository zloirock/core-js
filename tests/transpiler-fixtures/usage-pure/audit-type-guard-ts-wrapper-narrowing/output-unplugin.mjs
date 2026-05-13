import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `instanceof` narrowing must look through `as` and `!` TS wrappers on the
// LHS so that the array-specific polyfill is selected for the narrowed
// variable rather than the generic instance-method fallback.
declare const x: unknown;
declare const y: unknown;
function f() {
  if ((x as any) instanceof Array) { var _ref; _atMaybeArray(_ref = x as any[]).call(_ref, 0); }
  if (y! instanceof Array) { var _ref2; _atMaybeArray(_ref2 = y as any[]).call(_ref2, 0); }
}