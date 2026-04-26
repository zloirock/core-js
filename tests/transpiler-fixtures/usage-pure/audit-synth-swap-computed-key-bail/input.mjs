// synthetic argument-receiver substitution must bail when the key is computed and
// non-literal: the rewrite leaves the call site untouched.
function run({ [Symbol.iterator]: iter, from } = Array) {
  return from([1, 2, 3]);
}
run();
