// computed bracket access on global proxy with an empty template literal: `globalThis[``]`.
// the empty cooked key resolves to '' and falls through (an empty key cannot match any
// global), so this access does NOT polyfill. the sibling Map.groupBy still polyfills,
// confirming the visitor reached the file.
const x = globalThis[``];

const groups = Map.groupBy([1, 2, 3], n => n % 2);
groups;
x;
