// for-in over an object rebinds the static slot to each enumerated property
// name. resolver must treat the for-in LHS as a mutation site and skip the
// polyfill substitution on the post-loop instance of the same static.
const seen = {};
for (Array.from in { a: 1, b: 2 }) {
  seen[Array.from] = true;
}
Array.from([1]);
