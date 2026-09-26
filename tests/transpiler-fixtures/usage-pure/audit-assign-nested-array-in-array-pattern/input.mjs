// destructuring assignment with array-pattern nested inside array-pattern: each level
// tracks its own receiver for pure-mode polyfill rewrites.
let b;
[[b]] = [["hello"]];
b.at(-1);
