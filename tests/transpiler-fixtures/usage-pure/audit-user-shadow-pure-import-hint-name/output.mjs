import _Array$from from "@core-js/pure/actual/array/from";
import _Object$assign2 from "@core-js/pure/actual/object/assign";
// user already declared the bare hint-prefix name as a top-level binding before any
// polyfillable usage. addPureImport hint-prefix collision must skip past the user's name
// and allocate the next slot via uniqueName + skip-1
const _Object$assign = 1;
const merged = _Object$assign2({}, {
  a: 1
});
const flat = _Array$from(merged);