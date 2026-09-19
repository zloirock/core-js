// array-pattern destructure with nested array-pattern: each level of nesting must
// track its own receiver for pure-mode polyfill rewrites.
const { a: [[b]] } = { a: [["hello"]] };
b.at(-1);
