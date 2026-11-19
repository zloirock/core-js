// destructuring assignment with array-pattern nesting an object-pattern: each level
// tracks its own receiver for pure-mode polyfill rewrites.
let a;
[, { a }] = ["skip", { a: [1, 2, 3] }];
a.at(-1);
