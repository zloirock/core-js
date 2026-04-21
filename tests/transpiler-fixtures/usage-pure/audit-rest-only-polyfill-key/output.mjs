import _Array$from from "@core-js/pure/actual/array/from";
const from = _Array$from;
// Single polyfillable key + rest element: hasRest=true, rebuildProps renames `from`
// to _unused, rest collects everything else. `const from = _Array$from` extracted
// with `const { from: _unused1, ...rest } = Array` for rest construction.
const {
  from: _unused,
  ...rest
} = Array;
rest;