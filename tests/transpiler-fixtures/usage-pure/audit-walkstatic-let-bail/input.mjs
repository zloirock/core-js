// alias of `Array` declared with `let` is reassignable, so `from`'s receiver shape can't
// be statically narrowed to Array. instance methods on the result (`findLast` / `at` /
// `includes`) must fall back to generic instance polyfills, not array-narrowed variants
let A = Array;
const { from } = A;
const arr = from('hi');
arr.findLast(c => c);
arr.at(-1);
arr.includes('h');
