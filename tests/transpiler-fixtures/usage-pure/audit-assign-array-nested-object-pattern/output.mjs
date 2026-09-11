import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// destructuring assignment with array-pattern nesting an object-pattern: each level
// tracks its own receiver for pure-mode polyfill rewrites.
let a;
[, {
  a
}] = ["skip", {
  a: [1, 2, 3]
}];
_atMaybeArray(a).call(a, -1);