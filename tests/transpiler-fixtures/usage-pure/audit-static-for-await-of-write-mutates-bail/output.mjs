// for-await-of also rebinds the static slot. ForOfStatement with `await: true` is
// the parse shape; the LHS check matches the same as plain for-of. without that,
// the post-loop call would be silently rewritten to the polyfill import while the
// untransformed code observes the loop-assigned function.
async function run() {
  for await (Array.of of [function () {
    return [];
  }]) {
    Array.of(1, 2, 3);
  }
  Array.of(4, 5, 6);
}
run();