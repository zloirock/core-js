import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `instanceof` narrowing must look through `as` and `!` TS wrappers on the
// LHS so that the array-specific polyfill is selected for the narrowed
// variable rather than the generic instance-method fallback.
declare const x: unknown;
declare const y: unknown;
function f() {
  if (x as any instanceof Array) _atMaybeArray(x as any[]).call(x as any[], 0);
  if (y! instanceof Array) _atMaybeArray(y as any[]).call(y as any[], 0);
}