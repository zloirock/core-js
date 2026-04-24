// TS user-defined type predicate `x is unknown[]` narrows inside the `if` branch to an
// array. `.at(0)` on the narrowed binding should dispatch the array-specific polyfill
// even though `x` was declared `unknown`
function isArr(x: unknown): x is unknown[] {
  return Array.isArray(x);
}
function f(x: unknown) {
  if (isArr(x)) return x.at(0);
}
