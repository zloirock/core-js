// user already declared the bare hint-prefix name as a top-level binding before any
// polyfillable usage. addPureImport hint-prefix collision must skip past the user's name
// and allocate the next slot via uniqueName + skip-1
const _Object$assign = 1;
const merged = Object.assign({}, { a: 1 });
const flat = Array.from(merged);
