// for-of loop with a member-expression iteration target rebinds the static
// slot on every step. the post-loop call must not be rewritten to the polyfill
// import; otherwise the transformed code observes the polyfill while the
// untransformed code observes the loop-assigned function.
let collected = 0;
for (Array.from of [function () { collected++; return [collected]; }]) {
  Array.from([1, 2, 3]);
}
Array.from([4, 5, 6]);
