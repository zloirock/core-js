// `const from = Array.from` aliases the static; receiver of `from(...)` must still narrow to Array.
// `at` is the load-bearing method here because both Array-specific and generic entries exist;
// without alias-chain narrowing the generic instance polyfill would win.
const from = Array.from;
const arr = from('hi');
arr.at(-1);
arr.findLast(x => x);
arr.flat();
