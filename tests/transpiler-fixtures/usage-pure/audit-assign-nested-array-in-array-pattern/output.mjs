import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// destructuring assignment with array-pattern nested inside array-pattern: each level
// tracks its own receiver for pure-mode polyfill rewrites.
let b;
[[b]] = [["hello"]];
_atMaybeString(b).call(b, -1);