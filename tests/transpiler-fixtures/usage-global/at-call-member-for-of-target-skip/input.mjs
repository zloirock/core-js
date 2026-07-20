// `for-of` with a member expression target (`arr.at of ...`) shadows the property name in the
// loop binding; iterator protocol polyfills still emit because the loop traverses any iterable.
// the bracket spelling reads the same written slot, so its `at` module stays suppressed too
let arr = [];
for (arr.at of items) {
  use(arr.at);
}
for (arr.at of items) {
  use(arr['at']);
}
