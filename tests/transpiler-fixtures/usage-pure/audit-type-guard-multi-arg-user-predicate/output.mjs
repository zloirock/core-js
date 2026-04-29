import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// multi-arg user predicate `(x, mode): x is unknown[]` narrows the first arg same as
// single-arg form. parseTypeGuard accepts arguments.length >= 1 so trailing option
// args (the common `function isFoo(x, mode)` shape) don't block narrowing
function isArr(x: unknown, mode: string): x is unknown[] {
  return Array.isArray(x);
}
function f(x: unknown) {
  if (isArr(x, 'strict')) return _atMaybeArray(x).call(x, 0);
}