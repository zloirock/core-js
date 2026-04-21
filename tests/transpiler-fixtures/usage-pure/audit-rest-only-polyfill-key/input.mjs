// Single polyfillable key + rest element: hasRest=true, rebuildProps renames `from`
// to _unused, rest collects everything else. `const from = _Array$from` extracted
// with `const { from: _unused1, ...rest } = Array` for rest construction.
const { from, ...rest } = Array;
rest;
